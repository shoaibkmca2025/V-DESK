/**
 * Booking module — service tests on a fixed clock: India-time boundaries, opening hours, server-side pricing,
 * hold expiry, overlap protection, multi-hour rollback, idempotency and the status machine.
 * HTTP surface, auth and privacy are covered in booking.test.js.
 * Run: npx vitest run src/modules/booking/booking.service.test.js
 */
import mongoose from 'mongoose';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearTestDb, startTestDb, stopTestDb } from '../../../test/db.js';
import { Centre } from '../catalog/catalog.model.js';
import { BOOKING_TRANSITIONS, HOLD_SECONDS } from './booking.constants.js';
import { Booking, BookingSlot } from './booking.model.js';
import * as service from './booking.service.js';
import { addDays, formatSlot, isCalendarDate, istDate, istInstant } from './booking.time.js';
import { holdBody } from './booking.validation.js';

/** 09:00 IST on Sun 11 Oct 2026. */
const NOW = new Date('2026-10-11T03:30:00.000Z');
const TODAY = '2026-10-11';
const TOMORROW = '2026-10-12';
const later = (seconds) => new Date(NOW.getTime() + seconds * 1000);

let seq = 0;
const nextKey = () => `key-${++seq}`;

/** The signed-in customer the controller passes in; `customer` overrides below change the account, not the body. */
const ACCOUNT = { name: 'Priya Kulkarni', company: 'Zenith D2C', mobile: '9876543210', email: 'priya@zenith.in' };
const CUSTOMER_REF = 'CUS-TESTER01';

/** A validated hold body plus the signed-in customer, exactly as the route and controller hand it over. */
function body({ customer, customerRef, ...overrides } = {}) {
  return {
    ...holdBody.parse({
      centreRef: 'CTR-NSK-001',
      room: 'Conference Room',
      date: TOMORROW,
      startTime: '14:00',
      duration: 2,
      attendees: 6,
      ...overrides,
    }),
    customerRef: customerRef ?? CUSTOMER_REF,
    customer: { ...ACCOUNT, ...customer },
  };
}

const hold = (overrides, key = nextKey(), now = NOW) => service.holdBooking(body(overrides), key, now);
const slotHours = async (bookingRef) =>
  (await BookingSlot.find({ bookingRef }).sort({ hour: 1 }).lean()).map((s) => s.hour);

beforeAll(async () => {
  await startTestDb();
  // These tests run on a fixed clock in the real past, so every hold's expiresAt has already passed in real time;
  // stop the TTL monitor deleting slots mid-test. Expiry is asserted on the service's own clock instead.
  await mongoose.connection.db.admin().command({ setParameter: 1, ttlMonitorEnabled: false });
});
beforeEach(() =>
  Centre.create([
    {
      ref: 'CTR-NSK-001',
      cityRef: 'CITY-NSK',
      city: 'Nashik',
      areaName: 'College Road',
      fullName: 'V-DESK Headquarters — College Road',
      address: 'College Road, Nashik',
      services: ['Virtual Office', 'Coworking', 'Meeting Rooms'],
    },
    {
      ref: 'CTR-PNQ-001',
      cityRef: 'CITY-PNQ',
      city: 'Pune',
      areaName: 'Baner',
      fullName: 'V-DESK Pune — Baner',
      address: 'Baner, Pune',
      services: ['Virtual Office', 'Coworking'],
    },
  ]),
);
afterEach(async () => {
  vi.restoreAllMocks();
  await clearTestDb();
});
afterAll(stopTestDb);

// ── Pure helpers ─────────────────────────────

describe('booking time helpers', () => {
  it('maps IST wall-clock hours to UTC instants (+05:30, no DST)', () => {
    expect(istInstant('2026-10-12', 9).toISOString()).toBe('2026-10-12T03:30:00.000Z');
    expect(istInstant('2026-10-12', 20).toISOString()).toBe('2026-10-12T14:30:00.000Z');
  });

  it('knows the IST date across the UTC midnight boundary', () => {
    expect(istDate(new Date('2026-10-11T18:29:59.999Z'))).toBe('2026-10-11');
    expect(istDate(new Date('2026-10-11T18:30:00.000Z'))).toBe('2026-10-12');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
  });

  it('accepts only real calendar dates', () => {
    expect(isCalendarDate('2028-02-29')).toBe(true);
    for (const bad of ['2026-02-29', '2026-13-01', '2026-1-1', '12-10-2026', 'tomorrow']) {
      expect(isCalendarDate(bad)).toBe(false);
    }
  });

  it('formats slots the way the client shows them', () => {
    expect(formatSlot(14, 2)).toBe('02:00 PM - 04:00 PM');
    expect(formatSlot(9, 3)).toBe('09:00 AM - 12:00 PM');
  });

  it('has an explicit, closed transition table', () => {
    expect(BOOKING_TRANSITIONS.HELD).toEqual(['CONFIRMED', 'CANCELLED', 'EXPIRED']);
    for (const terminal of ['COMPLETED', 'CANCELLED', 'EXPIRED']) expect(BOOKING_TRANSITIONS[terminal]).toEqual([]);
  });
});

describe('hold validation (schema)', () => {
  const issues = (overrides) => holdBody.safeParse({ ...body(), startTime: '14:00', ...overrides }).success;

  it('rejects malformed dates, off-the-hour times, bad durations, attendees and mobiles', () => {
    expect(issues({ date: '2026-02-30' })).toBe(false);
    expect(issues({ startTime: '14:30' })).toBe(false);
    expect(issues({ startTime: '2 PM' })).toBe(false);
    expect(issues({ duration: 0 })).toBe(false);
    expect(issues({ duration: 12 })).toBe(false);
    expect(issues({ duration: 1.5 })).toBe(false);
    expect(issues({ attendees: 0 })).toBe(false);
    expect(issues({ room: '' })).toBe(false);
    expect(issues({ company: 'C'.repeat(201) })).toBe(false);
  });

  it('parses the start hour and drops client-sent prices and identity', () => {
    const parsed = holdBody.parse({
      ...body(),
      startTime: '14:00',
      totalAmount: 1,
      customer: { name: 'Someone Else', mobile: '9123456780' },
      customerRef: 'CUS-SOMEONE',
    });
    expect(parsed.startHour).toBe(14);
    expect(parsed.totalAmount).toBeUndefined();
    // Who is booking comes from the session, so the schema throws away any identity in the request.
    expect(parsed.customer).toBeUndefined();
    expect(parsed.customerRef).toBeUndefined();
  });
});

// ── Holds ────────────────────────────────────

describe('holdBooking', () => {
  it('holds the hours for 600 s at the server price, frozen on the booking', async () => {
    const { booking, created } = await hold();
    expect(created).toBe(true);
    expect(booking).toMatchObject({
      status: 'HELD',
      hub: 'V-DESK Headquarters — College Road',
      room: 'Conference Room',
      date: TOMORROW,
      startTime: '14:00',
      endTime: '16:00',
      slot: '02:00 PM - 04:00 PM',
      duration: 2,
      // ₹799 × 2 + 18 % GST = ₹1,885.64 (pricing.engine, ADR-007)
      pricing: { product: 'meeting_room', subtotal_paise: 159800, total_paise: 188564 },
    });
    expect(booking.ref).toMatch(/^BK-[A-Z0-9]{16,}$/);
    expect(new Date(booking.expiresAt).getTime() - NOW.getTime()).toBe(HOLD_SECONDS * 1000);
    expect(new Date(booking.startsAt).toISOString()).toBe('2026-10-12T08:30:00.000Z');
    expect(await slotHours(booking.ref)).toEqual([14, 15]);

    // A later price change does not touch the stored booking.
    const stored = await Booking.findOne({ ref: booking.ref }).lean();
    expect(stored.pricing.total_paise).toBe(188564);
  });

  it('applies the duration discount from pricing rules', async () => {
    const { booking } = await hold({ startTime: '09:00', duration: 8 });
    expect(booking.pricing.discount).toMatchObject({ rate_bp: 2000 });
  });

  it('refuses unknown centres, centres without rooms, unknown rooms and too many attendees', async () => {
    await expect(hold({ centreRef: 'CTR-XXX-999' })).rejects.toMatchObject({ status: 404, code: 'CENTRE_NOT_FOUND' });
    await expect(hold({ centreRef: 'CTR-PNQ-001' })).rejects.toMatchObject({ status: 409, code: 'ROOMS_NOT_OFFERED' });
    await expect(hold({ room: 'Ballroom' })).rejects.toMatchObject({ status: 400, code: 'UNKNOWN_ROOM' });
    await expect(hold({ attendees: 9 })).rejects.toMatchObject({ status: 400, code: 'ATTENDEES_EXCEED_CAPACITY' });
    expect((await hold({ attendees: 8, room: 'conference room' })).booking.room).toBe('Conference Room');
  });

  it('keeps holds inside 09:00–20:00 IST', async () => {
    await expect(hold({ startTime: '08:00', duration: 1 })).rejects.toMatchObject({ code: 'OUTSIDE_OPENING_HOURS' });
    await expect(hold({ startTime: '19:00', duration: 2 })).rejects.toMatchObject({ code: 'OUTSIDE_OPENING_HOURS' });
    await expect(hold({ startTime: '20:00', duration: 1 })).rejects.toMatchObject({ code: 'OUTSIDE_OPENING_HOURS' });
    expect((await hold({ startTime: '19:00', duration: 1 })).created).toBe(true);
    expect((await hold({ startTime: '09:00', duration: 11, date: addDays(TOMORROW, 1) })).created).toBe(true);
  });

  it('refuses slots that have started, judged in India time', async () => {
    const justBefore = new Date('2026-10-11T08:29:59.999Z'); // 13:59:59.999 IST
    const atStart = new Date('2026-10-11T08:30:00.000Z'); // 14:00 IST
    expect((await hold({ date: TODAY }, nextKey(), justBefore)).created).toBe(true);
    await expect(
      hold({ date: TODAY, startTime: '15:00' }, nextKey(), new Date('2026-10-11T09:30:00Z')),
    ).rejects.toMatchObject({ code: 'SLOT_IN_PAST' });
    await expect(hold({ date: TODAY, startTime: '14:00' }, nextKey(), atStart)).rejects.toMatchObject({
      code: 'SLOT_IN_PAST',
    });
  });

  it('uses the IST date, not the UTC date, for "today"', async () => {
    const lateNightUtc = new Date('2026-10-11T19:00:00.000Z'); // 00:30 IST on 12 Oct
    await expect(hold({ date: TODAY, startTime: '19:00', duration: 1 }, nextKey(), lateNightUtc)).rejects.toMatchObject(
      { code: 'DATE_OUT_OF_RANGE' },
    );
    expect((await hold({ date: TOMORROW, startTime: '09:00' }, nextKey(), lateNightUtc)).created).toBe(true);
  });

  it('books at most 90 days ahead', async () => {
    expect((await hold({ date: addDays(TODAY, 90) })).created).toBe(true);
    await expect(hold({ date: addDays(TODAY, 91) })).rejects.toMatchObject({ code: 'DATE_OUT_OF_RANGE' });
  });

  it('needs an Idempotency-Key and replays it without new bookings or slots', async () => {
    await expect(service.holdBooking(body(), undefined, NOW)).rejects.toMatchObject({
      code: 'IDEMPOTENCY_KEY_REQUIRED',
    });
    const first = await hold({}, 'same-key');
    const replay = await hold({}, 'same-key', later(5));
    expect(replay.created).toBe(false);
    expect(replay.booking.ref).toBe(first.booking.ref);
    expect(await Booking.countDocuments()).toBe(1);
    expect(await BookingSlot.countDocuments()).toBe(2);

    await expect(hold({ attendees: 4 }, 'same-key')).rejects.toMatchObject({ code: 'IDEMPOTENCY_KEY_REUSED' });
  });

  it('treats parallel requests with the same key as one booking', async () => {
    const settled = await Promise.allSettled([hold({}, 'twin'), hold({}, 'twin'), hold({}, 'twin')]);
    const results = settled.filter((r) => r.status === 'fulfilled').map((r) => r.value);
    // A replay that arrives while the original is still reserving is told to retry, never given another ref.
    for (const r of settled.filter((s) => s.status === 'rejected')) {
      expect(r.reason.code).toBe('IDEMPOTENCY_KEY_IN_PROGRESS');
    }
    expect(new Set(results.map((r) => r.booking.ref)).size).toBe(1);
    expect(results.filter((r) => r.created)).toHaveLength(1);
    expect(await Booking.countDocuments()).toBe(1);
    expect(await BookingSlot.countDocuments()).toBe(2);
  });

  it('caps unexpired holds per mobile', async () => {
    for (const startTime of ['09:00', '11:00', '13:00']) await hold({ startTime, duration: 1 });
    await expect(hold({ startTime: '15:00', duration: 1 })).rejects.toMatchObject({
      status: 429,
      code: 'TOO_MANY_HOLDS',
    });
    // Expired holds no longer count.
    expect((await hold({ startTime: '15:00', duration: 1 }, nextKey(), later(HOLD_SECONDS))).created).toBe(true);
  });
});

// ── Overlaps and rollback ────────────────────

describe('overlap protection', () => {
  const other = (overrides) => ({ customer: { name: 'Other', mobile: '9123456780' }, ...overrides });

  it('refuses an overlapping hold and allows adjacent ones', async () => {
    await hold({ startTime: '10:00', duration: 2 });
    await expect(hold(other({ startTime: '11:00', duration: 2 }))).rejects.toMatchObject({
      status: 409,
      code: 'SLOT_UNAVAILABLE',
      details: { taken: ['11:00'] },
    });
    expect((await hold(other({ startTime: '12:00', duration: 1 }))).created).toBe(true);
    expect((await hold(other({ startTime: '09:00', duration: 1 }))).created).toBe(true);
    // Same hours in another room or on another day are independent.
    expect((await hold(other({ startTime: '10:00', room: 'Boardroom' }))).created).toBe(true);
  });

  it('lets exactly one of many parallel overlapping holds win', async () => {
    const mobiles = ['9000000001', '9000000002', '9000000003', '9000000004', '9000000005', '9000000006'];
    const results = await Promise.allSettled(
      mobiles.map((mobile, i) =>
        hold({ startTime: `${10 + (i % 2)}:00`, duration: 2, customer: { name: 'Racer', mobile } }),
      ),
    );
    const won = results.filter((r) => r.status === 'fulfilled');
    expect(won).toHaveLength(1);
    for (const lost of results.filter((r) => r.status === 'rejected')) {
      expect(lost.reason.code).toBe('SLOT_UNAVAILABLE');
    }
    expect(await Booking.countDocuments()).toBe(1);
    expect(await slotHours(won[0].value.booking.ref)).toHaveLength(2);
    expect(await BookingSlot.countDocuments()).toBe(2);
  });

  it('releases the hours it inserted when a later hour is taken', async () => {
    await hold({ startTime: '12:00', duration: 1 });
    // 10:00 and 11:00 go in first, then 12:00 collides.
    await expect(hold(other({ startTime: '10:00', duration: 3 }))).rejects.toMatchObject({
      code: 'SLOT_UNAVAILABLE',
      details: { taken: ['12:00'] },
    });
    expect((await BookingSlot.find().lean()).map((s) => s.hour)).toEqual([12]);
    expect(await Booking.countDocuments()).toBe(1);
    // The failed key can be retried once the clash is gone.
    expect((await hold(other({ startTime: '09:00', duration: 3 }))).created).toBe(true);
  });

  it('rolls back on an unexpected failure part-way through inserting slots', async () => {
    const realInsert = BookingSlot.insertMany.bind(BookingSlot);
    vi.spyOn(BookingSlot, 'insertMany').mockImplementationOnce(async (docs) => {
      await realInsert(docs.slice(0, 1));
      throw new Error('connection reset');
    });
    await expect(hold({ startTime: '10:00', duration: 3 })).rejects.toThrow('connection reset');
    expect(await BookingSlot.countDocuments()).toBe(0);
    expect(await Booking.countDocuments()).toBe(0);
  });
});

// ── Expiry ───────────────────────────────────

describe('hold expiry', () => {
  it('reads as EXPIRED after 600 s and stops blocking the hours at once', async () => {
    const { booking } = await hold();
    expect((await service.getBooking(booking.ref, later(HOLD_SECONDS - 1))).status).toBe('HELD');
    expect((await service.getBooking(booking.ref, later(HOLD_SECONDS))).status).toBe('EXPIRED');

    const avail = await service.getAvailability(
      { centreRef: 'CTR-NSK-001', room: 'Conference Room', date: TOMORROW },
      later(HOLD_SECONDS),
    );
    expect(avail.slots.filter((s) => !s.available)).toEqual([]);

    // The lapsed slot documents are still there (TTL not run) — a new hold takes the hours anyway.
    expect(await BookingSlot.countDocuments({ bookingRef: booking.ref })).toBe(2);
    const next = await hold({ customer: { name: 'Next', mobile: '9123456780' } }, nextKey(), later(HOLD_SECONDS));
    expect(next.created).toBe(true);
    expect(await slotHours(next.booking.ref)).toEqual([14, 15]);
    expect(await BookingSlot.countDocuments({ bookingRef: booking.ref })).toBe(0);
  });
});

// ── Status changes ───────────────────────────

describe('confirm, cancel and staff moves', () => {
  it('confirms a live hold: slots become permanent and survive the hold window', async () => {
    const { booking } = await hold();
    const confirmed = await service.confirmBooking(booking.ref, 'USR-OPS', later(HOLD_SECONDS - 1));
    expect(confirmed.status).toBe('CONFIRMED');
    expect(confirmed.history.at(-1)).toMatchObject({ status: 'CONFIRMED', actor: 'USR-OPS' });
    expect(await BookingSlot.countDocuments({ bookingRef: booking.ref, expiresAt: null })).toBe(2);

    const avail = await service.getAvailability(
      { centreRef: 'CTR-NSK-001', room: 'Conference Room', date: TOMORROW },
      later(3600),
    );
    expect(avail.slots.filter((s) => !s.available).map((s) => s.startTime)).toEqual(['14:00', '15:00']);
    await expect(
      hold({ customer: { name: 'Late', mobile: '9123456780' } }, nextKey(), later(3600)),
    ).rejects.toMatchObject({ code: 'SLOT_UNAVAILABLE' });

    // Confirming again is a no-op.
    expect((await service.confirmBooking(booking.ref, 'USR-OPS', later(3600))).status).toBe('CONFIRMED');
  });

  it('refuses to confirm an expired hold, saves EXPIRED and frees the hours', async () => {
    const { booking } = await hold();
    await expect(service.confirmBooking(booking.ref, 'USR-OPS', later(HOLD_SECONDS))).rejects.toMatchObject({
      status: 409,
      code: 'HOLD_EXPIRED',
    });
    expect((await Booking.findOne({ ref: booking.ref }).lean()).status).toBe('EXPIRED');
    expect(await BookingSlot.countDocuments({ bookingRef: booking.ref })).toBe(0);
  });

  it('never confirms a hold that lost its hours, and cancels it', async () => {
    const { booking } = await hold();
    await BookingSlot.deleteOne({ bookingRef: booking.ref, hour: 15 }); // e.g. a crash mid-hold
    await expect(service.confirmBooking(booking.ref, 'USR-OPS', later(10))).rejects.toMatchObject({
      code: 'SLOT_UNAVAILABLE',
    });
    const stored = await Booking.findOne({ ref: booking.ref }).lean();
    expect(stored.status).toBe('CANCELLED');
    expect(stored.history.at(-1)).toMatchObject({ status: 'CANCELLED', actor: 'system' });
    expect(await BookingSlot.countDocuments()).toBe(0);
  });

  it('lets only one of two parallel confirmations win', async () => {
    const { booking } = await hold();
    const results = await Promise.allSettled([
      service.confirmBooking(booking.ref, 'USR-A', later(10)),
      service.confirmBooking(booking.ref, 'USR-B', later(10)),
    ]);
    const stored = await Booking.findOne({ ref: booking.ref }).lean();
    expect(stored.status).toBe('CONFIRMED');
    expect(stored.history.filter((h) => h.status === 'CONFIRMED')).toHaveLength(1);
    expect(results.some((r) => r.status === 'fulfilled')).toBe(true);
    expect(await BookingSlot.countDocuments({ bookingRef: booking.ref, expiresAt: null })).toBe(2);
  });

  it('lets the customer cancel a hold, freeing the hours; repeating is a no-op', async () => {
    const { booking } = await hold();
    expect((await service.cancelHold(booking.ref, later(10))).status).toBe('CANCELLED');
    expect(await BookingSlot.countDocuments()).toBe(0);
    expect((await service.cancelHold(booking.ref, later(20))).status).toBe('CANCELLED');
    await expect(service.confirmBooking(booking.ref, 'USR-OPS', later(30))).rejects.toMatchObject({
      code: 'INVALID_STATUS_TRANSITION',
    });
  });

  it('keeps confirmed bookings out of customer cancellation; staff cancel frees the hours', async () => {
    const { booking } = await hold();
    await service.confirmBooking(booking.ref, 'USR-OPS', later(10));
    await expect(service.cancelHold(booking.ref, later(20))).rejects.toMatchObject({
      code: 'CANCELLATION_REQUIRES_STAFF',
    });
    const cancelled = await service.setStatusByStaff(booking.ref, 'CANCELLED', 'USR-OPS', later(30));
    expect(cancelled.status).toBe('CANCELLED');
    expect(await BookingSlot.countDocuments()).toBe(0);
  });

  it('walks CONFIRMED → CHECKED_IN → COMPLETED and refuses illegal moves', async () => {
    const { booking } = await hold();
    await expect(service.setStatusByStaff(booking.ref, 'COMPLETED', 'USR-OPS', later(5))).rejects.toMatchObject({
      status: 409,
      code: 'INVALID_STATUS_TRANSITION',
    });
    await expect(service.setStatusByStaff(booking.ref, 'CHECKED_IN', 'USR-OPS', later(5))).rejects.toMatchObject({
      code: 'INVALID_STATUS_TRANSITION',
    });
    await service.confirmBooking(booking.ref, 'USR-OPS', later(10));
    expect((await service.setStatusByStaff(booking.ref, 'CHECKED_IN', 'USR-OPS', later(20))).status).toBe('CHECKED_IN');
    await expect(service.setStatusByStaff(booking.ref, 'CANCELLED', 'USR-OPS', later(25))).rejects.toMatchObject({
      code: 'INVALID_STATUS_TRANSITION',
    });
    expect((await service.setStatusByStaff(booking.ref, 'COMPLETED', 'USR-OPS', later(30))).status).toBe('COMPLETED');
    // Completed bookings keep their hours on record.
    expect(await BookingSlot.countDocuments({ bookingRef: booking.ref })).toBe(2);
  });

  it('saves EXPIRED when anything acts on a lapsed hold', async () => {
    const { booking } = await hold();
    await expect(service.cancelHold(booking.ref, later(HOLD_SECONDS + 1))).rejects.toMatchObject({
      code: 'HOLD_EXPIRED',
    });
    expect((await Booking.findOne({ ref: booking.ref }).lean()).status).toBe('EXPIRED');
  });
});

// ── Review regressions: crash windows, races, leftovers ────────────────────

/** The status a booking is in and the hours it holds, checked against the slot invariants. */
async function assertConsistent(ref) {
  const booking = await Booking.findOne({ ref }).lean();
  const slots = await BookingSlot.find({ bookingRef: ref }).lean();
  const permanent = slots.filter((s) => s.expiresAt === null).length;
  if (['CONFIRMED', 'CHECKED_IN'].includes(booking.status)) {
    expect(permanent).toBe(booking.duration);
    expect(slots).toHaveLength(booking.duration);
  }
  if (['CANCELLED', 'EXPIRED'].includes(booking.status)) expect(slots).toHaveLength(0);
  if (booking.status === 'HELD') expect(permanent === 0 || permanent === booking.duration).toBe(true);
  return booking.status;
}

/** Makes the next Booking status write to `status` fail as if the process died there. */
function crashOnStatusWrite(status) {
  const real = Booking.findOneAndUpdate.bind(Booking);
  let armed = true;
  vi.spyOn(Booking, 'findOneAndUpdate').mockImplementation((filter, update, options) => {
    if (armed && update?.$set?.status === status) {
      armed = false;
      return { lean: async () => Promise.reject(new Error('process crashed')) };
    }
    return real(filter, update, options);
  });
}

/** Holds the next slot insert until `release()` — lets a test act while a hold is half-way through. */
function pauseSlotInsert() {
  const real = BookingSlot.insertMany.bind(BookingSlot);
  let release;
  let entered;
  const gate = new Promise((resolve) => (release = resolve));
  const reached = new Promise((resolve) => (entered = resolve));
  vi.spyOn(BookingSlot, 'insertMany').mockImplementationOnce(async (...args) => {
    entered();
    await gate;
    return real(...args);
  });
  return { reached, release };
}

const mobileFor = (i) => `91000${String(i).padStart(5, '0')}`;
const takenAt = async (date, now) =>
  (await service.getAvailability({ centreRef: 'CTR-NSK-001', room: 'Conference Room', date }, now)).slots
    .filter((s) => !s.available)
    .map((s) => s.startTime);

describe('confirmation ordering (review F1–F3)', () => {
  it('makes every hour permanent before the booking reads CONFIRMED', async () => {
    const { booking } = await hold();
    const real = Booking.findOneAndUpdate.bind(Booking);
    const seen = [];
    vi.spyOn(Booking, 'findOneAndUpdate').mockImplementation((filter, update, options) => ({
      lean: async () => {
        if (update?.$set?.status === 'CONFIRMED') {
          seen.push(await BookingSlot.countDocuments({ bookingRef: filter.ref, expiresAt: null }));
        }
        return real(filter, update, options).lean();
      },
    }));
    await service.confirmBooking(booking.ref, 'USR-OPS', later(10));
    expect(seen).toEqual([2]);
  });

  it('a crash before the CONFIRMED write leaves a HELD booking: no pass, hours freed when it lapses', async () => {
    const { booking } = await hold();
    crashOnStatusWrite('CONFIRMED');
    await expect(service.confirmBooking(booking.ref, 'USR-OPS', later(10))).rejects.toThrow('process crashed');
    vi.restoreAllMocks();

    expect((await Booking.findOne({ ref: booking.ref }).lean()).status).toBe('HELD');
    await expect(service.getPass(booking.ref)).rejects.toMatchObject({ code: 'PASS_NOT_AVAILABLE' });
    expect(await takenAt(TOMORROW, later(10))).toEqual(['14:00', '15:00']);

    // Its slots are permanent (the TTL index won't touch them), yet once the hold lapses nobody is blocked.
    expect(await takenAt(TOMORROW, later(HOLD_SECONDS))).toEqual([]);
    const next = await hold({ customer: { name: 'Next', mobile: '9123456780' } }, nextKey(), later(HOLD_SECONDS));
    expect(next.created).toBe(true);
    expect((await Booking.findOne({ ref: booking.ref }).lean()).status).toBe('EXPIRED');
    await assertConsistent(booking.ref);
    await assertConsistent(next.booking.ref);
  });

  it('a retried confirmation after that crash completes normally', async () => {
    const { booking } = await hold();
    crashOnStatusWrite('CONFIRMED');
    await expect(service.confirmBooking(booking.ref, 'USR-OPS', later(10))).rejects.toThrow();
    vi.restoreAllMocks();
    expect((await service.confirmBooking(booking.ref, 'USR-OPS', later(20))).status).toBe('CONFIRMED');
    await assertConsistent(booking.ref);
  });

  it('never ends CONFIRMED without its hours when confirmation races cancellation', async () => {
    for (let i = 0; i < 8; i++) {
      const { booking } = await hold({ date: addDays(TOMORROW, i), customer: { name: 'R', mobile: mobileFor(i) } });
      await Promise.allSettled([
        service.confirmBooking(booking.ref, 'USR-OPS', later(10)),
        service.cancelHold(booking.ref, later(10)),
      ]);
      expect(['CONFIRMED', 'CANCELLED']).toContain(await assertConsistent(booking.ref));
    }
  });

  it('never double-books when confirmation races a new hold at the expiry instant', async () => {
    for (let i = 0; i < 8; i++) {
      const date = addDays(TOMORROW, i);
      const { booking } = await hold({ date, customer: { name: 'A', mobile: mobileFor(i) } });
      const [confirm, rival] = await Promise.allSettled([
        service.confirmBooking(booking.ref, 'USR-OPS', later(HOLD_SECONDS - 1)),
        hold({ date, customer: { name: 'B', mobile: mobileFor(100 + i) } }, nextKey(), later(HOLD_SECONDS)),
      ]);
      const status = await assertConsistent(booking.ref);
      if (status === 'CONFIRMED') {
        expect(confirm.status).toBe('fulfilled');
        expect(rival.status).toBe('rejected');
        expect(rival.reason.code).toBe('SLOT_UNAVAILABLE');
      } else {
        expect(status).toBe('EXPIRED');
        expect(rival.status).toBe('fulfilled');
        await assertConsistent(rival.value.booking.ref);
      }
    }
  });

  it('keeps one consistent outcome when two confirmations run with skewed clocks around expiry', async () => {
    for (let i = 0; i < 8; i++) {
      const { booking } = await hold({ date: addDays(TOMORROW, i), customer: { name: 'R', mobile: mobileFor(i) } });
      await Promise.allSettled([
        service.confirmBooking(booking.ref, 'USR-A', later(HOLD_SECONDS - 1)),
        service.confirmBooking(booking.ref, 'USR-B', later(HOLD_SECONDS + 1)),
      ]);
      const status = await assertConsistent(booking.ref);
      expect(['CONFIRMED', 'EXPIRED']).toContain(status);
      const stored = await Booking.findOne({ ref: booking.ref }).lean();
      expect(stored.history.filter((h) => h.status === 'CONFIRMED').length).toBe(status === 'CONFIRMED' ? 1 : 0);
    }
  });
});

describe('leftover slots never block (review F4)', () => {
  it('a crash between a staff cancellation and its slot clean-up does not block the hours', async () => {
    const { booking } = await hold();
    await service.confirmBooking(booking.ref, 'USR-OPS', later(10));
    vi.spyOn(BookingSlot, 'deleteMany').mockRejectedValueOnce(new Error('process crashed'));
    await expect(service.setStatusByStaff(booking.ref, 'CANCELLED', 'USR-OPS', later(20))).rejects.toThrow();
    vi.restoreAllMocks();

    expect((await Booking.findOne({ ref: booking.ref }).lean()).status).toBe('CANCELLED');
    expect(await BookingSlot.countDocuments({ bookingRef: booking.ref, expiresAt: null })).toBe(2);
    expect(await takenAt(TOMORROW, later(30))).toEqual([]);
    const next = await hold({ customer: { name: 'Next', mobile: '9123456780' } }, nextKey(), later(30));
    expect(next.created).toBe(true);
    await assertConsistent(booking.ref);
  });

  it('ignores and clears slots whose booking no longer exists', async () => {
    await BookingSlot.create({
      centreRef: 'CTR-NSK-001',
      room: 'Conference Room',
      date: TOMORROW,
      hour: 14,
      bookingRef: 'BK-GONE',
    });
    expect(await takenAt(TOMORROW, NOW)).toEqual([]);
    expect((await hold()).created).toBe(true);
    expect(await BookingSlot.countDocuments({ bookingRef: 'BK-GONE' })).toBe(0);
  });
});

describe('expired holds and the transition table (review F6)', () => {
  it('answers HOLD_EXPIRED every time, whether or not the expiry was saved yet', async () => {
    const { booking } = await hold();
    const at = later(HOLD_SECONDS);
    await expect(service.cancelHold(booking.ref, at)).rejects.toMatchObject({ code: 'HOLD_EXPIRED' });
    await expect(service.cancelHold(booking.ref, at)).rejects.toMatchObject({ code: 'HOLD_EXPIRED' });
    await expect(service.confirmBooking(booking.ref, 'USR-OPS', at)).rejects.toMatchObject({ code: 'HOLD_EXPIRED' });
    await expect(service.setStatusByStaff(booking.ref, 'CANCELLED', 'USR-OPS', at)).rejects.toMatchObject({
      code: 'HOLD_EXPIRED',
    });
    expect(await assertConsistent(booking.ref)).toBe('EXPIRED');
  });

  it('follows the transition table for every staff move, freeing hours only on cancellation', async () => {
    const setups = {
      HELD: async (i) =>
        (await hold({ date: addDays(TOMORROW, i), customer: { name: 'T', mobile: mobileFor(i) } })).booking.ref,
      CONFIRMED: async (i) => {
        const ref = await setups.HELD(i);
        await service.confirmBooking(ref, 'USR-OPS', later(5));
        return ref;
      },
      CHECKED_IN: async (i) => {
        const ref = await setups.CONFIRMED(i);
        await service.setStatusByStaff(ref, 'CHECKED_IN', 'USR-OPS', later(6));
        return ref;
      },
      COMPLETED: async (i) => {
        const ref = await setups.CHECKED_IN(i);
        await service.setStatusByStaff(ref, 'COMPLETED', 'USR-OPS', later(7));
        return ref;
      },
      CANCELLED: async (i) => {
        const ref = await setups.HELD(i);
        await service.cancelHold(ref, later(5));
        return ref;
      },
    };
    let i = 0;
    for (const [from, setup] of Object.entries(setups)) {
      for (const to of ['CHECKED_IN', 'COMPLETED', 'CANCELLED']) {
        const ref = await setup(i++);
        const kept = await BookingSlot.countDocuments({ bookingRef: ref });
        const attempt = service.setStatusByStaff(ref, to, 'USR-OPS', later(10));
        if (from === to || BOOKING_TRANSITIONS[from].includes(to)) {
          expect((await attempt).status).toBe(to);
          expect(await BookingSlot.countDocuments({ bookingRef: ref })).toBe(to === 'CANCELLED' ? 0 : kept);
        } else {
          await expect(attempt).rejects.toMatchObject({ status: 409, code: 'INVALID_STATUS_TRANSITION' });
          expect(await BookingSlot.countDocuments({ bookingRef: ref })).toBe(kept);
        }
        await assertConsistent(ref);
      }
    }
  });
});

describe('idempotency while the original is in flight (review F5)', () => {
  it('tells a replay to retry while the original is still reserving, then replays it', async () => {
    const paused = pauseSlotInsert();
    const original = hold({}, 'in-flight');
    await paused.reached;
    await expect(hold({}, 'in-flight')).rejects.toMatchObject({ status: 409, code: 'IDEMPOTENCY_KEY_IN_PROGRESS' });
    paused.release();
    const { booking, created } = await original;
    expect(created).toBe(true);

    const replay = await hold({}, 'in-flight');
    expect(replay).toMatchObject({ created: false, booking: { ref: booking.ref } });
    expect(await BookingSlot.countDocuments()).toBe(2);
  });

  it('never hands out a ref that the original then rolls back', async () => {
    await hold({ startTime: '15:00', duration: 1, customer: { name: 'First', mobile: '9123456780' } });
    const paused = pauseSlotInsert();
    const original = hold({}, 'doomed');
    await paused.reached;
    await expect(hold({}, 'doomed')).rejects.toMatchObject({ code: 'IDEMPOTENCY_KEY_IN_PROGRESS' });
    paused.release();
    await expect(original).rejects.toMatchObject({ code: 'SLOT_UNAVAILABLE' });

    expect(await Booking.countDocuments()).toBe(1);
    // With the key free again, a retry is a fresh attempt.
    await expect(hold({}, 'doomed')).rejects.toMatchObject({ code: 'SLOT_UNAVAILABLE' });
  });
});

// ── Crash after the booking insert, before its slots (accepted limitation) ─────────────

/**
 * Simulates the process dying while a hold reserves its hours: the slot insert fails after `inserted` hours and the
 * rollback dies too, leaving a HELD booking (holding the Idempotency-Key) with incomplete slots.
 */
async function crashMidHold(key, inserted, overrides) {
  const realInsert = BookingSlot.insertMany.bind(BookingSlot);
  vi.spyOn(BookingSlot, 'insertMany').mockImplementationOnce(async (docs) => {
    if (inserted > 0) await realInsert(docs.slice(0, inserted));
    throw new Error('process crashed');
  });
  vi.spyOn(BookingSlot, 'deleteMany').mockRejectedValueOnce(new Error('process crashed'));
  await expect(hold(overrides, key)).rejects.toThrow('process crashed');
  vi.restoreAllMocks();
  return Booking.findOne({ idempotencyKey: key }).lean();
}

describe('a hold whose process died before reserving its hours', () => {
  it('answers IDEMPOTENCY_KEY_IN_PROGRESS with the worst-case wait until it lapses, then replays EXPIRED for good', async () => {
    const stuck = await crashMidHold('stuck-key', 1);
    expect(stuck.status).toBe('HELD');
    expect(await BookingSlot.countDocuments({ bookingRef: stuck.ref })).toBe(1);

    for (const at of [later(1), later(HOLD_SECONDS - 1)]) {
      await expect(hold({}, 'stuck-key', at)).rejects.toMatchObject({
        status: 409,
        code: 'IDEMPOTENCY_KEY_IN_PROGRESS',
        details: { expiresAt: later(HOLD_SECONDS) },
      });
    }
    for (const at of [later(HOLD_SECONDS), later(86_400)]) {
      const replay = await hold({}, 'stuck-key', at);
      expect(replay).toMatchObject({ created: false, booking: { ref: stuck.ref, status: 'EXPIRED' } });
    }
    expect(await Booking.countDocuments()).toBe(1);
  });

  it('blocks only the hours it inserted, and only until it lapses; a new key never duplicates it', async () => {
    const stuck = await crashMidHold('stuck-key', 1); // holds 14:00, not 15:00
    const retry = { customer: { name: 'Priya Kulkarni', mobile: '9876543210' } };
    expect(await takenAt(TOMORROW, later(1))).toEqual(['14:00']);
    await expect(hold(retry, 'fresh-key', later(1))).rejects.toMatchObject({ code: 'SLOT_UNAVAILABLE' });

    const fresh = await hold(retry, 'fresh-key', later(HOLD_SECONDS));
    expect(fresh.created).toBe(true);
    expect(await assertConsistent(stuck.ref)).toBe('EXPIRED');
    expect(await assertConsistent(fresh.booking.ref)).toBe('HELD');
    expect(await Booking.countDocuments({ status: 'HELD' })).toBe(1);
  });

  it('blocks nothing when it died before inserting any hour', async () => {
    const stuck = await crashMidHold('stuck-key', 0);
    expect(await takenAt(TOMORROW, later(1))).toEqual([]);
    const fresh = await hold({}, 'fresh-key', later(1));
    expect(fresh.created).toBe(true);
    expect(await slotHours(fresh.booking.ref)).toEqual([14, 15]);
    // The stuck one can never be confirmed into a booking without hours.
    await expect(service.confirmBooking(stuck.ref, 'USR-OPS', later(2))).rejects.toMatchObject({
      code: 'SLOT_UNAVAILABLE',
    });
    expect(await assertConsistent(stuck.ref)).toBe('CANCELLED');
  });
});
