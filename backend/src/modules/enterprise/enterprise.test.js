/**
 * Enterprise — RFPs, organisations, multi-user membership, team bookings, consolidated billing, price books,
 * reports, events, audit, access and privacy.
 *
 * Bookings and orders are read through their modules' public services, stood in here with fixtures (creating real
 * holds needs catalog data, and orders cannot be paid yet). Pricing is real. Customers come from test/customer.js.
 * Run: npx vitest run src/modules/enterprise/enterprise.test.js
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
import { getBooking } from '../booking/index.js';
import { getOrder } from '../orders/index.js';
import { previewItem } from '../pricing/index.js';
import { OrganisationMember, Rfp } from './enterprise.model.js';

vi.mock('../identity/identity.customer.js', () => import('../../../test/customer.js'));
vi.mock('../booking/index.js', async (importOriginal) => ({ ...(await importOriginal()), getBooking: vi.fn() }));
vi.mock('../orders/index.js', async (importOriginal) => ({ ...(await importOriginal()), getOrder: vi.fn() }));

const app = createApp();
const OWNER = customer('CUS-OWNER');
const ADMIN = customer('CUS-ADMIN');
const MEMBER = customer('CUS-MEMBER');
const STRANGER = customer('CUS-STRANGER');

// ── Fixtures for booking / orders ──
const bookings = new Map();
const orders = new Map();
const booking = (ref, status = 'CONFIRMED') =>
  bookings.set(ref, {
    ref,
    status,
    hub: 'Nashik',
    room: 'Board Room',
    date: '2026-11-02',
    slot: '10:00 AM - 12:00 PM',
    attendees: 6,
    pricing: { total_paise: 188_564 },
  }) && ref;
const order = (ref, overrides = {}) =>
  orders.set(ref, {
    ref,
    status: 'PENDING_PAYMENT',
    description: 'Virtual Office — Pune',
    currency: 'INR',
    total_paise: 100_000,
    createdAt: '2026-10-05T10:00:00.000Z',
    ...overrides,
  }) && ref;
getBooking.mockImplementation(async (ref) => {
  if (!bookings.has(ref)) throw notFound('BOOKING_NOT_FOUND', 'Not found');
  return { ...bookings.get(ref) };
});
getOrder.mockImplementation(async (ref) => {
  if (!orders.has(ref)) throw notFound('ORDER_NOT_FOUND', 'Not found');
  return { ...orders.get(ref) };
});

// ── Staff ──
const sessions = new Map();
async function as(role) {
  if (!sessions.has(role)) sessions.set(role, await staffSession(app, role));
  return sessions.get(role).auth;
}
async function api(method, path, { role = 'OPS_ADMIN', headers, body } = {}) {
  const auth = headers ?? (await as(role));
  const req = request(app)[method](`/api/v1/enterprise${path}`).set(auth);
  return body === undefined ? req : req.send(body);
}

/** An organisation with an OWNER, an ADMIN and a MEMBER. */
async function organisation() {
  const res = await api('post', '/organisations', {
    body: { name: 'Acme Tech Pvt Ltd', ownerCustomerId: 'CUS-OWNER' },
  });
  expect(res.status).toBe(201);
  const { ref } = res.body.data;
  await api('post', `/organisations/${ref}/members`, {
    headers: OWNER,
    body: { customerId: 'CUS-ADMIN', role: 'ADMIN' },
  });
  await api('post', `/organisations/${ref}/members`, {
    headers: ADMIN,
    body: { customerId: 'CUS-MEMBER', role: 'MEMBER' },
  });
  return ref;
}
const events = (type) => DomainEvent.find(type ? { type } : {}).lean();

beforeAll(startTestDb);
afterEach(async () => {
  sessions.clear();
  bookings.clear();
  orders.clear();
  vi.restoreAllMocks();
  await clearTestDb();
});
afterAll(stopTestDb);

// ── RFPs ──────────────────────────────────────

describe('bulk RFPs', () => {
  const RFP = {
    company: 'Fortune Enterprise',
    contact: { name: 'Priya Shah', mobile: '+91 98765 43210', email: 'Procurement@Corp.in' },
    desks: 120,
    months: 12,
    cities: ['Mumbai', 'Bangalore', 'Mumbai'],
    total_paise: 1,
    status: 'WON',
  };
  const submit = (body = RFP, key = 'rfp-key-1') =>
    request(app).post('/api/v1/enterprise/rfps').set('Idempotency-Key', key).send(body);

  it('records the RFP with a server-priced estimate and returns a receipt without contact details', async () => {
    const res = await submit();
    expect(res.status).toBe(201);
    expect(Object.keys(res.body.data).sort()).toEqual(['createdAt', 'ref', 'status']);
    expect(res.body.data.status).toBe('SUBMITTED');

    const doc = await Rfp.findOne().lean();
    const standard = await previewItem({ product: 'enterprise_desks', desks: 120, months: 12 });
    expect(doc.estimate.total_paise).toBe(standard.total_paise);
    expect(doc).toMatchObject({ status: 'SUBMITTED', cities: ['Mumbai', 'Bangalore'] });
    expect(doc.contact).toEqual({ name: 'Priya Shah', mobile: '9876543210', email: 'procurement@corp.in' });

    const [event] = await events('enterprise.rfp_submitted');
    expect(event.payload).toMatchObject({ desks: 120, months: 12 });
    expect(JSON.stringify(event)).not.toMatch(/Priya|9876543210|procurement/);
  });

  it('is idempotent per key, and refuses a reused key with a different body', async () => {
    const first = await submit();
    const replay = await submit();
    expect(replay.status).toBe(200);
    expect(replay.body.data.ref).toBe(first.body.data.ref);
    expect((await submit({ ...RFP, desks: 10 })).body.error.code).toBe('IDEMPOTENCY_KEY_REUSED');
    expect((await request(app).post('/api/v1/enterprise/rfps').send(RFP)).body.error.code).toBe(
      'IDEMPOTENCY_KEY_REQUIRED',
    );
    expect(await Rfp.countDocuments()).toBe(1);
    expect(await events('enterprise.rfp_submitted')).toHaveLength(1);
  });

  it.each([
    ['a bad mobile', { contact: { ...RFP.contact, mobile: '12345' } }],
    ['no desks', { desks: 0 }],
    ['too many desks', { desks: 10_001 }],
    ['no cities', { cities: [] }],
    ['no company', { company: '' }],
  ])('rejects %s', async (_label, patch) => {
    expect((await submit({ ...RFP, ...patch })).status).toBe(400);
  });

  it('lets staff work the pipeline one step at a time', async () => {
    const { ref } = (await submit()).body.data;
    const move = (status, role = 'SALES_MANAGER') => api('patch', `/rfps/${ref}/status`, { role, body: { status } });
    expect((await move('WON')).body.error.code).toBe('INVALID_STATUS_TRANSITION');
    expect((await move('UNDER_REVIEW')).body.data.status).toBe('UNDER_REVIEW');
    expect((await move('PROPOSAL_SENT')).body.data.status).toBe('PROPOSAL_SENT');
    expect((await move('WON')).body.data.status).toBe('WON');
    expect((await move('LOST')).status).toBe(409);
    expect((await move('UNDER_REVIEW', 'FINANCE')).status).toBe(403);
    expect(await AuditEntry.countDocuments({ action: 'enterprise.rfp.status_changed', entityRef: ref })).toBe(3);

    const staffView = await api('get', `/rfps/${ref}`, { role: 'FINANCE' });
    expect(staffView.body.data.contact.name).toBe('Priya Shah');
    expect((await api('get', '/rfps', { role: 'CONTENT' })).status).toBe(403);
    expect((await api('get', '/rfps', { headers: { 'x-admin-key': ADMIN_KEY } })).status).toBe(401);
  });
});

// ── Organisations and members ─────────────────

describe('organisations and members', () => {
  it('creates an organisation with its owner; staff permissions apply', async () => {
    const ref = await organisation();
    const view = await api('get', `/organisations/${ref}`, { role: 'FINANCE' });
    expect(view.body.data.members.map((m) => [m.customerId, m.role])).toEqual([
      ['CUS-OWNER', 'OWNER'],
      ['CUS-ADMIN', 'ADMIN'],
      ['CUS-MEMBER', 'MEMBER'],
    ]);
    expect((await api('post', '/organisations', { role: 'FINANCE', body: { name: 'X Ltd' } })).status).toBe(403);
    expect((await api('post', '/organisations', { body: { name: 'X Ltd', gstin: 'NOT-A-GSTIN' } })).status).toBe(400);
    expect((await api('post', '/organisations', { body: { name: 'X Ltd', gstin: '27AAYFV9842K1Z5' } })).status).toBe(
      201,
    );
    expect(await events('enterprise.organisation_created')).toHaveLength(2);
  });

  it('enforces organisation roles for customers', async () => {
    const ref = await organisation();
    // MEMBER: sees the organisation and their role, not the member list; cannot manage members.
    const asMember = await api('get', `/organisations/${ref}`, { headers: MEMBER });
    expect(asMember.body.data).toMatchObject({ ref, myRole: 'MEMBER' });
    expect(asMember.body.data.members).toBeUndefined();
    const add = { customerId: 'CUS-NEW', role: 'MEMBER' };
    expect((await api('post', `/organisations/${ref}/members`, { headers: MEMBER, body: add })).status).toBe(403);
    // ADMIN: manages members but cannot grant or remove OWNER.
    const grant = { customerId: 'CUS-NEW', role: 'OWNER' };
    const denied = await api('post', `/organisations/${ref}/members`, { headers: ADMIN, body: grant });
    expect(denied.body.error.code).toBe('OWNER_REQUIRED');
    expect((await api('delete', `/organisations/${ref}/members/CUS-OWNER`, { headers: ADMIN })).status).toBe(403);
    // Non-members cannot tell the organisation exists.
    expect((await api('get', `/organisations/${ref}`, { headers: STRANGER })).status).toBe(404);

    const mine = await api('get', '/me/organisations', { headers: ADMIN });
    expect(mine.body.data).toEqual([expect.objectContaining({ ref, myRole: 'ADMIN' })]);
  });

  it('never leaves an organisation without an owner, even under concurrent changes', async () => {
    const ref = await organisation();
    const demote = (customerId, headers) =>
      api('patch', `/organisations/${ref}/members/${customerId}`, { headers, body: { role: 'MEMBER' } });
    expect((await demote('CUS-OWNER', OWNER)).body.error.code).toBe('LAST_OWNER');
    expect((await api('delete', `/organisations/${ref}/members/CUS-OWNER`)).body.error.code).toBe('LAST_OWNER');

    await api('patch', `/organisations/${ref}/members/CUS-ADMIN`, { body: { role: 'OWNER' } });
    await as('OPS_ADMIN');
    const results = await Promise.all([demote('CUS-OWNER', OWNER), demote('CUS-ADMIN', ADMIN)]);
    expect(results.map((r) => r.status).sort()).toEqual([200, 409]);
    expect(await OrganisationMember.countDocuments({ organisationRef: ref, role: 'OWNER', deletedAt: null })).toBe(1);
  });

  it('refuses duplicate members, and deleting a non-empty organisation', async () => {
    const ref = await organisation();
    const dup = await api('post', `/organisations/${ref}/members`, {
      body: { customerId: 'CUS-MEMBER', role: 'ADMIN' },
    });
    expect(dup.body.error.code).toBe('MEMBER_EXISTS');
    expect((await api('delete', `/organisations/${ref}`)).body.error.code).toBe('ORGANISATION_NOT_EMPTY');
  });

  it('adds nothing when the outbox write fails', async () => {
    const ref = await organisation();
    vi.spyOn(DomainEvent, 'create').mockRejectedValueOnce(new Error('outbox down'));
    const res = await api('post', `/organisations/${ref}/members`, { body: { customerId: 'CUS-NEW', role: 'MEMBER' } });
    expect(res.status).toBe(500);
    expect(await OrganisationMember.countDocuments({ customerId: 'CUS-NEW' })).toBe(0);
    expect(await AuditEntry.countDocuments({ entityRef: `${ref}:CUS-NEW` })).toBe(0);
  });
});

// ── Team bookings ─────────────────────────────

describe('team bookings', () => {
  it('lets members attribute their own live bookings, once', async () => {
    const ref = await organisation();
    const link = (bookingRef, headers, extra = {}) =>
      api('post', `/organisations/${ref}/bookings`, { headers, body: { bookingRef, ...extra } });

    const ok = await link(booking('BK-TEAMBOOKING1'), MEMBER);
    expect(ok.status).toBe(201);
    expect(ok.body.data).toMatchObject({ kind: 'booking', ref: 'BK-TEAMBOOKING1', memberCustomerId: 'CUS-MEMBER' });

    const forOther = await link(booking('BK-TEAMBOOKING2'), MEMBER, { memberCustomerId: 'CUS-ADMIN' });
    expect(forOther.body.error.code).toBe('BOOK_FOR_SELF_ONLY');
    expect((await link('BK-TEAMBOOKING2', ADMIN, { memberCustomerId: 'CUS-MEMBER' })).status).toBe(201);
    expect((await link(booking('BK-CANCELLEDBK1', 'CANCELLED'), ADMIN)).body.error.code).toBe('BOOKING_NOT_LINKABLE');
    expect((await link('BK-TEAMBOOKING1', ADMIN)).body.error.code).toBe('ALREADY_LINKED');
    expect((await link(booking('BK-STRANGERBK1'), STRANGER)).status).toBe(404);

    const list = await api('get', `/organisations/${ref}/bookings`, { headers: MEMBER });
    expect(list.body.data.map((b) => [b.ref, b.status, b.room])).toEqual([
      ['BK-TEAMBOOKING1', 'CONFIRMED', 'Board Room'],
      ['BK-TEAMBOOKING2', 'CONFIRMED', 'Board Room'],
    ]);
  });
});

// ── Billing, price books, reports ─────────────

describe('consolidated billing', () => {
  it('totals linked orders by status, with role checks and a formula-safe CSV', async () => {
    const ref = await organisation();
    const link = (orderRef) => api('post', `/organisations/${ref}/orders`, { body: { orderRef } });
    await link(order('ORD-BILLINGORD01', { status: 'PAID', total_paise: 250_000 }));
    await link(order('ORD-BILLINGORD02', { total_paise: 100_000, description: '=HYPERLINK("http://x")' }));
    await link(order('ORD-BILLINGORD03', { status: 'CANCELLED', total_paise: 999 }));
    await link(order('ORD-OLDBILLORD01', { status: 'PAID', total_paise: 7, createdAt: '2026-08-01T00:00:00.000Z' }));
    expect((await link('ORD-BILLINGORD01')).body.error.code).toBe('ALREADY_LINKED');
    expect(
      (await api('post', `/organisations/${ref}/orders`, { headers: OWNER, body: { orderRef: 'ORD-X1234567' } }))
        .status,
    ).toBe(401);

    const statement = await api('get', `/organisations/${ref}/billing?from=2026-10-01&to=2026-11-01`, {
      headers: ADMIN,
    });
    expect(statement.body.data.totals).toEqual({
      orders: 3,
      billed_paise: 350_000,
      paid_paise: 250_000,
      outstanding_paise: 100_000,
      currency: 'INR',
    });
    expect((await api('get', `/organisations/${ref}/billing`, { headers: MEMBER })).status).toBe(403);

    const csv = await api('get', `/organisations/${ref}/billing.csv`, { role: 'FINANCE' });
    expect(csv.headers['content-type']).toContain('text/csv');
    expect(csv.text).toContain(`"'=HYPERLINK(""http://x"")"`);
    expect((await api('get', `/organisations/${ref}/billing.csv`, { headers: OWNER })).status).toBe(401);
  });
});

describe('price books', () => {
  const BOOK = {
    enterprise_desks: { desk_month_paise: 650_000, bulk_discounts: [{ min_desks: 1, discount_bp: 1000 }] },
    note: 'Negotiated 2026-27 rate card',
  };

  it('versions price books and prices with the active one through the pricing engine', async () => {
    const ref = await organisation();
    const standard = await api('get', `/organisations/${ref}/price-preview?desks=10&months=12`, { headers: ADMIN });
    expect(standard.body.data.priceBookVersion).toBeNull();

    const v1 = await api('post', `/organisations/${ref}/price-books`, { role: 'FINANCE', body: BOOK });
    expect(v1.status).toBe(201);
    expect(v1.body.data.version).toBe(1);
    const stale = await api('post', `/organisations/${ref}/price-books`, { role: 'FINANCE', body: BOOK });
    expect(stale.body.error.code).toBe('PRICE_BOOK_CHANGED');
    const v2 = await api('post', `/organisations/${ref}/price-books`, {
      role: 'FINANCE',
      body: { ...BOOK, expectedVersion: 1, enterprise_desks: { ...BOOK.enterprise_desks, desk_month_paise: 600_000 } },
    });
    expect(v2.body.data.version).toBe(2);

    const custom = await api('get', `/organisations/${ref}/price-preview?desks=10&months=12`, { headers: ADMIN });
    // 10 desks × 12 months × ₹6,000 − 10 % + 18 % GST
    expect(custom.body.data).toMatchObject({ priceBookVersion: 2, total_paise: 76_464_000 });
    expect(custom.body.data.total_paise).toBeLessThan(standard.body.data.total_paise);

    expect((await api('get', `/organisations/${ref}/price-books`, { role: 'FINANCE' })).body.data).toHaveLength(2);
    expect((await api('post', `/organisations/${ref}/price-books`, { body: BOOK })).status).toBe(403);
    expect(await events('enterprise.price_book_updated')).toHaveLength(2);
  });

  it('validates the rule shape', async () => {
    const ref = await organisation();
    const bad = { enterprise_desks: { desk_month_paise: 0, bulk_discounts: [] } };
    expect((await api('post', `/organisations/${ref}/price-books`, { role: 'FINANCE', body: bad })).status).toBe(400);
    const dupTiers = {
      enterprise_desks: {
        desk_month_paise: 1,
        bulk_discounts: [
          { min_desks: 1, discount_bp: 10 },
          { min_desks: 1, discount_bp: 20 },
        ],
      },
    };
    expect((await api('post', `/organisations/${ref}/price-books`, { role: 'FINANCE', body: dupTiers })).status).toBe(
      400,
    );
  });
});

describe('organisation report', () => {
  it('summarises members, team bookings and billing', async () => {
    const ref = await organisation();
    await api('post', `/organisations/${ref}/bookings`, {
      headers: MEMBER,
      body: { bookingRef: booking('BK-REPORTBOOK1') },
    });
    await api('post', `/organisations/${ref}/orders`, {
      body: { orderRef: order('ORD-REPORTORD01', { status: 'PAID' }) },
    });
    const report = await api('get', `/organisations/${ref}/report`, { headers: OWNER });
    expect(report.body.data).toMatchObject({
      members: { total: 3, byRole: { OWNER: 1, ADMIN: 1, MEMBER: 1 } },
      teamBookings: { total: 1, byStatus: { CONFIRMED: 1 } },
      billing: { orders: 1, paid_paise: 100_000, byStatus: { PAID: 1 } },
    });
    expect((await api('get', `/organisations/${ref}/report`, { headers: MEMBER })).status).toBe(403);
    expect(JSON.stringify(report.body)).not.toContain('_id');
  });
});
