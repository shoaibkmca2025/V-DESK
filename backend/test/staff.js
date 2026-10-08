import request from 'supertest';
import { hotp, totpStep } from '../src/modules/identity/identity.totp.js';

export const ADMIN_KEY = 'test-admin-key-0123456789';
const PASSWORD = 'correct horse battery';

/**
 * Creates a staff user (through x-admin-key) and signs them in with MFA, for tests that need a real
 * Bearer token with a given role. Returns `{ ref, accessToken, auth }` — spread `auth` into `.set()`.
 */
export async function staffSession(app, role, email = `${role.toLowerCase()}@vdesk.in`) {
  const created = await request(app)
    .post('/api/v1/auth/users')
    .set('x-admin-key', ADMIN_KEY)
    .send({ email, name: `${role} tester`, role, password: PASSWORD });
  if (created.status !== 201) throw new Error(`could not create ${role}: ${JSON.stringify(created.body)}`);

  const login = await request(app).post('/api/v1/auth/login').send({ email, password: PASSWORD });
  const { mfaToken } = login.body.data;
  const { secret } = (await request(app).post('/api/v1/auth/mfa/enroll').send({ mfaToken })).body.data;
  const verify = await request(app)
    .post('/api/v1/auth/mfa/verify')
    .send({ mfaToken, code: hotp(secret, totpStep()) });
  const { accessToken } = verify.body.data;
  return { ref: created.body.data.ref, accessToken, auth: { Authorization: `Bearer ${accessToken}` } };
}
