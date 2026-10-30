import request from 'supertest';

/**
 * Signs a customer in through the real phone-OTP flow, for tests that need a portal session. Outside
 * production the API returns the code it would have texted (`devCode`), which is what makes this possible.
 * Returns `{ ref, accessToken, auth, mobile }` — spread `auth` into `.set()`.
 */
export async function customerSession(app, { mobile = '9876543210', name = 'Priya Kulkarni', ...rest } = {}) {
  const requested = await request(app).post('/api/v1/auth/otp/request').send({ mobile });
  if (requested.status !== 200) throw new Error(`could not request a code: ${JSON.stringify(requested.body)}`);

  const verified = await request(app)
    .post('/api/v1/auth/otp/verify')
    .send({ mobile, code: requested.body.data.devCode, name, ...rest });
  if (verified.status !== 200) throw new Error(`could not verify the code: ${JSON.stringify(verified.body)}`);

  const { accessToken, customer } = verified.body.data;
  return { ref: customer.ref, mobile: customer.mobile, accessToken, auth: { Authorization: `Bearer ${accessToken}` } };
}
