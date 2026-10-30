/**
 * Booking routes — mounted at /api/v1/bookings in src/routes.js.
 * Each route = path + middleware (validate, auth) + one controller function. No logic here.
 */
import { Router } from 'express';
import { rateLimit } from '../../shared/middleware/rateLimit.js';
import { validate } from '../../shared/middleware/validate.js';
import { requireCustomer, requireStaff } from '../identity/index.js';
import * as controller from './booking.controller.js';
import {
  availabilityQuery,
  bookingRefParams,
  holdBody,
  listBookingsQuery,
  myBookingsQuery,
  staffStatusBody,
} from './booking.validation.js';

export const bookingRouter = Router();

// ── Public ────────────────────────────────────
// Availability is read on every date/room change; holding a room needs a signed-in customer, so the budget
// is per browser as well as per account (plus a per-mobile cap in the service — rules.md §11).
const availabilityLimit = rateLimit({ name: 'room availability', windowMs: 60_000, max: 120 });
const holdLimit = rateLimit({ name: 'room holds', windowMs: 60_000, max: 10 });
const bookingLimit = rateLimit({ name: 'bookings', windowMs: 60_000, max: 60 });

// Fixed paths before /:ref so "availability" is not read as a booking ref.
bookingRouter.get(
  '/availability',
  availabilityLimit,
  validate({ query: availabilityQuery }),
  controller.getAvailability,
);

// ── Signed-in customer ────────────────────────
// Holding a room reserves real inventory against a real person, so it needs a portal session (ADR-009).
bookingRouter.post('/hold', holdLimit, requireCustomer, validate({ body: holdBody }), controller.holdBooking);
bookingRouter.get(
  '/mine',
  bookingLimit,
  requireCustomer,
  validate({ query: myBookingsQuery }),
  controller.listMyBookings,
);

// ── Staff ─────────────────────────────────────
bookingRouter.get('/', requireStaff('bookings:read'), validate({ query: listBookingsQuery }), controller.listBookings);
bookingRouter.post(
  '/:ref/confirm',
  requireStaff('bookings:write'),
  validate({ params: bookingRefParams }),
  controller.confirmBooking,
);
bookingRouter.patch(
  '/:ref/status',
  requireStaff('bookings:write'),
  validate({ params: bookingRefParams, body: staffStatusBody }),
  controller.setStatus,
);

// ── Public (booking ref) ──────────────────────
bookingRouter.get('/:ref', bookingLimit, validate({ params: bookingRefParams }), controller.getBooking);
bookingRouter.post('/:ref/cancel', bookingLimit, validate({ params: bookingRefParams }), controller.cancelHold);
bookingRouter.get('/:ref/pass', bookingLimit, validate({ params: bookingRefParams }), controller.getPass);
