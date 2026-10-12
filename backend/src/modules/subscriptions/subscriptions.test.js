/**
 * Subscriptions — creation, activation rule, suspension, cancellation, agreements, renewals, the lifecycle job,
 * events, audit, access and privacy.
 *
 * Payments are not built (orders has no PAID path yet), so orders' public `getOrder` is stood in with fixtures here;
 * KYC summaries likewise. Customer sign-in doesn't exist, so customers come from test/customer.js.
 * Run: npx vitest run src/modules/subscriptions/subscriptions.test.js
 */
import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { createApp } from '../../app.js';
import { AuditEntry } from '../../shared/audit/audit.model.js';
import { notFound } from '../../shared/errors/AppError.js';
import { DomainEvent } from '../../shared/events/events.model.js';
import { clearTestDb, startTestDb, stopTestDb } from '../../../test/db.js';
import { customer } from '../../../test/customer.js';
import { ADMIN_KEY, staffSession } from '../../../test/staff.js';
import { getApplicationSummary } from '../kyc/index.js';
import { getOrder } from '../orders/index.js';
import { Agreement, Renewal, Subscription } from './subscriptions.model.js';
import { applyRenewal, processSubscriptionLifecycle } from './subscriptions.service.js';
import { addMonthsIst } from './subscriptions.time.js';

vi.mock('../identity/identity.customer.js', () => import('../../../test/customer.js'));
vi.mock('../orders/index.js', async (importOriginal) => ({ ...(await importOriginal()), getOrder: vi.fn() }));
vi.mock('../kyc/index.js', async (importOriginal) => ({ ...(await importOriginal()), getApplicationSummary: vi.fn() }));

const app = createApp();
const DAY = 86_400_000;
const ALICE = customer('CUS-ALICE');
const BOB = customer('CUS-BOB');

// ── Fixtures for the modules this one reads ──
const orders = new Map();
const kycs = new Map();
function order(ref, overrides = {}) {
  orders.set(ref, {
    ref,
    status: 'PENDING_PAYMENT',
    source: { type: 'quote', ref: 'VDQ-ABCDEFGH1' },
    description: 'Virtual Office — Nashik',
    tenure: 'annual',
    currency: 'INR',
    total_paise: 1_769_900,
    pricing: { total_paise: 1_769_900, gst_paise: 269_985 },
    ...overrides,
  });
  return ref;
}
const pay = (ref) => orders.set(ref, { ...orders.get(ref), status: 'PAID' });
function kyc(ref, customerId = 'CUS-ALICE', status = 'APPROVED') {
  kycs.set(ref, { ref, status, customerId, approvedAt: status === 'APPROVED' ? new Date() : null });
  return ref;
}
const missing = (code) => notFound(code, 'Not found');
getOrder.mockImplementation(async (ref) => {
  if (!orders.has(ref)) throw missing('ORDER_NOT_FOUND');
  return structuredClone(orders.get(ref));
});
getApplicationSummary.mockImplementation(async (ref) => {
  if (!kycs.has(ref)) throw missing('KYC_APPLICATION_NOT_FOUND');
  return { ...kycs.get(ref) };
});

// ── Staff ──
const sessions = new Map();
async function as(role) {
  if (!sessions.has(role)) sessions.set(role, await staffSession(app, role));
  return sessions.get(role).auth;
}
const api = async (method, path, { role = 'OPS_ADMIN', headers, body } = {}) => {
  const auth = headers ?? (await as(role));
  const req = request(app)[method](`/api/v1/subscriptions${path}`).set(auth);
  return body === undefined ? req : req.send(body);
};

const KYC_REF = 'KYC-ABCDEFGHIJ1234';
let seq = 0;
async function createSub({ graceDays = 10, kycRef = kyc(KYC_REF) } = {}) {
  seq += 1;
  const orderRef = order(`ORD-TESTORDER${String(seq).padStart(4, '0')}`);
  const res = await api('post', '/', { body: { orderRef, kycRef, graceDays } });
  expect(res.status).toBe(201);
  return { ref: res.body.data.ref, orderRef };
}
async function activeSub(options) {
  const sub = await createSub(options);
  pay(sub.orderRef);
  const res = await api('post', `/${sub.ref}/activate`, { body: {} });
  expect(res.status).toBe(200);
  return { ...sub, sub: res.body.data };
}
const events = (type) => DomainEvent.find(type ? { type } : {}).lean();
const load = (ref) => Subscription.findOne({ ref }).lean();

beforeAll(startTestDb);
afterEach(async () => {
  sessions.clear();
  orders.clear();
  kycs.clear();
  vi.restoreAllMocks();
  await clearTestDb();
});
afterAll(stopTestDb);

// ── Create ────────────────────────────────────

describe('POST /subscriptions', () => {
  it('creates a PENDING_ACTIVATION subscription owned by the KYC customer, with event and audit', async () => {
    const { ref, orderRef } = await createSub();
    const doc = await load(ref);
    expect(doc).toMatchObject({
      status: 'PENDING_ACTIVATION',
      customerId: 'CUS-ALICE',
      orderRef,
      termMonths: 12,
      price: { total_paise: 1_769_900 },
      period: 0,
    });
    const [event] = await events('subscription.created');
    expect(event.payload).toEqual({ orderRef, kycRef: KYC_REF });
    expect(await AuditEntry.countDocuments({ action: 'subscriptions.subscription.created', entityRef: ref })).toBe(1);
  });

  it('allows one subscription per order', async () => {
    const { ref, orderRef } = await createSub();
    const res = await api('post', '/', { body: { orderRef, kycRef: KYC_REF, graceDays: 5 } });
    expect(res.status).toBe(409);
    expect(res.body.error).toMatchObject({ code: 'SUBSCRIPTION_EXISTS', details: { ref } });
    expect(await events('subscription.created')).toHaveLength(1);
  });

  it('refuses orders that cannot start a subscription', async () => {
    kyc(KYC_REF);
    const booking = order('ORD-BOOKINGORDER1', { source: { type: 'booking', ref: 'BK-1' }, tenure: '' });
    const cancelled = order('ORD-CANCELLEDORD1', { status: 'CANCELLED' });
    for (const [orderRef, code] of [
      [booking, 'ORDER_NOT_SUBSCRIBABLE'],
      [cancelled, 'ORDER_NOT_USABLE'],
      ['ORD-UNKNOWNORDER1', 'ORDER_NOT_FOUND'],
    ]) {
      const res = await api('post', '/', { body: { orderRef, kycRef: KYC_REF, graceDays: 5 } });
      expect(res.body.error.code).toBe(code);
    }
    expect(await Subscription.countDocuments()).toBe(0);
  });

  it.each([
    ['a client status', { status: 'ACTIVE' }],
    ['a client price', { total_paise: 1 }],
    ['a payment claim', { paid: true }],
    ['a negative grace period', { graceDays: -1 }],
    ['a grace period over 90 days', { graceDays: 91 }],
    ['a malformed order ref', { orderRef: 'ORD-$ne' }],
  ])('rejects %s', async (_label, extra) => {
    const body = { orderRef: order('ORD-VALIDATION01'), kycRef: kyc(KYC_REF), graceDays: 5, ...extra };
    expect((await api('post', '/', { body })).status).toBe(400);
  });

  it('is for ops staff with a signed-in session only', async () => {
    const body = { orderRef: order('ORD-PERMISSION01'), kycRef: kyc(KYC_REF), graceDays: 5 };
    expect((await api('post', '/', { role: 'FINANCE', body })).status).toBe(403);
    expect((await api('post', '/', { role: 'SALES_EXEC', body })).status).toBe(403);
    expect((await api('post', '/', { headers: { 'x-admin-key': ADMIN_KEY }, body })).status).toBe(401);
    expect((await api('post', '/', { headers: ALICE, body })).status).toBe(401);
  });
});

// ── Activation rule ───────────────────────────

describe('POST /subscriptions/:ref/activate', () => {
  it('needs a PAID order — a client cannot claim payment', async () => {
    const { ref } = await createSub();
    const res = await api('post', `/${ref}/activate`, { body: {} });
    expect(res.status).toBe(409);
    expect(res.body.error).toMatchObject({
      code: 'PAYMENT_NOT_CONFIRMED',
      details: { orderStatus: 'PENDING_PAYMENT' },
    });
    expect((await api('post', `/${ref}/activate`, { body: { paid: true, status: 'ACTIVE' } })).status).toBe(400);
    expect((await load(ref)).status).toBe('PENDING_ACTIVATION');
  });

  it('needs KYC approved for the same customer', async () => {
    const pending = await createSub({ kycRef: kyc('KYC-PENDINGKYC0001', 'CUS-ALICE', 'UNDER_REVIEW') });
    pay(pending.orderRef);
    expect((await api('post', `/${pending.ref}/activate`, { body: {} })).body.error.code).toBe('KYC_NOT_APPROVED');

    const { ref, orderRef } = await createSub({ kycRef: kyc('KYC-SWITCHEDKYC001') });
    pay(orderRef);
    kyc('KYC-SWITCHEDKYC001', 'CUS-MALLORY'); // the application now belongs to someone else
    expect((await api('post', `/${ref}/activate`, { body: {} })).body.error.code).toBe('KYC_NOT_APPROVED');
    expect(await events('service.activated')).toHaveLength(0);
  });

  it('activates once: first period, agreement, service.activated', async () => {
    const before = Date.now();
    const { ref, sub } = await activeSub();
    expect(sub).toMatchObject({ status: 'ACTIVE', period: 1 });
    const start = new Date(sub.currentPeriodStart);
    expect(start.getTime()).toBeGreaterThanOrEqual(before);
    expect(new Date(sub.currentPeriodEnd)).toEqual(addMonthsIst(start, 12));

    const agreements = await Agreement.find({ subscriptionRef: ref }).lean();
    expect(agreements).toHaveLength(1);
    expect(agreements[0]).toMatchObject({ period: 1, status: 'ISSUED' });

    const again = await api('post', `/${ref}/activate`, { body: {} });
    expect(again.status).toBe(200);
    expect(await events('service.activated')).toHaveLength(1);
    expect(await Agreement.countDocuments()).toBe(1);
  });

  it('activates exactly once under concurrent requests', async () => {
    const { ref, orderRef } = await createSub();
    pay(orderRef);
    await as('OPS_ADMIN');
    const results = await Promise.all([1, 2, 3].map(() => api('post', `/${ref}/activate`, { body: {} })));
    expect(results.every((r) => [200, 409].includes(r.status))).toBe(true);
    expect((await load(ref)).status).toBe('ACTIVE');
    expect(await events('service.activated')).toHaveLength(1);
    expect(await Agreement.countDocuments({ subscriptionRef: ref })).toBe(1);
  });

  it('saves nothing when the outbox write fails', async () => {
    const { ref, orderRef } = await createSub();
    pay(orderRef);
    vi.spyOn(DomainEvent, 'create').mockRejectedValueOnce(new Error('outbox down'));
    expect((await api('post', `/${ref}/activate`, { body: {} })).status).toBe(500);
    expect((await load(ref)).status).toBe('PENDING_ACTIVATION');
    expect(await Agreement.countDocuments()).toBe(0);
    expect(await AuditEntry.countDocuments({ action: 'subscriptions.subscription.activated' })).toBe(0);
  });

  it('is an ops permission', async () => {
    const { ref, orderRef } = await createSub();
    pay(orderRef);
    expect((await api('post', `/${ref}/activate`, { role: 'FINANCE', body: {} })).status).toBe(403);
  });
});

// ── Suspend / cancel / agreements ─────────────

describe('suspension, cancellation and agreements', () => {
  it('suspends with a reason and reinstates within the paid period', async () => {
    const { ref } = await activeSub();
    expect((await api('post', `/${ref}/suspend`, { body: {} })).status).toBe(400);
    expect((await api('post', `/${ref}/suspend`, { body: { reason: 'no' } })).status).toBe(400);
    const suspended = await api('post', `/${ref}/suspend`, { body: { reason: 'Address misuse reported by landlord' } });
    expect(suspended.body.data).toMatchObject({ status: 'SUSPENDED', suspensionReason: expect.any(String) });
    expect((await events('subscription.suspended'))[0].payload).toEqual({ by: 'staff' });

    const reinstated = await api('post', `/${ref}/activate`, { body: {} });
    expect(reinstated.body.data).toMatchObject({ status: 'ACTIVE', suspendedBy: null });
    expect(await events('subscription.reinstated')).toHaveLength(1);
    expect(await events('service.activated')).toHaveLength(1);
  });

  it('cancels for good and voids open renewal quotes', async () => {
    const { ref } = await activeSub();
    await api('post', `/${ref}/renew`, { body: {} });
    const res = await api('post', `/${ref}/cancel`, { body: { reason: 'Customer closed the business' } });
    expect(res.body.data.status).toBe('CANCELLED');
    expect((await Renewal.findOne().lean()).status).toBe('VOID');
    expect((await api('post', `/${ref}/activate`, { body: {} })).body.error.code).toBe('INVALID_STATUS_TRANSITION');
    expect((await api('post', `/${ref}/renew`, { body: {} })).body.error.code).toBe('NOT_RENEWABLE');
    const again = await api('post', `/${ref}/cancel`, { body: { reason: 'Customer closed the business' } });
    expect(again.status).toBe(200);
    expect(await events('subscription.cancelled')).toHaveLength(1);
  });

  it('records an offline signature once', async () => {
    const { ref } = await activeSub();
    const agreementRef = (await Agreement.findOne().lean()).ref;
    const res = await api('post', `/${ref}/agreements/${agreementRef}/sign`, { body: {} });
    expect(res.body.data).toMatchObject({ status: 'SIGNED', signatureMethod: 'offline' });
    const again = await api('post', `/${ref}/agreements/${agreementRef}/sign`, { body: {} });
    expect(again.body.data.signedAt).toBe(res.body.data.signedAt);
    expect(await AuditEntry.countDocuments({ action: 'subscriptions.agreement.signed' })).toBe(1);
  });
});

// ── Renewals ──────────────────────────────────

describe('renewals', () => {
  it('quotes the next period once, at the frozen price', async () => {
    const { ref } = await activeSub();
    const first = await api('post', `/${ref}/renew`, { body: {} });
    expect(first.status).toBe(201);
    expect(first.body.data).toMatchObject({ forPeriod: 2, status: 'QUOTED', total_paise: 1_769_900, termMonths: 12 });
    const second = await api('post', `/${ref}/renew`, { body: {} });
    expect(second.status).toBe(200);
    expect(second.body.data.ref).toBe(first.body.data.ref);
    expect(await events('subscription.renewal_quoted')).toHaveLength(1);
  });

  it('applies only a paid, unused order and continues from the current period end', async () => {
    const { ref, orderRef, sub } = await activeSub();
    const renewalRef = (await api('post', `/${ref}/renew`, { body: {} })).body.data.ref;
    const path = `/${ref}/renewals/${renewalRef}/apply`;

    const unpaid = order('ORD-RENEWALORDER1');
    expect((await api('post', path, { body: { orderRef: unpaid } })).body.error.code).toBe('PAYMENT_NOT_CONFIRMED');
    expect((await api('post', path, { body: { orderRef } })).body.error.code).toBe('ORDER_ALREADY_USED');

    pay(unpaid);
    const applied = await api('post', path, { body: { orderRef: unpaid } });
    expect(applied.status).toBe(200);
    expect(applied.body.data).toMatchObject({ status: 'ACTIVE', period: 2 });
    expect(applied.body.data.currentPeriodStart).toBe(sub.currentPeriodEnd);
    expect(await Agreement.countDocuments({ subscriptionRef: ref, period: 2 })).toBe(1);

    // Replaying the same apply changes nothing.
    expect((await api('post', path, { body: { orderRef: unpaid } })).status).toBe(200);
    expect(await events('subscription.renewed')).toHaveLength(1);
    expect((await load(ref)).period).toBe(2);
  });

  it('applies once when two paid orders race for the same renewal', async () => {
    const { ref } = await activeSub();
    const renewalRef = (await api('post', `/${ref}/renew`, { body: {} })).body.data.ref;
    const a = order('ORD-RACEORDERAAA1', { status: 'PAID' });
    const b = order('ORD-RACEORDERBBB1', { status: 'PAID' });
    const path = `/${ref}/renewals/${renewalRef}/apply`;
    const results = await Promise.all([a, b].map((orderRef) => api('post', path, { body: { orderRef } })));
    expect(results.map((r) => r.status).sort()).toEqual([200, 409]);
    expect((await load(ref)).period).toBe(2);
    expect(await events('subscription.renewed')).toHaveLength(1);
  });
});

// ── Lifecycle job ─────────────────────────────

describe('processSubscriptionLifecycle', () => {
  const runAt = (now) => processSubscriptionLifecycle({ now });

  it('sends T-30, T-7 and T-1 reminders exactly once each', async () => {
    const { ref, sub } = await activeSub();
    const end = new Date(sub.currentPeriodEnd).getTime();
    expect((await runAt(new Date(end - 31 * DAY))).reminders).toBe(0);
    expect((await runAt(new Date(end - 30 * DAY))).reminders).toBe(1);
    expect((await runAt(new Date(end - 29 * DAY))).reminders).toBe(0);
    await Promise.all([runAt(new Date(end - 7 * DAY)), runAt(new Date(end - 7 * DAY))]);
    expect((await runAt(new Date(end - DAY))).reminders).toBe(1);
    expect((await runAt(new Date(end - DAY / 2))).reminders).toBe(0);

    const reminders = await events('subscription.renewal_reminder_due');
    expect(reminders.map((e) => e.payload.daysBefore)).toEqual([30, 7, 1]);
    expect(reminders.every((e) => e.entity.ref === ref && e.actor.type === 'system')).toBe(true);
  });

  it('after a worker outage sends only the most urgent reminder', async () => {
    const { sub } = await activeSub();
    const end = new Date(sub.currentPeriodEnd).getTime();
    await runAt(new Date(end - 5 * DAY));
    await runAt(new Date(end - 4 * DAY));
    expect((await events('subscription.renewal_reminder_due')).map((e) => e.payload.daysBefore)).toEqual([7]);
  });

  it('moves to GRACE at period end, SUSPENDED when grace ends, then needs a renewal', async () => {
    const { ref, sub } = await activeSub({ graceDays: 10 });
    const end = new Date(sub.currentPeriodEnd).getTime();
    expect((await runAt(new Date(end))).grace).toBe(1);
    expect(await load(ref)).toMatchObject({ status: 'GRACE', graceEndsAt: new Date(end + 10 * DAY) });
    expect((await runAt(new Date(end + 9 * DAY))).suspended).toBe(0);
    expect((await runAt(new Date(end + 10 * DAY))).suspended).toBe(1);
    expect(await load(ref)).toMatchObject({ status: 'SUSPENDED', suspendedBy: 'system' });
    expect((await events('subscription.suspended'))[0].payload).toEqual({ by: 'system', reason: 'RENEWAL_OVERDUE' });
    expect((await api('post', `/${ref}/activate`, { body: {} })).body.error.code).toBe('RENEWAL_REQUIRED');
  });

  it('restarts a lapsed subscription from now when a renewal is applied', async () => {
    const { ref, sub } = await activeSub({ graceDays: 0 });
    const end = new Date(sub.currentPeriodEnd).getTime();
    await runAt(new Date(end + DAY));
    expect((await load(ref)).status).toBe('SUSPENDED');

    const renewalRef = (await api('post', `/${ref}/renew`, { body: {} })).body.data.ref;
    const paid = order('ORD-LAPSEDRENEW01', { status: 'PAID' });
    // Pin the clock after the lapse (the HTTP API always uses the real time).
    const later = new Date(end + 5 * DAY);
    const ops = { type: 'staff', id: 'USR-OPS', role: 'OPS_ADMIN' };
    const res = await applyRenewal(ref, renewalRef, { orderRef: paid }, ops, null, later);
    expect(res).toMatchObject({ status: 'ACTIVE', period: 2, suspendedBy: null });
    expect(res.currentPeriodStart).toEqual(later);
  });

  it('changes nothing and publishes nothing when the outbox write fails', async () => {
    const { ref, sub } = await activeSub();
    const end = new Date(sub.currentPeriodEnd).getTime();
    vi.spyOn(DomainEvent, 'create').mockRejectedValueOnce(new Error('outbox down'));
    await expect(runAt(new Date(end))).rejects.toThrow('outbox down');
    expect((await load(ref)).status).toBe('ACTIVE');
    expect((await runAt(new Date(end))).grace).toBe(1);
  });
});

// ── Customer access and privacy ───────────────

describe('customer access', () => {
  it('shows customers their own subscriptions only, without staff fields', async () => {
    const { ref } = await activeSub();
    await api('post', `/${ref}/suspend`, { body: { reason: 'Payment dispute under review' } });

    const mine = await api('get', '/mine', { headers: ALICE });
    expect(mine.body.data.map((s) => s.ref)).toEqual([ref]);
    expect((await api('get', '/mine', { headers: BOB })).body.data).toEqual([]);

    const view = await api('get', `/${ref}`, { headers: ALICE });
    expect(view.status).toBe(200);
    const text = JSON.stringify(view.body);
    for (const hidden of ['_id', 'customerId', 'suspensionReason', 'Payment dispute', 'history', 'version']) {
      expect(text).not.toContain(hidden);
    }
    expect(view.body.data.agreements).toHaveLength(1);
    expect((await api('get', `/${ref}`, { headers: BOB })).status).toBe(404);
  });

  it('lets the owner ask for a renewal quote but nothing ops-only', async () => {
    const { ref } = await activeSub();
    expect((await api('post', `/${ref}/renew`, { headers: ALICE, body: {} })).status).toBe(201);
    expect((await api('post', `/${ref}/renew`, { headers: BOB, body: {} })).status).toBe(404);
    expect((await api('post', `/${ref}/activate`, { headers: ALICE, body: {} })).status).toBe(401);
    expect((await api('post', `/${ref}/suspend`, { headers: ALICE, body: { reason: 'xxxxxx' } })).status).toBe(401);
  });

  it('lists for staff with pagination and the owner', async () => {
    await createSub();
    await createSub();
    const page = await api('get', '/?limit=1', { role: 'FINANCE' });
    expect(page.body.data).toHaveLength(1);
    expect(page.body.data[0].customerId).toBe('CUS-ALICE');
    const next = await api('get', `/?limit=1&cursor=${page.body.meta.nextCursor}`, { role: 'FINANCE' });
    expect(next.body.data[0].ref).not.toBe(page.body.data[0].ref);
    expect((await api('get', '/', { role: 'CONTENT' })).status).toBe(403);
  });
});

describe('addMonthsIst', () => {
  it('clamps to the end of the month in IST', () => {
    // 31 Jan 2027 10:00 IST + 1 month → 28 Feb 2027 10:00 IST
    expect(addMonthsIst(new Date('2027-01-31T04:30:00Z'), 1)).toEqual(new Date('2027-02-28T04:30:00Z'));
    // 31 Mar 2027 23:30 IST (still 31 Mar in IST, 18:00 UTC) + 12 months → 31 Mar 2028 23:30 IST
    expect(addMonthsIst(new Date('2027-03-31T18:00:00Z'), 12)).toEqual(new Date('2028-03-31T18:00:00Z'));
  });
});
