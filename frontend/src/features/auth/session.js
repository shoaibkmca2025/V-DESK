import { api, isApiEnabled } from '@/lib/api.js';

/**
 * The customer's portal session.
 *
 * Signing in is the phone-OTP flow on the API: ask for a code, verify it, and the API answers with an access
 * token plus a long-lived refresh cookie. The token is held in memory and mirrored to sessionStorage, so a
 * reload keeps the session inside this tab and closing the tab ends it; a fresh tab gets it back from the
 * cookie through `restoreSession()`. It is never written to localStorage, which other tabs and scripts outlive.
 *
 * A build with no API (`VITE_API_URL` unset) keeps a local session instead, so the static site still shows the
 * portal and the booking flow rather than a dead end.
 */

const KEY = 'VDESK_SESSION';
/**
 * A flag — never a token — saying this browser has a refresh cookie worth asking about. Without it every page
 * load by a visitor who has never signed in would spend a request finding that out.
 */
const HINT = 'VDESK_SESSION_HINT';

let session = null;
let restoring = null;

function setHint(on) {
  try {
    if (on) localStorage.setItem(HINT, '1');
    else localStorage.removeItem(HINT);
  } catch {
    /* storage unavailable: the session just won't survive a new tab */
  }
}

function hasHint() {
  try {
    return localStorage.getItem(HINT) === '1';
  } catch {
    return false;
  }
}

function load() {
  if (session) return session;
  try {
    const raw = sessionStorage.getItem(KEY);
    session = raw ? JSON.parse(raw) : null;
  } catch {
    session = null;
  }
  return session;
}

function save(next) {
  session = next;
  try {
    if (next) sessionStorage.setItem(KEY, JSON.stringify(next));
    else sessionStorage.removeItem(KEY);
  } catch {
    /* private mode: the session stays in memory only */
  }
  globalThis.dispatchEvent?.(new CustomEvent('vdesk:session', { detail: next }));
  return next;
}

function store({ accessToken, customer }) {
  setHint(true);
  return save({ accessToken: accessToken ?? null, customer, signedInAt: new Date().toISOString() });
}

/** The signed-in customer, or null. `{ ref, name, mobile, email, company }`. */
export function getCustomer() {
  return load()?.customer ?? null;
}

/** The whole session, as the pages used to read it. */
export function getSession() {
  return load();
}

export function isSignedIn() {
  return Boolean(load()?.customer);
}

/** Authorization header for portal calls, or an empty object when signed out. */
export function customerHeaders() {
  const token = load()?.accessToken;
  return token ? { authorization: `Bearer ${token}` } : {};
}

// ── Signing in ────────────────────────────────

/**
 * Step 1. Sends a code to the number and says whether it has an account yet — `isNewAccount` is what makes
 * the sign-in form ask for a name. Outside production the API hands back the code it would have texted
 * (`devCode`), because no SMS provider is wired up yet.
 */
export async function requestSignInCode(mobile) {
  if (!isApiEnabled()) return { isNewAccount: false, local: true };
  return api.post('/auth/otp/request', { body: { mobile } });
}

/** Step 2. Exchanges the code for a session; a number with no account yet gets one, which is the sign-up. */
export async function verifySignInCode({ mobile, code, name, email, company }) {
  if (!isApiEnabled()) return signInLocally({ name, mobile, email, company });
  const data = await api.post('/auth/otp/verify', { body: { mobile, code, name, email, company } });
  return store(data).customer;
}

/** Signs out everywhere: the API revokes the refresh cookie, this tab forgets the token. */
export async function signOut() {
  try {
    if (isApiEnabled()) await api.post('/auth/customer/logout');
  } catch {
    /* signing out locally is what matters */
  }
  setHint(false);
  save(null);
}

/**
 * Brings back a session the refresh cookie still vouches for — a new tab, or one whose access token has
 * expired. Resolves to the customer or null, and only ever asks the API once at a time.
 */
export function restoreSession() {
  const current = load();
  if (current) return Promise.resolve(current.customer);
  if (!isApiEnabled() || !hasHint()) return Promise.resolve(null);
  restoring ??= api
    .post('/auth/customer/refresh')
    .then((data) => store(data).customer)
    .catch(() => {
      // The cookie is gone or no longer accepted; stop asking until the next sign-in.
      setHint(false);
      return null;
    })
    .finally(() => {
      restoring = null;
    });
  return restoring;
}

/** The signed-in customer, straight from the API — null when the session is no longer accepted. */
export async function fetchCustomerProfile() {
  if (!isApiEnabled() || !isSignedIn()) return getCustomer();
  try {
    const customer = await api.get('/auth/customer/me', { headers: customerHeaders() });
    save({ ...load(), customer });
    return customer;
  } catch (error) {
    if (error.status === 401) {
      // The access token has run out; the cookie may still be good.
      save(null);
      return restoreSession();
    }
    return getCustomer();
  }
}

/** The static build's stand-in: a session with no API behind it, so the portal pages still have an account. */
export function signInLocally({ name, mobile, email, company } = {}) {
  return store({
    accessToken: null,
    customer: {
      ref: 'CUS-LOCAL-' + Date.now().toString(36).toUpperCase(),
      name: name || 'Guest',
      mobile: mobile || '',
      email: email || '',
      company: company || '',
      local: true,
    },
  }).customer;
}

/** Where to send someone who has to sign in first, so they come back to the page they wanted. */
export function signInPath(next = globalThis.location?.pathname ?? '/') {
  return `/login?next=${encodeURIComponent(next)}`;
}
