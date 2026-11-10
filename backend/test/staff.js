import request from 'supertest';
import { testPasswordKey } from './passwordKey.js';

export const ADMIN_KEY = 'test-admin-key-0123456789';
export const STAFF_PASSWORD = 'correct horse battery 42';

/**
 * Creates a staff user (through x-admin-key) and signs them in the way a real one does: email and password,
 * the password sent as its key (ADR-013). For tests that need a real Bearer token with a given role.
 * Returns `{ ref, accessToken, auth }` — spread `auth` into `.set()`.
 */
export async function staffSession(app, role, email = `${role.toLowerCase()}@vdesk.in`) {
  const passwordKey = testPasswordKey(email, STAFF_PASSWORD);
  const created = await request(app)
    .post('/api/v1/auth/users')
    .set('x-admin-key', ADMIN_KEY)
    .send({ email, name: `${role} tester`, role, passwordKey });
  if (created.status !== 201) throw new Error(`could not create ${role}: ${JSON.stringify(created.body)}`);

  const signedIn = await request(app).post('/api/v1/auth/login').send({ email, passwordKey });
  if (signedIn.status !== 200) throw new Error(`could not sign in ${role}: ${JSON.stringify(signedIn.body)}`);
  const { accessToken } = signedIn.body.data;
  return { ref: created.body.data.ref, accessToken, auth: { Authorization: `Bearer ${accessToken}` } };
}
