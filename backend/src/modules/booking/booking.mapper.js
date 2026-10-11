/**
 * Booking mapper — shapes bookings for API responses.
 * Internal fields (_id, idempotency data) never leave the API, and the public view carries no contact details:
 * whoever holds the ref sees the reservation, not who made it (rules.md §21).
 */
import { formatSlot, formatTime } from './booking.time.js';

/** A hold past `expiresAt` reads as EXPIRED even before anything persists it (there is no expiry job). */
export function effectiveStatus(doc, now = new Date()) {
  return doc.status === 'HELD' && doc.expiresAt <= now ? 'EXPIRED' : doc.status;
}

/** What anyone with the booking ref sees. Field names follow features/bookings/bookingStore.js (rules.md §42). */
export function mapBooking(doc, now = new Date()) {
  return {
    ref: doc.ref,
    status: effectiveStatus(doc, now),
    centreRef: doc.centreRef,
    hub: doc.hub,
    room: doc.room,
    roomCapacity: doc.roomCapacity,
    date: doc.date,
    startTime: formatTime(doc.startHour),
    endTime: formatTime(doc.startHour + doc.duration),
    slot: formatSlot(doc.startHour, doc.duration),
    duration: doc.duration,
    attendees: doc.attendees,
    startsAt: doc.startsAt,
    endsAt: doc.endsAt,
    pricing: doc.pricing,
    expiresAt: doc.expiresAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

/** Staff view adds the guest's contact details and the status timeline. */
export function mapBookingForStaff(doc, now = new Date()) {
  return { ...mapBooking(doc, now), customer: doc.customer, history: doc.history };
}

/** The visitor pass shown after confirmation; `qr` is the text the client encodes as a QR code. */
export function mapPass(doc) {
  return {
    ref: doc.ref,
    status: doc.status,
    room: doc.room,
    hub: doc.hub,
    date: doc.date,
    slot: formatSlot(doc.startHour, doc.duration),
    startsAt: doc.startsAt,
    endsAt: doc.endsAt,
    attendees: doc.attendees,
    qr: `VDESK-BOOKING:${doc.ref}`,
  };
}
