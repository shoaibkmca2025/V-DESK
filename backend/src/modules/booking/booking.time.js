/**
 * Booking time helpers — pure functions between Asia/Kolkata calendar dates / hours and UTC instants.
 * India has no daylight saving, so a fixed +05:30 offset is exact (rules.md §14: store UTC, reason in IST).
 */
import { IST_OFFSET_MINUTES } from './booking.constants.js';

const MINUTE_MS = 60_000;
const DAY_MS = 24 * 60 * MINUTE_MS;
const OFFSET_MS = IST_OFFSET_MINUTES * MINUTE_MS;

/** 'YYYY-MM-DD' → true only for a real calendar date (no 2026-02-30). */
export function isCalendarDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const [, y, m, d] = match.map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

/** The UTC instant at which `hour`:00 IST begins on IST calendar date `date`. */
export function istInstant(date, hour) {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, hour) - OFFSET_MS);
}

/** The IST calendar date ('YYYY-MM-DD') that `now` falls on. */
export function istDate(now) {
  return new Date(now.getTime() + OFFSET_MS).toISOString().slice(0, 10);
}

/** The IST calendar date `days` after `date`. */
export function addDays(date, days) {
  return new Date(istInstant(date, 0).getTime() + OFFSET_MS + days * DAY_MS).toISOString().slice(0, 10);
}

/** 14 → '02:00 PM', 9 → '09:00 AM' — the client's slot format. */
export function formatHour(hour) {
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${String(h12).padStart(2, '0')}:00 ${hour < 12 ? 'AM' : 'PM'}`;
}

/** '02:00 PM - 04:00 PM', as features/meetingRooms/roomBooking.js shows it. */
export function formatSlot(startHour, hours) {
  return `${formatHour(startHour)} - ${formatHour(startHour + hours)}`;
}

/** 14 → '14:00' */
export function formatTime(hour) {
  return `${String(hour).padStart(2, '0')}:00`;
}
