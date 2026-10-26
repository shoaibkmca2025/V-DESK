import { api, isApiEnabled } from '@/lib/api.js';

/**
 * Staff sign-in for the admin console: password → authenticator code → access token.
 *
 * The token is held in memory and mirrored to sessionStorage so a page reload inside the same tab
 * keeps the session, and closing the tab ends it. It is never written to localStorage, which other
 * tabs and scripts outlive.
 */

const KEY = 'VDESK_STAFF_SESSION';

let session = null;

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
}

export function staffSession() {
  return load();
}

export function isStaffSignedIn() {
  return Boolean(load()?.accessToken);
}

/** Authorization header for staff calls, or an empty object when signed out. */
export function staffHeaders() {
  const token = load()?.accessToken;
  return token ? { authorization: `Bearer ${token}` } : {};
}

/**
 * Step 1. Returns `{ mfaToken, mfaEnrollmentRequired }` — a first sign-in has to enrol an
 * authenticator app before it can get a code.
 */
export async function signInWithPassword(email, password) {
  if (!isApiEnabled()) throw new Error('No API is configured for this build');
  const data = await api.post('/auth/login', { body: { email, password } });
  return {
    mfaToken: data.mfaToken,
    enrolmentRequired: Boolean(data.mfaEnrollmentRequired),
  };
}

/** Step 1b (first sign-in only). Returns the secret to add to an authenticator app. */
export async function enrolAuthenticator(mfaToken) {
  const data = await api.post('/auth/mfa/enroll', { body: { mfaToken } });
  return { secret: data.secret, otpauthUrl: data.otpauthUrl ?? null };
}

/** Step 2. Exchanges the six-digit code for an access token and stores the session. */
export async function verifyCode(mfaToken, code) {
  const data = await api.post('/auth/mfa/verify', { body: { mfaToken, code } });
  save({ accessToken: data.accessToken, user: data.user ?? null, signedInAt: new Date().toISOString() });
  return data;
}

export async function signOutStaff() {
  try {
    if (isStaffSignedIn()) await api.post('/auth/logout', { headers: staffHeaders() });
  } catch {
    /* signing out locally is what matters */
  }
  save(null);
}

/** The signed-in staff member, or null. */
export async function fetchStaffProfile() {
  if (!isStaffSignedIn()) return null;
  try {
    return await api.get('/auth/me', { headers: staffHeaders() });
  } catch (error) {
    if (error.status === 401) save(null);
    return null;
  }
}
