import request from 'supertest';
import { hotp, totpStep } from '../src/modules/identity/identity.totp.js';

export const ADMIN_KEY = 'test-admin-key-0123456789';
export const STAFF_PASSWORD = 'correct horse battery 42';

/**
 * Creates a staff user (through x-admin-key) and signs them in the way a real new staff member does: setup code
 * → choose a password → enrol MFA → TOTP code (ADR-012). For tests that need a real Bearer token with a given
 * role. Returns `{ ref, accessToken, auth }` — spread `auth` into `.set()`.
 */
export async function staffSession(app, role, email = `${role.toLowerCase()}@vdesk.in`) {
  const created = await request(app)
    .post('/api/v1/auth/users')
    .set('x-admin-key', ADMIN_KEY)
    .send({ email, name: `${role} tester`, role });
  if (created.status !== 201) throw new Error(`could not create ${role}: ${JSON.stringify(created.body)}`);

  const withCode = await request(app).post('/api/v1/auth/login').send({ email, password: created.body.data.setupCode });
  const setup = await request(app)
    .post('/api/v1/auth/password/setup')
    .send({ setupToken: withCode.body.data.setupToken, newPassword: STAFF_PASSWORD });
  const { mfaToken } = setup.body.data;
  const { secret } = (await request(app).post('/api/v1/auth/mfa/enroll').send({ mfaToken })).body.data;
  const verify = await request(app)
    .post('/api/v1/auth/mfa/verify')
    .send({ mfaToken, code: hotp(secret, totpStep()) });
  const { accessToken } = verify.body.data;
  return { ref: created.body.data.ref, accessToken, auth: { Authorization: `Bearer ${accessToken}` } };
}
