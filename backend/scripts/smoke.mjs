/**
 * Smoke test against a running API — the one command to answer "is this deployment actually working?".
 *
 *   node scripts/smoke.mjs                                  # http://127.0.0.1:5000
 *   API=https://api.vdesk.in node scripts/smoke.mjs
 *   API=http://127.0.0.1:5055 MOBILE=9812345670 node scripts/smoke.mjs
 *
 * It checks the paths that cross every layer: health and readiness (so the database is reachable), the public
 * catalog, phone-OTP sign-in and registration, the booking gate, holding a room, and session refresh.
 *
 * Outside production the API returns the code it would have texted, which is what lets sign-in run
 * unattended; against a production API those steps are skipped rather than faked, and the script says so.
 *
 * It writes real rows (a customer account and a booking hold, both for a test number), so point it at a
 * staging or local database, or clean up after it.
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

// ── Customer sign-in, registration and the booking gate ─────────────────────
const date = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
const holdBody = {
  centreRef: centre?.ref,
  room: 'Conference Room',
  date,
  startTime: '14:00',
  duration: 2,
  attendees: 4,
};

const anonymous = await call('POST', '/bookings/hold', { body: holdBody, idempotencyKey: `smoke-anon-${Date.now()}` });
check('holding a room without a session is refused', anonymous.status === 401, anonymous.body?.error?.code);

const requested = await call('POST', '/auth/otp/request', { body: { mobile: MOBILE } });
const code = requested.body?.data?.devCode;
check(
  'POST /auth/otp/request sends a code',
  requested.status === 200,
  JSON.stringify(requested.body?.data ?? requested.body),
);

if (!code) {
  skip('sign in, hold a room, refresh the session', 'this API does not hand back the code (production)');
} else {
  const verified = await call('POST', '/auth/otp/verify', {
    body: { mobile: MOBILE, code, name: 'Smoke Test', email: 'smoke@vdesk.test', company: 'Smoke Co' },
  });
  const token = verified.body?.data?.accessToken;
  check(
    'POST /auth/otp/verify signs in (and registers a new number)',
    verified.status === 200 && Boolean(token),
    verified.body?.data?.customer?.ref ?? JSON.stringify(verified.body),
  );
  check(
    'the refresh cookie is httpOnly and scoped to the customer routes',
    verified.setCookie.some((value) => value.includes('HttpOnly') && value.includes('Path=/api/v1/auth/customer')),
  );

  const me = await call('GET', '/auth/customer/me', { token });
  check('GET /auth/customer/me returns the account', me.status === 200 && me.body?.data?.mobile === MOBILE);
  check('a customer token cannot open a staff route', (await call('GET', '/auth/me', { token })).status === 401);

  if (centre) {
    const held = await call('POST', '/bookings/hold', {
      token,
      body: holdBody,
      idempotencyKey: `smoke-hold-${Date.now()}`,
    });
    const holdOk = check(
      'a signed-in customer can hold a room',
      held.status === 201,
      held.body?.data?.ref ?? JSON.stringify(held.body?.error),
    );
    check('the hold carries no contact details', !JSON.stringify(held.body ?? {}).includes(MOBILE));

    const mine = await call('GET', '/bookings/mine', { token });
    check(
      'GET /bookings/mine lists the account bookings',
      mine.status === 200 && (mine.body?.data?.length ?? 0) > 0,
      `${mine.body?.data?.length ?? 0} bookings`,
    );

    if (holdOk) await call('POST', `/bookings/${held.body.data.ref}/cancel`);
  } else {
    skip('hold a room', 'no centre in the catalog');
  }

  const refreshed = await call('POST', '/auth/customer/refresh', { sendCookie: true });
  check(
    'the refresh cookie mints a new access token',
    refreshed.status === 200 && typeof refreshed.body?.data?.accessToken === 'string',
  );
  check(
    'signing out ends the session',
    (await call('POST', '/auth/customer/logout', { sendCookie: true })).status === 204,
  );
  check(
    'the cookie is dead afterwards',
    (await call('POST', '/auth/customer/refresh', { sendCookie: true })).status === 401,
  );
}

console.log(`\n[smoke] ${passed}/${passed + failed} checks passed${skipped ? `, ${skipped} skipped` : ''}`);
process.exit(failed ? 1 : 0);
