/**
 * Smoke test against a running API — the one command to answer "is this deployment actually working?".
 *
 *   node scripts/smoke.mjs                                  # http://127.0.0.1:5000
 *   API=https://api.vdesk.in node scripts/smoke.mjs
 *   API=http://127.0.0.1:5055 MOBILE=9812345670 node scripts/smoke.mjs
 *
 * It checks the paths that cross every layer: health and readiness (so the database is reachable), the public
 * catalog, holding a room as a guest (ADR-012), and the doors that need a customer session staying shut.
 * "Continue with Google" itself needs a person at Google's prompt, so only its refusal of a forged credential
 * is checked here.
 *
 * It writes a real row (a booking hold for a test number, released straight away), so point it at a staging
 * or local database, or clean up after it.
 */
const API = (process.env.API ?? 'http://127.0.0.1:5000').replace(/\/+$/, '');
const BASE = `${API}/api/v1`;
const MOBILE = process.env.MOBILE ?? '9812345670';

let passed = 0;
let failed = 0;
let skipped = 0;
let cookie = '';

const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
  if (ok) passed += 1;
  else failed += 1;
  return ok;
};

const skip = (name, why) => {
  console.log(`SKIP  ${name} — ${why}`);
  skipped += 1;
};

async function call(method, path, { body, token, idempotencyKey, sendCookie } = {}) {
  const res = await fetch(path.startsWith('/api') ? API + path : BASE + path, {
    method,
    headers: {
      accept: 'application/json',
      ...(body ? { 'content-type': 'application/json' } : {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
      ...(sendCookie && cookie ? { cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const fresh = (res.headers.getSetCookie?.() ?? []).find((value) => value.startsWith('vd_crt='));
  if (fresh) cookie = fresh.split(';')[0];
  const text = await res.text();
  let payload;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = { raw: text.slice(0, 200) };
  }
  return { status: res.status, body: payload, setCookie: res.headers.getSetCookie?.() ?? [] };
}

console.log(`[smoke] ${API}\n`);

// ── The platform ────────────────────────────────────────────────────────────
const health = await call('GET', '/api/../health');
check('GET /health answers', health.status === 200 && health.body?.data?.status === 'ok');
const ready = await call('GET', '/api/../ready');
check('GET /ready reports the database is connected', ready.status === 200, JSON.stringify(ready.body));

// ── The public catalog ──────────────────────────────────────────────────────
const cities = await call('GET', '/catalog/cities');
check(
  'GET /catalog/cities returns cities',
  cities.status === 200 && (cities.body?.data?.length ?? 0) > 0,
  `${cities.body?.data?.length ?? 0} cities`,
);
const centres = await call('GET', '/catalog/centres?limit=1');
const centre = centres.body?.data?.[0];
check('GET /catalog/centres returns centres', Boolean(centre), centre?.ref ?? 'none — seed the catalog first');

// ── Guest holds and the checkout sign-in ────────────────────────────────────
const date = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
const holdBody = {
  centreRef: centre?.ref,
  room: 'Conference Room',
  date,
  startTime: '14:00',
  duration: 2,
  attendees: 4,
  name: 'Smoke Test',
  mobile: MOBILE,
  email: 'smoke@vdesk.test',
  company: 'Smoke Co',
};

if (centre) {
  // No account is needed to hold a room (ADR-012); customers sign in with Google only to pay.
  const held = await call('POST', '/bookings/hold', { body: holdBody, idempotencyKey: `smoke-hold-${Date.now()}` });
  const holdOk = check(
    'a guest can hold a room without signing in',
    held.status === 201,
    held.body?.data?.ref ?? JSON.stringify(held.body?.error),
  );
  check('the hold carries no contact details', !JSON.stringify(held.body ?? {}).includes(MOBILE));
  if (holdOk) {
    const claim = await call('POST', `/bookings/${held.body.data.ref}/claim`);
    check('claiming a hold needs a signed-in customer', claim.status === 401, claim.body?.error?.code);
    const cancelled = await call('POST', `/bookings/${held.body.data.ref}/cancel`);
    check('the hold can be released', cancelled.body?.data?.status === 'CANCELLED');
  }
} else {
  skip('hold a room', 'no centre in the catalog');
}

const google = await call('POST', '/auth/google', { body: { credential: 'not-a-google-token' } });
if (google.status === 503) {
  skip('Google sign-in', `${google.body?.error?.code} — set GOOGLE_CLIENT_ID on the API`);
} else {
  // A real sign-in needs a person at a Google prompt, so only the refusal is checked unattended.
  check('POST /auth/google refuses a forged credential', google.status === 401, google.body?.error?.code);
}
check(
  'phone-code sign-in is gone',
  (await call('POST', '/auth/otp/request', { body: { mobile: MOBILE } })).status === 404,
);
check('the portal needs a session', (await call('GET', '/auth/customer/me')).status === 401);
check('so does the bookings list', (await call('GET', '/bookings/mine')).status === 401);

console.log(`\n[smoke] ${passed}/${passed + failed} checks passed${skipped ? `, ${skipped} skipped` : ''}`);
process.exit(failed ? 1 : 0);
