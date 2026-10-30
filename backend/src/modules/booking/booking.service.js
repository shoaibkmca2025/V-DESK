/**
 * Booking service — meeting-room availability, 10-minute holds, confirmation, cancellation and passes
 * (PRD §34–35).
 *
 * Rules (docs/backend/rules.md):
 *  - Rooms are booked by catalog centre + room format name from pricing's `meeting_room` rule, in whole hours
 *    from 09:00 to 20:00 Asia/Kolkata, never in the past and at most MAX_ADVANCE_DAYS ahead.
 *  - The price comes from the pricing engine and is frozen on the booking at hold time; the client never sends one.
 *  - Overlaps are stopped by the unique (centre, room, date, hour) index on booking_slots. A hold inserts its
 *    booking first (claiming the Idempotency-Key), then its hours; if any hour is taken it removes the hours it
 *    inserted and the booking, and answers 409 SLOT_UNAVAILABLE. That rollback is a compensating write rather
 *    than a transaction on purpose: the booking has to be visible to the Idempotency-Key lookup before its
 *    hours are reserved, so a replay of the same key can be told the original is still in flight.
 *  - A slot only blocks its hour while its booking does (RELEASED_STATUSES): a lapsed hold, a cancelled or expired
 *    booking, or a booking that no longer exists frees the hour even if its slot rows are still there. Such
 *    leftovers are cleared before the next insert on those hours (a lapsed hold is saved as EXPIRED first), and
 *    the worker's purge job deletes lapsed hold slots in the background — so a crash between two writes never
 *    blocks an hour.
 *  - Holds last HOLD_SECONDS and read as EXPIRED the moment they lapse.
 *  - Confirmation makes every hour permanent first and only then marks the booking CONFIRMED, so a CONFIRMED
 *    booking (and its pass) always has all its hours; a crash in between leaves a HELD booking that frees its
 *    hours when it lapses.
 *  - Confirmation is staff-only until the orders module confirms on a verified payment. Nothing here records or
 *    implies that a payment happened.
 *  - Status moves follow BOOKING_TRANSITIONS (§5); illegal moves are 409 INVALID_STATUS_TRANSITION.
 *  - Logs carry booking refs, centre refs, room names and totals — never names, mobiles or emails (§21).
 */
import { createHash } from 'node:crypto';
import { AppError, badRequest, conflict, notFound } from '../../shared/errors/AppError.js';
import { logger } from '../../shared/lib/logger.js';
import { decodeCursor, toPage } from '../../shared/lib/pagination.js';
import { generateRef } from '../../shared/lib/refs.js';
import { getCentre } from '../catalog/index.js';
import { getEffectiveRules, priceItem } from '../pricing/index.js';
import {
  BOOKING_TRANSITIONS,
  CLOSING_HOUR,
  HOLD_SECONDS,
  MAX_ACTIVE_HOLDS_PER_MOBILE,
  MAX_ADVANCE_DAYS,
  OPENING_HOUR,
  PASS_STATUSES,
  RELEASED_STATUSES,
} from './booking.constants.js';
import { effectiveStatus, mapBooking, mapBookingForStaff, mapPass } from './booking.mapper.js';
import * as repo from './booking.repository.js';
import { addDays, formatSlot, formatTime, istDate, istInstant } from './booking.time.js';

const log = logger.child({ module: 'booking' });

// ──────────────────────────────────────────────
// Rooms and schedule
// ──────────────────────────────────────────────

/** The centre and room format a booking is for; 404 / 409 / 400 when either can't be booked. */
async function resolveRoom(centreRef, roomName) {
  const [centre, rules] = await Promise.all([getCentre(centreRef), getEffectiveRules()]);
  if (!(centre.services ?? []).includes('Meeting Rooms') || centre.status === 'unavailable') {
    throw conflict('ROOMS_NOT_OFFERED', `Centre ${centre.ref} does not take meeting room bookings`);
  }
  const room = rules.meeting_room.rooms.find((r) => r.name.toLowerCase() === roomName.toLowerCase());
  if (!room) {
    throw badRequest('UNKNOWN_ROOM', `No meeting room format '${roomName}'`, {
      rooms: rules.meeting_room.rooms.map((r) => r.name),
    });
  }
  return { centre, room, rules };
}

/** 400 unless `date` is today (IST) or up to MAX_ADVANCE_DAYS ahead. */
function assertBookableDate(date, now) {
  const today = istDate(now);
  const last = addDays(today, MAX_ADVANCE_DAYS);
  if (date < today || date > last) {
    throw badRequest('DATE_OUT_OF_RANGE', `Pick a date from ${today} to ${last}`, { from: today, to: last });
  }
}

/** 400 unless [startHour, startHour + duration) lies inside opening hours and starts in the future. */
function assertBookableSlot(date, startHour, duration, now) {
  if (startHour < OPENING_HOUR || startHour + duration > CLOSING_HOUR) {
    throw badRequest(
      'OUTSIDE_OPENING_HOURS',
      `Rooms can be booked from ${formatTime(OPENING_HOUR)} to ${formatTime(CLOSING_HOUR)}`,
      { opensAt: formatTime(OPENING_HOUR), closesAt: formatTime(CLOSING_HOUR) },
    );
  }
  if (istInstant(date, startHour) <= now) {
    throw badRequest('SLOT_IN_PAST', 'That time has already started. Please pick a later slot.');
  }
}

/** '8 Pax' → 8; null when the label has no number (no capacity check then). */
function seatsOf(room) {
  const match = /\d+/.exec(room.capacity ?? '');
  return match ? Number(match[0]) : null;
}

const hoursOf = (startHour, duration) => Array.from({ length: duration }, (_, i) => startHour + i);

// ──────────────────────────────────────────────
// Who holds an hour
// ──────────────────────────────────────────────

/** Whether a booking (null = no longer exists) still keeps its hours at `now`. */
function blocksHours(booking, now) {
  if (!booking || RELEASED_STATUSES.includes(booking.status)) return false;
  return booking.status !== 'HELD' || booking.expiresAt > now;
}

/**
 * Slot documents on the given hours (all hours when omitted) of one room and day, split into the hours really
 * taken and the leftovers of bookings that no longer keep them (bookingRef → booking state, null when gone).
 */
async function inspectSlots(key, hours, now) {
  const slots = await repo.findSlots(key, hours);
  const refs = [...new Set(slots.map((slot) => slot.bookingRef))];
  const bookings = new Map((await repo.findBookingStates(refs)).map((b) => [b.ref, b]));
  const taken = new Set();
  const leftovers = new Map();
  for (const slot of slots) {
    const booking = bookings.get(slot.bookingRef) ?? null;
    if (blocksHours(booking, now)) taken.add(slot.hour);
    else leftovers.set(slot.bookingRef, booking);
  }
  return { taken, leftovers };
}

/**
 * Deletes leftover slots so their hours can be inserted again. A lapsed hold is first saved as EXPIRED — that
 * status change is what stops a confirmation in flight from winning, so its slots go only if it succeeds.
 */
async function clearLeftovers(leftovers, now) {
  for (const [bookingRef, booking] of leftovers) {
    if (booking?.status === 'HELD') await persistExpiry(booking, now);
    else await repo.deleteSlotsForBooking(bookingRef);
  }
}

// ──────────────────────────────────────────────
// Availability
// ──────────────────────────────────────────────

/** Every one-hour slot of one room on one day, with whether it can still be held. */
export async function getAvailability({ centreRef, room: roomName, date }, now = new Date()) {
  assertBookableDate(date, now);
  const { centre, room } = await resolveRoom(centreRef, roomName);
  const { taken } = await inspectSlots({ centreRef: centre.ref, room: room.name, date }, undefined, now);

  const slots = hoursOf(OPENING_HOUR, CLOSING_HOUR - OPENING_HOUR).map((hour) => ({
    startTime: formatTime(hour),
    endTime: formatTime(hour + 1),
    slot: formatSlot(hour, 1),
    available: !taken.has(hour) && istInstant(date, hour) > now,
  }));
  return {
    centreRef: centre.ref,
    hub: centre.fullName,
    room: room.name,
    roomCapacity: room.capacity,
    rate_hour_paise: room.hour_paise,
    date,
    opensAt: formatTime(OPENING_HOUR),
    closesAt: formatTime(CLOSING_HOUR),
    slots,
  };
}

// ──────────────────────────────────────────────
// Holds
// ──────────────────────────────────────────────

const hashRequest = (body) => createHash('sha256').update(JSON.stringify(body)).digest('hex');

async function findReplay(idempotencyKey, requestHash) {
  const existing = await repo.findBookingByIdempotencyKey(idempotencyKey);
  if (existing && existing.requestHash !== requestHash) {
    throw conflict('IDEMPOTENCY_KEY_REUSED', 'This Idempotency-Key was already used for a different booking');
  }
  return existing;
}

/**
 * The answer to a replayed Idempotency-Key. While the original request is still reserving its hours (or died
 * part-way), the hold is not real yet, so the replay is told to retry rather than handed a ref that may be rolled
 * back a moment later.
 *
 * A live original finishes in milliseconds; one that crashed leaves this state until the hold's `expiresAt`, after
 * which the key replays as EXPIRED for good. The replay deliberately does not take over or cancel the stuck hold:
 * a crashed request can't be told apart from a slow one, and taking over would let two writers race on the same
 * booking's slots or give one key two answers. `expiresAt` in the details is the worst-case wait.
 */
async function replayOf(existing, now) {
  if (effectiveStatus(existing, now) === 'HELD' && (await repo.countSlots(existing.ref)) < existing.duration) {
    throw conflict(
      'IDEMPOTENCY_KEY_IN_PROGRESS',
      'A request with this Idempotency-Key is still being processed. Please retry in a moment.',
      { expiresAt: existing.expiresAt },
    );
  }
  return { booking: mapBooking(existing, now), created: false };
}

/** Inserts the booking's hours; on any failure releases what went in and removes the booking. */
async function reserveSlots(booking, now) {
  const hours = hoursOf(booking.startHour, booking.duration);
  const key = { centreRef: booking.centreRef, room: booking.room, date: booking.date };
  let reserved = false;
  try {
    await clearLeftovers((await inspectSlots(key, hours, now)).leftovers, now);
    reserved = await repo.insertSlots(
      hours.map((hour) => ({ ...key, hour, bookingRef: booking.ref, expiresAt: booking.expiresAt })),
    );
  } finally {
    if (!reserved) {
      await repo.deleteSlotsForBooking(booking.ref);
      await repo.deleteBooking(booking.ref);
    }
  }
  if (!reserved) {
    const { taken } = await inspectSlots(key, hours, now);
    throw conflict('SLOT_UNAVAILABLE', 'Some of those hours were just booked. Please pick another slot.', {
      taken: hours.filter((hour) => taken.has(hour)).map(formatTime),
    });
  }
}

/**
 * Holds a room for HOLD_SECONDS at the server-computed price.
 *
 * `body.customer` and `body.customerRef` are the signed-in customer's own details, put there by the
 * controller — they are never read from the request, so nobody can hold a room in someone else's name.
 * @returns {Promise<{ booking: object, created: boolean }>} created=false when the key was replayed
 */
export async function holdBooking(body, idempotencyKey, now = new Date()) {
  if (!idempotencyKey) {
    throw badRequest(
      'IDEMPOTENCY_KEY_REQUIRED',
      'Send an Idempotency-Key header (for example a UUID) with each new booking',
    );
  }
  const requestHash = hashRequest(body);
  const replay = await findReplay(idempotencyKey, requestHash);
  if (replay) return replayOf(replay, now);

  const { centreRef, date, startHour, duration, attendees, customer, customerRef } = body;
  assertBookableDate(date, now);
  assertBookableSlot(date, startHour, duration, now);
  const { centre, room, rules } = await resolveRoom(centreRef, body.room);
  const seats = seatsOf(room);
  if (seats !== null && attendees > seats) {
    throw badRequest('ATTENDEES_EXCEED_CAPACITY', `${room.name} seats up to ${seats} people`, { capacity: seats });
  }
  if ((await repo.countActiveHolds(customer.mobile, now)) >= MAX_ACTIVE_HOLDS_PER_MOBILE) {
    throw new AppError(429, 'TOO_MANY_HOLDS', 'You already have rooms on hold. Complete or cancel them first.');
  }

  const pricing = priceItem({ product: 'meeting_room', room: room.name, hours: duration }, rules);

  const booking = await repo.insertBooking({
    ref: generateRef('BK', 8),
    status: 'HELD',
    centreRef: centre.ref,
    hub: centre.fullName,
    room: room.name,
    roomCapacity: room.capacity,
    date,
    startHour,
    duration,
    startsAt: istInstant(date, startHour),
    endsAt: istInstant(date, startHour + duration),
    attendees,
    customerRef,
    customer: {
      name: customer.name,
      company: customer.company ?? '',
      mobile: customer.mobile,
      email: customer.email ?? '',
    },
    pricing,
    expiresAt: new Date(now.getTime() + HOLD_SECONDS * 1000),
    history: [{ status: 'HELD', at: now, actor: customerRef }],
    idempotencyKey,
    requestHash,
  });
  if (!booking) {
    // A concurrent request with the same key won the insert; answer as its replay.
    const winner = await findReplay(idempotencyKey, requestHash);
    if (winner) return replayOf(winner, now);
    throw conflict('BOOKING_CONFLICT', 'Could not hold the room. Please try again.');
  }

  await reserveSlots(booking, now);
  log.info(
    {
      event: 'booking.held',
      bookingRef: booking.ref,
      centreRef: booking.centreRef,
      room: booking.room,
      duration,
      total_paise: pricing.total_paise,
    },
    'room held',
  );
  return { booking: mapBooking(booking, now), created: true };
}

// ──────────────────────────────────────────────
// Reading
// ──────────────────────────────────────────────

async function findBookingOrThrow(ref) {
  const booking = await repo.findBookingByRef(ref);
  if (!booking) throw notFound('BOOKING_NOT_FOUND', `No booking found for ref '${ref}'`);
  return booking;
}

export async function getBooking(ref, now = new Date()) {
  return mapBooking(await findBookingOrThrow(ref), now);
}

/** The visitor pass — only for a confirmed (or checked-in) booking. */
export async function getPass(ref) {
  const booking = await findBookingOrThrow(ref);
  if (!PASS_STATUSES.includes(booking.status)) {
    throw conflict('PASS_NOT_AVAILABLE', 'A pass is issued once the booking is confirmed', {
      status: effectiveStatus(booking),
    });
  }
  return mapPass(booking);
}

/** Staff list, newest first, with contact details and the status timeline. */
/** The signed-in customer's own bookings, newest first — the portal's list, with no contact details in it. */
export async function listBookingsForCustomer(customerRef, { cursor, limit }, now = new Date()) {
  const after = cursor ? decodeCursor(cursor) : undefined;
  const { items, nextCursor } = toPage(await repo.findBookingsForCustomer({ customerRef, after, limit }), limit);
  return { bookings: items.map((doc) => mapBooking(doc, now)), nextCursor };
}

export async function listBookings({ status, centreRef, date, cursor, limit }, now = new Date()) {
  const after = cursor ? decodeCursor(cursor) : undefined;
  const { items, nextCursor } = toPage(await repo.findBookings({ status, centreRef, date, after, limit }), limit);
  return { bookings: items.map((doc) => mapBookingForStaff(doc, now)), nextCursor };
}

// ──────────────────────────────────────────────
// Status changes
// ──────────────────────────────────────────────

/** Saves EXPIRED on a lapsed hold and frees its hours. Safe to repeat. */
async function persistExpiry(booking, now) {
  const expired = await repo.updateBookingStatus(booking.ref, 'HELD', 'EXPIRED', {
    status: 'EXPIRED',
    at: now,
    actor: 'system',
  });
  // Once EXPIRED a booking can never be confirmed, so every hour it still holds is garbage.
  if (expired) {
    await repo.deleteSlotsForBooking(booking.ref);
    log.info({ event: 'booking.hold_expired', bookingRef: booking.ref }, 'hold expired');
  }
}

function assertTransition(from, to) {
  const allowed = BOOKING_TRANSITIONS[from] ?? [];
  if (!allowed.includes(to)) {
    throw conflict('INVALID_STATUS_TRANSITION', `A booking cannot move from ${from} to ${to}`, { from, to, allowed });
  }
}

const bookingChanged = () => conflict('BOOKING_CHANGED', 'This booking was just changed. Please reload and try again.');
const holdExpired = (booking) =>
  conflict('HOLD_EXPIRED', 'This hold has expired and the room was released. Please hold it again.', {
    expiresAt: booking.expiresAt,
  });

/**
 * Moves a booking to `to` (CANCELLED, CHECKED_IN or COMPLETED), freeing its hours when cancelled.
 * Repeating the current status is a no-op; a lapsed hold is saved as EXPIRED and refused.
 */
async function changeStatus(booking, to, actor, now) {
  const current = effectiveStatus(booking, now);
  if (current === to) return booking;
  if (current === 'EXPIRED') {
    if (booking.status === 'HELD') await persistExpiry(booking, now);
    throw holdExpired(booking);
  }
  assertTransition(current, to);

  const updated = await repo.updateBookingStatus(
    booking.ref,
    current,
    to,
    { status: to, at: now, actor },
    current === 'HELD' ? { unexpiredAt: now } : {},
  );
  if (!updated) throw bookingChanged();
  if (to === 'CANCELLED') await repo.deleteSlotsForBooking(booking.ref);
  log.info(
    { event: `booking.${to.toLowerCase()}`, bookingRef: booking.ref, from: current, to, actor },
    'booking status changed',
  );
  return updated;
}

/** Customer cancellation through the booking ref — holds only; a confirmed booking needs staff. */
export async function cancelHold(ref, now = new Date()) {
  const booking = await findBookingOrThrow(ref);
  const current = effectiveStatus(booking, now);
  if (current !== 'HELD' && current !== 'CANCELLED' && current !== 'EXPIRED') {
    throw conflict('CANCELLATION_REQUIRES_STAFF', 'Please contact us to cancel a confirmed booking', {
      status: current,
    });
  }
  return mapBooking(await changeStatus(booking, 'CANCELLED', 'public', now), now);
}

/** Staff moves: CHECKED_IN, COMPLETED, CANCELLED (no refund is issued — there are no payments yet). */
export async function setStatusByStaff(ref, to, actor, now = new Date()) {
  const booking = await findBookingOrThrow(ref);
  return mapBookingForStaff(await changeStatus(booking, to, actor, now), now);
}

/** After losing a race on a confirmation: fine if someone else confirmed it, otherwise say what happened. */
async function afterConfirmRace(ref, now) {
  const fresh = await findBookingOrThrow(ref);
  if (fresh.status !== 'HELD' && blocksHours(fresh, now)) return mapBookingForStaff(fresh, now);
  if (effectiveStatus(fresh, now) === 'EXPIRED') throw holdExpired(fresh);
  throw bookingChanged();
}

/**
 * Staff confirmation of a hold, in this order:
 *  1. make every hour permanent (only those whose hold hasn't lapsed — a lapsed slot may be someone else's now);
 *  2. count the permanent hours; if any is missing, end the hold (EXPIRED if it lapsed, else CANCELLED by system)
 *     and free what is left — unless someone else changed it first;
 *  3. only then HELD → CONFIRMED.
 * Nothing turns a permanent slot back into an expiring one, and a booking's slots are only deleted after it has
 * left HELD / CONFIRMED. So once step 2 has counted every hour, step 3 either wins with all hours in place or loses
 * to the cancellation / expiry that frees them: a CONFIRMED booking — and its pass — never lacks an hour.
 */
export async function confirmBooking(ref, actor, now = new Date()) {
  const booking = await findBookingOrThrow(ref);
  const current = effectiveStatus(booking, now);
  if (current === 'CONFIRMED') return mapBookingForStaff(booking, now);
  if (current === 'EXPIRED') {
    if (booking.status === 'HELD') await persistExpiry(booking, now);
    throw holdExpired(booking);
  }
  assertTransition(current, 'CONFIRMED');

  await repo.makeSlotsPermanent(ref, now);
  const secured = await repo.countSlots(ref, { permanentOnly: true });
  if (secured !== booking.duration) {
    const lapsed = booking.expiresAt <= now;
    const to = lapsed ? 'EXPIRED' : 'CANCELLED';
    const ended = await repo.updateBookingStatus(ref, 'HELD', to, { status: to, at: now, actor: 'system' });
    if (!ended) return afterConfirmRace(ref, now);
    await repo.deleteSlotsForBooking(ref);
    log.warn({ event: 'booking.slots_missing', bookingRef: ref, secured, to }, 'hold lost some of its hours');
    if (lapsed) throw holdExpired(booking);
    throw conflict('SLOT_UNAVAILABLE', 'This hold no longer has all its hours. Please hold the room again.');
  }

  const updated = await repo.updateBookingStatus(ref, 'HELD', 'CONFIRMED', { status: 'CONFIRMED', at: now, actor });
  if (!updated) return afterConfirmRace(ref, now);
  log.info({ event: 'booking.confirmed', bookingRef: ref, actor }, 'booking confirmed by staff');
  return mapBookingForStaff(updated, now);
}
