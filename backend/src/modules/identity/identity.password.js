import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

/**
 * Stored staff passwords (ADR-013): the API never sees a password, only the 32-byte key the sign-in page derived
 * from it with argon2id (identity.passwordKey.js). What is stored is a salted SHA-256 of that key, in a PHC-like
 * string: `$vdk-key$v=1$<salt>$<hash>`.
 *
 * Checking one costs microseconds, so staff sign-in fits Cloudflare Workers' free plan (10 ms of CPU). It is
 * still a proper password store: the key is already the output of a slow hash, so a leaked table gives an
 * attacker nothing faster to attack than argon2id itself; and the per-account random salt here means equal keys
 * never look equal in the table.
 *
 * Hashes made before ADR-013 (`$argon2id$…`, hashed on the server from the plain password) cannot be checked
 * against a key. Those accounts need a new setup code (`isLegacyPasswordHash`).
 */

const PREFIX = '$vdk-key$v=1$';
const SALT_BYTES = 16;

const digest = (salt, passwordKey) => createHash('sha256').update(salt).update(passwordKey, 'utf8').digest();

export function hashPasswordKey(passwordKey) {
  const salt = randomBytes(SALT_BYTES);
  return `${PREFIX}${salt.toString('base64url')}$${digest(salt, passwordKey).toString('base64url')}`;
}

/** Constant-time check of a key against a stored hash. False for anything this file did not produce. */
export function verifyPasswordKey(stored, passwordKey) {
  if (typeof stored !== 'string' || !stored.startsWith(PREFIX) || typeof passwordKey !== 'string') return false;
  const [salt, hash] = stored.slice(PREFIX.length).split('$');
  if (!salt || !hash) return false;
  const expected = Buffer.from(hash, 'base64url');
  const actual = digest(Buffer.from(salt, 'base64url'), passwordKey);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

/** A password hashed on the server from the plain password, before ADR-013. */
export function isLegacyPasswordHash(stored) {
  return typeof stored === 'string' && stored.startsWith('$argon2id$');
}

/*
 * The same work for an unknown email as for a wrong password, so the answer's timing does not reveal which staff
 * emails exist. (It is microseconds either way now, but the two paths should stay alike.)
 *
 * Built on first use, not at import: Workers forbids generating random values in global scope, so a module-level
 * `randomBytes` here fails the deployment outright (error 10021).
 */
let dummyHash;
export function verifyAgainstDummy(passwordKey) {
  dummyHash ??= hashPasswordKey(randomBytes(32).toString('base64url'));
  verifyPasswordKey(dummyHash, passwordKey ?? '');
  return false;
}
