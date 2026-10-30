import { randomBytes, timingSafeEqual } from 'node:crypto';
import { argon2idAsync } from '@noble/hashes/argon2.js';

/**
 * Password hashing: argon2id, in the standard PHC string format (rules.md §19).
 *
 * The implementation is pure JavaScript (`@noble/hashes`, audited) rather than the native `argon2` addon,
 * because the API runs on Cloudflare Workers, which cannot load native addons — and cannot compile
 * WebAssembly at runtime either, which rules out the wasm builds (ADR-011).
 *
 * The *format* is what matters for portability: a stored hash carries its own parameters, so hashes made
 * by any argon2id implementation verify here, and hashes made here verify anywhere else. Moving back to a
 * Node host with the native addon would not invalidate a single password.
 *
 * Deriving a hash costs about half a second of CPU on purpose — that is the point of a password hash. It is
 * awaited, and `asyncTick` lets the event loop breathe between blocks, so one sign-in does not stall the
 * process.
 */

/** OWASP's argon2id baseline: 19 MiB of memory, 2 passes, one lane, 32-byte tag. */
export const ARGON2_PARAMS = Object.freeze({ m: 19_456, t: 2, p: 1, dkLen: 32 });
const VERSION = 0x13;
const SALT_BYTES = 16;
/** Yield to the event loop every few milliseconds while deriving. */
const ASYNC_TICK = 5;

const toBase64 = (bytes) => Buffer.from(bytes).toString('base64').replace(/=+$/, '');
const fromBase64 = (text) => Buffer.from(text, 'base64');

/** `$argon2id$v=19$m=19456,t=2,p=1$<salt>$<hash>` — the PHC string format. */
function encode({ salt, hash, m, t, p }) {
  return `$argon2id$v=${VERSION}$m=${m},t=${t},p=${p}$${toBase64(salt)}$${toBase64(hash)}`;
}

/** Reads a stored hash back. Returns null for anything this code did not produce. */
function decode(stored) {
  const match = /^\$argon2id\$v=(\d+)\$m=(\d+),t=(\d+),p=(\d+)\$([^$]+)\$([^$]+)$/.exec(stored ?? '');
  if (!match) return null;
  const [, version, m, t, p, salt, hash] = match;
  if (Number(version) !== VERSION) return null;
  return { m: Number(m), t: Number(t), p: Number(p), salt: fromBase64(salt), hash: fromBase64(hash) };
}

const derive = (password, salt, { m, t, p, dkLen }) =>
  argon2idAsync(password, salt, { m, t, p, dkLen, asyncTick: ASYNC_TICK });

export async function hashPassword(password) {
  const salt = randomBytes(SALT_BYTES);
  const hash = await derive(password, salt, ARGON2_PARAMS);
  return encode({ salt, hash, ...ARGON2_PARAMS });
}

/**
 * Checks a password against a stored hash, using the parameters the hash carries — so a hash made with
 * older or stronger settings still verifies.
 */
export async function verifyPassword(stored, password) {
  const parsed = decode(stored);
  if (!parsed) return false;
  const hash = await derive(password, parsed.salt, { ...parsed, dkLen: parsed.hash.length });
  // Same length by construction, so a constant-time comparison is safe to make here.
  return timingSafeEqual(Buffer.from(hash), parsed.hash);
}

/*
 * Verifying against a throwaway hash when the email is unknown keeps "no such user" and "wrong password"
 * equally slow, so response time doesn't reveal which staff emails exist.
 */
let dummyHash;
export async function verifyAgainstDummy(password) {
  dummyHash ??= await hashPassword(randomBytes(16).toString('hex'));
  await verifyPassword(dummyHash, password);
  return false;
}
