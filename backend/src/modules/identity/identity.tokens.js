/**
 * Credentials: HS256 access tokens (jose) and opaque refresh tokens. Kept apart
 * from the service so the rules there read as rules, not crypto plumbing. (Google ID tokens are checked in
 * src/integrations/google.js.)
 * Stored password keys live in identity.password.js and are re-exported here, where their callers look for them.
 */
import { createHash, randomBytes } from 'node:crypto';
import { jwtVerify, SignJWT } from 'jose';
import { env } from '../../config/env.js';
import {
  ACCESS_TOKEN_TTL_SECONDS,
  CUSTOMER_ACCESS_TOKEN_TTL_SECONDS,
  JWT_AUDIENCE,
  JWT_ISSUER,
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

/** 15-minute session token. `typ` keeps it from being accepted where another kind of token belongs. */
export function signAccessToken(user) {
  return sign({ typ: 'access', role: user.role }, user.ref, ACCESS_TOKEN_TTL_SECONDS);
}

/** Portal session token. `typ: 'customer'` is why it can never be used on a staff route, and vice versa. */
export function signCustomerToken(customer) {
  return sign({ typ: 'customer' }, customer.ref, CUSTOMER_ACCESS_TOKEN_TTL_SECONDS);
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

// ── Setup codes ───────────────────────────────

// ── Refresh tokens ────────────────────────────

/** 256 random bits; the database only ever sees the SHA-256. */
export function generateRefreshToken() {
  return randomBytes(32).toString('base64url');
}

export function hashRefreshToken(token) {
  return createHash('sha256').update(token).digest('hex');
}
