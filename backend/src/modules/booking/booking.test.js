/**
 * Booking module — HTTP tests: availability, holds, the public booking view and pass, cancellation, staff
 * confirmation / status / list, authentication, permissions and privacy. Business rules on a fixed clock are in
 * booking.service.test.js.
 * Run: npx vitest run src/modules/booking/booking.test.js
 */
import request from 'supertest';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../../app.js';
import { clearTestDb, count, insert, row, startTestDb, stopTestDb } from '../../../test/db.js';
import { customerSession } from '../../../test/customer.js';
import { ADMIN_KEY, staffSession } from '../../../test/staff.js';
import { HOLD_SECONDS } from './booking.constants.js';
import * as repo from './booking.repository.js';
import { addDays, istDate } from './booking.time.js';

const app = createApp();

/** A stored booking, under the field names the module uses; `id` is the surrogate key the API never shows. */
const storedBooking = (where, params) =>
  row(
    `SELECT id::text AS id, ref, status, customer_ref AS "customerRef", customer, history,
            expires_at AS "expiresAt", idempotency_key AS "idempotencyKey", request_hash AS "requestHash"
       FROM bookings WHERE ${where}`,
    params,
  );
const date = () => addDays(istDate(new Date()), 1);

/** Who is booking: typed into the form — no account is needed to hold a room (ADR-012). */
const CUSTOMER = { name: 'Priya Kulkarni', company: 'Zenith D2C', mobile: '9876543210', email: 'priya@zenith.in' };
const holdRequest = (overrides = {}) => ({
  centreRef: 'ctr-nsk-001',
  room: 'Conference Room',
  date: date(),
  startTime: '14:00',
  duration: 2,
  attendees: 6,
  ...CUSTOMER,
  ...overrides,
});

let seq = 0;
/** A guest hold unless `auth` signs a customer in. */
const postHold = (body = holdRequest(), key = `route-key-${++seq}`, auth = {}) =>
  request(app).post('/api/v1/bookings/hold').set('Idempotency-Key', key).set(auth).send(body);
const availability = (query) =>
  request(app)
    .get('/api/v1/bookings/availability')
    .query({ centreRef: 'CTR-NSK-001', room: 'Conference Room', date: date(), ...query });
const adminKey = { 'x-admin-key': ADMIN_KEY };

async function heldRef(overrides) {
  const res = await postHold(holdRequest(overrides));
  expect(res.status).toBe(201);
  return res.body.data.ref;
}

beforeAll(startTestDb);
beforeEach(async () => {
  await insert('centres', {
    ref: 'CTR-NSK-001',
    cityRef: 'CITY-NSK',
    city: 'Nashik',
    areaName: 'College Road',
    fullName: 'V-DESK Headquarters — College Road',
    address: 'College Road, Nashik',
    services: ['Virtual Office', 'Meeting Rooms'],
  });
});
afterEach(async () => {
  vi.useRealTimers();
  await clearTestDb();
});
afterAll(stopTestDb);

describe('GET /api/v1/bookings/availability', () => {
  it('lists the eleven one-hour slots, 09:00–20:00 IST, with held hours taken', async () => {
    await heldRef();
    const res = await availability();
    expect(res.status).toBe(200);
    const { data } = res.body;
    expect(data).toMatchObject({
      centreRef: 'CTR-NSK-001',
      hub: 'V-DESK Headquarters — College Road',
      room: 'Conference Room',
      roomCapacity: '8 Pax',
      rate_hour_paise: 79900,
      opensAt: '09:00',
      closesAt: '20:00',
    });
    expect(data.slots).toHaveLength(11);
    expect(data.slots[0]).toEqual({
      startTime: '09:00',
      endTime: '10:00',
      slot: '09:00 AM - 10:00 AM',
      available: true,
    });
    expect(data.slots.filter((s) => !s.available).map((s) => s.startTime)).toEqual(['14:00', '15:00']);
  });

  it('validates the query', async () => {
    expect((await availability({ date: '2026-02-30' })).body.error.code).toBe('VALIDATION_FAILED');
    expect((await availability({ room: undefined, centreRef: undefined })).status).toBe(400);
    expect((await availability({ room: 'Ballroom' })).body.error.code).toBe('UNKNOWN_ROOM');
    expect((await availability({ centreRef: 'CTR-XXX-999' })).status).toBe(404);
    expect((await availability({ date: addDays(date(), -3) })).body.error.code).toBe('DATE_OUT_OF_RANGE');
  });
});

describe('POST /api/v1/bookings/hold', () => {
  it('holds the room at the server price and returns no contact details', async () => {
    const res = await postHold(holdRequest({ totalAmount: 1, pricing: { total_paise: 1 }, state: 'confirmed' }));
    expect(res.status).toBe(201);
    const booking = res.body.data;
    expect(booking).toMatchObject({
      status: 'HELD',
      room: 'Conference Room',
      slot: '02:00 PM - 04:00 PM',
      pricing: { total_paise: 188564 },
    });
    expect(booking.ref).toMatch(/^BK-[A-Z0-9]{16,}$/);
    for (const field of ['_id', 'customer', 'idempotencyKey', 'requestHash', 'history', 'totalAmount']) {
      expect(booking[field]).toBeUndefined();
    }
    const raw = JSON.stringify(booking);
    for (const pii of [CUSTOMER.name, CUSTOMER.mobile, CUSTOMER.email, CUSTOMER.company])
      expect(raw).not.toContain(pii);
  });

  it('needs an Idempotency-Key and replays it', async () => {
    const missing = await request(app).post('/api/v1/bookings/hold').send(holdRequest());
    expect(missing.status).toBe(400);
    expect(missing.body.error.code).toBe('IDEMPOTENCY_KEY_REQUIRED');

    const first = await postHold(holdRequest(), 'replay-key');
    const replay = await postHold(holdRequest(), 'replay-key');
    expect(replay.status).toBe(200);
    expect(replay.body.data.ref).toBe(first.body.data.ref);
    expect(await count('bookings')).toBe(1);
  });

  it('answers a replay of a hold that died mid-way with a retryable 409 and its worst-case wait', async () => {
    vi.spyOn(repo, 'insertSlots').mockRejectedValueOnce(new Error('process crashed'));
    vi.spyOn(repo, 'deleteSlotsForBooking').mockRejectedValueOnce(new Error('process crashed'));
    expect((await postHold(holdRequest(), 'crash-key')).status).toBe(500);
    vi.restoreAllMocks();

    const replay = await postHold(holdRequest(), 'crash-key');
    expect(replay.status).toBe(409);
    expect(replay.body.error).toMatchObject({
      code: 'IDEMPOTENCY_KEY_IN_PROGRESS',
      details: { expiresAt: expect.any(String) },
    });
    const stuck = await storedBooking('idempotency_key = $1', ['crash-key']);
    expect(new Date(replay.body.error.details.expiresAt)).toEqual(stuck.expiresAt);
    expect(JSON.stringify(replay.body)).not.toContain(stuck.ref);
  });

  it('rejects invalid input with VALIDATION_FAILED', async () => {
    for (const bad of [
      { duration: 0 },
      { duration: 12 },
      { attendees: 0 },
      { startTime: '14:30' },
      { date: 'tomorrow' },
      { room: '' },
      { company: 'C'.repeat(201) },
      { name: '' },
      { name: undefined },
      { mobile: '12345' },
      { mobile: undefined },
      { email: 'not-an-email' },
    ]) {
      const res = await postHold(holdRequest(bad));
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_FAILED');
    }
    expect((await postHold(holdRequest({ startTime: '07:00' }))).body.error.code).toBe('OUTSIDE_OPENING_HOURS');
    expect((await postHold(holdRequest({ attendees: 20 }))).body.error.code).toBe('ATTENDEES_EXCEED_CAPACITY');
  });

  it('answers 409 SLOT_UNAVAILABLE for overlapping and parallel holds', async () => {
    // Four different numbers, so the per-mobile hold cap is not what refuses them.
    const mobiles = ['9000000001', '9000000002', '9000000003', '9000000004'];
    const results = await Promise.all(mobiles.map((mobile) => postHold(holdRequest({ mobile, name: 'Racer' }))));
    expect(results.map((r) => r.status).sort()).toEqual([201, 409, 409, 409]);
    for (const res of results.filter((r) => r.status === 409)) expect(res.body.error.code).toBe('SLOT_UNAVAILABLE');
    expect(await count('booking_slots')).toBe(2);
  });

  it('caps unexpired holds per mobile number', async () => {
    for (const startTime of ['09:00', '11:00', '16:00']) await heldRef({ startTime, duration: 1 });
    // Written another way, it is still the same number.
    const res = await postHold(holdRequest({ startTime: '18:00', duration: 1, mobile: '+91 98765-43210' }));
    expect(res.status).toBe(429);
    expect(res.body.error.code).toBe('TOO_MANY_HOLDS');
    expect((await postHold(holdRequest({ startTime: '18:00', duration: 1, mobile: '9123456780' }))).status).toBe(201);
  });

  it('frees the hours once the hold lapses', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    const ref = await heldRef();
    vi.advanceTimersByTime(HOLD_SECONDS * 1000);
    expect((await request(app).get(`/api/v1/bookings/${ref}`)).body.data.status).toBe('EXPIRED');
    expect((await availability()).body.data.slots.every((s) => s.available)).toBe(true);
    expect((await postHold(holdRequest({ mobile: '9123456780', name: 'Next' }))).status).toBe(201);
  });

  it('needs no account: a guest, or a stale or staff token, holds as a guest', async () => {
    const staff = await staffSession(app, 'OPS_ADMIN');
    const guest = await postHold(holdRequest({ company: 'Zenith Labs LLP' }), 'guest');
    expect(guest.status).toBe(201);
    const stored = await storedBooking('ref = $1', [guest.body.data.ref]);
    expect(stored.customerRef).toBeNull();
    expect(stored.customer).toEqual({ ...CUSTOMER, company: 'Zenith Labs LLP' });
    expect(stored.history[0].actor).toBe('public');

    const asStaff = await postHold(holdRequest({ startTime: '09:00', duration: 1 }), 'staff-token', staff.auth);
    const stale = await postHold(holdRequest({ startTime: '11:00', duration: 1 }), 'stale-token', {
      Authorization: 'Bearer garbage',
    });
    for (const res of [asStaff, stale]) {
      expect(res.status).toBe(201);
      expect((await storedBooking('ref = $1', [res.body.data.ref])).customerRef).toBeNull();
    }
  });

  it("puts a signed-in customer's hold in their name, filling a blank email from the account", async () => {
    const customer = await customerSession(app);
    const ref = (await postHold(holdRequest({ email: '' }), undefined, customer.auth)).body.data.ref;
    const stored = await storedBooking('ref = $1', [ref]);
    expect(stored.customerRef).toBe(customer.ref);
    expect(stored.customer).toMatchObject({ name: CUSTOMER.name, mobile: CUSTOMER.mobile, email: customer.email });
    expect(stored.history[0].actor).toBe(customer.ref);
  });
});

describe('POST /api/v1/bookings/:ref/claim', () => {
  const claim = (ref, auth) => request(app).post(`/api/v1/bookings/${ref}/claim`).set(auth);

  it("puts a guest hold in the customer's name at checkout, once", async () => {
    const customer = await customerSession(app);
    const ref = await heldRef();
    const res = await claim(ref, customer.auth);
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ ref, status: 'HELD' });
    expect(res.body.data.customer).toBeUndefined();

    const stored = await storedBooking('ref = $1', [ref]);
    expect(stored.customerRef).toBe(customer.ref);
    expect(stored.history.at(-1)).toMatchObject({ status: 'HELD', actor: customer.ref, note: 'claimed at checkout' });
    // Claiming again is a no-op, not a second history entry.
    expect((await claim(ref, customer.auth)).status).toBe(200);
    expect((await storedBooking('ref = $1', [ref])).history).toHaveLength(2);

    const mine = await request(app).get('/api/v1/bookings/mine').set(customer.auth);
    expect(mine.body.data.map((booking) => booking.ref)).toEqual([ref]);
  });

  it("refuses someone else's booking, and one no longer on hold", async () => {
    const owner = await customerSession(app);
    const other = await customerSession(app, { sub: '100000000000000000002', email: 'arjun@example.com' });
    const ref = await heldRef();
    await claim(ref, owner.auth);
    const taken = await claim(ref, other.auth);
    expect(taken.status).toBe(409);
    expect(taken.body.error.code).toBe('BOOKING_ALREADY_CLAIMED');

    const cancelled = await heldRef({ startTime: '09:00', duration: 1 });
    await request(app).post(`/api/v1/bookings/${cancelled}/cancel`);
    expect((await claim(cancelled, other.auth)).body.error.code).toBe('BOOKING_NOT_HELD');

    vi.useFakeTimers({ toFake: ['Date'] });
    const lapsed = await heldRef({ startTime: '11:00', duration: 1 });
    vi.advanceTimersByTime(HOLD_SECONDS * 1000 + 1);
    expect((await claim(lapsed, other.auth)).body.error.code).toBe('HOLD_EXPIRED');
    expect((await claim('BK-NOPE', other.auth)).status).toBe(404);
  });

  it('lets exactly one of two accounts racing for a hold have it', async () => {
    const a = await customerSession(app);
    const b = await customerSession(app, { sub: '100000000000000000002', email: 'arjun@example.com' });
    const ref = await heldRef();
    const results = await Promise.all([claim(ref, a.auth), claim(ref, b.auth)]);
    expect(results.map((r) => r.status).sort()).toEqual([200, 409]);
  });

  it('needs a signed-in customer', async () => {
    const ref = await heldRef();
    const staff = await staffSession(app, 'OPS_ADMIN');
    expect((await claim(ref, {})).body.error.code).toBe('AUTH_REQUIRED');
    expect((await claim(ref, staff.auth)).body.error.code).toBe('TOKEN_INVALID');
    expect((await storedBooking('ref = $1', [ref])).customerRef).toBeNull();
  });
});

describe('public booking ref', () => {
  it('GET /:ref shows the booking without contact details; unknown refs are 404', async () => {
    const ref = await heldRef();
    const res = await request(app).get(`/api/v1/bookings/${ref.toLowerCase()}`);
    expect(res.status).toBe(200);
    expect(res.body.data.ref).toBe(ref);
    expect(res.body.data.customer).toBeUndefined();
    expect(JSON.stringify(res.body)).not.toContain(CUSTOMER.mobile);

    const missing = await request(app).get('/api/v1/bookings/BK-NOPE');
    expect(missing.status).toBe(404);
    expect(missing.body.error.code).toBe('BOOKING_NOT_FOUND');
  });

  it('POST /:ref/cancel releases a hold', async () => {
    const ref = await heldRef();
    const res = await request(app).post(`/api/v1/bookings/${ref}/cancel`);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('CANCELLED');
    expect(await count('booking_slots')).toBe(0);
  });

  it('GET /:ref/pass is only issued once confirmed, and carries no contact details', async () => {
    const ref = await heldRef();
    const early = await request(app).get(`/api/v1/bookings/${ref}/pass`);
    expect(early.status).toBe(409);
    expect(early.body.error.code).toBe('PASS_NOT_AVAILABLE');

    await request(app).post(`/api/v1/bookings/${ref}/confirm`).set(adminKey);
    const pass = await request(app).get(`/api/v1/bookings/${ref}/pass`);
    expect(pass.status).toBe(200);
    expect(pass.body.data).toMatchObject({
      ref,
      status: 'CONFIRMED',
      room: 'Conference Room',
      slot: '02:00 PM - 04:00 PM',
      attendees: 6,
      qr: `VDESK-BOOKING:${ref}`,
    });
    expect(JSON.stringify(pass.body)).not.toContain(CUSTOMER.name);
  });

  it('public responses carry exactly the documented fields — no PII, _id, __v or idempotency data', async () => {
    const PUBLIC_FIELDS = [
      'attendees',
      'centreRef',
      'createdAt',
      'date',
      'duration',
      'endTime',
      'endsAt',
      'expiresAt',
      'hub',
      'pricing',
      'ref',
      'room',
      'roomCapacity',
      'slot',
      'startTime',
      'startsAt',
      'status',
      'updatedAt',
    ];
    const held = await postHold(holdRequest(), 'privacy-key');
    const { ref } = held.body.data;
    const replay = await postHold(holdRequest(), 'privacy-key');
    const view = await request(app).get(`/api/v1/bookings/${ref}`);
    const cancelled = await request(app).post(`/api/v1/bookings/${await heldRef({ startTime: '09:00' })}/cancel`);
    for (const res of [held, replay, view, cancelled]) expect(Object.keys(res.body.data).sort()).toEqual(PUBLIC_FIELDS);

    await request(app).post(`/api/v1/bookings/${ref}/confirm`).set(adminKey);
    const pass = await request(app).get(`/api/v1/bookings/${ref}/pass`);
    expect(Object.keys(pass.body.data).sort()).toEqual(
      ['attendees', 'date', 'endsAt', 'hub', 'qr', 'ref', 'room', 'slot', 'startsAt', 'status'].sort(),
    );

    const stored = await storedBooking('ref = $1', [ref]);
    for (const res of [held, replay, view, cancelled, pass]) {
      const raw = JSON.stringify(res.body);
      for (const secret of [
        CUSTOMER.name,
        CUSTOMER.mobile,
        CUSTOMER.email,
        CUSTOMER.company,
        'privacy-key',
        stored.requestHash,
        stored.id,
      ]) {
        expect(raw).not.toContain(secret);
      }
    }
  });
});

describe('GET /api/v1/bookings/mine', () => {
  it('lists only the bookings of the signed-in customer, newest first and without contact details', async () => {
    const customer = await customerSession(app);
    const other = await customerSession(app, { sub: '100000000000000000002', email: 'arjun@example.com' });
    const asCustomer = (overrides) => postHold(holdRequest(overrides), undefined, customer.auth);
    const mine = [];
    for (const overrides of [{ startTime: '09:00', duration: 1 }, { startTime: '11:00' }]) {
      mine.push((await asCustomer(overrides)).body.data.ref);
    }
    expect((await postHold(holdRequest({ startTime: '16:00', duration: 1 }), undefined, other.auth)).status).toBe(201);
    // A guest hold is nobody's until it is claimed at checkout.
    await heldRef({ startTime: '18:00', duration: 1, mobile: '9123456780' });

    const res = await request(app).get('/api/v1/bookings/mine').set(customer.auth);
    expect(res.status).toBe(200);
    expect(res.body.data.map((booking) => booking.ref)).toEqual([...mine].reverse());
    expect(res.body.data[0].customer).toBeUndefined();
    expect(JSON.stringify(res.body)).not.toContain(CUSTOMER.mobile);

    expect((await request(app).get('/api/v1/bookings/mine')).status).toBe(401);
  });
});

describe('staff routes', () => {
  it('require authentication', async () => {
    const ref = await heldRef();
    for (const res of [
      await request(app).get('/api/v1/bookings'),
      await request(app).post(`/api/v1/bookings/${ref}/confirm`),
      await request(app).patch(`/api/v1/bookings/${ref}/status`).send({ status: 'CANCELLED' }),
      await request(app).get('/api/v1/bookings').set('x-admin-key', 'wrong-key-0123456789'),
      await request(app).get('/api/v1/bookings').set('Authorization', 'Bearer garbage'),
    ]) {
      expect(res.status).toBe(401);
    }
    expect((await storedBooking('ref = $1', [ref])).status).toBe('HELD');
  });

  it('enforce bookings:read / bookings:write', async () => {
    const ref = await heldRef();
    const content = await staffSession(app, 'CONTENT');
    const manager = await staffSession(app, 'SALES_MANAGER');
    const ops = await staffSession(app, 'OPS_ADMIN');

    expect((await request(app).get('/api/v1/bookings').set(content.auth)).status).toBe(403);
    expect((await request(app).get('/api/v1/bookings').set(manager.auth)).status).toBe(200);
    expect((await request(app).post(`/api/v1/bookings/${ref}/confirm`).set(manager.auth)).status).toBe(403);

    const confirmed = await request(app).post(`/api/v1/bookings/${ref}/confirm`).set(ops.auth);
    expect(confirmed.status).toBe(200);
    expect(confirmed.body.data.status).toBe('CONFIRMED');
    expect(confirmed.body.data.history.at(-1)).toMatchObject({ status: 'CONFIRMED', actor: ops.ref });
  });

  it('list bookings with contact details, filters and a cursor', async () => {
    const first = await heldRef({ startTime: '09:00', duration: 1 });
    const second = await heldRef({ startTime: '11:00', duration: 1 });
    await request(app).post(`/api/v1/bookings/${first}/confirm`).set(adminKey);

    const page1 = await request(app).get('/api/v1/bookings').query({ limit: 1 }).set(adminKey);
    expect(page1.status).toBe(200);
    expect(page1.body.data.map((b) => b.ref)).toEqual([second]);
    expect(page1.body.data[0].customer).toMatchObject({ name: CUSTOMER.name, mobile: CUSTOMER.mobile });
    expect(page1.body.data[0].customerRef).toBeNull();
    expect(page1.body.data[0]._id).toBeUndefined();

    const page2 = await request(app)
      .get('/api/v1/bookings')
      .query({ limit: 1, cursor: page1.body.meta.nextCursor })
      .set(adminKey);
    expect(page2.body.data.map((b) => b.ref)).toEqual([first]);
    expect(page2.body.meta.nextCursor).toBeNull();

    const confirmed = await request(app).get('/api/v1/bookings').query({ status: 'CONFIRMED' }).set(adminKey);
    expect(confirmed.body.data.map((b) => b.ref)).toEqual([first]);
    const byDate = await request(app)
      .get('/api/v1/bookings')
      .query({ date: addDays(date(), 1) })
      .set(adminKey);
    expect(byDate.body.data).toEqual([]);
  });

  it('confirm an expired hold → 409 HOLD_EXPIRED', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    const ref = await heldRef();
    vi.advanceTimersByTime(HOLD_SECONDS * 1000 + 1);
    const res = await request(app).post(`/api/v1/bookings/${ref}/confirm`).set(adminKey);
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('HOLD_EXPIRED');
  });

  it('PATCH /:ref/status walks the lifecycle and refuses illegal moves', async () => {
    const ref = await heldRef();
    const patch = (status) => request(app).patch(`/api/v1/bookings/${ref}/status`).set(adminKey).send({ status });

    expect((await patch('CONFIRMED')).status).toBe(400); // confirming has its own endpoint
    const early = await patch('COMPLETED');
    expect(early.status).toBe(409);
    expect(early.body.error.code).toBe('INVALID_STATUS_TRANSITION');

    await request(app).post(`/api/v1/bookings/${ref}/confirm`).set(adminKey);
    expect((await request(app).post(`/api/v1/bookings/${ref}/cancel`)).body.error.code).toBe(
      'CANCELLATION_REQUIRES_STAFF',
    );
    expect((await patch('CHECKED_IN')).body.data.status).toBe('CHECKED_IN');
    expect((await patch('COMPLETED')).body.data.status).toBe('COMPLETED');
    expect((await patch('CANCELLED')).status).toBe(409);
  });
});
