import { readJson, writeJson } from '@/lib/storage.js';

/**
 * Demo client session for the portal pages. There is no backend yet: any valid-looking credentials
 * sign the visitor in locally. Replace with real auth (JWT / OTP) when the API exists.
 */

const KEY = 'VDESK_SESSION';

export function getSession() {
  return readJson(KEY, null, globalThis.sessionStorage);
}

export function signIn({ name, email, mobile, company }) {
  const session = {
    id: 'VD-AC-' + Date.now().toString(36).toUpperCase(),
    name: name || 'Arjun Mehta',
    email: email || '',
    mobile: mobile || '',
    company: company || '',
    signedInAt: new Date().toISOString(),
  };
  writeJson(KEY, session, globalThis.sessionStorage);
  return session;
}

export function signOut() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* storage unavailable */
  }
}
