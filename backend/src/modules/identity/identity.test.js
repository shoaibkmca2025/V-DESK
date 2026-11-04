/**
 * Identity module — integration tests: staff users, sign-in with MFA, sessions, and RBAC on other modules.
 *
 * TOTP codes depend on the clock and each 30-second step is accepted once per user, so Date is faked and
 * moved forward 30 s before every test. JWT/MFA secrets and ADMIN_API_KEY come from vitest.config.js.
 * Run: npx vitest run src/modules/identity/identity.test.js
 */
import request from 'supertest';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../../app.js';
import { clearTestDb, startTestDb, stopTestDb } from '../../../test/db.js';
import { hotp, totpStep } from './identity.totp.js';

const app = createApp();
const ADMIN_KEY = 'test-admin-key-0123456789';
const PASSWORD = 'correct horse battery 42';
// Three groups of four from the unambiguous alphabet (no 0/O, 1/I/L).
const SETUP_CODE_PATTERN = /^[A-HJKMNP-Z2-9]{4}-[A-HJKMNP-Z2-9]{4}-[A-HJKMNP-Z2-9]{4}$/;

let clock = Date.parse('2026-10-08T10:00:00Z');
function advance(seconds) {
  clock += seconds * 1000;
  vi.setSystemTime(clock);
}

beforeAll(startTestDb);
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  advance(30);
});
afterEach(async () => {
  vi.useRealTimers();
  await clearTestDb();
});
afterAll(stopTestDb);

// ── Helpers ───────────────────────────────────

/** Creates a staff account; the response carries the one-time setup code, still unused. */
const createStaffRaw = (body) =>
  request(app)
    .post('/api/v1/auth/users')
    .set('x-admin-key', ADMIN_KEY)
    .send({ name: 'Test User', ...body });

/** Signs in with a setup code and chooses `newPassword`, as a new staff member does. Returns the setup response. */
async function setPasswordWithCode(email, setupCode, newPassword = PASSWORD) {
  const login = await request(app).post('/api/v1/auth/login').send({ email, password: setupCode });
  return request(app)
    .post('/api/v1/auth/password/setup')
    .send({ setupToken: login.body.data?.setupToken, newPassword });
}

/** Creates a staff account and has them set PASSWORD with the setup code, so tests can sign in with it. */
async function createStaff(body) {
  const created = await createStaffRaw(body);
  if (created.status === 201) await setPasswordWithCode(created.body.data.email, created.body.data.setupCode);
  return created;
}

const login = (email, password) => request(app).post('/api/v1/auth/login').send({ email, password });
const issueSetupCode = (ref, auth = { 'x-admin-key': ADMIN_KEY }) =>
  request(app).patch(`/api/v1/auth/users/${ref}`).set(auth).send({ issueSetupCode: true });
const bearer = (token) => ({ Authorization: `Bearer ${token}` });
const refreshCookieOf = (res) => res.headers['set-cookie']?.find((c) => c.startsWith('vd_rt='));
const cookiePair = (res) => refreshCookieOf(res)?.split(';')[0];

/** Full sign-in: password → (enrol on first sign-in) → TOTP code. */
async function signIn(email, { password = PASSWORD, secret } = {}) {
  const login = await request(app).post('/api/v1/auth/login').send({ email, password });
  expect(login.status).toBe(200);
  const { mfaToken } = login.body.data;
  if (!secret) {
    const enroll = await request(app).post('/api/v1/auth/mfa/enroll').send({ mfaToken });
    expect(enroll.status).toBe(200);
    secret = enroll.body.data.secret;
  }
  const verify = await request(app)
    .post('/api/v1/auth/mfa/verify')
    .send({ mfaToken, code: hotp(secret, totpStep()) });
  expect(verify.status).toBe(200);
  return { accessToken: verify.body.data.accessToken, cookie: cookiePair(verify), secret, res: verify };
}

async function staffWithSession(role, email = `${role.toLowerCase()}@vdesk.in`) {
  const created = await createStaff({ email, role });
  expect(created.status).toBe(201);
  return { ref: created.body.data.ref, email, ...(await signIn(email)) };
}

// ── Staff users ───────────────────────────────

describe('staff users', () => {
  it('creates a user with a one-time setup code and without exposing secrets', async () => {
    // A password in the body is ignored: admins never choose (or learn) a staff member's password.
    const res = await createStaffRaw({ email: '  Ops@VDESK.in ', role: 'OPS_ADMIN', password: PASSWORD });
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({
      email: 'ops@vdesk.in',
      role: 'OPS_ADMIN',
      status: 'active',
      mfaEnabled: false,
      passwordSet: false,
      setupCodeExpiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
      permissions: expect.arrayContaining(['leads:read', 'search:manage']),
    });
    expect(res.body.data.ref).toMatch(/^USR-[A-Z0-9]+$/);
    expect(res.body.data.setupCode).toMatch(SETUP_CODE_PATTERN);
    for (const field of ['passwordHash', 'setupCodeHash', 'mfa', 'failedAttempts', '_id']) {
      expect(res.body.data[field]).toBeUndefined();
    }
    expect(
      (await request(app).post('/api/v1/auth/login').send({ email: 'ops@vdesk.in', password: PASSWORD })).status,
    ).toBe(401);

    // The code is shown once: reading the user back never returns it.
    const read = await request(app).get(`/api/v1/auth/users/${res.body.data.ref}`).set('x-admin-key', ADMIN_KEY);
    expect(read.body.data.setupCode).toBeUndefined();
    expect(read.body.data.passwordSet).toBe(false);
  });

  it('rejects a duplicate email and an unknown role', async () => {
    await createStaff({ email: 'a@vdesk.in', role: 'FINANCE' });
    expect((await createStaff({ email: 'A@vdesk.in', role: 'FINANCE' })).body.error.code).toBe('EMAIL_TAKEN');
    expect((await createStaff({ email: 'c@vdesk.in', role: 'CUSTOMER' })).status).toBe(400);
  });

  it('needs staff credentials', async () => {
    const res = await request(app).get('/api/v1/auth/users');
    expect(res.status).toBe(401);
  });
});

// ── Setup codes (ADR-012) ─────────────────────

describe('setup codes', () => {
  it('signs in once with the code, then only with the password the user chose', async () => {
    const created = await createStaffRaw({ email: 'new@vdesk.in', role: 'FINANCE' });
    const { setupCode, ref } = created.body.data;

    // Typed in lower case and without dashes, the code still works.
    const withCode = await login('new@vdesk.in', setupCode.toLowerCase().replaceAll('-', ''));
    expect(withCode.status).toBe(200);
    expect(withCode.body.data).toMatchObject({ passwordSetupRequired: true, expiresIn: 900 });
    expect(withCode.body.data.mfaToken).toBeUndefined();
    const { setupToken } = withCode.body.data;

    // A setup token is not an MFA or access token.
    expect((await request(app).post('/api/v1/auth/mfa/enroll').send({ mfaToken: setupToken })).status).toBe(401);
    expect((await request(app).get('/api/v1/auth/me').set(bearer(setupToken))).body.error.code).toBe('TOKEN_INVALID');

    const setup = (newPassword) => request(app).post('/api/v1/auth/password/setup').send({ setupToken, newPassword });
    for (const weak of ['short 1', 'only letters here', '1234567890123']) expect((await setup(weak)).status).toBe(400);

    const done = await setup(PASSWORD);
    expect(done.status).toBe(200);
    expect(done.body.data).toMatchObject({ mfaEnrollmentRequired: true, expiresIn: 300 });
    expect(done.body.data.mfaToken).toBeTruthy();

    // Single use: neither the setup token nor the code works again.
    expect((await setup('a different password 9')).body.error.code).toBe('SETUP_TOKEN_INVALID');
    expect((await login('new@vdesk.in', setupCode)).body.error.code).toBe('INVALID_CREDENTIALS');

    await signIn('new@vdesk.in');
    const read = await request(app).get(`/api/v1/auth/users/${ref}`).set('x-admin-key', ADMIN_KEY);
    expect(read.body.data).toMatchObject({ passwordSet: true, setupCodeExpiresAt: null, mfaEnabled: true });
  });

  it('expires an unused code after 72 hours', async () => {
    const created = await createStaffRaw({ email: 'new@vdesk.in', role: 'FINANCE' });
    advance(72 * 60 * 60);
    const res = await login('new@vdesk.in', created.body.data.setupCode);
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('SETUP_CODE_EXPIRED');

    const fresh = await issueSetupCode(created.body.data.ref);
    expect((await setPasswordWithCode('new@vdesk.in', fresh.body.data.setupCode)).status).toBe(200);
  });

  it('a new code cancels the old code and any setup already in progress', async () => {
    const created = await createStaffRaw({ email: 'new@vdesk.in', role: 'FINANCE' });
    const oldCode = created.body.data.setupCode;
    const { setupToken } = (await login('new@vdesk.in', oldCode)).body.data;

    const fresh = await issueSetupCode(created.body.data.ref);
    expect(fresh.status).toBe(200);
    expect(fresh.body.data.setupCode).toMatch(SETUP_CODE_PATTERN);
    expect(fresh.body.data.setupCode).not.toBe(oldCode);

    const stale = await request(app).post('/api/v1/auth/password/setup').send({ setupToken, newPassword: PASSWORD });
    expect(stale.body.error.code).toBe('SETUP_TOKEN_INVALID');
    expect((await login('new@vdesk.in', oldCode)).status).toBe(401);
    expect((await setPasswordWithCode('new@vdesk.in', fresh.body.data.setupCode)).status).toBe(200);
  });

  it('rejects forged setup tokens', async () => {
    const res = await request(app)
      .post('/api/v1/auth/password/setup')
      .send({ setupToken: 'not.a.jwt', newPassword: PASSWORD });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('SETUP_TOKEN_INVALID');
  });

  it('counts wrong codes towards the lockout', async () => {
    const created = await createStaffRaw({ email: 'new@vdesk.in', role: 'FINANCE' });
    for (let i = 0; i < 5; i++) await login('new@vdesk.in', 'AAAA-BBBB-CCCC');
    const locked = await login('new@vdesk.in', created.body.data.setupCode);
    expect(locked.status).toBe(429);
    expect(locked.body.error.code).toBe('ACCOUNT_LOCKED');
  });

  it('resets a forgotten password: old password and sessions stop, MFA stays', async () => {
    const staff = await staffWithSession('FINANCE', 'fin@vdesk.in');
    const reset = await issueSetupCode(staff.ref);
    expect(reset.body.data).toMatchObject({ passwordSet: false, setupCode: expect.stringMatching(SETUP_CODE_PATTERN) });

    expect((await login('fin@vdesk.in', PASSWORD)).status).toBe(401);
    expect((await request(app).post('/api/v1/auth/refresh').set('Cookie', staff.cookie)).status).toBe(401);
    // An access token still within its 15 minutes cannot change a password that no longer exists.
    const change = await request(app)
      .post('/api/v1/auth/password')
      .set(bearer(staff.accessToken))
      .send({ currentPassword: PASSWORD, newPassword: 'another long password 7' });
    expect(change.body.error.code).toBe('PASSWORD_NOT_SET');

    const setup = await setPasswordWithCode('fin@vdesk.in', reset.body.data.setupCode, 'a brand new password 8');
    expect(setup.body.data).toMatchObject({ mfaRequired: true });
    advance(30);
    await signIn('fin@vdesk.in', { password: 'a brand new password 8', secret: staff.secret });
  });

  it('does not let a super admin reset their own password this way', async () => {
    const admin = await staffWithSession('SUPER_ADMIN');
    const res = await issueSetupCode(admin.ref, bearer(admin.accessToken));
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CANNOT_CHANGE_OWN_ACCESS');
  });
});

// ── Sign-in ───────────────────────────────────

describe('sign-in', () => {
  it('walks a new user through MFA enrolment and sets the refresh cookie', async () => {
    await createStaff({ email: 'exec@vdesk.in', role: 'SALES_EXEC' });
    const login = await request(app).post('/api/v1/auth/login').send({ email: 'exec@vdesk.in', password: PASSWORD });
    expect(login.body.data).toMatchObject({ mfaEnrollmentRequired: true, expiresIn: 300 });
    expect(login.body.data.accessToken).toBeUndefined();

    const enroll = await request(app).post('/api/v1/auth/mfa/enroll').send({ mfaToken: login.body.data.mfaToken });
    expect(enroll.body.data.secret).toMatch(/^[A-Z2-7]{32}$/);
    expect(enroll.body.data.otpauthUrl).toMatch(/^otpauth:\/\/totp\/V-DESK/);

    const verify = await request(app)
      .post('/api/v1/auth/mfa/verify')
      .send({ mfaToken: login.body.data.mfaToken, code: hotp(enroll.body.data.secret, totpStep()) });
    expect(verify.status).toBe(200);
    expect(verify.body.data).toMatchObject({ tokenType: 'Bearer', expiresIn: 900, user: { mfaEnabled: true } });
    expect(verify.body.data.refreshToken).toBeUndefined();
    const cookie = refreshCookieOf(verify);
    expect(cookie).toMatch(/HttpOnly/);
    expect(cookie).toMatch(/SameSite=Strict/);
    expect(cookie).toMatch(/Path=\/api\/v1\/auth/);
  });

  it('asks enrolled users for a code and refuses to enrol them again', async () => {
    await createStaff({ email: 'fin@vdesk.in', role: 'FINANCE' });
    await signIn('fin@vdesk.in');
    const login = await request(app).post('/api/v1/auth/login').send({ email: 'fin@vdesk.in', password: PASSWORD });
    expect(login.body.data).toMatchObject({ mfaRequired: true });
    const enroll = await request(app).post('/api/v1/auth/mfa/enroll').send({ mfaToken: login.body.data.mfaToken });
    expect(enroll.status).toBe(409);
    expect(enroll.body.error.code).toBe('MFA_ALREADY_ENABLED');
  });

  it('accepts each code only once', async () => {
    await createStaff({ email: 'fin@vdesk.in', role: 'FINANCE' });
    const { secret } = await signIn('fin@vdesk.in');
    const login = await request(app).post('/api/v1/auth/login').send({ email: 'fin@vdesk.in', password: PASSWORD });
    const replay = await request(app)
      .post('/api/v1/auth/mfa/verify')
      .send({ mfaToken: login.body.data.mfaToken, code: hotp(secret, totpStep()) });
    expect(replay.status).toBe(401);
    expect(replay.body.error.code).toBe('MFA_CODE_INVALID');
    advance(30);
    await signIn('fin@vdesk.in', { secret });
  });

  it('gives the same answer for a wrong password and an unknown email', async () => {
    await createStaff({ email: 'fin@vdesk.in', role: 'FINANCE' });
    const wrong = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'fin@vdesk.in', password: 'not it at all' });
    const unknown = await request(app).post('/api/v1/auth/login').send({ email: 'who@vdesk.in', password: PASSWORD });
    expect(wrong.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect(wrong.body.error.code).toBe('INVALID_CREDENTIALS');
    expect(unknown.body.error.message).toBe(wrong.body.error.message);
  });

  it('rejects a forged MFA token and a wrong code', async () => {
    const forged = await request(app).post('/api/v1/auth/mfa/verify').send({ mfaToken: 'not.a.jwt', code: '123456' });
    expect(forged.body.error.code).toBe('MFA_TOKEN_INVALID');

    await createStaff({ email: 'fin@vdesk.in', role: 'FINANCE' });
    const { secret } = await signIn('fin@vdesk.in');
    advance(30);
    const login = await request(app).post('/api/v1/auth/login').send({ email: 'fin@vdesk.in', password: PASSWORD });
    const wrongCode = String((Number(hotp(secret, totpStep())) + 1) % 1_000_000).padStart(6, '0');
    const res = await request(app)
      .post('/api/v1/auth/mfa/verify')
      .send({ mfaToken: login.body.data.mfaToken, code: wrongCode });
    expect(res.body.error.code).toBe('MFA_CODE_INVALID');
  });

  it('locks the account after 5 failures until an admin unlocks it', async () => {
    const { body } = await createStaff({ email: 'fin@vdesk.in', role: 'FINANCE' });
    for (let i = 0; i < 5; i++) {
      await request(app).post('/api/v1/auth/login').send({ email: 'fin@vdesk.in', password: 'wrong password!' });
    }
    const locked = await request(app).post('/api/v1/auth/login').send({ email: 'fin@vdesk.in', password: PASSWORD });
    expect(locked.status).toBe(429);
    expect(locked.body.error).toMatchObject({ code: 'ACCOUNT_LOCKED', details: { retryAfterSeconds: 900 } });

    const unlock = await request(app)
      .patch(`/api/v1/auth/users/${body.data.ref}`)
      .set('x-admin-key', ADMIN_KEY)
      .send({ unlock: true });
    expect(unlock.body.data.lockedUntil).toBeNull();
    await signIn('fin@vdesk.in');
  });

  it('unlocks by itself after 15 minutes', async () => {
    await createStaff({ email: 'fin@vdesk.in', role: 'FINANCE' });
    for (let i = 0; i < 5; i++) {
      await request(app).post('/api/v1/auth/login').send({ email: 'fin@vdesk.in', password: 'wrong password!' });
    }
    advance(15 * 60);
    await signIn('fin@vdesk.in');
  });
});

// ── Sessions ──────────────────────────────────

describe('sessions', () => {
  it('GET /me needs a valid access token', async () => {
    const { accessToken, email } = await staffWithSession('SALES_EXEC');
    const me = await request(app).get('/api/v1/auth/me').set(bearer(accessToken));
    expect(me.status).toBe(200);
    expect(me.body.data).toMatchObject({
      email,
      role: 'SALES_EXEC',
      permissions: ['leads:read', 'leads:write', 'quotes:read'],
    });

    expect((await request(app).get('/api/v1/auth/me')).body.error.code).toBe('AUTH_REQUIRED');
    expect((await request(app).get('/api/v1/auth/me').set(bearer('garbage'))).body.error.code).toBe('TOKEN_INVALID');

    advance(16 * 60);
    expect((await request(app).get('/api/v1/auth/me').set(bearer(accessToken))).body.error.code).toBe('TOKEN_INVALID');
  });

  it('does not accept an MFA token as an access token', async () => {
    await createStaff({ email: 'fin@vdesk.in', role: 'FINANCE' });
    const login = await request(app).post('/api/v1/auth/login').send({ email: 'fin@vdesk.in', password: PASSWORD });
    const res = await request(app).get('/api/v1/auth/me').set(bearer(login.body.data.mfaToken));
    expect(res.body.error.code).toBe('TOKEN_INVALID');
  });

  it('rotates the refresh cookie and revokes the login when an old one is reused', async () => {
    const { cookie: first } = await staffWithSession('FINANCE');
    const rotated = await request(app).post('/api/v1/auth/refresh').set('Cookie', first);
    expect(rotated.status).toBe(200);
    expect(rotated.body.data.accessToken).toBeTruthy();
    const second = cookiePair(rotated);
    expect(second).not.toBe(first);

    // A parallel tab replaying within seconds just fails; the new cookie keeps working.
    expect((await request(app).post('/api/v1/auth/refresh').set('Cookie', first)).status).toBe(401);
    const third = cookiePair(await request(app).post('/api/v1/auth/refresh').set('Cookie', second));

    // Replayed later, a rotated cookie looks stolen: every cookie from that sign-in stops working.
    advance(60);
    expect((await request(app).post('/api/v1/auth/refresh').set('Cookie', second)).status).toBe(401);
    const afterReuse = await request(app).post('/api/v1/auth/refresh').set('Cookie', third);
    expect(afterReuse.body.error.code).toBe('REFRESH_INVALID');
  });

  it('logout revokes the session and is safe to repeat', async () => {
    const { cookie } = await staffWithSession('FINANCE');
    const out = await request(app).post('/api/v1/auth/logout').set('Cookie', cookie);
    expect(out.status).toBe(204);
    expect(refreshCookieOf(out)).toMatch(/Expires=Thu, 01 Jan 1970/);
    expect((await request(app).post('/api/v1/auth/refresh').set('Cookie', cookie)).status).toBe(401);
    expect((await request(app).post('/api/v1/auth/logout')).status).toBe(204);
  });

  it('changing the password checks the old one and ends other sessions', async () => {
    const { accessToken, cookie, secret } = await staffWithSession('FINANCE', 'fin@vdesk.in');
    const wrong = await request(app)
      .post('/api/v1/auth/password')
      .set(bearer(accessToken))
      .send({ currentPassword: 'nope', newPassword: 'another long password 7' });
    expect(wrong.status).toBe(401);

    const ok = await request(app)
      .post('/api/v1/auth/password')
      .set(bearer(accessToken))
      .send({ currentPassword: PASSWORD, newPassword: 'another long password 7' });
    expect(ok.status).toBe(204);
    expect((await request(app).post('/api/v1/auth/refresh').set('Cookie', cookie)).status).toBe(401);
    const old = await request(app).post('/api/v1/auth/login').send({ email: 'fin@vdesk.in', password: PASSWORD });
    expect(old.status).toBe(401);
    advance(30);
    await signIn('fin@vdesk.in', { password: 'another long password 7', secret });
  });
});

// ── Permissions across modules ────────────────

describe('permissions', () => {
  it('lets sales staff work leads but not manage users or search', async () => {
    const exec = await staffWithSession('SALES_EXEC');
    await request(app).post('/api/v1/leads').send({ ref: 'VD-PERM-0001', name: 'Asha', mobile: '9876543210' });

    expect((await request(app).get('/api/v1/leads').set(bearer(exec.accessToken))).status).toBe(200);
    const moved = await request(app)
      .patch('/api/v1/leads/VD-PERM-0001')
      .set(bearer(exec.accessToken))
      .send({ status: 'CONTACTED' });
    expect(moved.status).toBe(200);
    // The timeline records who did it.
    expect(moved.body.data.activities.at(-1)).toMatchObject({ type: 'status_changed', actor: exec.ref });

    const users = await request(app).get('/api/v1/auth/users').set(bearer(exec.accessToken));
    expect(users.status).toBe(403);
    expect(users.body.error.code).toBe('FORBIDDEN');
    expect((await request(app).get('/api/v1/search/admin/config').set(bearer(exec.accessToken))).status).toBe(403);
  });

  it('lets content staff manage search but not read leads', async () => {
    const content = await staffWithSession('CONTENT');
    expect((await request(app).get('/api/v1/search/admin/config').set(bearer(content.accessToken))).status).toBe(200);
    expect((await request(app).get('/api/v1/leads').set(bearer(content.accessToken))).status).toBe(403);
  });

  it('applies a role change at once and ends the old sessions', async () => {
    const admin = await staffWithSession('SUPER_ADMIN');
    const exec = await staffWithSession('SALES_EXEC');
    const res = await request(app)
      .patch(`/api/v1/auth/users/${exec.ref}`)
      .set(bearer(admin.accessToken))
      .send({ role: 'CONTENT' });
    expect(res.body.data.role).toBe('CONTENT');
    expect((await request(app).get('/api/v1/leads').set(bearer(exec.accessToken))).status).toBe(403);
    expect((await request(app).post('/api/v1/auth/refresh').set('Cookie', exec.cookie)).status).toBe(401);
  });

  it('stops a disabled user immediately', async () => {
    const exec = await staffWithSession('SALES_EXEC');
    await request(app)
      .patch(`/api/v1/auth/users/${exec.ref}`)
      .set('x-admin-key', ADMIN_KEY)
      .send({ status: 'disabled' });
    expect((await request(app).get('/api/v1/auth/me').set(bearer(exec.accessToken))).body.error.code).toBe(
      'TOKEN_INVALID',
    );
    expect((await request(app).post('/api/v1/auth/login').send({ email: exec.email, password: PASSWORD })).status).toBe(
      401,
    );
  });

  it('protects super admins from locking everyone out', async () => {
    const admin = await staffWithSession('SUPER_ADMIN');
    const self = await request(app)
      .patch(`/api/v1/auth/users/${admin.ref}`)
      .set(bearer(admin.accessToken))
      .send({ status: 'disabled' });
    expect(self.body.error.code).toBe('CANNOT_CHANGE_OWN_ACCESS');

    const last = await request(app)
      .patch(`/api/v1/auth/users/${admin.ref}`)
      .set('x-admin-key', ADMIN_KEY)
      .send({ role: 'OPS_ADMIN' });
    expect(last.status).toBe(409);
    expect(last.body.error.code).toBe('LAST_SUPER_ADMIN');
  });

  it('lists users newest first with a cursor', async () => {
    const admin = await staffWithSession('SUPER_ADMIN');
    for (const role of ['FINANCE', 'CONTENT']) {
      advance(1);
      await createStaff({ email: `${role.toLowerCase()}@vdesk.in`, role });
    }
    const page1 = await request(app).get('/api/v1/auth/users?limit=2').set(bearer(admin.accessToken));
    expect(page1.body.data.map((u) => u.role)).toEqual(['CONTENT', 'FINANCE']);
    const page2 = await request(app)
      .get(`/api/v1/auth/users?limit=2&cursor=${page1.body.meta.nextCursor}`)
      .set(bearer(admin.accessToken));
    expect(page2.body.data.map((u) => u.role)).toEqual(['SUPER_ADMIN']);
    expect(page2.body.meta.nextCursor).toBeNull();
  });
});
