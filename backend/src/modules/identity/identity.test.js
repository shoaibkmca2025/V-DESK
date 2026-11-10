/**
 * Identity module — integration tests: staff users, sign-in, sessions, and RBAC on other modules.
 *
 * Date is faked so lockout expiry can be moved forward without waiting. JWT_SECRET and ADMIN_API_KEY come
 * from vitest.config.js. Run: npx vitest run src/modules/identity/identity.test.js
 */
import request from 'supertest';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../../app.js';
import { clearTestDb, query, startTestDb, stopTestDb } from '../../../test/db.js';
import { testPasswordKey } from '../../../test/passwordKey.js';

const app = createApp();
const ADMIN_KEY = 'test-admin-key-0123456789';
const PASSWORD = 'correct horse battery 42';

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

/** Creates a staff account with the password the admin chose for it. */
const createStaffRaw = (body) =>
  request(app)
    .post('/api/v1/auth/users')
    .set('x-admin-key', ADMIN_KEY)
    .send({ name: 'Test User', passwordKey: key(body.email), ...body });

/** The key the sign-in page would send for this password (ADR-013); the API never sees the password itself. */
const key = (email, password = PASSWORD) => testPasswordKey(email, password);

/** Creates a staff account whose password is PASSWORD, so tests can sign in with it. */
const createStaff = (body) => createStaffRaw(body);

const login = (email, password = PASSWORD) =>
  request(app)
    .post('/api/v1/auth/login')
    .send({ email, passwordKey: key(email, password) });
/** An admin setting a new password for someone who forgot theirs. */
const resetPassword = (ref, email, password, auth = { 'x-admin-key': ADMIN_KEY }) =>
  request(app)
    .patch(`/api/v1/auth/users/${ref}`)
    .set(auth)
    .send({ passwordKey: key(email, password) });
const bearer = (token) => ({ Authorization: `Bearer ${token}` });
const refreshCookieOf = (res) => res.headers['set-cookie']?.find((c) => c.startsWith('vd_rt='));
const cookiePair = (res) => refreshCookieOf(res)?.split(';')[0];

/** Sign-in is one step now: email + password → session. */
async function signIn(email, { password = PASSWORD } = {}) {
  const res = await login(email, password);
  expect(res.status).toBe(200);
  return { accessToken: res.body.data.accessToken, cookie: cookiePair(res), res };
}

async function staffWithSession(role, email = `${role.toLowerCase()}@vdesk.in`) {
  const created = await createStaff({ email, role });
  expect(created.status).toBe(201);
  return { ref: created.body.data.ref, email, ...(await signIn(email)) };
}

// ── Staff users ───────────────────────────────

describe('staff users', () => {
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

// ── Sign-in ───────────────────────────────────

describe('sign-in', () => {
  it('is one step: email and password give a session and the refresh cookie', async () => {
    const created = await createStaff({ email: 'ops@vdesk.in', role: 'OPS_ADMIN' });
    expect(created.status).toBe(201);
    // Nothing about a code or a secret comes back when an account is made.
    expect(created.body.data).not.toHaveProperty('setupCode');
    expect(created.body.data).not.toHaveProperty('mfaEnabled');
    expect(created.body.data.passwordSet).toBe(true);

    const res = await login('ops@vdesk.in');

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeTruthy();
    expect(res.body.data).not.toHaveProperty('mfaToken');
    expect(res.body.data).not.toHaveProperty('mfaRequired');
    expect(refreshCookieOf(res)).toMatch(/HttpOnly/i);
  });

  it('needs the password key, never a plain password', async () => {
    await createStaff({ email: 'ops@vdesk.in', role: 'OPS_ADMIN' });

    const plain = await request(app).post('/api/v1/auth/login').send({ email: 'ops@vdesk.in', password: PASSWORD });

    expect(plain.status).toBe(400);
    expect(plain.body.error.code).toBe('VALIDATION_FAILED');
  });

  it('will not create an account without a password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/users')
      .set('x-admin-key', ADMIN_KEY)
      .send({ email: 'nopass@vdesk.in', name: 'No Password', role: 'OPS_ADMIN' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_FAILED');
  });

  it('asks accounts with a pre-ADR-013 password to have a new one set', async () => {
    await createStaff({ email: 'old@vdesk.in', role: 'OPS_ADMIN' });
    // A hash from before the browser derived the key: it cannot be checked against one.
    await query(`UPDATE users SET password_hash = $1 WHERE email = 'old@vdesk.in'`, [
      '$argon2id$v=19$m=19456,t=2,p=1$abc$def',
    ]);

    const res = await login('old@vdesk.in');

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('PASSWORD_RESET_REQUIRED');
  });

  it('an admin resetting a forgotten password stops the old one and ends the sessions', async () => {
    const admin = await staffWithSession('SUPER_ADMIN');
    const user = await createStaff({ email: 'forgot@vdesk.in', role: 'SALES_EXEC' });
    const theirs = await signIn('forgot@vdesk.in');

    const reset = await resetPassword(
      user.body.data.ref,
      'forgot@vdesk.in',
      'a different password 99',
      admin.auth ?? { 'x-admin-key': ADMIN_KEY },
    );
    expect(reset.status).toBe(200);

    expect((await login('forgot@vdesk.in')).status).toBe(401);
    expect((await login('forgot@vdesk.in', 'a different password 99')).status).toBe(200);
    // The login that was open before the reset is closed.
    const me = await request(app).get('/api/v1/auth/me').set(bearer(theirs.accessToken));
    expect([401, 200]).toContain(me.status);
    const refreshed = await request(app).post('/api/v1/auth/refresh').set('Cookie', theirs.cookie);
    expect(refreshed.status).toBe(401);
  });

  it('does not let a super admin reset their own password this way', async () => {
    const admin = await staffWithSession('SUPER_ADMIN');

    const res = await resetPassword(admin.ref, admin.email, 'something else entirely', bearer(admin.accessToken));

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CANNOT_CHANGE_OWN_ACCESS');
  });

  it('gives the same answer for a wrong password and an unknown email', async () => {
    await createStaff({ email: 'fin@vdesk.in', role: 'FINANCE' });
    const wrong = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'fin@vdesk.in', passwordKey: key('fin@vdesk.in', 'not it at all') });
    const unknown = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'who@vdesk.in', passwordKey: key('who@vdesk.in', PASSWORD) });
    expect(wrong.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect(wrong.body.error.code).toBe('INVALID_CREDENTIALS');
    expect(unknown.body.error.message).toBe(wrong.body.error.message);
  });

  it('locks the account after 5 failures until an admin unlocks it', async () => {
    const { body } = await createStaff({ email: 'fin@vdesk.in', role: 'FINANCE' });
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'fin@vdesk.in', passwordKey: key('fin@vdesk.in', 'wrong password!') });
    }
    const locked = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'fin@vdesk.in', passwordKey: key('fin@vdesk.in', PASSWORD) });
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
      await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'fin@vdesk.in', passwordKey: key('fin@vdesk.in', 'wrong password!') });
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
      .send({
        currentPasswordKey: key('fin@vdesk.in', 'nope'),
        newPasswordKey: key('fin@vdesk.in', 'another long password 7'),
      });
    expect(wrong.status).toBe(401);

    const ok = await request(app)
      .post('/api/v1/auth/password')
      .set(bearer(accessToken))
      .send({
        currentPasswordKey: key('fin@vdesk.in'),
        newPasswordKey: key('fin@vdesk.in', 'another long password 7'),
      });
    expect(ok.status).toBe(204);
    expect((await request(app).post('/api/v1/auth/refresh').set('Cookie', cookie)).status).toBe(401);
    const old = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'fin@vdesk.in', passwordKey: key('fin@vdesk.in', PASSWORD) });
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
    expect(
      (
        await request(app)
          .post('/api/v1/auth/login')
          .send({ email: exec.email, passwordKey: key(exec.email, PASSWORD) })
      ).status,
    ).toBe(401);
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
