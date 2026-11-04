import { argon2idAsync } from '@noble/hashes/argon2.js';

/**
 * The slow half of a staff password (ADR-013): argon2id, run by whoever *has* the password — the sign-in page in
 * the browser, or a script on someone's machine — never by the API.
 *
 * The API runs on Cloudflare Workers, whose free plan allows 10 ms of CPU per request; an argon2id hash costs
 * about half a second, so hashing on the server failed with error 1102. The browser has the time to spare, so
 * it derives a 32-byte key from the password and sends only that key. The API stores a salted SHA-256 of the
 * key (identity.password.js) — microseconds of work — and the expensive step still stands between a leaked
 * database and the passwords: guessing one means running argon2id for every guess.
 *
 * This file and frontend/src/features/auth/passwordKey.js MUST produce the same key: same parameters, same
 * salt, same encoding. Both test suites check the same test vector, so they cannot drift apart silently.
 * The salt is the account's email, which never changes (there is no API for it) and is different for
 * every account, so two staff with the same password still get different keys.
 */

/** OWASP's argon2id baseline: 19 MiB of memory, 2 passes, one lane, 32-byte key. */
export const PASSWORD_KEY_PARAMS = Object.freeze({ m: 19_456, t: 2, p: 1, dkLen: 32 });

export const passwordKeySalt = (email) => `vdesk-staff-password:${String(email).trim().toLowerCase()}`;

const toBase64Url = (bytes) => Buffer.from(bytes).toString('base64url');

/** The key the sign-in page sends instead of the password: base64url, 43 characters. */
export async function derivePasswordKey(email, password) {
  const key = await argon2idAsync(password, passwordKeySalt(email), { ...PASSWORD_KEY_PARAMS, asyncTick: 10 });
  return toBase64Url(key);
}
