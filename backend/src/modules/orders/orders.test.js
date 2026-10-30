/**
 * Orders module — creation from quotes and bookings, frozen pricing, idempotency, one open order per source,
 * expiry and source consistency, cancellation, staff access and privacy.
 * Run: npx vitest run src/modules/orders/orders.test.js
 */
import request from 'supertest';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../../app.js';
import { clearTestDb, startTestDb, stopTestDb } from '../../../test/db.js';
import { customerSession } from '../../../test/customer.js';
import { ADMIN_KEY, staffSession } from '../../../test/staff.js';
import { addDays, istDate } from '../booking/booking.time.js';
import { Centre } from '../catalog/catalog.model.js';
import { previewItem } from '../pricing/index.js';
import { ORDER_TRANSITIONS } from './orders.constants.js';
import { Order } from './orders.model.js';
import * as service from './orders.service.js';

const app = createApp();
const adminKey = { 'x-admin-key': ADMIN_KEY };
/** The signed-in customer that holds the bookings orders are made from. */
let customer;

const CUSTOMER = { name: 'Priya Kulkarni', company: 'Zenith D2C', mobile: '9876543210', email: 'priya@zenith.in' };
let seq = 0;
const key = () => `order-key-${++seq}`;

const postOrder = (body, idempotencyKey = key()) =>
  request(app).post('/api/v1/orders').set('Idempotency-Key', idempotencyKey).send(body);
const fromQuote = (ref) => ({ source: { type: 'quote', ref } });
const fromBooking = (ref) => ({ source: { type: 'booking', ref } });

async function acceptedQuote(status = 'ACCEPTED') {
  const created = await request(app)
    .post('/api/v1/pricing/quotes')
    .set('Idempotency-Key', key())
    .send({
      name: CUSTOMER.name,
      company: CUSTOMER.company,
      item: { product: 'meeting_room', room: 'Boardroom', hours: 4 },
    });
  const { ref } = created.body.data;
  if (status !== 'SENT') await request(app).patch(`/api/v1/pricing/quotes/${ref}/status`).send({ status });
  return created.body.data;
}

/** Holds a room as the signed-in customer — contact details come from that account, not from this body. */
async function heldBooking(startTime = '14:00') {
  const res = await request(app)
    .post('/api/v1/bookings/hold')
    .set('Idempotency-Key', key())
    .set(customer.auth)
    .send({
      centreRef: 'CTR-NSK-001',
      room: 'Conference Room',
      date: addDays(istDate(new Date()), 1),
      startTime,
      duration: 2,
      attendees: 6,
    });
  expect(res.status).toBe(201);
  return res.body.data;
}

beforeAll(startTestDb);
beforeEach(async () => {
  await Centre.create({
    ref: 'CTR-NSK-001',
    cityRef: 'CITY-NSK',
    city: 'Nashik',
    areaName: 'College Road',
    fullName: 'V-DESK Headquarters — College Road',
    address: 'College Road, Nashik',
    services: ['Virtual Office', 'Meeting Rooms'],
  });
  customer = await customerSession(app, CUSTOMER);
});
afterEach(async () => {
  vi.restoreAllMocks();
  await clearTestDb();
});
afterAll(stopTestDb);

// ── Creation ─────────────────────────────────

describe('POST /api/v1/orders', () => {
  it('creates a PENDING_PAYMENT order from an accepted quote with its frozen breakdown', async () => {
    const quote = await acceptedQuote();
    const res = await postOrder({ ...fromQuote(quote.ref.toLowerCase()), total_paise: 1, status: 'PAID' });
    expect(res.status).toBe(201);
    const order = res.body.data;
    expect(order.ref).toMatch(/^ORD-[A-Z0-9]{16,}$/);
    expect(order).toMatchObject({
      status: 'PENDING_PAYMENT',
      source: { type: 'quote', ref: quote.ref },
      description: quote.product,
      tenure: '4 Hours',
      currency: 'INR',
      total_paise: quote.pricing.total_paise,
      pricing: quote.pricing,
      expiresAt: quote.validUntil,
    });
  });

  it('creates an order from a held booking that expires with the hold', async () => {
    const booking = await heldBooking();
    const res = await postOrder(fromBooking(booking.ref));
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({
      source: { type: 'booking', ref: booking.ref },
      description: 'Conference Room (8 Pax) — V-DESK Headquarters — College Road',
      tenure: '2 Hours',
      total_paise: 188564, // ₹799 × 2 + 18 % GST, paise-exact (ADR-007)
      expiresAt: booking.expiresAt,
    });
    const { product, label, tenure, rate_month_paise, ...breakdown } = booking.pricing;
    expect([product, label, tenure, rate_month_paise]).toEqual([
      'meeting_room',
      'Conference Room (8 Pax)',
      '2 Hours',
      null,
    ]);
    expect(res.body.data.pricing).toEqual(breakdown);
  });

  it('validates the request', async () => {
    const noKey = await request(app).post('/api/v1/orders').send(fromQuote('VDQ-X'));
    expect(noKey.status).toBe(400);
    expect(noKey.body.error.code).toBe('IDEMPOTENCY_KEY_REQUIRED');
    for (const bad of [
      {},
      { source: { type: 'invoice', ref: 'X' } },
      { source: { type: 'quote' } },
      { source: { type: 'quote', ref: '' } },
    ]) {
      const res = await postOrder(bad);
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_FAILED');
    }
  });

  it('refuses missing and unpayable sources with stable codes', async () => {
    expect((await postOrder(fromQuote('VDQ-NOPE'))).body.error.code).toBe('QUOTE_NOT_FOUND');
    expect((await postOrder(fromBooking('BK-NOPE'))).body.error.code).toBe('BOOKING_NOT_FOUND');

    const sent = await acceptedQuote('SENT');
    const notAccepted = await postOrder(fromQuote(sent.ref));
    expect(notAccepted.status).toBe(409);
    expect(notAccepted.body.error).toMatchObject({ code: 'SOURCE_NOT_PAYABLE', details: { status: 'SENT' } });
    const rejected = await acceptedQuote('REJECTED');
    expect((await postOrder(fromQuote(rejected.ref))).body.error.code).toBe('SOURCE_NOT_PAYABLE');

    const booking = await heldBooking();
    await request(app).post(`/api/v1/bookings/${booking.ref}/cancel`);
    expect((await postOrder(fromBooking(booking.ref))).body.error).toMatchObject({
      code: 'SOURCE_NOT_PAYABLE',
      details: { status: 'CANCELLED' },
    });
  });

  it('refuses an accepted quote past its validity', async () => {
    const quote = await acceptedQuote();
    await expect(
      service.createOrder(fromQuote(quote.ref), key(), new Date(new Date(quote.validUntil).getTime() + 1)),
    ).rejects.toMatchObject({ status: 409, code: 'QUOTE_EXPIRED' });
  });
});

// ── Idempotency and duplicates ───────────────

describe('idempotency and one open order per purchase', () => {
  it('replays the same key and refuses a reused key', async () => {
    const quote = await acceptedQuote();
    const first = await postOrder(fromQuote(quote.ref), 'same-key');
    const replay = await postOrder(fromQuote(quote.ref), 'same-key');
    expect(replay.status).toBe(200);
    expect(replay.body.data).toEqual(first.body.data);

    const other = await acceptedQuote();
    const reused = await postOrder(fromQuote(other.ref), 'same-key');
    expect(reused.status).toBe(409);
    expect(reused.body.error.code).toBe('IDEMPOTENCY_KEY_REUSED');
    expect(await Order.countDocuments()).toBe(1);
  });

  it('turns parallel requests with one key into one order', async () => {
    const quote = await acceptedQuote();
    const results = await Promise.all([1, 2, 3, 4].map(() => postOrder(fromQuote(quote.ref), 'twin-key')));
    expect(results.map((r) => r.status).sort()).toEqual([200, 200, 200, 201]);
    expect(new Set(results.map((r) => r.body.data.ref)).size).toBe(1);
    expect(await Order.countDocuments()).toBe(1);
  });

  /** Makes the next `n` order lookups miss, as if they ran just before a concurrent same-key request committed. */
  const missLookups = (n) => {
    const spy = vi.spyOn(Order, 'findOne');
    for (let i = 0; i < n; i++) spy.mockImplementationOnce(() => ({ lean: async () => null }));
  };

  it('replays, not refuses, when its own key order appears after the replay lookup', async () => {
    const quote = await acceptedQuote();
    const first = await postOrder(fromQuote(quote.ref), 'race-key');
    missLookups(1); // replay lookup misses; the open-order check then finds the same key's order
    const second = await postOrder(fromQuote(quote.ref), 'race-key');
    expect(second.status).toBe(200);
    expect(second.body.data.ref).toBe(first.body.data.ref);
  });

  it('replays, not refuses, when the insert collides on both the key and the source', async () => {
    const quote = await acceptedQuote();
    const first = await postOrder(fromQuote(quote.ref), 'race-key');
    missLookups(2); // replay lookup and open-order check both miss; the insert hits both unique indexes
    const second = await postOrder(fromQuote(quote.ref), 'race-key');
    expect(second.status).toBe(200);
    expect(second.body.data.ref).toBe(first.body.data.ref);
    expect(await Order.countDocuments()).toBe(1);
  });

  it('allows one open order per source; others get its ref', async () => {
    const booking = await heldBooking();
    const first = await postOrder(fromBooking(booking.ref));
    const second = await postOrder(fromBooking(booking.ref));
    expect(second.status).toBe(409);
    expect(second.body.error).toMatchObject({ code: 'ORDER_ALREADY_OPEN', details: { ref: first.body.data.ref } });
  });

  it('lets exactly one of many parallel orders for the same source through', async () => {
    const quote = await acceptedQuote();
    const results = await Promise.all([1, 2, 3, 4, 5].map(() => postOrder(fromQuote(quote.ref))));
    expect(results.map((r) => r.status).sort()).toEqual([201, 409, 409, 409, 409]);
    const winner = results.find((r) => r.status === 201).body.data.ref;
    for (const res of results.filter((r) => r.status === 409)) {
      expect(res.body.error).toMatchObject({ code: 'ORDER_ALREADY_OPEN', details: { ref: winner } });
    }
    expect(await Order.countDocuments()).toBe(1);
  });

  it('allows a new order once the open one is cancelled', async () => {
    const quote = await acceptedQuote();
    const first = await postOrder(fromQuote(quote.ref));
    await request(app).post(`/api/v1/orders/${first.body.data.ref}/cancel`);
    const second = await postOrder(fromQuote(quote.ref));
    expect(second.status).toBe(201);
    expect(second.body.data.ref).not.toBe(first.body.data.ref);
  });
});

// ── Lifecycle and source consistency ─────────

describe('lifecycle', () => {
  it('has a closed transition table; PAID is final', () => {
    expect(ORDER_TRANSITIONS.PENDING_PAYMENT).toEqual(['PAID', 'CANCELLED', 'EXPIRED']);
    for (const terminal of ['PAID', 'CANCELLED', 'EXPIRED']) expect(ORDER_TRANSITIONS[terminal]).toEqual([]);
  });

  it('expires with the booking hold, saves EXPIRED, and refuses cancellation then', async () => {
    const booking = await heldBooking();
    const { order } = await service.createOrder(fromBooking(booking.ref), key());
    const lapse = new Date(booking.expiresAt);
    expect((await service.getOrder(order.ref, new Date(lapse.getTime() - 1))).status).toBe('PENDING_PAYMENT');
    expect((await service.getOrder(order.ref, lapse)).status).toBe('EXPIRED');
    const stored = await Order.findOne({ ref: order.ref }).lean();
    expect(stored.status).toBe('EXPIRED');
    expect(stored.history.at(-1)).toMatchObject({ status: 'EXPIRED', actor: 'system' });
    await expect(service.cancelOrder(order.ref, 'public', lapse)).rejects.toMatchObject({ code: 'ORDER_EXPIRED' });
  });

  it('expires a quote order at the quote validity and frees the source', async () => {
    const quote = await acceptedQuote();
    const { order } = await service.createOrder(fromQuote(quote.ref), key());
    const at = new Date(quote.validUntil);
    expect((await service.getOrder(order.ref, at)).status).toBe('EXPIRED');
    expect(await Order.countDocuments({ status: 'PENDING_PAYMENT' })).toBe(0);
  });

  it('is cancelled by the system once its booking is no longer held', async () => {
    const releases = [
      ['10:00', (ref) => request(app).post(`/api/v1/bookings/${ref}/cancel`)],
      ['16:00', (ref) => request(app).post(`/api/v1/bookings/${ref}/confirm`).set(adminKey)],
    ];
    for (const [startTime, release] of releases) {
      const booking = await heldBooking(startTime);
      const created = await postOrder(fromBooking(booking.ref));
      await release(booking.ref);
      const res = await request(app).get(`/api/v1/orders/${created.body.data.ref}`);
      expect(res.body.data.status).toBe('CANCELLED');
      const stored = await Order.findOne({ ref: created.body.data.ref }).lean();
      expect(stored.history.at(-1)).toMatchObject({ actor: 'system', reason: 'SOURCE_UNAVAILABLE' });
    }
  });

  it('lets the customer cancel an open order; repeating is a no-op', async () => {
    const quote = await acceptedQuote();
    const { ref } = (await postOrder(fromQuote(quote.ref))).body.data;
    const cancelled = await request(app).post(`/api/v1/orders/${ref}/cancel`);
    expect(cancelled.status).toBe(200);
    expect(cancelled.body.data.status).toBe('CANCELLED');
    expect((await request(app).post(`/api/v1/orders/${ref}/cancel`)).body.data.status).toBe('CANCELLED');
    expect((await request(app).get('/api/v1/orders/ORD-NOPE')).body.error.code).toBe('ORDER_NOT_FOUND');
  });

  it('never cancels a paid order', async () => {
    const quote = await acceptedQuote();
    const { ref } = (await postOrder(fromQuote(quote.ref))).body.data;
    // Nothing in the API can set PAID yet; simulate what a verified gateway payment will do.
    await Order.updateOne({ ref }, { $set: { status: 'PAID' } });
    const res = await request(app).post(`/api/v1/orders/${ref}/cancel`);
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('INVALID_STATUS_TRANSITION');
  });

  it('offers no way to mark an order paid', async () => {
    const quote = await acceptedQuote();
    const { ref } = (await postOrder(fromQuote(quote.ref))).body.data;
    for (const res of [
      await request(app).patch(`/api/v1/orders/${ref}`).set(adminKey).send({ status: 'PAID' }),
      await request(app).patch(`/api/v1/orders/${ref}/status`).set(adminKey).send({ status: 'PAID' }),
      await request(app).post(`/api/v1/orders/${ref}/pay`).send({ status: 'PAID' }),
    ]) {
      expect(res.status).toBe(404);
    }
    expect((await Order.findOne({ ref }).lean()).status).toBe('PENDING_PAYMENT');
  });
});

// ── Pricing snapshot ─────────────────────────

describe('pricing snapshot', () => {
  it('accepts breakdowns that reconcile to the paisa, GST on top or included', async () => {
    const room = await previewItem({ product: 'meeting_room', room: 'Training Hall', hours: 9 });
    expect(service.snapshotPricing(room).total_paise).toBe(room.total_paise);
    const bundle = await previewItem({
      product: 'bundle',
      services: ['virtual-office', 'gst-registration', 'company-incorporation'],
    });
    expect(bundle.gst.inclusive).toBe(true);
    const snap = service.snapshotPricing(bundle);
    expect(snap.taxable_paise + snap.gst.amount_paise).toBe(snap.total_paise);
    expect(Object.keys(snap).sort()).toEqual(
      ['currency', 'discount', 'gst', 'lines', 'subtotal_paise', 'taxable_paise', 'total_paise'].sort(),
    );
  });

  it('refuses a breakdown that does not reconcile or uses fractional paise', async () => {
    const good = await previewItem({ product: 'meeting_room', room: 'Boardroom', hours: 2 });
    for (const bad of [
      { ...good, total_paise: good.total_paise + 1 },
      { ...good, subtotal_paise: good.subtotal_paise + 0.5 },
      { ...good, gst: { ...good.gst, amount_paise: good.gst.amount_paise - 1 } },
      { ...good, lines: [{ ...good.lines[0], amount_paise: 1 }] },
    ]) {
      expect(() => service.snapshotPricing(bad)).toThrow(expect.objectContaining({ code: 'PRICING_INCONSISTENT' }));
    }
  });

  it('keeps the frozen price after the pricing rules change', async () => {
    const quote = await acceptedQuote();
    const { ref } = (await postOrder(fromQuote(quote.ref))).body.data;
    await request(app)
      .put('/api/v1/pricing/rules/tax')
      .set(adminKey)
      .send({ value: { gst_bp: 2800 } });
    expect((await request(app).get(`/api/v1/orders/${ref}`)).body.data.total_paise).toBe(quote.pricing.total_paise);
  });
});

// ── Staff and privacy ────────────────────────

describe('staff list and privacy', () => {
  it('requires orders:read', async () => {
    expect((await request(app).get('/api/v1/orders')).status).toBe(401);
    const content = await staffSession(app, 'CONTENT');
    expect((await request(app).get('/api/v1/orders').set(content.auth)).status).toBe(403);
    const finance = await staffSession(app, 'FINANCE');

    const quote = await acceptedQuote();
    const { ref } = (await postOrder(fromQuote(quote.ref))).body.data;
    const booking = await heldBooking();
    await postOrder(fromBooking(booking.ref));

    const res = await request(app).get('/api/v1/orders').query({ sourceType: 'quote' }).set(finance.auth);
    expect(res.status).toBe(200);
    expect(res.body.data.map((o) => o.ref)).toEqual([ref]);
    expect(res.body.data[0].history[0]).toMatchObject({ status: 'PENDING_PAYMENT', actor: 'public' });
    const page = await request(app).get('/api/v1/orders').query({ limit: 1 }).set(adminKey);
    expect(page.body.meta.nextCursor).toEqual(expect.any(String));
  });

  it('public responses carry exactly the documented fields and no customer or internal data', async () => {
    const quote = await acceptedQuote();
    const booking = await heldBooking();
    const created = await postOrder(fromBooking(booking.ref), 'privacy-key');
    const fromQuoteRes = await postOrder(fromQuote(quote.ref));
    const read = await request(app).get(`/api/v1/orders/${created.body.data.ref}`);
    const stored = await Order.findOne({ ref: created.body.data.ref }).lean();

    const FIELDS = [
      'createdAt',
      'currency',
      'description',
      'expiresAt',
      'pricing',
      'ref',
      'source',
      'status',
      'tenure',
      'total_paise',
      'updatedAt',
    ];
    for (const res of [created, fromQuoteRes, read]) {
      expect(Object.keys(res.body.data).sort()).toEqual(FIELDS);
      const raw = JSON.stringify(res.body);
      for (const secret of [...Object.values(CUSTOMER), 'privacy-key', stored.requestHash, String(stored._id)]) {
        expect(raw).not.toContain(secret);
      }
    }
    // Orders store no customer details at all.
    expect(JSON.stringify(stored)).not.toContain(CUSTOMER.mobile);
    expect(JSON.stringify(stored)).not.toContain(CUSTOMER.name);
  });
});
