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
 * Step 1. Email + password → `{ mfaToken, enrolmentRequired }` — a first sign-in has to enrol an authenticator
 * app before it can get a code. A new staff member signs in with the one-time setup code an admin gave them
 * instead (ADR-012); that answers `{ passwordSetupRequired: true, setupToken }`, and they choose a password next.
 */
export async function signInWithPassword(email, password) {
  if (!isApiEnabled()) throw new Error('No API is configured for this build');
  const data = await api.post('/auth/login', { body: { email, password } });
  if (data.passwordSetupRequired) return { passwordSetupRequired: true, setupToken: data.setupToken };
  return {
    mfaToken: data.mfaToken,
    enrolmentRequired: Boolean(data.mfaEnrollmentRequired),
  };
}

/** Step 1b (setup code only). Stores the password they chose; answers like step 1, with the MFA token. */
export async function choosePassword(setupToken, newPassword) {
  const data = await api.post('/auth/password/setup', { body: { setupToken, newPassword } });
  return { mfaToken: data.mfaToken, enrolmentRequired: Boolean(data.mfaEnrollmentRequired) };
}

/** The API's password rule, checked before sending: 12+ characters with at least one letter and one number. */
export function passwordProblem(password) {
  if (password.length < 12) return 'Use at least 12 characters.';
  if (password.length > 128) return 'Use at most 128 characters.';
  if (!/[A-Za-z]/.test(password)) return 'Include at least one letter.';
  if (!/\d/.test(password)) return 'Include at least one number.';
  return null;
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
