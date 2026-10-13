/**
 * Enterprise with the real customer principal: customer routes fail closed until customer sign-in exists; staff
 * routes keep working and refuse the legacy admin key.
 * Run: npx vitest run src/modules/enterprise/enterprise.unconfigured.test.js
 */
import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../../app.js';
import { clearTestDb, startTestDb, stopTestDb } from '../../../test/db.js';
import { ADMIN_KEY, staffSession } from '../../../test/staff.js';

const app = createApp();
const ORG = 'ORG-ABCDEFGHIJ';

beforeAll(startTestDb);
afterEach(clearTestDb);
afterAll(stopTestDb);

describe('without customer sign-in', () => {
  it.each([
    ['get', '/api/v1/enterprise/me/organisations'],
    ['get', `/api/v1/enterprise/organisations/${ORG}`],
    ['get', `/api/v1/enterprise/organisations/${ORG}/bookings`],
    ['post', `/api/v1/enterprise/organisations/${ORG}/members`],
  ])('%s %s answers 503 CUSTOMER_AUTH_NOT_AVAILABLE', async (method, path) => {
    const res = await request(app)[method](path).send({});
    expect(res.status).toBe(503);
    expect(res.body.error.code).toBe('CUSTOMER_AUTH_NOT_AVAILABLE');
  });

  it('keeps staff routes working and refuses the legacy admin key', async () => {
    const { auth } = await staffSession(app, 'OPS_ADMIN');
    const created = await request(app).post('/api/v1/enterprise/organisations').set(auth).send({ name: 'Acme Ltd' });
    expect(created.status).toBe(201);
    const legacy = await request(app)
      .get(`/api/v1/enterprise/organisations/${created.body.data.ref}`)
      .set('x-admin-key', ADMIN_KEY);
    expect(legacy.status).toBe(401);
  });
});
