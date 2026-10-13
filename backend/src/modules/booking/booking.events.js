/**
 * Booking domain events (modules.md §3.6): `booking.held`, `booking.hold_expired`, `booking.confirmed`,
 * `booking.cancelled`. Each is written to the outbox in the same transaction as the change it announces
 * (ADR-005, ADR-008), so it exists if and only if that change was saved — never for a refused or repeated move.
 *
 * Payloads carry refs and statuses only; handlers read details (never guest contact data) through the service.
 */
import { publish } from '../../shared/events/bus.js';
import { withTransaction } from '../../shared/lib/transactions.js';
import * as repo from './booking.repository.js';

/** The event announcing a move into each status; moves into other statuses (CHECKED_IN, COMPLETED) have none. */
export const STATUS_EVENTS = Object.freeze({
  EXPIRED: 'booking.hold_expired',
  CONFIRMED: 'booking.confirmed',
  CANCELLED: 'booking.cancelled',
});

/** Booking history actors are 'public', 'system', 'admin-key' or a staff user ref. */
function eventActor(actor) {
  if (actor === 'public' || actor === 'system' || actor === 'admin-key') return { type: actor };
  return { type: 'user', id: actor ?? null };
}

/**
 * Moves a booking from `from` to `to` (see repo.updateBookingStatus) and records the matching event with it.
 * Returns the updated booking, or null — with no event — when it had changed meanwhile.
 */
export async function transitionWithEvent(ref, from, to, actor, now, { unexpiredAt } = {}) {
  return withTransaction(async (session) => {
    const entry = { status: to, at: now, actor };
    const updated = await repo.updateBookingStatus(ref, from, to, entry, { unexpiredAt, session });
    if (updated && STATUS_EVENTS[to]) {
      await publish(
        {
          type: STATUS_EVENTS[to],
          entity: { type: 'booking', ref },
          actor: eventActor(actor),
          payload: { from, centreRef: updated.centreRef },
        },
        { session },
      );
    }
    return updated;
  });
}

/** Thrown inside the transaction to abort it when an hour is already taken. */
class SlotTaken extends Error {}

/**
 * Inserts all of a hold's hours and `booking.held` together. Returns false — with no slot and no event saved —
 * when any hour is taken (unique index). On a standalone MongoDB (development only) a partial insert is possible;
 * the caller releases the booking's slots whenever this does not return true.
 */
export async function reserveSlotsWithEvent(booking, slots) {
  try {
    await withTransaction(async (session) => {
      if (!(await repo.insertSlots(slots, { session }))) throw new SlotTaken();
      await publish(
        {
          type: 'booking.held',
          entity: { type: 'booking', ref: booking.ref },
          actor: { type: 'public' },
          payload: { centreRef: booking.centreRef, expiresAt: booking.expiresAt },
        },
        { session },
      );
    });
    return true;
  } catch (err) {
    if (err instanceof SlotTaken) return false;
    throw err;
  }
}
