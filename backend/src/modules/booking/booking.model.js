/**
 * Booking Mongoose schemas. Collections: bookings, booking_slots.
 *
 * `booking_slots` holds one document per reserved room-hour. Its unique index on
 * (centreRef, room, date, hour) is what stops two bookings overlapping — the database, not application code,
 * decides who gets an hour, so concurrent holds cannot both win. A held slot carries the hold's `expiresAt`;
 * confirming sets it to null (permanent). A TTL index deletes expired holds' slots, and the service also
 * clears expired slots before inserting, so an expired hold never blocks anyone even if the TTL monitor
 * (≈ every 60 s) hasn't run yet. The planned `holds` / `availability_slots` collections are covered by this.
 */
import mongoose from 'mongoose';
import { BOOKING_STATUSES } from './booking.constants.js';

const { Schema } = mongoose;

// ──────────────────────────────────────────────
// Booking
// ──────────────────────────────────────────────
const bookingSchema = new Schema(
  {
    /** BK- + time + 8 random characters: it is the customer's link to the booking, so it must not be guessable. */
    ref: { type: String, required: true, unique: true },
    status: { type: String, enum: BOOKING_STATUSES, default: 'HELD' },
    centreRef: { type: String, required: true },
    /** Centre display name, frozen at hold time (the client's `hub`). */
    hub: { type: String, required: true },
    /** Room format name as in pricing's meeting_room rule (canonical casing). */
    room: { type: String, required: true },
    roomCapacity: { type: String, default: '' },
    /** IST calendar date 'YYYY-MM-DD' and first hour (9–19). */
    date: { type: String, required: true },
    startHour: { type: Number, required: true },
    /** Hours booked — the client's `duration`. */
    duration: { type: Number, required: true },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
    attendees: { type: Number, required: true },
    /** The signed-in customer who booked it (identity's `customers`), so the portal can list their own. */
    customerRef: { type: String, required: true },
    /** Contact details, copied from the account at hold time. PII: never logged, never in the public view (rules.md §21). */
    customer: {
      name: { type: String, required: true },
      company: { type: String, default: '' },
      /** Normalised to 10 digits. */
      mobile: { type: String, required: true },
      email: { type: String, default: '' },
    },
    /** Breakdown from the pricing engine at hold time; later rule changes never alter it. */
    pricing: { type: Schema.Types.Mixed, required: true },
    /** When a HELD booking lapses. Kept after confirmation for the record. */
    expiresAt: { type: Date, required: true },
    history: [
      {
        _id: false,
        status: { type: String, enum: BOOKING_STATUSES, required: true },
        at: { type: Date, required: true },
        actor: { type: String, required: true },
      },
    ],
    /** Idempotency-Key of the creating request (rules.md §10) and a hash of its body, to spot reuse. */
    idempotencyKey: { type: String, default: null },
    requestHash: { type: String, default: null },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true, minimize: false },
);

bookingSchema.index(
  { idempotencyKey: 1 },
  { unique: true, partialFilterExpression: { idempotencyKey: { $type: 'string' } } },
);
bookingSchema.index({ deletedAt: 1, createdAt: -1, ref: -1 });
bookingSchema.index({ deletedAt: 1, centreRef: 1, date: 1 });
/** Per-mobile active-hold count. */
bookingSchema.index({ 'customer.mobile': 1, status: 1, expiresAt: 1 });
/** One customer's own bookings, newest first. */
bookingSchema.index({ customerRef: 1, createdAt: -1, ref: -1 });

// ──────────────────────────────────────────────
// Reserved room-hour
// ──────────────────────────────────────────────
const bookingSlotSchema = new Schema(
  {
    centreRef: { type: String, required: true },
    room: { type: String, required: true },
    date: { type: String, required: true },
    /** IST hour this slot starts (9–19). */
    hour: { type: Number, required: true },
    bookingRef: { type: String, required: true, index: true },
    /** Hold expiry; null once the booking is confirmed. */
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true },
);

bookingSlotSchema.index({ centreRef: 1, room: 1, date: 1, hour: 1 }, { unique: true });
// TTL ignores documents whose expiresAt is null, so confirmed slots stay.
bookingSlotSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Booking = mongoose.model('Booking', bookingSchema, 'bookings');
export const BookingSlot = mongoose.model('BookingSlot', bookingSlotSchema, 'booking_slots');
