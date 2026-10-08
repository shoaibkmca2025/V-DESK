/**
 * Pricing module — integration tests: previews, quotes (idempotency, status flow, expiry) and rule overrides.
 * Engine arithmetic is covered in pricing.engine.test.js.
 * Run: npx vitest run src/modules/pricing/pricing.test.js
 */
import request from 'supertest';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../../app.js';
import { clearTestDb, startTestDb, stopTestDb } from '../../../test/db.js';
import { ADMIN_KEY, staffSession } from '../../../test/staff.js';
import { Centre } from '../catalog/catalog.model.js';

const app = createApp();

const VO_ITEM = {
  product: 'virtual_office',
  centreRef: 'ctr-nsk-001',
  tenure: 'annual',
  purpose: 'GST Registration',
  addons: { gst: true, mail: true },
};

const preview = (item) => request(app).post('/api/v1/pricing/quote-preview').send(item);
const createQuote = (body, key = 'key-0001') =>
  request(app).post('/api/v1/pricing/quotes').set('Idempotency-Key', key).send(body);
const setStatus = (ref, status) => request(app).patch(`/api/v1/pricing/quotes/${ref}/status`).send({ status });
const staff = (method, path) => request(app)[method](`/api/v1/pricing${path}`).set('x-admin-key', ADMIN_KEY);
const quoteBody = { name: 'Priya Kulkarni', company: 'Zenith D2C Brands Pvt Ltd', item: VO_ITEM };

beforeAll(startTestDb);
beforeEach(() =>
  Centre.create({
    ref: 'CTR-NSK-001',
    cityRef: 'CITY-NSK',
    city: 'Nashik',
    areaName: 'College Road',
    fullName: 'V-DESK Headquarters — College Road',
    address: 'College Road, Nashik',
    services: ['Virtual Office', 'Coworking'],
    vo_price_paise: 124900,
  }),
);
afterEach(async () => {
  vi.useRealTimers();
  await clearTestDb();
});
afterAll(stopTestDb);

describe('POST /api/v1/pricing/quote-preview', () => {
  it('prices a virtual office from the catalog centre, ignoring any price the client sends', async () => {
    const res = await preview({ ...VO_ITEM, vo_price_paise: 1, total_paise: 1 });
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ product: 'virtual_office', rate_month_paise: 124900, total_paise: 2150054 });
  });

  it('prices the other products', async () => {
    expect((await preview({ product: 'meeting_room', room: 'Conference Room', hours: 2 })).body.data.total_paise).toBe(
      188564,
    );
    expect((await preview({ product: 'enterprise_desks', desks: 50 })).body.data.tenure).toBe('12 Months');
    const bundle = await preview({
      product: 'bundle',
      services: ['virtual-office', 'gst-registration', 'company-incorporation'],
    });
    expect(bundle.body.data.total_paise).toBe(1868810);
  });

  it('answers 404 for an unknown centre and 400 for bad input', async () => {
    expect((await preview({ ...VO_ITEM, centreRef: 'CTR-XXX-999' })).body.error.code).toBe('CENTRE_NOT_FOUND');
    expect((await preview({ product: 'spaceship' })).status).toBe(400);
    expect((await preview({ product: 'meeting_room', room: 'Boardroom', hours: 0 })).status).toBe(400);
    expect((await preview({ product: 'meeting_room', room: 'Ballroom', hours: 2 })).body.error.code).toBe(
      'UNKNOWN_ROOM',
    );
  });
});

describe('quotes', () => {
  it('needs an Idempotency-Key', async () => {
    const res = await request(app).post('/api/v1/pricing/quotes').send(quoteBody);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('IDEMPOTENCY_KEY_REQUIRED');
  });

  it('creates a SENT quote valid for 14 days, in the client quote shape', async () => {
    const res = await createQuote(quoteBody);
    expect(res.status).toBe(201);
    const quote = res.body.data;
    expect(quote.ref).toMatch(/^VDQ-[A-Z0-9]{16,}$/);
    expect(quote).toMatchObject({
      status: 'SENT',
      productType: 'virtual_office',
      product: 'Nashik Virtual Office Platform',
      purpose: 'GST Registration',
      tenure: '12 Months',
      rate_month_paise: 124900,
      name: 'Priya Kulkarni',
      company: 'Zenith D2C Brands Pvt Ltd',
      pricing: { total_paise: 2150054 },
    });
    const validFor = new Date(quote.validUntil) - new Date(quote.createdAt);
    expect(Math.abs(validFor - 14 * 24 * 3600 * 1000)).toBeLessThan(1000);
    for (const field of ['_id', 'idempotencyKey', 'requestHash', 'item', 'history'])
      expect(quote[field]).toBeUndefined();

    const shared = await request(app).get(`/api/v1/pricing/quotes/${quote.ref.toLowerCase()}`);
    expect(shared.status).toBe(200);
    expect(shared.body.data).toEqual(quote);
  });

  it('replays the same request and refuses a reused key', async () => {
    const first = await createQuote(quoteBody);
    const replay = await createQuote(quoteBody);
    expect(replay.status).toBe(200);
    expect(replay.body.data.ref).toBe(first.body.data.ref);

    const reused = await createQuote({ ...quoteBody, name: 'Someone Else' });
    expect(reused.status).toBe(409);
    expect(reused.body.error.code).toBe('IDEMPOTENCY_KEY_REUSED');
  });

  it('answers 404 for an unknown ref', async () => {
    expect((await request(app).get('/api/v1/pricing/quotes/VDQ-NOPE')).body.error.code).toBe('QUOTE_NOT_FOUND');
  });

  it('keeps its price when the rules change later', async () => {
    const { ref } = (await createQuote(quoteBody)).body.data;
    await staff('put', '/rules/tax').send({ value: { gst_bp: 500 } });
    expect((await request(app).get(`/api/v1/pricing/quotes/${ref}`)).body.data.pricing.total_paise).toBe(2150054);
    expect((await preview(VO_ITEM)).body.data.gst.rate_bp).toBe(500);
  });
});

describe('quote status', () => {
  it('goes SENT → VIEWED → ACCEPTED, with repeats as no-ops', async () => {
    const { ref } = (await createQuote(quoteBody)).body.data;
    expect((await setStatus(ref, 'VIEWED')).body.data.status).toBe('VIEWED');
    expect((await setStatus(ref, 'VIEWED')).body.data.status).toBe('VIEWED');
    expect((await setStatus(ref, 'ACCEPTED')).body.data.status).toBe('ACCEPTED');
    expect((await setStatus(ref, 'ACCEPTED')).status).toBe(200);
    // Re-opening an accepted proposal doesn't move it back.
    expect((await setStatus(ref, 'VIEWED')).body.data.status).toBe('ACCEPTED');

    const reject = await setStatus(ref, 'REJECTED');
    expect(reject.status).toBe(409);
    expect(reject.body.error).toMatchObject({ code: 'INVALID_STATUS_TRANSITION', details: { from: 'ACCEPTED' } });

    const { body } = await staff('get', '/quotes');
    expect(body.data[0].history.map((h) => h.status)).toEqual(['SENT', 'VIEWED', 'ACCEPTED']);
  });

  it('only lets the customer view, accept or reject', async () => {
    const { ref } = (await createQuote(quoteBody)).body.data;
    expect((await setStatus(ref, 'EXPIRED')).status).toBe(400);
    expect((await setStatus(ref, 'DRAFT')).status).toBe(400);
  });

  it('expires after 14 days and can no longer be accepted', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    const { ref } = (await createQuote(quoteBody)).body.data;
    vi.setSystemTime(Date.now() + 15 * 24 * 3600 * 1000);

    expect((await request(app).get(`/api/v1/pricing/quotes/${ref}`)).body.data.status).toBe('EXPIRED');
    const accept = await setStatus(ref, 'ACCEPTED');
    expect(accept.status).toBe(409);
    expect(accept.body.error.code).toBe('QUOTE_EXPIRED');

    const { body } = await staff('get', '/quotes?status=EXPIRED');
    expect(body.data).toHaveLength(1);
    expect(body.data[0].history.at(-1)).toMatchObject({ status: 'EXPIRED', actor: 'system' });
  });
});

describe('staff', () => {
  it('lists quotes newest first with a cursor and needs staff access', async () => {
    expect((await request(app).get('/api/v1/pricing/quotes')).status).toBe(401);
    for (const key of ['k-1', 'k-2', 'k-3']) await createQuote({ ...quoteBody, name: key }, key);
    const page1 = await staff('get', '/quotes?limit=2');
    expect(page1.body.data.map((q) => q.name)).toEqual(['k-3', 'k-2']);
    const page2 = await staff('get', `/quotes?limit=2&cursor=${page1.body.meta.nextCursor}`);
    expect(page2.body.data.map((q) => q.name)).toEqual(['k-1']);
  });

  it('shows effective rules, overrides a key, validates it, and resets it', async () => {
    const rules = await staff('get', '/rules');
    expect(rules.body.data.map((r) => [r.key, r.source])).toEqual([
      ['tax', 'default'],
      ['virtual_office', 'default'],
      ['meeting_room', 'default'],
      ['enterprise_desks', 'default'],
      ['bundle', 'default'],
    ]);

    const bad = await staff('put', '/rules/tax').send({ value: { gst_bp: 18.5, extra: true } });
    expect(bad.status).toBe(400);
    expect(bad.body.error.details.map((d) => d.path)).toEqual(expect.arrayContaining(['value.gst_bp']));

    const set = await staff('put', '/rules/tax').send({ value: { gst_bp: 1200 } });
    expect(set.body.data).toMatchObject({
      key: 'tax',
      source: 'custom',
      value: { gst_bp: 1200 },
      updatedBy: 'admin-key',
    });

    const reset = await staff('delete', '/rules/tax');
    expect(reset.body.data).toMatchObject({ source: 'default', value: { gst_bp: 1800 } });
    expect((await preview(VO_ITEM)).body.data.gst.rate_bp).toBe(1800);
  });

  it('lets finance change prices; sales can read rules but not change them', async () => {
    const finance = await staffSession(app, 'FINANCE');
    const exec = await staffSession(app, 'SALES_EXEC');
    expect((await request(app).get('/api/v1/pricing/rules').set(exec.auth)).status).toBe(200);
    expect(
      (
        await request(app)
          .put('/api/v1/pricing/rules/tax')
          .set(exec.auth)
          .send({ value: { gst_bp: 0 } })
      ).status,
    ).toBe(403);

    const res = await request(app)
      .put('/api/v1/pricing/rules/tax')
      .set(finance.auth)
      .send({ value: { gst_bp: 1800 } });
    expect(res.status).toBe(200);
    expect(res.body.data.updatedBy).toBe(finance.ref);
  });
});
