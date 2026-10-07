/**
 * Search module — integration tests for the staff endpoints (/api/v1/search/admin/*) and the seed script.
 * Public search endpoints are covered in search.test.js.
 *
 * Uses test/db.js (real MongoDB in memory). One catalog centre is inserted as a fixture so promoted-centre
 * validation has something to find. ADMIN_API_KEY comes from vitest.config.js.
 * Run: npx vitest run src/modules/search/search.admin.test.js
 */
import request from 'supertest';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../app.js';
import { clearTestDb, startTestDb, stopTestDb } from '../../../test/db.js';
import { POPULAR_SEARCHES_SEED, seedSearch } from '../../../scripts/seed-search.js';
import { Centre } from '../catalog/catalog.model.js';
import { SearchService, SearchSynonym } from './search.model.js';

const app = createApp();
const ADMIN_KEY = 'test-admin-key-0123456789';

const admin = (method, path) => request(app)[method](`/api/v1/search/admin${path}`).set('x-admin-key', ADMIN_KEY);

beforeAll(startTestDb);
beforeEach(async () => {
  await Centre.create({
    ref: 'CTR-MUM-001',
    cityRef: 'CITY-MUM',
    city: 'Mumbai',
    areaName: 'Andheri East',
    fullName: 'V-DESK Mumbai — Andheri East',
    address: 'Andheri East, Mumbai',
    vo_price_paise: 199900,
  });
  await seedSearch();
});
afterEach(clearTestDb);
afterAll(stopTestDb);

describe('search admin', () => {
  it('requires the admin key on every admin route', async () => {
    const routes = [
      ['get', '/synonyms'],
      ['get', '/redirects'],
      ['post', '/redirects'],
      ['patch', '/redirects/RDR-ABCD'],
      ['delete', '/redirects/RDR-ABCD'],
      ['get', '/config'],
      ['post', '/config'],
      ['patch', '/config/popularSearches'],
      ['delete', '/config/popularSearches'],
    ];
    for (const [method, path] of routes) {
      const res = await request(app)[method](`/api/v1/search/admin${path}`);
      expect(res.status, `${method} ${path}`).toBe(401);
      expect(res.body.error.code).toBe('ADMIN_KEY_INVALID');
    }
    const wrong = await request(app).get('/api/v1/search/admin/config').set('x-admin-key', 'wrong-key-0123456789');
    expect(wrong.status).toBe(401);
  });

  it('lists synonyms (none seeded) without internal fields', async () => {
    expect((await admin('get', '/synonyms')).body.data).toEqual([]);
    await SearchSynonym.create({ ref: 'SYN-TEST1', term: 'gurugram', replacement: 'gurgaon' });
    const [synonym] = (await admin('get', '/synonyms')).body.data;
    expect(synonym).toMatchObject({ ref: 'SYN-TEST1', term: 'gurugram', replacement: 'gurgaon' });
    expect(synonym).not.toHaveProperty('_id');
    expect(synonym).not.toHaveProperty('deletedAt');
  });

  it('creates, lists, updates and soft-deletes redirects', async () => {
    const created = await admin('post', '/redirects').send({
      query: '  GST   Help ',
      target: '/services/gst-registration',
    });
    expect(created.status).toBe(201);
    const { ref } = created.body.data;
    expect(created.body.data).toMatchObject({ query: 'gst help', target: '/services/gst-registration' });
    expect(ref).toMatch(/^RDR-/);

    expect((await admin('get', '/redirects')).body.data.map((r) => r.ref)).toEqual([ref]);

    const updated = await admin('patch', `/redirects/${ref.toLowerCase()}`).send({ target: '/virtual-office' });
    expect(updated.status).toBe(200);
    expect(updated.body.data).toMatchObject({ ref, query: 'gst help', target: '/virtual-office' });

    await admin('delete', `/redirects/${ref}`).expect(204);
    expect((await admin('get', '/redirects')).body.data).toEqual([]);
    expect((await admin('delete', `/redirects/${ref}`)).body.error.code).toBe('REDIRECT_NOT_FOUND');
    expect((await admin('patch', `/redirects/${ref}`).send({ target: '/x' })).status).toBe(404);

    // The same query can be redirected again after a delete.
    await admin('post', '/redirects').send({ query: 'gst help', target: '/x' }).expect(201);
  });

  it('keeps one live redirect per query', async () => {
    await admin('post', '/redirects').send({ query: 'a', target: '/a' }).expect(201);
    const other = await admin('post', '/redirects').send({ query: 'b', target: '/b' });
    const duplicate = await admin('post', '/redirects').send({ query: ' A ', target: '/c' });
    expect(duplicate.status).toBe(409);
    expect(duplicate.body.error.code).toBe('REDIRECT_EXISTS');
    const clash = await admin('patch', `/redirects/${other.body.data.ref}`).send({ query: 'a' });
    expect(clash.status).toBe(409);
  });

  it('only accepts site-relative redirect targets', async () => {
    for (const target of ['https://evil.example', '//evil.example', '/\\evil.example', 'services', '/with space']) {
      const res = await admin('post', '/redirects').send({ query: 'q', target });
      expect(res.status, target).toBe(400);
    }
    expect((await admin('patch', '/redirects/RDR-ABCD').send({})).status).toBe(400);
    expect((await admin('patch', '/redirects/not-a-ref').send({ target: '/x' })).status).toBe(400);
  });

  it('manages config entries by key', async () => {
    const list = await admin('get', '/config');
    expect(list.body.data).toEqual([expect.objectContaining({ key: 'popularSearches', value: POPULAR_SEARCHES_SEED })]);

    const duplicate = await admin('post', '/config').send({ key: 'popularSearches', value: ['x'] });
    expect(duplicate.status).toBe(409);
    expect(duplicate.body.error.code).toBe('CONFIG_EXISTS');

    const patched = await admin('patch', '/config/popularSearches').send({ value: [' Coworking in Pune '] });
    expect(patched.status).toBe(200);
    expect(patched.body.data).toMatchObject({ key: 'popularSearches', value: ['Coworking in Pune'] });
    expect((await request(app).get('/api/v1/search/popular')).body.data).toEqual([{ query: 'Coworking in Pune' }]);

    await admin('delete', '/config/popularSearches').expect(204);
    expect((await admin('patch', '/config/popularSearches').send({ value: [] })).body.error.code).toBe(
      'CONFIG_NOT_FOUND',
    );
    expect((await admin('delete', '/config/promotedCentres')).status).toBe(404);
    await admin('post', '/config').send({ key: 'popularSearches', value: [] }).expect(201);
  });

  it('validates config values against their key', async () => {
    const unknownKey = await admin('post', '/config').send({ key: 'ranking', value: [] });
    expect(unknownKey.status).toBe(400);

    const missing = await admin('post', '/config').send({
      key: 'promotedCentres',
      value: ['CTR-MUM-001', 'CTR-NOPE-9'],
    });
    expect(missing.status).toBe(400);
    expect(missing.body.error).toMatchObject({ code: 'UNKNOWN_CENTRE', details: { unknown: ['CTR-NOPE-9'] } });

    const repeated = await admin('patch', '/config/popularSearches').send({ value: ['GST', 'gst'] });
    expect(repeated.status).toBe(400);
    expect(repeated.body.error.details[0]).toMatchObject({ in: 'body', path: 'value' });

    const tooMany = await admin('patch', '/config/popularSearches').send({
      value: Array.from({ length: 21 }, (_, i) => `q${i}`),
    });
    expect(tooMany.status).toBe(400);
    expect((await admin('patch', '/config/popularSearches').send({})).status).toBe(400);
    expect((await admin('patch', '/config/popularSearches').send({ value: 'GST' })).status).toBe(400);
    expect((await admin('patch', '/config/other').send({ value: [] })).status).toBe(400);

    await admin('post', '/config').send({ key: 'promotedCentres', value: [] }).expect(201);
    const unknownOnPatch = await admin('patch', '/config/promotedCentres').send({ value: ['CTR-NOPE-9'] });
    expect(unknownOnPatch.body.error.code).toBe('UNKNOWN_CENTRE');
  });
});

// ── Seed ──────────────────────────────────────────────────────────────────────

describe('seed-search', () => {
  it('stores every client service and is safe to re-run', async () => {
    expect(await SearchService.countDocuments()).toBe(3);
    const gst = await SearchService.findOne({ slug: 'gst-registration' }).lean();
    expect(gst).toMatchObject({
      ref: 'SVC-GST-REGISTRATION',
      name: 'GST Registration',
      starting_price_paise: 149900,
      priceUnit: ' one-time',
    });
    expect(gst.faqs[0][0]).toBe('Which documents are required?');

    await admin('patch', '/config/popularSearches')
      .send({ value: ['Admin choice'] })
      .expect(200);
    expect(await seedSearch()).toEqual({ services: 3, popularCreated: false });
    expect(await SearchService.countDocuments()).toBe(3);
    expect((await request(app).get('/api/v1/search/popular')).body.data).toEqual([{ query: 'Admin choice' }]);
  });
});
