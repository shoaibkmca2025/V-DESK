/**
 * Customer identity — integration tests: "Continue with Google" sign-in and registration (ADR-012), every
 * refusal of a bad ID token, the portal session (refresh, logout, profile), and the wall between a customer
 * session and a staff one.
 *
 * The ID tokens are real RS256 JWTs signed with a test key the API is told to trust (test/google.js), so the
 * same verification that runs in production runs here. Secrets come from vitest.config.js.
 * Run: npx vitest run src/modules/identity/identity.customer.test.js
 */
import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { createApp } from '../../app.js';
import * as google from '../../integrations/google.js';
import { clearTestDb, count, query, row, startTestDb, stopTestDb } from '../../../test/db.js';
import { googleIdToken, strangerKey } from '../../../test/google.js';
import { staffSession } from '../../../test/staff.js';

const app = createApp();
const SUB = '100000000000000000001';

beforeAll(startTestDb);
afterEach(async () => {
  vi.restoreAllMocks();
  await clearTestDb();
});
afterAll(stopTestDb);

// ── Helpers ───────────────────────────────────

const googleSignIn = async (claims) =>
  request(app)
    .post('/api/v1/auth/google')
    .send({ credential: await googleIdToken(claims) });
const bearer = (token) => ({ Authorization: `Bearer ${token}` });
const cookieOf = (res) => res.headers['set-cookie']?.find((c) => c.startsWith('vd_crt='));
const cookiePair = (res) => cookieOf(res)?.split(';')[0];

async function signIn(claims) {
  const res = await googleSignIn(claims);
  expect(res.status).toBe(200);
  return res;
}

// ── Registration & sign-in ────────────────────

describe('POST /api/v1/auth/google', () => {
  it('creates the account on the first sign-in and hands back a session', async () => {
    const res = await signIn({ email: 'Priya@Example.com', name: 'Priya Kulkarni' });
    expect(res.body.data).toMatchObject({
      tokenType: 'Bearer',
      expiresIn: 3600,
      customer: { name: 'Priya Kulkarni', email: 'priya@example.com', mobile: '', company: '', status: 'active' },
    });
    expect(res.body.data.customer.ref).toMatch(/^CUS-[A-Z0-9]+$/);
    expect(res.body.data.refreshToken).toBeUndefined();
    expect(cookieOf(res)).toContain('HttpOnly');
    expect(cookieOf(res)).toContain('SameSite=Strict');
    expect(cookieOf(res)).toContain('Path=/api/v1/auth/customer');

    // Google's account id is the key, and it never leaves the API.
    const stored = await row('SELECT google_sub AS "googleSub", mobile FROM customers');
    expect(stored).toEqual({ googleSub: SUB, mobile: null });
    expect(JSON.stringify(res.body)).not.toContain(SUB);
  });

  it('signs the same Google account in to the same customer, keeping details they changed', async () => {
    const first = await signIn();
    const token = first.body.data.accessToken;
    await request(app).patch('/api/v1/auth/customer/me').set(bearer(token)).send({ email: 'accounts@zenith.in' });

    // A new email at Google does not overwrite the one the customer chose here.
    const again = await signIn({ email: 'priya.k@example.com' });
    expect(again.body.data.customer).toMatchObject({ ref: first.body.data.customer.ref, email: 'accounts@zenith.in' });
    expect(await count('customers')).toBe(1);

    const other = await signIn({ sub: '100000000000000000002', email: 'arjun@example.com', name: 'Arjun' });
    expect(other.body.data.customer.ref).not.toBe(first.body.data.customer.ref);
    expect(await count('customers')).toBe(2);
  });

  it('uses the start of the email as the name when Google sends none', async () => {
    const res = await signIn({ name: '', email: 'asha.p@example.com' });
    expect(res.body.data.customer.name).toBe('asha.p');
  });

  it('creates one account when two first sign-ins race', async () => {
    const [a, b] = await Promise.all([googleSignIn(), googleSignIn()]);
    expect([a.status, b.status]).toEqual([200, 200]);
    expect(a.body.data.customer.ref).toBe(b.body.data.customer.ref);
    expect(await count('customers')).toBe(1);
  });

  it('refuses tokens that are not a valid Google ID token for this site', async () => {
    const refusals = [
      { claims: { audience: 'someone-else.apps.googleusercontent.com' }, code: 'GOOGLE_TOKEN_INVALID' },
      { claims: { issuer: 'https://evil.example.com' }, code: 'GOOGLE_TOKEN_INVALID' },
      { claims: { expiresIn: '-1m' }, code: 'GOOGLE_TOKEN_INVALID' },
      { claims: { key: await strangerKey() }, code: 'GOOGLE_TOKEN_INVALID' },
      { claims: { emailVerified: false }, code: 'GOOGLE_EMAIL_UNVERIFIED' },
    ];
    for (const { claims, code } of refusals) {
      const res = await googleSignIn(claims);
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe(code);
    }

    const garbage = await request(app).post('/api/v1/auth/google').send({ credential: 'not.a.jwt' });
    expect(garbage.body.error.code).toBe('GOOGLE_TOKEN_INVALID');
    expect((await request(app).post('/api/v1/auth/google').send({})).status).toBe(400);
    expect(
      (
        await request(app)
          .post('/api/v1/auth/google')
          .send({ credential: 'x'.repeat(5000) })
      ).status,
    ).toBe(400);
    expect(await count('customers')).toBe(0);
  });

  it('answers 503 when Google cannot be reached, rather than letting anyone in', async () => {
    vi.spyOn(google, 'verifyIdToken').mockRejectedValueOnce(new Error('fetch failed'));
    const res = await googleSignIn();
    expect(res.status).toBe(503);
    expect(res.body.error.code).toBe('GOOGLE_UNAVAILABLE');
  });

  it('keeps a closed account out', async () => {
    await signIn();
    await query(`UPDATE customers SET status = 'disabled' WHERE google_sub = $1`, [SUB]);
    const blocked = await googleSignIn();
    expect(blocked.status).toBe(403);
    expect(blocked.body.error.code).toBe('ACCOUNT_DISABLED');
  });

  it('is gone: phone-code sign-in', async () => {
    expect((await request(app).post('/api/v1/auth/otp/request').send({ mobile: '9876543210' })).status).toBe(404);
  });
});

// ── Session & profile ─────────────────────────

describe('customer session', () => {
  it('reads and updates its own profile, mobile included', async () => {
    const { body } = await signIn();
    const token = body.data.accessToken;

    const me = await request(app).get('/api/v1/auth/customer/me').set(bearer(token));
    expect(me.status).toBe(200);
    expect(me.body.data).toMatchObject({ ref: body.data.customer.ref, email: 'priya@example.com' });

    const updated = await request(app)
      .patch('/api/v1/auth/customer/me')
      .set(bearer(token))
      .send({ company: 'Zenith Labs LLP', mobile: '+91 98765 43210' });
    expect(updated.status).toBe(200);
    expect(updated.body.data).toMatchObject({ company: 'Zenith Labs LLP', mobile: '9876543210' });

    for (const bad of [{}, { mobile: '12345' }, { email: 'nope' }, { name: 'x'.repeat(121) }]) {
      expect((await request(app).patch('/api/v1/auth/customer/me').set(bearer(token)).send(bad)).status).toBe(400);
    }
  });

  it('rotates the refresh cookie and stops working after signing out', async () => {
    const signedIn = await signIn();
    const first = await request(app).post('/api/v1/auth/customer/refresh').set('Cookie', cookiePair(signedIn));
    expect(first.status).toBe(200);
    expect(first.body.data.accessToken).toEqual(expect.any(String));
    expect(cookiePair(first)).not.toBe(cookiePair(signedIn));

    // The rotated cookie is dead; the new one works until it is signed out.
    expect((await request(app).post('/api/v1/auth/customer/logout').set('Cookie', cookiePair(first))).status).toBe(204);
    const after = await request(app).post('/api/v1/auth/customer/refresh').set('Cookie', cookiePair(first));
    expect(after.status).toBe(401);
    expect(after.body.error.code).toBe('REFRESH_INVALID');
    expect((await request(app).post('/api/v1/auth/customer/logout')).status).toBe(204);
  });

  it('is refused without a token, and a staff token is not a customer session', async () => {
    const staff = await staffSession(app, 'OPS_ADMIN');
    const anonymous = await request(app).get('/api/v1/auth/customer/me');
    expect(anonymous.status).toBe(401);
    expect(anonymous.body.error.code).toBe('AUTH_REQUIRED');

    const asStaff = await request(app).get('/api/v1/auth/customer/me').set(staff.auth);
    expect(asStaff.status).toBe(401);
    expect(asStaff.body.error.code).toBe('TOKEN_INVALID');
  });

  it('cannot open a staff route, and is refused once the account is closed', async () => {
    const { body } = await signIn();
    const token = body.data.accessToken;
    for (const res of [
      await request(app).get('/api/v1/auth/me').set(bearer(token)),
      await request(app).get('/api/v1/leads').set(bearer(token)),
      await request(app).get('/api/v1/auth/users').set(bearer(token)),
    ]) {
      expect(res.status).toBe(401);
    }

    await query(`UPDATE customers SET status = 'disabled' WHERE google_sub = $1`, [SUB]);
    const closed = await request(app).get('/api/v1/auth/customer/me').set(bearer(token));
    expect(closed.status).toBe(401);
    expect(closed.body.error.code).toBe('TOKEN_INVALID');
  });
});
