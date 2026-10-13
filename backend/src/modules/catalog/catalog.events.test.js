/**
 * Catalog — `catalog.updated` is saved with each staff change (outbox, ADR-008): never for refused or no-op edits.
 * Run: npx vitest run src/modules/catalog/catalog.events.test.js
 */
import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { createApp } from '../../app.js';
import { clearTestDb, startTestDb, stopTestDb } from '../../../test/db.js';
import { ADMIN_KEY } from '../../../test/staff.js';
import { DomainEvent } from '../../shared/events/events.model.js';
import { Centre, City } from './catalog.model.js';

const app = createApp();
const admin = (method, path) => request(app)[method](`/api/v1/catalog/admin${path}`).set('x-admin-key', ADMIN_KEY);

const CITY = { slug: 'nashik', name: 'Nashik', state: 'Maharashtra', tier: 'Tier-2', localities: ['College Road'] };
const CENTRE = {
  citySlug: 'nashik',
  areaName: 'College Road',
  fullName: 'V-DESK HQ — College Road',
  address: 'Landmark Trade Centre, College Road, Nashik',
  services: ['Virtual Office'],
  vo_price_paise: 124900,
};
const updates = () => DomainEvent.find({ type: 'catalog.updated' }).sort({ createdAt: 1 }).lean();

beforeAll(startTestDb);
afterEach(async () => {
  vi.restoreAllMocks();
  await clearTestDb();
});
afterAll(stopTestDb);

describe('catalog.updated', () => {
  it('is published for each create, change and delete, with refs and field names only', async () => {
    expect((await admin('post', '/cities').send(CITY)).status).toBe(201);
    const centre = (await admin('post', '/centres').send(CENTRE)).body.data;
    expect((await admin('patch', `/centres/${centre.ref}`).send({ vo_price_paise: 129900 })).status).toBe(200);
    expect((await admin('delete', `/centres/${centre.ref}`)).status).toBe(204);

    const events = await updates();
    expect(events.map((e) => [e.entity.type, e.entity.ref, e.payload.action])).toEqual([
      ['city', 'CITY-NASHIK', 'created'],
      ['centre', centre.ref, 'created'],
      ['centre', centre.ref, 'updated'],
      ['centre', centre.ref, 'deleted'],
    ]);
    expect(events[2].payload.fields).toEqual(['vo_price_paise']);
    expect(events[2].actor).toEqual({ type: 'admin-key', id: null });
    expect(JSON.stringify(events.map((e) => e.payload))).not.toMatch(/129900|Landmark/);
  });

  it('is not published for an edit to the same values, a duplicate city or a refused delete', async () => {
    await admin('post', '/cities').send(CITY);
    await admin('post', '/centres').send(CENTRE);
    const before = (await updates()).length;

    expect((await admin('patch', '/cities/nashik').send({ name: 'Nashik' })).status).toBe(200);
    expect((await admin('post', '/cities').send(CITY)).body.error.code).toBe('CITY_EXISTS');
    expect((await admin('delete', '/cities/nashik')).body.error.code).toBe('CITY_HAS_CENTRES');
    expect(await updates()).toHaveLength(before);
  });

  it('is not published by a delete that a concurrent delete beat (regression)', async () => {
    await admin('post', '/cities').send(CITY);
    const centre = (await admin('post', '/centres').send(CENTRE)).body.data;
    const before = (await updates()).length;

    // The record passed the existence check, but another request soft-deleted it before this write.
    vi.spyOn(Centre, 'updateOne').mockResolvedValueOnce({ acknowledged: true, matchedCount: 0, modifiedCount: 0 });
    const res = await admin('delete', `/centres/${centre.ref}`);
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('CENTRE_NOT_FOUND');
    expect(await updates()).toHaveLength(before);
  });

  it('publishes one delete when two deletes of the same record race', async () => {
    await admin('post', '/cities').send(CITY);
    const centre = (await admin('post', '/centres').send(CENTRE)).body.data;
    const results = await Promise.all([1, 2].map(() => admin('delete', `/centres/${centre.ref}`)));
    expect(results.map((r) => r.status).sort()).toEqual([204, 404]);
    expect((await updates()).filter((e) => e.payload.action === 'deleted')).toHaveLength(1);
  });

  it('renames a city on its centres together with the event, or not at all', async () => {
    await admin('post', '/cities').send(CITY);
    const centre = (await admin('post', '/centres').send(CENTRE)).body.data;

    vi.spyOn(DomainEvent, 'create').mockRejectedValueOnce(new Error('outbox down'));
    expect((await admin('patch', '/cities/nashik').send({ name: 'Nasik' })).status).toBe(500);
    expect((await City.findOne({ slug: 'nashik' }).lean()).name).toBe('Nashik');
    expect((await Centre.findOne({ ref: centre.ref }).lean()).city).toBe('Nashik');

    expect((await admin('patch', '/cities/nashik').send({ name: 'Nasik' })).status).toBe(200);
    expect((await Centre.findOne({ ref: centre.ref }).lean()).city).toBe('Nasik');
    expect((await updates()).at(-1).payload).toEqual({ action: 'updated', fields: ['name'] });
  });
});
