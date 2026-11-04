/**
 * Booking routes — mounted at /api/v1/bookings in src/routes.js.
 * Each route = path + middleware (validate, auth) + one controller function. No logic here.
 */
import { Router } from 'express';
import { rateLimit } from '../../shared/middleware/rateLimit.js';
import { validate } from '../../shared/middleware/validate.js';
import { optionalCustomer, requireCustomer, requireStaff } from '../identity/index.js';
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
// Availability is read on every date/room change. Anyone may hold a room (ADR-012), so holds get a tight
// per-IP budget plus a per-mobile cap in the service (rules.md §11).
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

// No sign-in needed; a signed-in customer's hold is put in their name at once.
bookingRouter.post('/hold', holdLimit, optionalCustomer, validate({ body: holdBody }), controller.holdBooking);

// ── Signed-in customer ────────────────────────
// Customers sign in with Google to pay; claiming a guest hold is the first thing checkout does after that.
bookingRouter.post(
  '/:ref/claim',
  bookingLimit,
  requireCustomer,
  validate({ params: bookingRefParams }),
  controller.claimBooking,
);
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
