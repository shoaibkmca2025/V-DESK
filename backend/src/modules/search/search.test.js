/**
 * Search module — integration tests for the public /api/v1/search endpoints (staff + seed: search.admin.test.js).
 *
 * Uses test/db.js (real MongoDB in memory). Catalog rows are inserted through catalog's models as test fixtures
 * only; the search code itself reads them through catalog's public service. ADMIN_API_KEY comes from vitest.config.js.
 * Run: npm test  (or: npx vitest run src/modules/search/search.test.js)
 */
import request from 'supertest';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../app.js';
import { clearTestDb, startTestDb, stopTestDb } from '../../../test/db.js';
import { POPULAR_SEARCHES_SEED, seedSearch } from '../../../scripts/seed-search.js';
import { Centre, City, Workspace } from '../catalog/catalog.model.js';
import { SearchSynonym } from './search.model.js';

const app = createApp();
const ADMIN_KEY = 'test-admin-key-0123456789';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const city = (slug, name, localities) => ({
  ref: `CITY-${slug.slice(0, 3).toUpperCase()}`,
  slug,
  name,
  state: 'S',
  tier: 'Tier-1',
  localities,
});
const centre = (ref, cityName, areaName, price, extra = {}) => ({
  ref,
  cityRef: `CITY-${cityName.slice(0, 3).toUpperCase()}`,
  city: cityName,
  areaName,
  fullName: `V-DESK ${cityName} — ${areaName}`,
  address: `${areaName} address, ${cityName}`,
  vo_price_paise: price,
  ...extra,
});
const workspace = (ref, centreRef, cityName, type, capacity, price) => ({
  ref,
  centreRef,
  city: cityName,
  locality: 'L',
  name: `${type} ${ref}`,
  type,
  capacity,
  price_month_paise: price,
  price_hour_paise: 10000,
  rating: 4.8,
  reviews: 50,
});

async function seedCatalog() {
  await City.insertMany([
    city('mumbai', 'Mumbai', ['BKC', 'Andheri East']),
    city('pune', 'Pune', ['Baner']),
    city('gurgaon', 'Gurgaon', ['DLF Cyber City']),
    city('nashik', 'Nashik', ['College Road']),
    city('bangalore', 'Bangalore', ['Koramangala', 'HSR Layout']),
  ]);
  await Centre.insertMany([
    centre('CTR-NSK-001', 'Nashik', 'College Road', 124900, { flagship: true }),
    centre('CTR-MUM-001', 'Mumbai', 'Andheri East', 199900),
    centre('CTR-MUM-002', 'Mumbai', 'BKC', 249900, { status: 'limited' }),
    centre('CTR-PNE-001', 'Pune', 'Baner', 159900),
    centre('CTR-GUR-001', 'Gurgaon', 'Cyber City', 229900),
  ]);
  await Workspace.insertMany([
    workspace('WS-MUM-002', 'CTR-MUM-001', 'Mumbai', 'Coworking', 1, 799900),
    workspace('WS-NSK-001', 'CTR-NSK-001', 'Nashik', 'Meeting Rooms', 12, 2500000),
    workspace('WS-MUM-001', 'CTR-MUM-002', 'Mumbai', 'Private Office', 8, 4800000),
    workspace('WS-GUR-001', 'CTR-GUR-001', 'Gurgaon', 'Private Office', 8, 5200000),
  ]);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const search = (query = {}) => request(app).get('/api/v1/search').query(query);
const refs = (res) => res.body.data.results.map((r) => r.ref);
const admin = (method, path) => request(app)[method](`/api/v1/search/admin${path}`).set('x-admin-key', ADMIN_KEY);

beforeAll(startTestDb);
beforeEach(async () => {
  await seedCatalog();
  await seedSearch();
});
afterEach(clearTestDb);
afterAll(stopTestDb);

// ── GET /search ───────────────────────────────────────────────────────────────

describe('GET /api/v1/search', () => {
  it('parses intent, routes to the landing page and filters by it', async () => {
    const res = await search({ q: 'virtual office in mumbai' });
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({
      query: 'virtual office in mumbai',
      intent: { intent: 'Virtual Office', location: 'Mumbai', summary: 'Virtual Office • Mumbai' },
      route: '/locations/mumbai/virtual-office',
      redirected: false,
      filters: { city: 'Mumbai', type: 'Virtual Office', capacity: 'all', maxPrice: null, sort: 'recommended' },
      recommendations: null,
    });
    expect(refs(res)).toEqual(['CTR-MUM-001', 'CTR-MUM-002']);
    expect(res.body.data.services).toEqual([
      {
        slug: 'virtual-office',
        name: 'Virtual Office',
        icon: 'ph-buildings',
        starting_price_paise: 124900,
        priceUnit: '/mo',
      },
    ]);
    expect(res.body.meta).toEqual({ total: 3 });
  });

  it('returns items in the client shape with paise, centre address and no invented reviews', async () => {
    const res = await search({ q: 'Office for 8 people in Gurgaon' });
    expect(res.body.data.filters).toMatchObject({ city: 'Gurgaon', type: 'Private Office', capacity: '6-10' });
    expect(res.body.data.route).toBe('/locations/gurgaon/private-office');
    expect(res.body.data.results).toEqual([
      {
        ref: 'WS-GUR-001',
        name: 'Private Office WS-GUR-001',
        type: 'Private Office',
        city: 'Gurgaon',
        locality: 'L',
        address: 'Cyber City address, Gurgaon',
        capacity: 8,
        price_month_paise: 5200000,
        status: 'available',
        rating: 4.8,
        reviews: 50,
      },
    ]);
    const vo = await search({ q: 'virtual office in pune' });
    expect(vo.body.data.results[0]).toMatchObject({ ref: 'CTR-PNE-001', capacity: 10, rating: null, reviews: null });
    expect(JSON.stringify(res.body)).not.toContain('_id');
  });

  it('lets sent filters override the ones the query implies', async () => {
    const res = await search({ q: 'virtual office in mumbai', type: 'all' });
    expect(refs(res)).toEqual(['CTR-MUM-001', 'CTR-MUM-002', 'WS-MUM-002', 'WS-MUM-001']);
    expect(res.body.data.route).toBe('/locations/mumbai/virtual-office');
  });

  it('without a query returns the whole inventory, filtered and sorted as asked', async () => {
    const all = await search();
    expect(all.body.data).toMatchObject({ query: '', intent: null, route: null, services: [] });
    expect(refs(all)).toHaveLength(9);

    expect(refs(await search({ maxPrice: 2000 }))).toEqual(['CTR-NSK-001', 'CTR-MUM-001', 'CTR-PNE-001']);
    expect(refs(await search({ maxPrice: 2000, sort: 'price-asc' }))).toEqual([
      'CTR-NSK-001',
      'CTR-PNE-001',
      'CTR-MUM-001',
    ]);
    expect(refs(await search({ maxPrice: 2000, sort: 'price-desc' }))).toEqual([
      'CTR-MUM-001',
      'CTR-PNE-001',
      'CTR-NSK-001',
    ]);
    const byCapacity = refs(await search({ sort: 'capacity' }));
    expect(byCapacity[0]).toBe('WS-NSK-001');
    expect(byCapacity.at(-1)).toBe('WS-MUM-002');
    expect(refs(await search({ city: 'nashik', capacity: '11-25' }))).toEqual(['WS-NSK-001']);
  });

  it('puts promoted centres first for the recommended sort only', async () => {
    const created = await admin('post', '/config').send({
      key: 'promotedCentres',
      value: ['ctr-pne-001', 'CTR-MUM-002'],
    });
    expect(created.status).toBe(201);
    expect(refs(await search()).slice(0, 3)).toEqual(['CTR-PNE-001', 'CTR-MUM-002', 'CTR-NSK-001']);
    expect(refs(await search({ maxPrice: 2000, sort: 'price-asc' }))[0]).toBe('CTR-NSK-001');
  });

  it('matches business services and routes to their page', async () => {
    const res = await search({ q: 'GST registration' });
    expect(res.body.data.route).toBe('/services/gst-registration');
    expect(res.body.data.services.map((s) => s.slug)).toContain('gst-registration');
    expect(res.body.data.filters).toMatchObject({ city: 'all', type: 'all' });
  });

  it('on zero results relaxes filters and offers the client suggestion chips', async () => {
    const res = await search({ q: 'meeting room for 10 people in pune' });
    expect(res.body.data.results).toEqual([]);
    expect(res.body.meta.total).toBe(0);
    const { recommendations } = res.body.data;
    expect(recommendations.relaxed).toEqual(['capacity', 'type']);
    expect(recommendations.results.map((r) => r.ref)).toEqual(['CTR-PNE-001']);
    expect(recommendations.suggestions).toEqual([
      { type: 'city', label: 'Bangalore', query: 'Meeting Rooms in Bangalore' },
      { type: 'city', label: 'Gurgaon', query: 'Meeting Rooms in Gurgaon' },
      { type: 'city', label: 'Mumbai', query: 'Meeting Rooms in Mumbai' },
      { type: 'city', label: 'Nashik', query: 'Meeting Rooms in Nashik' },
      { type: 'service', label: 'GST Registration', query: 'GST Registration' },
      { type: 'service', label: 'Company Registration', query: 'Company Registration' },
    ]);
  });

  it('returns empty recommendations when even relaxed filters find nothing', async () => {
    const res = await search({ q: 'coworking in pune', maxPrice: 100 });
    expect(res.body.data.recommendations).toMatchObject({ relaxed: ['type', 'city'], results: [] });
  });

  it('applies an exact redirect regardless of case and spacing', async () => {
    await admin('post', '/redirects').send({ query: 'cheap office', target: '/virtual-office' }).expect(201);
    const res = await search({ q: '  CHEAP   Office ' });
    expect(res.body.data).toMatchObject({ route: '/virtual-office', redirected: true });
    expect((await search({ q: 'cheap office nashik' })).body.data.redirected).toBe(false);
  });

  it('rewrites synonyms before parsing but reports the visitor query', async () => {
    await SearchSynonym.create({ ref: 'SYN-TEST1', term: 'bengaluru', replacement: 'bangalore' });
    const res = await search({ q: 'Virtual office Bengaluru' });
    expect(res.body.data.intent).toMatchObject({ location: 'Bangalore', rawQuery: 'Virtual office Bengaluru' });
    expect(res.body.data.route).toBe('/locations/bangalore/virtual-office');
  });

  it('rejects unknown filter values', async () => {
    for (const query of [{ type: 'Hotel' }, { sort: 'random' }, { capacity: '7' }, { maxPrice: -5 }]) {
      const res = await search(query);
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_FAILED');
    }
  });
});

// ── GET /suggest and /popular ─────────────────────────────────────────────────

describe('GET /api/v1/search/suggest', () => {
  it('suggests popular searches, then cities, with landing routes', async () => {
    const res = await request(app).get('/api/v1/search/suggest').query({ q: 'mum' });
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([
      {
        type: 'popular',
        label: 'Virtual Office in Mumbai',
        route: '/locations/mumbai/virtual-office',
        query: 'Virtual Office in Mumbai',
      },
      { type: 'city', label: 'Mumbai', route: '/locations/mumbai', query: 'Mumbai' },
    ]);
  });

  it('matches localities by name and de-duplicates labels', async () => {
    const kora = await request(app).get('/api/v1/search/suggest').query({ q: 'kora' });
    expect(kora.body.data).toEqual([
      {
        type: 'locality',
        label: 'Koramangala, Bangalore',
        route: '/locations/bangalore',
        query: 'Koramangala, Bangalore',
      },
    ]);
    const gst = await request(app).get('/api/v1/search/suggest').query({ q: 'gst' });
    expect(gst.body.data.map((s) => [s.type, s.label])).toEqual([['popular', 'GST registration']]);
  });

  it('includes services, returns at most 8, and requires q', async () => {
    const company = await request(app).get('/api/v1/search/suggest').query({ q: 'company' });
    expect(company.body.data).toEqual([
      {
        type: 'service',
        label: 'Company Registration',
        route: '/services/company-registration',
        query: 'Company Registration',
      },
    ]);
    expect((await request(app).get('/api/v1/search/suggest').query({ q: 'a' })).body.data).toHaveLength(8);
    const missing = await request(app).get('/api/v1/search/suggest');
    expect(missing.status).toBe(400);
  });
});

describe('GET /api/v1/search/popular', () => {
  it('returns the configured chips in order, or none once removed', async () => {
    const res = await request(app).get('/api/v1/search/popular');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(POPULAR_SEARCHES_SEED.map((query) => ({ query })));

    await admin('delete', '/config/popularSearches').expect(204);
    expect((await request(app).get('/api/v1/search/popular')).body.data).toEqual([]);
  });
});
