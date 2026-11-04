/**
 * Credentials: HS256 access/MFA/setup tokens (jose), opaque refresh tokens and staff setup codes. Kept apart
 * from the service so the rules there read as rules, not crypto plumbing. (Google ID tokens are checked in
 * src/integrations/google.js.)
 * Stored password keys live in identity.password.js and are re-exported here, where their callers look for them.
 */
import { createHash, randomBytes, randomInt } from 'node:crypto';
import { jwtVerify, SignJWT } from 'jose';
import { env } from '../../config/env.js';
import {
  ACCESS_TOKEN_TTL_SECONDS,
  CUSTOMER_ACCESS_TOKEN_TTL_SECONDS,
  JWT_AUDIENCE,
  JWT_ISSUER,
  MFA_TOKEN_TTL_SECONDS,
  SETUP_CODE_ALPHABET,
  SETUP_CODE_LENGTH,
  SETUP_TOKEN_TTL_SECONDS,
} from './identity.constants.js';

// ── Passwords ─────────────────────────────────

export { hashPasswordKey, isLegacyPasswordHash, verifyAgainstDummy, verifyPasswordKey } from './identity.password.js';

// ── Signed tokens ─────────────────────────────

const secretKey = () => new TextEncoder().encode(env.JWT_SECRET);

async function sign(claims, subject, ttlSeconds) {
  return new SignJWT(claims)
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(subject)
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${ttlSeconds}s`)
    .sign(secretKey());
}

/** 15-minute session token. `typ` stops an MFA token being used as an access token and vice versa. */
export function signAccessToken(user) {
  return sign({ typ: 'access', role: user.role }, user.ref, ACCESS_TOKEN_TTL_SECONDS);
}

export function signMfaToken(user) {
  return sign({ typ: 'mfa' }, user.ref, MFA_TOKEN_TTL_SECONDS);
}

/** Portal session token. `typ: 'customer'` is why it can never be used on a staff route, and vice versa. */
export function signCustomerToken(customer) {
  return sign({ typ: 'customer' }, customer.ref, CUSTOMER_ACCESS_TOKEN_TTL_SECONDS);
}

/**
 * Proof that a setup code was just entered (ADR-012). It names the code it came from (`sch`, a prefix of the
 * code's hash), so a fresh code issued by an admin makes every earlier setup token useless.
 */
export function signSetupToken(user) {
  return sign({ typ: 'setup', sch: user.setupCodeHash.slice(0, 16) }, user.ref, SETUP_TOKEN_TTL_SECONDS);
}

async function verifiedPayload(token, typ) {
  try {
    const { payload } = await jwtVerify(token, secretKey(), {
      algorithms: ['HS256'],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });
    return payload.typ === typ && typeof payload.sub === 'string' ? payload : null;
  } catch {
    return null;
  }
}

/** Returns the user ref, or null for anything expired, tampered with or of the wrong type. */
export async function verifyToken(token, typ) {
  return (await verifiedPayload(token, typ))?.sub ?? null;
}

/** @returns {Promise<{ ref: string, codeHashPrefix: string } | null>} */
export async function verifySetupToken(token) {
  const payload = await verifiedPayload(token, 'setup');
  return payload && typeof payload.sch === 'string' ? { ref: payload.sub, codeHashPrefix: payload.sch } : null;
}

// ── Setup codes ───────────────────────────────

/** XXXX-XXXX-XXXX from an alphabet without look-alikes, so it survives being read out or copied by hand. */
export function generateSetupCode() {
  const chars = Array.from(
    { length: SETUP_CODE_LENGTH },
    () => SETUP_CODE_ALPHABET[randomInt(SETUP_CODE_ALPHABET.length)],
  );
  return chars.join('').match(/.{4}/g).join('-');
}

/**
 * Case, spaces and dashes don't matter when typing it back. A setup code is random, so a plain SHA-256 is a
 * safe way to store it — unlike a password a person chose, it can't be found by guessing common words.
 */
export function hashSetupCode(code) {
  const normalised = String(code).toUpperCase().replace(/[\s-]/g, '');
  return createHash('sha256').update(`setup:${normalised}`).digest('hex');
}

// ── Refresh tokens ────────────────────────────

/** 256 random bits; the database only ever sees the SHA-256. */
export function generateRefreshToken() {
  return randomBytes(32).toString('base64url');
}

export function hashRefreshToken(token) {
  return createHash('sha256').update(token).digest('hex');
}
