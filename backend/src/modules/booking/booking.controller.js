/**
 * Booking controller — reads `req.validated`, calls booking.service.js, sends `{ data, meta? }`.
 * No business rules and no database access here.
 */
import * as bookingService from './booking.service.js';

// ── Public ────────────────────────────────────

/** GET /api/v1/bookings/availability — one room's hourly slots for one day. */
export async function getAvailability(req, res) {
  res.json({ data: await bookingService.getAvailability(req.validated.query) });
}

/**
 * POST /api/v1/bookings/hold — 201 for a new hold, 200 when the Idempotency-Key is replayed.
 *
 * No account needed (ADR-012): the contact details come from the form. When a customer is signed in the hold
 * is theirs straight away, and their account fills in an email or company the form left blank.
 */
export async function holdBooking(req, res) {
  const { name, mobile, email, company, ...details } = req.validated.body;
  const body = {
    ...details,
    customerRef: req.customer?.ref ?? null,
    customer: {
      name,
      mobile,
      email: email ?? req.customer?.email ?? '',
      company: company ?? req.customer?.company ?? '',
    },
  };
  const { booking, created } = await bookingService.holdBooking(body, req.get('idempotency-key'));
  res.status(created ? 201 : 200).json({ data: booking });
}

/** POST /api/v1/bookings/:ref/claim — at checkout, puts a guest hold in the signed-in customer's name. */
export async function claimBooking(req, res) {
  res.json({ data: await bookingService.claimBooking(req.validated.params.ref, req.customer.ref) });
}

/** GET /api/v1/bookings/mine — the signed-in customer's own bookings. */
export async function listMyBookings(req, res) {
  const query = req.validated.query;
  const { bookings, nextCursor } = await bookingService.listBookingsForCustomer(req.customer.ref, query);
  res.json({ data: bookings, meta: { limit: query.limit, nextCursor } });
}

/** GET /api/v1/bookings/:ref — the booking, without contact details. */
export async function getBooking(req, res) {
  res.json({ data: await bookingService.getBooking(req.validated.params.ref) });
}

/** POST /api/v1/bookings/:ref/cancel — the customer releases a hold. */
export async function cancelHold(req, res) {
  res.json({ data: await bookingService.cancelHold(req.validated.params.ref) });
}

/** GET /api/v1/bookings/:ref/pass — the visitor pass of a confirmed booking. */
export async function getPass(req, res) {
  res.json({ data: await bookingService.getPass(req.validated.params.ref) });
}

// ── Staff ─────────────────────────────────────

export async function listBookings(req, res) {
  const query = req.validated.query;
  const { bookings, nextCursor } = await bookingService.listBookings(query);
  res.json({ data: bookings, meta: { limit: query.limit, nextCursor } });
}

export async function confirmBooking(req, res) {
  res.json({ data: await bookingService.confirmBooking(req.validated.params.ref, req.actor) });
}

export async function setStatus(req, res) {
  const data = await bookingService.setStatusByStaff(req.validated.params.ref, req.validated.body.status, req.actor);
  res.json({ data });
}
