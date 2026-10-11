/**
 * Booking constants — statuses, the transition table, opening hours and hold length.
 *
 * Meeting rooms are booked by centre + room format (the names in pricing's `meeting_room` rule), in whole
 * hours inside opening hours, Asia/Kolkata. A hold reserves the hours for HOLD_SECONDS; staff confirm it
 * (until the orders module confirms on a verified payment).
 */

export const BOOKING_STATUSES = ['HELD', 'CONFIRMED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED', 'EXPIRED'];

/**
 * The only legal status moves (rules.md §5); anything else is 409 INVALID_STATUS_TRANSITION.
 * PAYMENT_PENDING (modules.md §3.6) arrives with the orders module; until then staff confirm a hold directly.
 * Cancelling a CONFIRMED booking is staff-only and does not refund anything (no payments exist yet).
 */
export const BOOKING_TRANSITIONS = Object.freeze({
  HELD: ['CONFIRMED', 'CANCELLED', 'EXPIRED'],
  CONFIRMED: ['CHECKED_IN', 'CANCELLED'],
  CHECKED_IN: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
  EXPIRED: [],
});

/** Statuses whose hours stay reserved. HELD only until `expiresAt`. */
export const ACTIVE_STATUSES = ['HELD', 'CONFIRMED', 'CHECKED_IN'];

/** What staff may set through PATCH /:ref/status (confirming has its own endpoint). */
export const STAFF_STATUS_CHANGES = ['CHECKED_IN', 'COMPLETED', 'CANCELLED'];

/** Statuses that have a usable visitor pass. */
export const PASS_STATUSES = ['CONFIRMED', 'CHECKED_IN'];

/** "Slot Held for 10 Minutes" — features/meetingRooms/roomBooking.js counts down 599 s from a 600 s hold. */
export const HOLD_SECONDS = 600;

/** One-hour slots: the first starts at 09:00 and the last ends at 20:00, Asia/Kolkata. */
export const OPENING_HOUR = 9;
export const CLOSING_HOUR = 20;
export const MAX_DURATION_HOURS = CLOSING_HOUR - OPENING_HOUR;

/** How far ahead a room can be booked. */
export const MAX_ADVANCE_DAYS = 90;

/** Unexpired holds one mobile number may have at once (rules.md §11 per-phone limit on public writes). */
export const MAX_ACTIVE_HOLDS_PER_MOBILE = 3;

/** India has one time zone and no daylight saving: IST = UTC + 05:30. */
export const IST_OFFSET_MINUTES = 330;

/** Same rule as crm's lead form: a 10-digit Indian mobile, optionally +91 / 91 prefixed. */
export const MOBILE_PATTERN = /^(\+?91)?[6-9]\d{9}$/;

export const LIST_DEFAULT_LIMIT = 25;
export const LIST_MAX_LIMIT = 100;
