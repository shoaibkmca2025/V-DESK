/**
 * Customer identity — integration tests: phone-OTP sign-in and registration, code rules (single use, expiry,
 * wrong-code limit, resend limits), the portal session (refresh, logout, profile), and the wall between a
 * customer session and a staff one.
 *
 * Codes and expiry depend on the clock, so Date is faked where time matters. Secrets come from vitest.config.js.
 * Run: npx vitest run src/modules/identity/identity.customer.test.js
 */
import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { createApp } from '../../app.js';
import { clearTestDb, startTestDb, stopTestDb } from '../../../test/db.js';
import { staffSession } from '../../../test/staff.js';
import { OTP_MAX_ATTEMPTS, OTP_MAX_SENDS_PER_WINDOW, OTP_RESEND_MS, OTP_TTL_MS } from './identity.constants.js';
import { Customer, OtpChallenge } from './identity.customer.model.js';

const app = createApp();
const MOBILE = '9876543210';

beforeAll(startTestDb);
afterEach(async () => {
  vi.useRealTimers();
  await clearTestDb();
});
afterAll(stopTestDb);

// ── Helpers ───────────────────────────────────

const requestCode = (mobile = MOBILE) => request(app).post('/api/v1/auth/otp/request').send({ mobile });
const verify = (body) => request(app).post('/api/v1/auth/otp/verify').send(body);
const bearer = (token) => ({ Authorization: `Bearer ${token}` });
const cookieOf = (res) => res.headers['set-cookie']?.find((c) => c.startsWith('vd_crt='));
const cookiePair = (res) => cookieOf(res)?.split(';')[0];

/** Asks for a code and returns the one the API would have texted. */
async function codeFor(mobile = MOBILE) {
  const res = await requestCode(mobile);
  expect(res.status).toBe(200);
  return res.body.data.devCode;
}

/** Full sign-in: code → session. */
async function signIn({ mobile = MOBILE, name = 'Priya Kulkarni', ...rest } = {}) {
  const code = await codeFor(mobile);
  const res = await verify({ mobile, code, name, ...rest });
  expect(res.status).toBe(200);
  return res;
}

/** Lets a number ask for another code without waiting out the resend gap. */
const allowResend = (mobile = MOBILE) =>
  OtpChallenge.updateOne({ mobile }, { $set: { lastSentAt: new Date(Date.now() - OTP_RESEND_MS - 1000) } });

// ── Registration & sign-in ────────────────────

describe('POST /api/v1/auth/otp/request', () => {
  it('says a number is new, and says it is not once the account exists', async () => {
    const first = await requestCode();
    expect(first.status).toBe(200);
    expect(first.body.data).toMatchObject({ isNewAccount: true, name: null, delivery: 'not-configured' });
    expect(first.body.data.devCode).toMatch(/^\d{6}$/);

    await verify({ mobile: MOBILE, code: first.body.data.devCode, name: 'Priya Kulkarni' });
    await allowResend();
    const second = await requestCode();
    expect(second.body.data).toMatchObject({ isNewAccount: false, name: 'Priya Kulkarni' });
  });

  it('stores the code only as a hash, never in the clear', async () => {
    const code = await codeFor();
    const stored = await OtpChallenge.findOne({ mobile: MOBILE }).lean();
    expect(stored.codeHash).toMatch(/^[0-9a-f]{64}$/);
    expect(JSON.stringify(stored)).not.toContain(code);
  });

  it('refuses a resend straight away, and caps the sends per number', async () => {
    await requestCode();
    const tooSoon = await requestCode();
    expect(tooSoon.status).toBe(429);
    expect(tooSoon.body.error).toMatchObject({
      code: 'OTP_RESEND_TOO_SOON',
      details: { retryAfterSeconds: expect.any(Number) },
    });

    for (let sent = 1; sent < OTP_MAX_SENDS_PER_WINDOW; sent += 1) {
      await allowResend();
      expect((await requestCode()).status).toBe(200);
    }
    await allowResend();
    const capped = await requestCode();
    expect(capped.status).toBe(429);
    expect(capped.body.error.code).toBe('OTP_SEND_LIMIT');
  });

  it('rejects anything that is not an Indian mobile number', async () => {
    for (const mobile of ['12345', '1234567890', '98765 4321', '', 'nine'])
      expect((await requestCode(mobile)).status).toBe(400);
  });
});

describe('POST /api/v1/auth/otp/verify', () => {
  it('creates the account on the first verified code and hands back a session', async () => {
    const res = await signIn({ company: 'Zenith D2C', email: 'priya@zenith.in' });
    expect(res.body.data).toMatchObject({
      tokenType: 'Bearer',
      expiresIn: expect.any(Number),
      customer: {
        name: 'Priya Kulkarni',
        mobile: MOBILE,
        email: 'priya@zenith.in',
        company: 'Zenith D2C',
        status: 'active',
      },
    });
    expect(res.body.data.customer.ref).toMatch(/^CUS-[A-Z0-9]+$/);
    expect(cookieOf(res)).toContain('HttpOnly');
    expect(cookieOf(res)).toContain('SameSite=Strict');
    expect(cookieOf(res)).toContain('Path=/api/v1/auth/customer');
    // A customer account is not a staff user: no role, no permissions, no password.
    for (const field of ['role', 'permissions', 'passwordHash', 'mfaEnabled']) {
      expect(res.body.data.customer[field]).toBeUndefined();
    }
  });

  it('needs a name the first time, and only the first time', async () => {
    const code = await codeFor();
    const nameless = await verify({ mobile: MOBILE, code });
    expect(nameless.status).toBe(400);
    expect(nameless.body.error.code).toBe('NAME_REQUIRED');

    // The code survives a request that failed for a reason other than the code itself.
    expect((await verify({ mobile: MOBILE, code, name: 'Priya Kulkarni' })).status).toBe(200);
    await allowResend();
    const again = await verify({ mobile: MOBILE, code: await codeFor() });
    expect(again.status).toBe(200);
    expect(again.body.data.customer.name).toBe('Priya Kulkarni');
    expect(await Customer.countDocuments()).toBe(1);
  });

  it('treats a number with and without +91 and spaces as one account', async () => {
    await signIn();
    await allowResend();
    const code = await codeFor('+91 98765 43210');
    const res = await verify({ mobile: '+91 98765-43210', code });
    expect(res.status).toBe(200);
    expect(res.body.data.customer.mobile).toBe(MOBILE);
    expect(await Customer.countDocuments()).toBe(1);
  });

  it('fills in details the account is missing but never overwrites what is there', async () => {
    await signIn({ email: 'priya@zenith.in' });
    await allowResend();
    await signIn({ name: 'Someone Else', email: 'other@elsewhere.in', company: 'Zenith D2C' });

    const stored = await Customer.findOne({ mobile: MOBILE }).lean();
    expect(stored).toMatchObject({ name: 'Priya Kulkarni', email: 'priya@zenith.in', company: 'Zenith D2C' });
    expect(stored.lastLoginAt).toBeInstanceOf(Date);
  });

  it('refuses a wrong code, counts the attempts, and ends the challenge after too many', async () => {
    await codeFor();
    const wrong = await verify({ mobile: MOBILE, code: '000000', name: 'Priya Kulkarni' });
    expect(wrong.status).toBe(401);
    expect(wrong.body.error).toMatchObject({
      code: 'OTP_INVALID',
      details: { attemptsLeft: OTP_MAX_ATTEMPTS - 1 },
    });

    for (let attempt = 2; attempt <= OTP_MAX_ATTEMPTS; attempt += 1) {
      expect((await verify({ mobile: MOBILE, code: '000000', name: 'A' })).status).toBe(401);
    }
    const locked = await verify({ mobile: MOBILE, code: '000000', name: 'A' });
    expect(locked.status).toBe(429);
    expect(locked.body.error.code).toBe('OTP_ATTEMPTS_EXCEEDED');
    expect(await Customer.countDocuments()).toBe(0);
  });

  it('spends a code: the same one cannot sign in twice', async () => {
    const code = await codeFor();
    expect((await verify({ mobile: MOBILE, code, name: 'Priya Kulkarni' })).status).toBe(200);
    const replay = await verify({ mobile: MOBILE, code, name: 'Priya Kulkarni' });
    expect(replay.status).toBe(401);
    expect(replay.body.error.code).toBe('OTP_EXPIRED');
  });

  it('refuses a code that has expired, and one that was never asked for', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    const code = await codeFor();
    vi.advanceTimersByTime(OTP_TTL_MS + 1000);
    const late = await verify({ mobile: MOBILE, code, name: 'Priya Kulkarni' });
    expect(late.status).toBe(401);
    expect(late.body.error.code).toBe('OTP_EXPIRED');

    const never = await verify({ mobile: '9123456780', code: '123456', name: 'Nobody' });
    expect(never.status).toBe(401);
    expect(never.body.error.code).toBe('OTP_NOT_REQUESTED');
  });

  it('keeps a closed account out, at both steps', async () => {
    await signIn();
    await Customer.updateOne({ mobile: MOBILE }, { $set: { status: 'disabled' } });
    await allowResend();
    const blocked = await requestCode();
    expect(blocked.status).toBe(403);
    expect(blocked.body.error.code).toBe('ACCOUNT_DISABLED');
  });
});

// ── Session & profile ─────────────────────────

describe('customer session', () => {
  it('reads and updates its own profile', async () => {
    const { body } = await signIn();
    const token = body.data.accessToken;

    const me = await request(app).get('/api/v1/auth/customer/me').set(bearer(token));
    expect(me.status).toBe(200);
    expect(me.body.data).toMatchObject({ ref: body.data.customer.ref, mobile: MOBILE });

    const updated = await request(app)
      .patch('/api/v1/auth/customer/me')
      .set(bearer(token))
      .send({ company: 'Zenith Labs LLP', email: 'accounts@zenith.in' });
    expect(updated.status).toBe(200);
    expect(updated.body.data).toMatchObject({ company: 'Zenith Labs LLP', email: 'accounts@zenith.in' });
    // The mobile number is the account, so it is not editable here.
    expect(
      (await request(app).patch('/api/v1/auth/customer/me').set(bearer(token)).send({ mobile: '9123456780' })).status,
    ).toBe(400);
    expect((await Customer.findOne({ mobile: MOBILE }).lean()).mobile).toBe(MOBILE);
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

    await Customer.updateOne({ mobile: MOBILE }, { $set: { status: 'disabled' } });
    const closed = await request(app).get('/api/v1/auth/customer/me').set(bearer(token));
    expect(closed.status).toBe(401);
    expect(closed.body.error.code).toBe('TOKEN_INVALID');
  });
});
