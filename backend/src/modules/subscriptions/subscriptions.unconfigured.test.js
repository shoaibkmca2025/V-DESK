/**
 * Subscriptions with the real customer principal and real orders/KYC modules: customer routes fail closed until
 * customer sign-in exists, and activation is refused while orders cannot record a payment.
 * Run: npx vitest run src/modules/subscriptions/subscriptions.unconfigured.test.js
 */
import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../../app.js';
import { clearTestDb, startTestDb, stopTestDb } from '../../../test/db.js';
import { staffSession } from '../../../test/staff.js';

const app = createApp();
const REF = 'SUB-ABCDEFGHIJKL';

beforeAll(startTestDb);
afterEach(clearTestDb);
afterAll(stopTestDb);

describe('without customer sign-in', () => {
  it.each([
    ['get', '/api/v1/subscriptions/mine'],
    ['get', `/api/v1/subscriptions/${REF}`],
    ['post', `/api/v1/subscriptions/${REF}/renew`],
  ])('%s %s answers 503 CUSTOMER_AUTH_NOT_AVAILABLE', async (method, path) => {
    const res = await request(app)[method](path).send({});
    expect(res.status).toBe(503);
    expect(res.body.error.code).toBe('CUSTOMER_AUTH_NOT_AVAILABLE');
  });
});

describe('with the real orders and KYC modules', () => {
  it('cannot create a subscription from an order or KYC application that does not exist', async () => {
    const { auth } = await staffSession(app, 'OPS_ADMIN');
    const res = await request(app)
      .post('/api/v1/subscriptions')
      .set(auth)
      .send({ orderRef: 'ORD-DOESNOTEXIST1', kycRef: 'KYC-DOESNOTEXIST1', graceDays: 7 });
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('ORDER_NOT_FOUND');
  });
});
