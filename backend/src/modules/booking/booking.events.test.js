/**
 * Booking — domain events: each is saved with the change it announces (outbox, ADR-008), only for a real move, and
 * `booking.hold_expired` only once EXPIRED is saved (by an action on the hold or the expiry job).
 * Run: npx vitest run src/modules/booking/booking.events.test.js
 */
import mongoose from 'mongoose';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearTestDb, startTestDb, stopTestDb } from '../../../test/db.js';
import { DomainEvent } from '../../shared/events/events.model.js';
import { Centre } from '../catalog/catalog.model.js';
import { HOLD_SECONDS } from './booking.constants.js';
import { Booking, BookingSlot } from './booking.model.js';
import * as service from './booking.service.js';
import { holdBody } from './booking.validation.js';

/** 09:00 IST on Sun 11 Oct 2026. */
const NOW = new Date('2026-10-11T03:30:00.000Z');
const later = (seconds) => new Date(NOW.getTime() + seconds * 1000);

let seq = 0;
const body = (overrides = {}) =>
  holdBody.parse({
    centreRef: 'CTR-NSK-001',
    room: 'Conference Room',
    date: '2026-10-12',
    startTime: '14:00',
    duration: 2,
    attendees: 4,
    customer: { name: 'Priya Kulkarni', mobile: `98765${String(++seq).padStart(5, '0')}`, email: 'p@zenith.in' },
    ...overrides,
  });
const hold = async (overrides, key = `ev-key-${++seq}`) =>
  (await service.holdBooking(body(overrides), key, NOW)).booking.ref;
const events = (type) =>
  DomainEvent.find(type ? { type } : {})
    .sort({ occurredAt: 1 })
    .lean();
const typesFor = async (ref) => (await DomainEvent.find({ 'entity.ref': ref }).lean()).map((e) => e.type).sort();

beforeAll(async () => {
  await startTestDb();
  // Fixed clock in the past: keep the TTL monitor from deleting hold slots mid-test (as booking.service.test.js).
  await mongoose.connection.db.admin().command({ setParameter: 1, ttlMonitorEnabled: false });
});
beforeEach(() =>
  Centre.create({
    ref: 'CTR-NSK-001',
    cityRef: 'CITY-NSK',
    city: 'Nashik',
    areaName: 'College Road',
    fullName: 'V-DESK Headquarters — College Road',
    address: 'College Road, Nashik',
    services: ['Meeting Rooms'],
  }),
);
afterEach(async () => {
  vi.restoreAllMocks();
  await clearTestDb();
});
afterAll(stopTestDb);

describe('booking.held', () => {
  it('is published once per hold, with refs only — a replay adds nothing', async () => {
    const key = 'held-once';
    const ref = await hold({}, key);
    await service.holdBooking(body(), key, NOW).catch(() => {}); // different body → reuse error, no event
    const [event, ...rest] = await events('booking.held');
    expect(rest).toHaveLength(0);
    expect(event).toMatchObject({ entity: { type: 'booking', ref }, actor: { type: 'public' } });
    expect(event.payload.centreRef).toBe('CTR-NSK-001');
    expect(JSON.stringify(event.payload)).not.toMatch(/Priya|98765|zenith/);
  });

  it('is not published when an hour is taken, and leaves no booking or slot behind', async () => {
    await hold();
    await expect(hold({ startTime: '15:00' })).rejects.toMatchObject({ code: 'SLOT_UNAVAILABLE' });
    expect(await events('booking.held')).toHaveLength(1);
    expect(await Booking.countDocuments()).toBe(1);
    expect(await BookingSlot.countDocuments()).toBe(2);
  });

  it('gives exactly one of two concurrent holds on the same hours its event', async () => {
    const results = await Promise.allSettled([hold(), hold()]);
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    expect(await events('booking.held')).toHaveLength(1);
    expect(await BookingSlot.countDocuments()).toBe(2);
  });

  it('saves no hold when the outbox write fails', async () => {
    vi.spyOn(DomainEvent, 'create').mockRejectedValueOnce(new Error('outbox down'));
    await expect(hold()).rejects.toThrow('outbox down');
    expect(await Booking.countDocuments()).toBe(0);
    expect(await BookingSlot.countDocuments()).toBe(0);
  });
});

describe('status events', () => {
  it('announces confirmation and cancellation once each; check-in has no event', async () => {
    const ref = await hold();
    await service.confirmBooking(ref, 'USR-OPS1', later(60));
    await service.confirmBooking(ref, 'USR-OPS1', later(61)); // already confirmed: no-op
    await service.setStatusByStaff(ref, 'CANCELLED', 'USR-OPS1', later(120));
    await service.setStatusByStaff(ref, 'CANCELLED', 'USR-OPS1', later(121)); // repeat: no-op

    expect(await typesFor(ref)).toEqual(['booking.cancelled', 'booking.confirmed', 'booking.held']);
    const [confirmed] = await events('booking.confirmed');
    expect(confirmed).toMatchObject({ actor: { type: 'user', id: 'USR-OPS1' }, payload: { from: 'HELD' } });
    const [cancelled] = await events('booking.cancelled');
    expect(cancelled.payload.from).toBe('CONFIRMED');

    const other = await hold({ startTime: '10:00' });
    await service.confirmBooking(other, 'USR-OPS1', later(60));
    await service.setStatusByStaff(other, 'CHECKED_IN', 'USR-OPS1', later(90));
    expect(await typesFor(other)).toEqual(['booking.confirmed', 'booking.held']);
  });

  it('announces a customer cancelling a hold, and nothing for a refused cancellation', async () => {
    const ref = await hold();
    await service.cancelHold(ref, later(30));
    expect((await events('booking.cancelled'))[0]).toMatchObject({ actor: { type: 'public' } });

    const confirmed = await hold({ startTime: '10:00' });
    await service.confirmBooking(confirmed, 'USR-OPS1', later(60));
    await expect(service.cancelHold(confirmed, later(70))).rejects.toMatchObject({
      code: 'CANCELLATION_REQUIRES_STAFF',
    });
    expect(await events('booking.cancelled')).toHaveLength(1);
  });

  it('keeps the booking HELD when the outbox write fails on confirmation', async () => {
    const ref = await hold();
    vi.spyOn(DomainEvent, 'create').mockRejectedValueOnce(new Error('outbox down'));
    await expect(service.confirmBooking(ref, 'USR-OPS1', later(60))).rejects.toThrow('outbox down');
    expect((await Booking.findOne({ ref }).lean()).status).toBe('HELD');
    expect(await events('booking.confirmed')).toHaveLength(0);
    // Retrying succeeds: the hours made permanent by the failed attempt are still this booking's.
    await service.confirmBooking(ref, 'USR-OPS1', later(61));
    expect(await events('booking.confirmed')).toHaveLength(1);
  });
});

describe('booking.hold_expired', () => {
  it('is published by the expiry job only after the hold lapses, once, and frees the hours', async () => {
    const ref = await hold();
    expect(await service.expireLapsedHolds({ now: later(HOLD_SECONDS - 1) })).toEqual({ expired: 0 });

    // Reads as EXPIRED at once, but nothing is announced until EXPIRED is saved.
    expect((await service.getBooking(ref, later(HOLD_SECONDS + 1))).status).toBe('EXPIRED');
    expect(await events('booking.hold_expired')).toHaveLength(0);

    expect(await service.expireLapsedHolds({ now: later(HOLD_SECONDS + 1) })).toEqual({ expired: 1 });
    expect(await service.expireLapsedHolds({ now: later(HOLD_SECONDS + 2) })).toEqual({ expired: 0 });
    const [event, ...rest] = await events('booking.hold_expired');
    expect(rest).toHaveLength(0);
    expect(event).toMatchObject({ entity: { ref }, actor: { type: 'system' }, payload: { from: 'HELD' } });
    expect((await Booking.findOne({ ref }).lean()).status).toBe('EXPIRED');
    expect(await BookingSlot.countDocuments({ bookingRef: ref })).toBe(0);
  });

  it('is published once when two jobs run at the same time', async () => {
    await hold();
    await hold({ startTime: '10:00' });
    const at = later(HOLD_SECONDS + 1);
    const runs = await Promise.all([service.expireLapsedHolds({ now: at }), service.expireLapsedHolds({ now: at })]);
    expect(runs[0].expired + runs[1].expired).toBe(2);
    expect(await events('booking.hold_expired')).toHaveLength(2);
  });

  it('is published when acting on a lapsed hold saves it as EXPIRED', async () => {
    const ref = await hold();
    await expect(service.confirmBooking(ref, 'USR-OPS1', later(HOLD_SECONDS + 1))).rejects.toMatchObject({
      code: 'HOLD_EXPIRED',
    });
    expect(await typesFor(ref)).toEqual(['booking.held', 'booking.hold_expired']);
    expect(await events('booking.confirmed')).toHaveLength(0);
  });
});
