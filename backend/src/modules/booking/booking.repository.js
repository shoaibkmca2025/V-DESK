/**
 * Booking repository — the only file that queries the database for this module.
 * Hides soft-deleted records, except where idempotency needs to see them.
 *
 * `booking_slots` is where the real concurrency control lives: its unique (centre, room, date, hour) index
 * is what makes two bookings of the same hour impossible, so `insertSlots` reads a unique violation as
 * "someone else has it" rather than as an error.
 */
import { cursorClause } from '../../shared/lib/pagination.js';
import { exec, row, rows, UNIQUE_VIOLATION } from '../../shared/lib/sql.js';

const BOOKING_COLUMNS = `
  ref, status, centre_ref AS "centreRef", hub, room, room_capacity AS "roomCapacity",
  "date", start_hour AS "startHour", duration,
  starts_at AS "startsAt", ends_at AS "endsAt", attendees,
  customer_ref AS "customerRef", customer, pricing,
  expires_at AS "expiresAt", history,
  idempotency_key AS "idempotencyKey", request_hash AS "requestHash",
  deleted_at AS "deletedAt", created_at AS "createdAt", updated_at AS "updatedAt"`;

// ──────────────────────────────────────────────
// Bookings
// ──────────────────────────────────────────────

export async function findBookingByRef(ref) {
  return row(`SELECT ${BOOKING_COLUMNS} FROM bookings WHERE ref = $1 AND deleted_at IS NULL`, [ref]);
}

export async function findBookingByIdempotencyKey(idempotencyKey) {
  return row(`SELECT ${BOOKING_COLUMNS} FROM bookings WHERE idempotency_key = $1`, [idempotencyKey]);
}

/** Inserts a booking, or returns null when the Idempotency-Key was taken by a concurrent request. */
export async function insertBooking(data) {
  try {
    return await row(
      `INSERT INTO bookings (ref, status, centre_ref, hub, room, room_capacity, "date", start_hour, duration,
                             starts_at, ends_at, attendees, customer_ref, customer, pricing, expires_at,
                             history, idempotency_key, request_hash)
            VALUES ($1, coalesce($2, 'HELD'), $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
                    $14::jsonb, $15::jsonb, $16, coalesce($17::jsonb, '[]'::jsonb), $18, $19)
         RETURNING ${BOOKING_COLUMNS}`,
      [
        data.ref,
        data.status ?? null,
        data.centreRef,
        data.hub,
        data.room,
        data.roomCapacity ?? '',
        data.date,
        data.startHour,
        data.duration,
        data.startsAt,
        data.endsAt,
        data.attendees,
        data.customerRef,
        JSON.stringify(data.customer),
        JSON.stringify(data.pricing),
        data.expiresAt,
        data.history ? JSON.stringify(data.history) : null,
        data.idempotencyKey ?? null,
        data.requestHash ?? null,
      ],
    );
  } catch (err) {
    if (err.code === UNIQUE_VIOLATION) return null;
    throw err;
  }
}

/** Removes a booking whose hours could not be reserved. The customer never received its ref. */
export async function deleteBooking(ref) {
  await exec(`DELETE FROM bookings WHERE ref = $1 AND status = 'HELD'`, [ref]);
}

/** Unexpired holds for one mobile number. */
export async function countActiveHolds(mobile, now) {
  const result = await row(
    `SELECT count(*)::int AS n FROM bookings
      WHERE customer_mobile = $1 AND status = 'HELD' AND expires_at > $2 AND deleted_at IS NULL`,
    [mobile, now],
  );
  return result.n;
}

/** Newest first; fetches `limit + 1` so the service can tell whether there is another page. */
export async function findBookings({ status, centreRef, date, after, limit }) {
  const cursor = cursorClause(after, 4);
  return rows(
    `SELECT ${BOOKING_COLUMNS} FROM bookings
      WHERE deleted_at IS NULL
        AND ($1::text IS NULL OR status = $1)
        AND ($2::text IS NULL OR centre_ref = $2)
        AND ($3::text IS NULL OR "date" = $3)
        ${cursor.text}
      ORDER BY created_at DESC, ref DESC
      LIMIT $${cursor.next}`,
    [status ?? null, centreRef ?? null, date ?? null, ...cursor.params, limit + 1],
  );
}

/** One customer's bookings, newest first; same cursor shape as findBookings. */
export async function findBookingsForCustomer({ customerRef, after, limit }) {
  const cursor = cursorClause(after, 2);
  return rows(
    `SELECT ${BOOKING_COLUMNS} FROM bookings
      WHERE deleted_at IS NULL AND customer_ref = $1 ${cursor.text}
      ORDER BY created_at DESC, ref DESC
      LIMIT $${cursor.next}`,
    [customerRef, ...cursor.params, limit + 1],
  );
}

/**
 * Moves a booking to `to` only if it is still in `from` (and, when given, its hold hasn't lapsed) — two
 * people confirming and cancelling at once can't both win. Returns the updated booking, or null if it
 * changed meanwhile.
 */
export async function updateBookingStatus(ref, from, to, entry, { unexpiredAt } = {}) {
  return row(
    `UPDATE bookings SET status = $3, history = history || $4::jsonb
      WHERE ref = $1 AND status = $2 AND deleted_at IS NULL
        AND ($5::timestamptz IS NULL OR expires_at > $5)
      RETURNING ${BOOKING_COLUMNS}`,
    [ref, from, to, JSON.stringify([entry]), unexpiredAt ?? null],
  );
}

// ──────────────────────────────────────────────
// Slots (one row per reserved room-hour)
// ──────────────────────────────────────────────

/** The reserved hours of one room on one day, optionally only the hours given. */
export async function findSlots({ centreRef, room, date }, hours) {
  return rows(
    `SELECT hour, booking_ref AS "bookingRef", expires_at AS "expiresAt"
       FROM booking_slots
      WHERE centre_ref = $1 AND room = $2 AND "date" = $3
        AND ($4::int[] IS NULL OR hour = ANY($4))`,
    [centreRef, room, date, hours ?? null],
  );
}

/** Status and hold expiry of the given bookings (missing refs are simply absent). */
export async function findBookingStates(refs) {
  if (refs.length === 0) return [];
  return rows(
    `SELECT ref, status, expires_at AS "expiresAt" FROM bookings
      WHERE ref = ANY($1) AND deleted_at IS NULL`,
    [refs],
  );
}

/** How many hours a booking holds — all of them, or only the permanent (confirmed) ones. */
export async function countSlots(bookingRef, { permanentOnly = false } = {}) {
  const result = await row(
    `SELECT count(*)::int AS n FROM booking_slots
      WHERE booking_ref = $1 AND (NOT $2::boolean OR expires_at IS NULL)`,
    [bookingRef, permanentOnly],
  );
  return result.n;
}

/**
 * Reserves every hour for one booking in a single statement. Returns true when all went in, false when any
 * hour is already taken (the unique index decides) — and then nothing went in at all, because one statement
 * either succeeds or leaves no trace. The caller still releases the booking's slots afterwards, which is
 * what makes a crash between the two writes harmless.
 */
export async function insertSlots(slots) {
  try {
    await exec(
      `INSERT INTO booking_slots (centre_ref, room, "date", hour, booking_ref, expires_at)
       SELECT * FROM unnest($1::text[], $2::text[], $3::ist_date[], $4::int[], $5::text[], $6::timestamptz[])`,
      [
        slots.map((slot) => slot.centreRef),
        slots.map((slot) => slot.room),
        slots.map((slot) => slot.date),
        slots.map((slot) => slot.hour),
        slots.map((slot) => slot.bookingRef),
        slots.map((slot) => slot.expiresAt ?? null),
      ],
    );
    return true;
  } catch (err) {
    if (err.code === UNIQUE_VIOLATION) return false;
    throw err;
  }
}

/** Releases every hour a booking holds. */
export async function deleteSlotsForBooking(bookingRef) {
  return exec(`DELETE FROM booking_slots WHERE booking_ref = $1`, [bookingRef]);
}

/**
 * Makes a hold's hours permanent, but only those whose hold hasn't lapsed at `now` — a lapsed slot may
 * already be someone else's to take. Callers count the permanent slots afterwards rather than trusting
 * this count.
 */
export async function makeSlotsPermanent(bookingRef, now) {
  await exec(`UPDATE booking_slots SET expires_at = NULL WHERE booking_ref = $1 AND expires_at > $2`, [
    bookingRef,
    now,
  ]);
}
