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

/** Reserved hours of one room on one day that are still in force at `now`. */
export async function findTakenHours({ centreRef, room, date }, now) {
  const docs = await BookingSlot.find(
    { centreRef, room, date, $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }] },
    { hour: 1, _id: 0 },
  ).lean();
  return docs.map((doc) => doc.hour);
}

/** Deletes lapsed hold slots on the given hours, so they can be taken before the TTL monitor gets to them. */
export async function deleteExpiredSlots({ centreRef, room, date, hours }, now) {
  await BookingSlot.deleteMany({ centreRef, room, date, hour: { $in: hours }, expiresAt: { $ne: null, $lte: now } });
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
 * Makes a hold's hours permanent, but only those whose hold hasn't lapsed at `now`. Returns how many were made
 * permanent; fewer than the booking's duration means the hold lost some hours.
 */
export async function makeSlotsPermanent(bookingRef, now) {
  const res = await BookingSlot.updateMany({ bookingRef, expiresAt: { $gt: now } }, { $set: { expiresAt: null } });
  return res.modifiedCount;
}
