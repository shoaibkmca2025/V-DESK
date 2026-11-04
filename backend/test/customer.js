import request from 'supertest';
import { googleIdToken } from './google.js';

/**
 * Signs a customer in the way the website does at checkout — "Continue with Google" (ADR-012) — with an ID
 * token signed by the test stand-in for Google's key (test/google.js). The first sign-in for a `sub` creates
 * the account. Returns `{ ref, email, accessToken, auth, cookie }` — spread `auth` into `.set()`.
 */
export async function customerSession(
  app,
  { sub = '100000000000000000001', email = 'priya@example.com', name = 'Priya Kulkarni' } = {},
) {
  const credential = await googleIdToken({ sub, email, name });
  const res = await request(app).post('/api/v1/auth/google').send({ credential });
  if (res.status !== 200) throw new Error(`could not sign in with Google: ${JSON.stringify(res.body)}`);

  const { accessToken, customer } = res.body.data;
  const cookie = res.headers['set-cookie']?.find((c) => c.startsWith('vd_crt='))?.split(';')[0];
  return {
    ref: customer.ref,
    email: customer.email,
    accessToken,
    auth: { Authorization: `Bearer ${accessToken}` },
    cookie,
  };
}
