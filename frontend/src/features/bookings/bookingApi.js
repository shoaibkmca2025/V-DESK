import { api, idempotencyKey, isApiEnabled } from '@/lib/api.js';

/**
 * Meeting-room bookings against /api/v1/bookings.
 *
 * The booking state machine lives on the server: a hold locks the slot for ten minutes, payment
 * confirms it. Each call returns `null` when no API is configured, so the scheduler keeps its
 * local simulation and the page behaves the same on the static build.
 */

/** Slots already taken for a room on a date, so the picker can grey them out. */
export async function fetchAvailability({ centreRef, room, date }) {
  if (!isApiEnabled()) return null;
  try {
    return await api.get('/bookings/availability', { query: { centreRef, room, date } });
  } catch (error) {
    console.warn('[V-DESK] availability unavailable:', error.code);
    return null;
  }
}

/**
 * Holds a slot. `startTime` is on the hour in 24-hour India time ('14:00').
 * Throws an ApiError the caller can show — a clash here is a real answer, not a glitch.
 */
export async function holdBooking({ centreRef, room, date, startTime, duration, attendees, customer }) {
  if (!isApiEnabled()) return null;
  return api.post('/bookings/hold', {
    idempotencyKey: idempotencyKey('hold'),
    body: { centreRef, room, date, startTime, duration, attendees, customer },
  });
}

export async function confirmBooking(ref) {
  if (!isApiEnabled() || !ref) return null;
  try {
    return await api.post(`/bookings/${ref}/confirm`, { idempotencyKey: idempotencyKey('confirm'), body: {} });
  } catch (error) {
    console.warn('[V-DESK] booking not confirmed on the API:', error.code);
    return null;
  }
}

export async function cancelBooking(ref) {
  if (!isApiEnabled() || !ref) return null;
  try {
    return await api.post(`/bookings/${ref}/cancel`);
  } catch (error) {
    console.warn('[V-DESK] booking not cancelled on the API:', error.code);
    return null;
  }
}

export async function fetchBooking(ref) {
  if (!isApiEnabled() || !ref) return null;
  try {
    return await api.get(`/bookings/${ref}`);
  } catch {
    return null;
  }
}
