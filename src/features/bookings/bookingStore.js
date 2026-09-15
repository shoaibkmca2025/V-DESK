import { readJson, writeJson } from '@/lib/storage.js';

/** Confirmed reservations shown on /bookings and in the portal (localStorage until the API exists). */

const KEY = 'VDESK_BOOKINGS';

function demoBookings() {
  return [
    { ref: 'BK-2026-9812', room: '4K Boardroom (12 Pax)', hub: 'Nashik HQ — College Road', date: '18 Sep 2026', slot: '02:00 PM - 04:00 PM', duration: 2, attendees: 8, totalAmount: 2830, state: 'confirmed', createdAt: '2026-09-01T09:00:00.000Z' },
    { ref: 'BK-2026-7734', room: 'Conference Room (8 Pax)', hub: 'Mumbai — BKC', date: '28 Aug 2026', slot: '11:00 AM - 02:00 PM', duration: 3, attendees: 6, totalAmount: 2547, state: 'completed', createdAt: '2026-08-20T09:00:00.000Z' },
  ];
}

export function getBookings() {
  const cached = readJson(KEY, null);
  if (Array.isArray(cached)) return cached;
  const seeded = demoBookings();
  writeJson(KEY, seeded);
  return seeded;
}

export function addBooking(booking) {
  const bookings = getBookings();
  bookings.unshift({ ...booking, createdAt: new Date().toISOString() });
  writeJson(KEY, bookings);
  return booking;
}

export function setBookingState(ref, state) {
  const bookings = getBookings();
  const booking = bookings.find((b) => b.ref === ref);
  if (!booking) return null;
  booking.state = state;
  writeJson(KEY, bookings);
  return booking;
}
