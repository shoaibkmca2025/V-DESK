/**
 * Analytics module — integration tests: event ingest, the staff stream, KPIs and the funnel.
 * Run: npx vitest run src/modules/analytics/analytics.test.js
 */
import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../../app.js';
import { clearTestDb, startTestDb, stopTestDb } from '../../../test/db.js';
import { ADMIN_KEY, staffSession } from '../../../test/staff.js';
import { AnalyticsEvent } from './analytics.model.js';

const app = createApp();

const ingest = (events) => request(app).post('/api/v1/analytics/events').send({ events });
const staffGet = (path) => request(app).get(`/api/v1/analytics${path}`).set('x-admin-key', ADMIN_KEY);
const hoursAgo = (hours) => new Date(Date.now() - hours * 3600_000).toISOString();

/** An event the way telemetry.js builds it. */
const event = (type, data = {}, extra = {}) => ({
  id: `EVT-${Math.random().toString(36).slice(2, 10)}`,
  type,
  data,
  device: 'Desktop',
  timestamp: new Date().toISOString(),
  ...extra,
});

beforeAll(startTestDb);
afterEach(clearTestDb);
afterAll(stopTestDb);

describe('POST /api/v1/analytics/events', () => {
  it('stores a batch and strips personal data', async () => {
    const res = await ingest([
      event('search_submitted', { query: 'VO in Mumbai, mail me at rahul@acme.in' }),
      event('document_uploaded', { docType: 'PAN Card', fileName: 'rahul-pan.pdf' }),
    ]);
    expect(res.status).toBe(202);
    expect(res.body.data).toEqual({ accepted: 2, duplicates: 0 });

    const stored = await AnalyticsEvent.find().sort({ type: 1 }).lean();
    expect(stored[0].data).toEqual({ docType: 'PAN Card' });
    expect(stored[1].data).toEqual({ query: 'VO in Mumbai, mail me at [email]' });
    expect(stored[0].ref).toMatch(/^EVT-[A-Z0-9]+$/);
  });

  it('makes retries harmless, including duplicates inside one batch', async () => {
    const batch = [event('quote_started', { quoteId: 'VDQ-2026-1234' }), event('kyc_started')];
    await ingest(batch);
    const retry = await ingest([...batch, batch[0]]);
    expect(retry.status).toBe(202);
    expect(retry.body.data).toEqual({ accepted: 0, duplicates: 3 });

    const mixed = await ingest([batch[1], event('kyc_submitted')]);
    expect(mixed.body.data).toEqual({ accepted: 1, duplicates: 1 });
    expect(await AnalyticsEvent.countDocuments()).toBe(3);
  });

  it('accepts a sendBeacon text/plain body', async () => {
    const res = await request(app)
      .post('/api/v1/analytics/events')
      .set('Content-Type', 'text/plain')
      .send(JSON.stringify({ events: [event('hero_search', { query: 'coworking' })] }));
    expect(res.status).toBe(202);
    expect(res.body.data.accepted).toBe(1);

    const broken = await request(app)
      .post('/api/v1/analytics/events')
      .set('Content-Type', 'text/plain')
      .send('{"events":');
    expect(broken.body.error.code).toBe('INVALID_JSON');
  });

  it('distrusts odd devices and clocks instead of rejecting the event', async () => {
    const future = new Date(Date.now() + 86_400_000).toISOString();
    await ingest([event('search_submitted', {}, { device: 'Fridge', timestamp: future })]);
    const [stored] = await AnalyticsEvent.find().lean();
    expect(stored.device).toBe('Unknown');
    expect(Math.abs(stored.occurredAt - stored.createdAt)).toBeLessThan(5_000);
  });

  it('rejects empty, oversized and badly typed batches', async () => {
    expect((await ingest([])).status).toBe(400);
    expect((await ingest(Array.from({ length: 51 }, (_, i) => event('hero_search', { i })))).status).toBe(400);
    const badType = await ingest([event('Search Submitted')]);
    expect(badType.status).toBe(400);
    expect(badType.body.error.details[0].path).toBe('events.0.type');
  });
});

describe('GET /api/v1/analytics/events (staff stream)', () => {
  it('needs staff access', async () => {
    expect((await request(app).get('/api/v1/analytics/events')).status).toBe(401);
  });

  it('lists newest first in the client telemetry shape, filtered by type, with a cursor', async () => {
    for (const type of ['hero_search', 'search_submitted', 'hero_search']) await ingest([event(type, { n: type })]);

    const page1 = await staffGet('/events?limit=2');
    expect(page1.status).toBe(200);
    expect(page1.body.data).toHaveLength(2);
    expect(Object.keys(page1.body.data[0]).sort()).toEqual([
      'data',
      'device',
      'id',
      'receivedAt',
      'ref',
      'timestamp',
      'type',
    ]);
    const page2 = await staffGet(`/events?limit=2&cursor=${page1.body.meta.nextCursor}`);
    expect(page2.body.data).toHaveLength(1);
    expect(page2.body.meta.nextCursor).toBeNull();

    const filtered = await staffGet('/events?type=hero_search');
    expect(filtered.body.data.map((e) => e.type)).toEqual(['hero_search', 'hero_search']);
  });
});

describe('GET /api/v1/analytics/kpis and /funnel', () => {
  async function seed() {
    await ingest([
      event('hero_search', { query: ' Coworking ' }),
      event('search_submitted', { query: 'coworking' }),
      event('search_submitted', { query: 'GST registration' }, { device: 'Mobile' }),
      event('search_submitted', { query: 'virtual office' }),
      event('search_no_results', { query: 'Atlantis office' }),
      event('search_result_clicked', { id: 'CTR-MUM-001', type: 'centre' }),
      event('search_result_clicked', { id: 'WS-MUM-001', type: 'workspace' }),
      event('quote_started', { quoteId: 'VDQ-1' }),
      event('checkout_started', { amount: 1000 }),
      event('search_submitted', { query: 'old search' }, { timestamp: hoursAgo(48) }),
    ]);
  }

  it('summarises searches, devices and conversion events for the range', async () => {
    await seed();
    const res = await staffGet('/kpis?range=24h');
    expect(res.status).toBe(200);
    expect(res.body.data.range.key).toBe('24h');
    expect(res.body.data.events.total).toBe(9);
    expect(res.body.data.devices).toEqual({ Desktop: 8, Mobile: 1 });
    expect(res.body.data.search).toMatchObject({ searches: 4, noResults: 1, noResultRate: 25 });
    expect(res.body.data.search.topQueries[0]).toEqual({ query: 'coworking', count: 2 });
    expect(res.body.data.search.topNoResultQueries).toEqual([{ query: 'atlantis office', count: 1 }]);
    expect(res.body.data.conversion).toEqual({ quotesStarted: 1, checkoutsStarted: 1, kycSubmitted: 0, payments: 0 });

    const week = await staffGet('/kpis');
    expect(week.body.data.range.key).toBe('7d');
    expect(week.body.data.search.searches).toBe(5);
  });

  it('builds the funnel from step counts', async () => {
    await seed();
    const res = await staffGet('/funnel?range=24h');
    const steps = Object.fromEntries(res.body.data.steps.map((s) => [s.key, s]));
    expect(res.body.data.basis).toBe('events');
    expect(steps.search).toMatchObject({ count: 4, fromPrevious: null });
    expect(steps.result_click).toMatchObject({ count: 2, fromPrevious: 50, fromStart: 50 });
    expect(steps.quote).toMatchObject({ count: 1, fromPrevious: 50, fromStart: 25 });
    // No KYC events to convert from: the step rate is unknown (null), not 0 %.
    expect(steps.payment).toMatchObject({ count: 0, fromPrevious: null, fromStart: 0 });
  });

  it('rejects an unknown range', async () => {
    expect((await staffGet('/kpis?range=1y')).status).toBe(400);
  });

  it('is open to finance but not to sales execs', async () => {
    const finance = await staffSession(app, 'FINANCE');
    const exec = await staffSession(app, 'SALES_EXEC');
    expect((await request(app).get('/api/v1/analytics/kpis').set(finance.auth)).status).toBe(200);
    expect((await request(app).get('/api/v1/analytics/kpis').set(exec.auth)).status).toBe(403);
  });
});
