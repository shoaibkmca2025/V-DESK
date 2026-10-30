/**
 * Booking repository — the only file that queries MongoDB for this module (through booking.model.js).
 * Returns plain objects (`.lean()`) and hides soft-deleted records.
 */
import { olderThan } from '../../shared/lib/pagination.js';
import { Booking, BookingSlot } from './booking.model.js';

const DUPLICATE_KEY = 11000;
const notDeleted = { deletedAt: null };

// ──────────────────────────────────────────────
// Bookings
// ──────────────────────────────────────────────

export async function findBookingByRef(ref) {
  return Booking.findOne({ ref, ...notDeleted }).lean();
}

export async function findBookingByIdempotencyKey(idempotencyKey) {
  return Booking.findOne({ idempotencyKey }).lean();
}

/** Inserts a booking, or returns null when the Idempotency-Key was taken by a concurrent request. */
export async function insertBooking(data) {
  try {
    const doc = await Booking.create(data);
    return doc.toObject();
  } catch (err) {
    if (err.code === DUPLICATE_KEY) return null;
    throw err;
  }
}

/** Removes a booking whose hours could not be reserved. The customer never received its ref. */
export async function deleteBooking(ref) {
  await Booking.deleteOne({ ref, status: 'HELD' });
}

/** Unexpired holds for one mobile number. */
export async function countActiveHolds(mobile, now) {
  return Booking.countDocuments({ 'customer.mobile': mobile, status: 'HELD', expiresAt: { $gt: now }, ...notDeleted });
}

/** Newest first; fetches `limit + 1` so the service can tell whether there is another page. */
export async function findBookings({ status, centreRef, date, after, limit }) {
  const filter = {
    ...notDeleted,
    ...(status && { status }),
    ...(centreRef && { centreRef }),
    ...(date && { date }),
    ...(after && olderThan(after)),
  };
  return Booking.find(filter)
    .sort({ createdAt: -1, ref: -1 })
    .limit(limit + 1)
    .lean();
}

/**
 * Moves a booking to `to` only if it is still in `from` (and, when given, its hold hasn't lapsed) — two people
 * confirming and cancelling at once can't both win. Returns the updated booking, or null if it changed meanwhile.
 */
/** One customer's bookings, newest first; same cursor shape as findBookings. */
export async function findBookingsForCustomer({ customerRef, after, limit }) {
  const filter = { ...notDeleted, customerRef, ...(after && olderThan(after)) };
  return Booking.find(filter)
    .sort({ createdAt: -1, ref: -1 })
    .limit(limit + 1)
    .lean();
}

export async function updateBookingStatus(ref, from, to, entry, { unexpiredAt } = {}) {
  return Booking.findOneAndUpdate(
    { ref, status: from, ...notDeleted, ...(unexpiredAt && { expiresAt: { $gt: unexpiredAt } }) },
    { $set: { status: to }, $push: { history: entry } },
    { returnDocument: 'after' },
  ).lean();
}

// ──────────────────────────────────────────────
// Slots (one document per reserved room-hour)
// ──────────────────────────────────────────────

/** Slot documents of one room on one day, optionally only on the given hours. */
export async function findSlots({ centreRef, room, date }, hours) {
  return BookingSlot.find(
    { centreRef, room, date, ...(hours && { hour: { $in: hours } }) },
    { hour: 1, bookingRef: 1, expiresAt: 1, _id: 0 },
  ).lean();
}

/** Status and hold expiry of the given bookings (missing refs are simply absent). */
export async function findBookingStates(refs) {
  if (refs.length === 0) return [];
  return Booking.find({ ref: { $in: refs }, ...notDeleted }, { ref: 1, status: 1, expiresAt: 1, _id: 0 }).lean();
}

/** How many hours a booking holds — all of them, or only the permanent (confirmed) ones. */
export async function countSlots(bookingRef, { permanentOnly = false } = {}) {
  return BookingSlot.countDocuments({ bookingRef, ...(permanentOnly && { expiresAt: null }) });
}

/**
 * Reserves every hour for one booking, in order. Returns true when all were inserted, false when any hour is
 * already taken (unique index) — in that case the caller must release the ones that did go in.
 */
export async function insertSlots(slots) {
  try {
    await BookingSlot.insertMany(slots, { ordered: true });
    return true;
  } catch (err) {
    if (err.code === DUPLICATE_KEY || err.writeErrors?.some((e) => e.code === DUPLICATE_KEY)) return false;
    throw err;
  }
}

/** Releases every hour a booking holds. */
export async function deleteSlotsForBooking(bookingRef) {
  const res = await BookingSlot.deleteMany({ bookingRef });
  return res.deletedCount;
}

/**
 * Makes a hold's hours permanent, but only those whose hold hasn't lapsed at `now` — a lapsed slot may already
 * be someone else's to take. Callers count the permanent slots afterwards rather than trusting this count.
 */
export async function makeSlotsPermanent(bookingRef, now) {
  await BookingSlot.updateMany({ bookingRef, expiresAt: { $gt: now } }, { $set: { expiresAt: null } });
}
