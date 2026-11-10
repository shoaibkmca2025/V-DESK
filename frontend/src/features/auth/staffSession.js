import { api, isApiEnabled } from '@/lib/api.js';
import { derivePasswordKey } from './passwordKey.js';

/**
 * Staff sign-in for the admin console: email + password (sent as a key, ADR-013) → access token.
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
 * Email + password → a session, stored here. The password never leaves this browser: it is turned into a key
 * first (about a second of work, ADR-013) and only the key is sent.
 */
export async function signInWithPassword(email, password) {
  if (!isApiEnabled()) throw new Error('No API is configured for this build');
  const passwordKey = await derivePasswordKey(email, password);
  const data = await api.post('/auth/login', { body: { email, passwordKey } });
  save({ accessToken: data.accessToken, user: data.user ?? null, signedInAt: new Date().toISOString() });
  return data;
}

/**
 * The password rule: 12+ characters with at least one letter and one number. Only this page can check it —
 * the API never sees the password, just the key made from it (ADR-013).
 */
export function passwordProblem(password) {
  if (password.length < 12) return 'Use at least 12 characters.';
  if (password.length > 128) return 'Use at most 128 characters.';
  if (!/[A-Za-z]/.test(password)) return 'Include at least one letter.';
  if (!/\d/.test(password)) return 'Include at least one number.';
  return null;
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
