/**
 * Booking request schemas (zod) — one per endpoint body / query / params,
 * applied with `validate({ body, query, params })` in booking.routes.js.
 *
 * Unknown body fields are dropped, so a client-sent `totalAmount` or `state` never reaches the service.
 * Opening hours, past slots and the booking horizon depend on the clock, so the service checks those.
 */
import { z } from 'zod';
import {
  BOOKING_STATUSES,
  LIST_DEFAULT_LIMIT,
  LIST_MAX_LIMIT,
  MAX_DURATION_HOURS,
  MOBILE_PATTERN,
  STAFF_STATUS_CHANGES,
} from './booking.constants.js';
import { isCalendarDate } from './booking.time.js';

/** Forms send '' for untouched inputs; treat that the same as "not sent". */
const blankToUndefined = (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value);
const optionalText = (max) => z.preprocess(blankToUndefined, z.string().trim().max(max).optional());
const int = (min, max) => z.coerce.number().int().min(min).max(max);

/** Stored as the last 10 digits, so '+91 98765 43210' and '9876543210' count as one number for the hold cap. */
const mobile = z
  .string()
  .trim()
  .max(20)
  .transform((value) => value.replace(/[\s()-]/g, ''))
  .refine((value) => MOBILE_PATTERN.test(value), 'Enter a valid 10-digit Indian mobile number')
  .transform((value) => value.slice(-10));

const centreRef = z.string().trim().toUpperCase().min(1).max(40);
const room = z.string().trim().min(1).max(60);
const date = z.string().trim().refine(isCalendarDate, 'Date must be a real calendar date in YYYY-MM-DD form');

/** Query for GET /api/v1/bookings/availability */
export const availabilityQuery = z.object({ centreRef, room, date });

/** Body for POST /api/v1/bookings/hold (Idempotency-Key header required). */
export const holdBody = z
  .object({
    centreRef,
    room,
    date,
    /** Start of the first hour, IST, on the hour: '14:00'. */
    startTime: z
      .string()
      .trim()
      .regex(/^([01]\d|2[0-3]):00$/, 'Start time must be on the hour, HH:00 (24-hour, India time)'),
    /** Hours booked — the client's `duration`. */
    duration: int(1, MAX_DURATION_HOURS),
    attendees: int(1, 100),
    /*
     * Who is booking. No account is needed to hold a room (ADR-012) — the customer signs in with Google only
     * to pay — so the contact details come from the form. PII: stored on the booking, never logged.
     */
    name: z.string().trim().min(1, 'Name is required').max(120),
    mobile,
    email: z.preprocess(
      blankToUndefined,
      z.string().trim().toLowerCase().max(254).email('Enter a valid email').optional(),
    ),
    company: optionalText(200),
  })
  .transform(({ startTime, ...rest }) => ({ ...rest, startHour: Number(startTime.slice(0, 2)) }));

export const bookingRefParams = z.object({
  ref: z.string().trim().toUpperCase().min(1).max(60),
});

/** Body for PATCH /api/v1/bookings/:ref/status (staff). */
export const staffStatusBody = z.object({
  status: z.enum(STAFF_STATUS_CHANGES),
});

/** Query for GET /api/v1/bookings/mine (the signed-in customer). */
export const myBookingsQuery = z.object({
  cursor: z.string().trim().min(1).max(500).optional(),
  limit: int(1, LIST_MAX_LIMIT).default(LIST_DEFAULT_LIMIT),
});

/** Query for GET /api/v1/bookings (staff). */
export const listBookingsQuery = z.object({
  status: z.enum(BOOKING_STATUSES).optional(),
  centreRef: centreRef.optional(),
  date: date.optional(),
  cursor: z.string().trim().min(1).max(500).optional(),
  limit: int(1, LIST_MAX_LIMIT).default(LIST_DEFAULT_LIMIT),
});
