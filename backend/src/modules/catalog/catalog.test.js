/**
 * Catalog module — integration tests.
 *
 * Uses the existing test/db.js helper (real MongoDB in memory via mongodb-memory-server).
 * Tests the full HTTP stack: routes → controller → service → repository → model.
 *
 * Run: npm test  (or: npx vitest run src/modules/catalog/catalog.test.js)
 */
import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../../app.js';
import { clearTestDb, startTestDb, stopTestDb } from '../../../test/db.js';
import { Centre, City, Workspace } from './catalog.model.js';

const app = createApp();

// ── Shared fixtures ───────────────────────────────────────────────────────────

async function seedCity(overrides = {}) {
  return City.create({
    ref: 'CITY-TST',
    slug: 'testville',
    name: 'Testville',
    state: 'Test State',
    tier: 'Tier-2',
    tagline: 'The testing city',
    localities: ['Zone A', 'Zone B'],
    active: true,
    deletedAt: null,
    ...overrides,
  });
}

async function seedCentre(overrides = {}) {
  return Centre.create({
    ref: 'CTR-TST-001',
    cityRef: 'CITY-TST',
    city: 'Testville',
    areaName: 'Zone A',
    fullName: 'V-DESK Testville — Zone A',
    address: '1 Test Street, Testville – 000001',
    services: ['Virtual Office', 'GST Registration'],
    vo_price_paise: 100000, // ₹1,000
    cw_price_paise: 50000,  // ₹500
    meetingCapacity: '4–8 pax',
    status: 'available',
    flagship: false,
    active: true,
    deletedAt: null,
    ...overrides,
  });
}

async function seedWorkspace(overrides = {}) {
  return Workspace.create({
    ref: 'WS-TST-001',
    centreRef: 'CTR-TST-001',
    city: 'Testville',
    locality: 'Zone A',
    name: 'Test Coworking Desk',
    type: 'Coworking',
    capacity: 2,
    price_month_paise: 500000, // ₹5,000
    price_hour_paise: 20000,   // ₹200
    amenities: ['Wi-Fi', 'Power Backup'],
    status: 'available',
    rating: 4.5,
    reviews: 10,
    active: true,
    deletedAt: null,
    ...overrides,
  });
}

// ── Suite ─────────────────────────────────────────────────────────────────────

describe('catalog module', () => {
  beforeAll(startTestDb);
  afterEach(clearTestDb);
  afterAll(stopTestDb);

  // ── GET /api/v1/catalog (bundle) ──────────────────────────────────────────

  describe('GET /api/v1/catalog', () => {
    it('returns an empty bundle when the DB is empty', async () => {
      const res = await request(app).get('/api/v1/catalog');
      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({ cities: [], centres: [], workspaces: [] });
    });

    it('returns all active cities, centres, and workspaces', async () => {
      await seedCity();
      await seedCentre();
      await seedWorkspace();

      const res = await request(app).get('/api/v1/catalog');
      expect(res.status).toBe(200);
      expect(res.body.data.cities).toHaveLength(1);
      expect(res.body.data.centres).toHaveLength(1);
      expect(res.body.data.workspaces).toHaveLength(1);
    });

    it('never exposes _id in the response', async () => {
      await seedCity();
      const res = await request(app).get('/api/v1/catalog');
      const city = res.body.data.cities[0];
      expect(city._id).toBeUndefined();
      expect(city.ref).toBe('CITY-TST');
    });

    it('excludes soft-deleted records', async () => {
      await seedCity({ deletedAt: new Date() });
      const res = await request(app).get('/api/v1/catalog');
      expect(res.body.data.cities).toHaveLength(0);
    });

    it('excludes inactive records', async () => {
      await seedCentre({ active: false });
      const res = await request(app).get('/api/v1/catalog');
      expect(res.body.data.centres).toHaveLength(0);
    });
  });

  // ── GET /api/v1/catalog/cities ────────────────────────────────────────────

  describe('GET /api/v1/catalog/cities', () => {
    it('returns an empty array when no cities exist', async () => {
      const res = await request(app).get('/api/v1/catalog/cities');
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    });

    it('returns all active cities', async () => {
      await seedCity();
      const res = await request(app).get('/api/v1/catalog/cities');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].slug).toBe('testville');
    });

    it('includes X-Request-Id header', async () => {
      const res = await request(app).get('/api/v1/catalog/cities');
      expect(res.headers['x-request-id']).toBeDefined();
    });
  });

  // ── GET /api/v1/catalog/cities/:slug ─────────────────────────────────────

  describe('GET /api/v1/catalog/cities/:slug', () => {
    it('returns 200 for an existing city', async () => {
      await seedCity();
      const res = await request(app).get('/api/v1/catalog/cities/testville');
      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Testville');
    });

    it('returns 404 CITY_NOT_FOUND for an unknown slug', async () => {
      const res = await request(app).get('/api/v1/catalog/cities/narnia');
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('CITY_NOT_FOUND');
    });

    it('returns 404 for a soft-deleted city', async () => {
      await seedCity({ slug: 'ghost', ref: 'CITY-GHO', deletedAt: new Date() });
      const res = await request(app).get('/api/v1/catalog/cities/ghost');
      expect(res.status).toBe(404);
    });
  });

  // ── GET /api/v1/catalog/centres ───────────────────────────────────────────

  describe('GET /api/v1/catalog/centres', () => {
    it('returns all centres without filter', async () => {
      await seedCity();
      await seedCentre();
      const res = await request(app).get('/api/v1/catalog/centres');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].ref).toBe('CTR-TST-001');
    });

    it('filters centres by city slug', async () => {
      await seedCity();
      await seedCentre();
      // Add a centre in a different city
      await Centre.create({
        ref: 'CTR-OTH-001', cityRef: 'CITY-OTH', city: 'Othertown', areaName: 'Other',
        fullName: 'Other Centre', address: 'Other', services: [], status: 'available',
        active: true, deletedAt: null,
      });

      const res = await request(app).get('/api/v1/catalog/centres?city=testville');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].city).toBe('Testville');
    });

    it('returns 404 CITY_NOT_FOUND when city slug does not exist', async () => {
      const res = await request(app).get('/api/v1/catalog/centres?city=atlantis');
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('CITY_NOT_FOUND');
    });

    it('never exposes _id in centre records', async () => {
      await seedCity();
      await seedCentre();
      const res = await request(app).get('/api/v1/catalog/centres');
      expect(res.body.data[0]._id).toBeUndefined();
    });
  });

  // ── GET /api/v1/catalog/centres/:ref ──────────────────────────────────────

  describe('GET /api/v1/catalog/centres/:ref', () => {
    it('returns 200 for an existing centre ref', async () => {
      await seedCity();
      await seedCentre();
      const res = await request(app).get('/api/v1/catalog/centres/CTR-TST-001');
      expect(res.status).toBe(200);
      expect(res.body.data.fullName).toBe('V-DESK Testville — Zone A');
    });

    it('returns 404 CENTRE_NOT_FOUND for unknown ref', async () => {
      const res = await request(app).get('/api/v1/catalog/centres/CTR-NOPE');
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('CENTRE_NOT_FOUND');
    });
  });

  // ── GET /api/v1/catalog/workspaces ────────────────────────────────────────

  describe('GET /api/v1/catalog/workspaces', () => {
    it('returns all workspaces without filter', async () => {
      await seedCity();
      await seedCentre();
      await seedWorkspace();
      const res = await request(app).get('/api/v1/catalog/workspaces');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });

    it('filters by city', async () => {
      await seedCity();
      await seedCentre();
      await seedWorkspace();
      const res = await request(app).get('/api/v1/catalog/workspaces?city=Testville');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });

    it('filters by type', async () => {
      await seedCity();
      await seedCentre();
      await seedWorkspace();
      const res = await request(app).get('/api/v1/catalog/workspaces?type=Meeting+Rooms');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(0); // seeded type is Coworking
    });

    it('filters by capacity (minimum)', async () => {
      await seedCity();
      await seedCentre();
      await seedWorkspace({ capacity: 4 });
      const res = await request(app).get('/api/v1/catalog/workspaces?capacity=5');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(0);
    });

    it('filters by maxPrice (rupees)', async () => {
      await seedCity();
      await seedCentre();
      await seedWorkspace({ price_month_paise: 500000 }); // ₹5,000
      // maxPrice=4000 → paise=400000 < 500000 → excluded
      const res = await request(app).get('/api/v1/catalog/workspaces?maxPrice=4000');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(0);
    });

    it('accepts maxPrice in rupees that includes the workspace', async () => {
      await seedCity();
      await seedCentre();
      await seedWorkspace({ price_month_paise: 500000 }); // ₹5,000
      const res = await request(app).get('/api/v1/catalog/workspaces?maxPrice=5000');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });

    it('returns 400 VALIDATION_FAILED for invalid type enum', async () => {
      const res = await request(app).get('/api/v1/catalog/workspaces?type=InvalidType');
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_FAILED');
    });

    it('returns 400 VALIDATION_FAILED for non-numeric capacity', async () => {
      const res = await request(app).get('/api/v1/catalog/workspaces?capacity=abc');
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_FAILED');
    });

    it('never exposes _id in workspace records', async () => {
      await seedCity();
      await seedCentre();
      await seedWorkspace();
      const res = await request(app).get('/api/v1/catalog/workspaces');
      expect(res.body.data[0]._id).toBeUndefined();
    });
  });

  // ── GET /api/v1/catalog/workspaces/:ref ───────────────────────────────────

  describe('GET /api/v1/catalog/workspaces/:ref', () => {
    it('returns 200 for an existing workspace ref', async () => {
      await seedCity();
      await seedCentre();
      await seedWorkspace();
      const res = await request(app).get('/api/v1/catalog/workspaces/WS-TST-001');
      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Test Coworking Desk');
    });

    it('returns 404 WORKSPACE_NOT_FOUND for unknown ref', async () => {
      const res = await request(app).get('/api/v1/catalog/workspaces/WS-NOPE');
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('WORKSPACE_NOT_FOUND');
    });
  });
});
