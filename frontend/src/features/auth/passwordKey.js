import { argon2idAsync } from '@noble/hashes/argon2.js';

/**
 * Turns a staff password into the key the API stores (ADR-013) — here, in the browser, so the API never sees the
 * password and never has to run the slow hash itself.
 *
 * Why: the API runs on Cloudflare Workers, whose free plan allows 10 ms of CPU per request. A password hash worth
 * having (argon2id) takes about half a second, so hashing on the server failed with error 1102. The browser has
 * the time to spare: it spends about a second here, sends the 32-byte result, and the API checks it with a quick
 * salted SHA-256. A leaked database still means running argon2id for every password guess.
 *
 * MUST match backend/src/modules/identity/identity.passwordKey.js exactly — same parameters, same salt, same
 * encoding — or nobody can sign in. Both sides test the same vector (src/__tests__/passwordKey.test.js).
 */

/** OWASP's argon2id baseline: 19 MiB of memory, 2 passes, one lane, 32-byte key. */
export const PASSWORD_KEY_PARAMS = Object.freeze({ m: 19_456, t: 2, p: 1, dkLen: 32 });

export const passwordKeySalt = (email) => `vdesk-staff-password:${String(email).trim().toLowerCase()}`;

function toBase64Url(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** The key the sign-in page sends instead of the password: base64url, 43 characters. About a second of work. */
export async function derivePasswordKey(email, password) {
  // asyncTick yields to the browser every few ms, so the "Checking…" state keeps painting while this runs.
  const key = await argon2idAsync(password, passwordKeySalt(email), { ...PASSWORD_KEY_PARAMS, asyncTick: 10 });
  return toBase64Url(key);
}
