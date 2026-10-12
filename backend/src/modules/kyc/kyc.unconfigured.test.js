/**
 * KYC with the real customer principal: identity has no customer sign-in yet, so customer routes must fail closed
 * (503 CUSTOMER_AUTH_NOT_AVAILABLE) rather than fall back to anything weaker. Staff access is unaffected.
 * Run: npx vitest run src/modules/kyc/kyc.unconfigured.test.js
 */
import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../../app.js';
import { clearTestDb, startTestDb, stopTestDb } from '../../../test/db.js';
import { ADMIN_KEY, staffSession } from '../../../test/staff.js';
import { KycApplication } from './kyc.model.js';

const app = createApp();
const REF = 'KYC-ABCDEFGHIJKLMNOPQR';

beforeAll(startTestDb);
afterEach(clearTestDb);
afterAll(stopTestDb);

describe('without customer sign-in', () => {
  it.each([
    ['post', '/api/v1/kyc', {}],
    ['post', `/api/v1/kyc/${REF}/documents/upload-url`, { type: 'pan', contentType: 'application/pdf', sizeBytes: 9 }],
    ['post', `/api/v1/kyc/${REF}/submit`, { consent: true }],
    ['get', `/api/v1/kyc/${REF}`, undefined],
  ])('%s %s answers 503 CUSTOMER_AUTH_NOT_AVAILABLE', async (method, path, body) => {
    const res = await request(app)[method](path).send(body);
    expect(res.status).toBe(503);
    expect(res.body.error.code).toBe('CUSTOMER_AUTH_NOT_AVAILABLE');
    expect(await KycApplication.countDocuments()).toBe(0);
  });

  it('is not unlocked by sending a known application ref', async () => {
    await KycApplication.create({ ref: REF, customerId: 'CUS-1', openCustomerId: 'CUS-1' });
    const res = await request(app).get(`/api/v1/kyc/${REF}`);
    expect(res.status).toBe(503);
    expect(JSON.stringify(res.body)).not.toContain('CUS-1');
  });

  it('still lets compliance staff read applications, but never the legacy admin key', async () => {
    await KycApplication.create({ ref: REF, customerId: 'CUS-1', openCustomerId: 'CUS-1' });
    expect((await request(app).get(`/api/v1/kyc/${REF}`).set('x-admin-key', ADMIN_KEY)).status).toBe(401);
    const { auth } = await staffSession(app, 'COMPLIANCE');
    const res = await request(app).get(`/api/v1/kyc/${REF}`).set(auth);
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ ref: REF, status: 'DRAFT', customerId: 'CUS-1' });
  });
});
