/**
 * Catalog module — integration tests for the staff endpoints (/api/v1/catalog/admin/*).
 * Public reads are covered in catalog.test.js.
 * Run: npx vitest run src/modules/catalog/catalog.admin.test.js
 */
import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../../app.js';
import { clearTestDb, startTestDb, stopTestDb } from '../../../test/db.js';
import { ADMIN_KEY, staffSession } from '../../../test/staff.js';

const app = createApp();

const admin = (method, path) => request(app)[method](`/api/v1/catalog/admin${path}`).set('x-admin-key', ADMIN_KEY);
const pub = (path) => request(app).get(`/api/v1/catalog${path}`);

const CITY = { slug: 'nashik', name: 'Nashik', state: 'Maharashtra', tier: 'Tier-2', localities: ['College Road'] };
const CENTRE = {
  citySlug: 'nashik',
  areaName: 'College Road',
  fullName: 'V-DESK HQ — College Road',
  address: 'Landmark Trade Centre, College Road, Nashik',
  services: ['Virtual Office', 'Coworking'],
  vo_price_paise: 124900,
};
const WORKSPACE = {
  name: 'Boardroom (12 Pax)',
  type: 'Meeting Rooms',
  capacity: 12,
  price_month_paise: 2800000,
  price_hour_paise: 119900,
};

async function seedCityAndCentre() {
  await admin('post', '/cities').send(CITY);
  return (await admin('post', '/centres').send(CENTRE)).body.data;
}

beforeAll(startTestDb);
afterEach(clearTestDb);
afterAll(stopTestDb);

describe('access', () => {
  it('needs catalog:manage — ops yes, sales no', async () => {
    expect((await request(app).get('/api/v1/catalog/admin/cities')).status).toBe(401);
    const ops = await staffSession(app, 'OPS_ADMIN');
    const exec = await staffSession(app, 'SALES_EXEC');
    expect((await request(app).get('/api/v1/catalog/admin/cities').set(ops.auth)).status).toBe(200);
    expect((await request(app).post('/api/v1/catalog/admin/cities').set(exec.auth).send(CITY)).status).toBe(403);
  });
});

describe('cities', () => {
  it('creates a city that the public API then lists', async () => {
    const res = await admin('post', '/cities').send({ ...CITY, slug: ' Nashik ' });
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ ref: 'CITY-NASHIK', slug: 'nashik', active: true, tagline: '' });
    expect(res.body.data._id).toBeUndefined();
    expect((await pub('/cities/nashik')).body.data.name).toBe('Nashik');
  });

  it('rejects a taken slug and a slug that is not URL-safe', async () => {
    await admin('post', '/cities').send(CITY);
    expect((await admin('post', '/cities').send(CITY)).body.error.code).toBe('CITY_EXISTS');
    expect((await admin('post', '/cities').send({ ...CITY, slug: 'navi mumbai' })).status).toBe(400);
  });

  it('carries a rename through to centres and workspaces', async () => {
    const centre = await seedCityAndCentre();
    await admin('post', '/workspaces').send({ ...WORKSPACE, centreRef: centre.ref });

    const renamed = await admin('patch', '/cities/nashik').send({ name: 'Nasik' });
    expect(renamed.body.data.name).toBe('Nasik');
    expect((await pub(`/centres/${centre.ref}`)).body.data.city).toBe('Nasik');
    expect((await pub('/workspaces?city=nasik')).body.data).toHaveLength(1);
  });

  it('refuses to delete a city that still has centres', async () => {
    await seedCityAndCentre();
    const res = await admin('delete', '/cities/nashik');
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CITY_HAS_CENTRES');
  });

  it('can only change existing fields, and needs at least one', async () => {
    await admin('post', '/cities').send(CITY);
    expect((await admin('patch', '/cities/nashik').send({})).status).toBe(400);
    expect((await admin('patch', '/cities/atlantis').send({ name: 'X' })).body.error.code).toBe('CITY_NOT_FOUND');
  });
});

describe('centres', () => {
  it('numbers new centres after the city code and copies the city name', async () => {
    await admin('post', '/cities').send(CITY);
    const first = await admin('post', '/centres').send(CENTRE);
    const second = await admin('post', '/centres').send({ ...CENTRE, areaName: 'Gangapur Road' });
    expect(first.status).toBe(201);
    expect(first.body.data).toMatchObject({
      ref: 'CTR-NASHIK-001',
      cityRef: 'CITY-NASHIK',
      city: 'Nashik',
      status: 'available',
    });
    expect(second.body.data.ref).toBe('CTR-NASHIK-002');
  });

  it('answers 404 for an unknown city and 400 for bad prices', async () => {
    expect((await admin('post', '/centres').send(CENTRE)).body.error.code).toBe('CITY_NOT_FOUND');
    await admin('post', '/cities').send(CITY);
    const bad = await admin('post', '/centres').send({ ...CENTRE, vo_price_paise: 1249.5 });
    expect(bad.status).toBe(400);
    expect(bad.body.error.details[0].path).toBe('vo_price_paise');
  });

  it('hides an inactive centre from the public but keeps it for staff', async () => {
    const centre = await seedCityAndCentre();
    await admin('patch', `/centres/${centre.ref.toLowerCase()}`).send({ active: false });
    expect((await pub(`/centres/${centre.ref}`)).status).toBe(404);
    const staffList = await admin('get', '/centres?city=nashik');
    expect(staffList.body.data).toMatchObject([{ ref: centre.ref, active: false }]);
  });

  it('never reuses a deleted ref', async () => {
    const centre = await seedCityAndCentre();
    expect((await admin('delete', `/centres/${centre.ref}`)).status).toBe(204);
    expect((await admin('get', '/centres')).body.data).toHaveLength(0);
    const next = await admin('post', '/centres').send(CENTRE);
    expect(next.body.data.ref).toBe('CTR-NASHIK-002');
  });
});

describe('workspaces', () => {
  it('derives ref, city and locality from the centre', async () => {
    const centre = await seedCityAndCentre();
    const res = await admin('post', '/workspaces').send({ ...WORKSPACE, centreRef: centre.ref.toLowerCase() });
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({
      ref: 'WS-NASHIK-001',
      centreRef: centre.ref,
      city: 'Nashik',
      locality: 'College Road',
      reviews: 0,
      rating: null,
    });
    expect((await pub('/workspaces/WS-NASHIK-001')).body.data.price_hour_paise).toBe(119900);
  });

  it('validates type and capacity, and 404s an unknown centre', async () => {
    const centre = await seedCityAndCentre();
    expect(
      (await admin('post', '/workspaces').send({ ...WORKSPACE, centreRef: centre.ref, type: 'Rooftop' })).status,
    ).toBe(400);
    expect((await admin('post', '/workspaces').send({ ...WORKSPACE, centreRef: centre.ref, capacity: 0 })).status).toBe(
      400,
    );
    expect((await admin('post', '/workspaces').send({ ...WORKSPACE, centreRef: 'CTR-XXX-001' })).body.error.code).toBe(
      'CENTRE_NOT_FOUND',
    );
  });

  it('updates prices, then blocks deleting the centre until the workspace is gone', async () => {
    const centre = await seedCityAndCentre();
    const { ref } = (await admin('post', '/workspaces').send({ ...WORKSPACE, centreRef: centre.ref })).body.data;
    const updated = await admin('patch', `/workspaces/${ref}`).send({ price_hour_paise: 129900, status: 'limited' });
    expect(updated.body.data).toMatchObject({ price_hour_paise: 129900, status: 'limited' });

    expect((await admin('delete', `/centres/${centre.ref}`)).body.error.code).toBe('CENTRE_HAS_WORKSPACES');
    expect((await admin('delete', `/workspaces/${ref}`)).status).toBe(204);
    expect((await pub(`/workspaces/${ref}`)).status).toBe(404);
    expect((await admin('delete', `/centres/${centre.ref}`)).status).toBe(204);
    expect((await admin('delete', '/cities/nashik')).status).toBe(204);
    expect((await pub('/cities')).body.data).toHaveLength(0);
  });
});
