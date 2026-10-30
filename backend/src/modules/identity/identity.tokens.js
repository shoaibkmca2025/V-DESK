/**
 * Credentials: argon2id password hashes, HS256 access/MFA tokens (jose) and opaque refresh tokens.
 * Kept apart from the service so the rules there read as rules, not crypto plumbing.
 */
import { createHash, randomBytes, randomInt } from 'node:crypto';
import argon2 from 'argon2';
import { jwtVerify, SignJWT } from 'jose';
import { env } from '../../config/env.js';
import {
  ACCESS_TOKEN_TTL_SECONDS,
  CUSTOMER_ACCESS_TOKEN_TTL_SECONDS,
  JWT_AUDIENCE,
  JWT_ISSUER,
  MFA_TOKEN_TTL_SECONDS,
  OTP_LENGTH,
} from './identity.constants.js';

// ── Passwords ─────────────────────────────────

export function hashPassword(password) {
  return argon2.hash(password, { type: argon2.argon2id });
}

export function verifyPassword(hash, password) {
  return argon2.verify(hash, password);
}

// Verifying against a throwaway hash when the email is unknown keeps "no such user" and "wrong password"
// equally slow, so response time doesn't reveal which staff emails exist.
let dummyHash;
export async function verifyAgainstDummy(password) {
  dummyHash ??= await hashPassword(randomBytes(16).toString('hex'));
  await argon2.verify(dummyHash, password);
  return false;
}

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

/** Returns the user ref, or null for anything expired, tampered with or of the wrong type. */
export async function verifyToken(token, typ) {
  try {
    const { payload } = await jwtVerify(token, secretKey(), {
      algorithms: ['HS256'],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });
    return payload.typ === typ && typeof payload.sub === 'string' ? payload.sub : null;
  } catch {
    return null;
  }
}

// ── Refresh tokens ────────────────────────────

/** 256 random bits; the database only ever sees the SHA-256. */
export function generateRefreshToken() {
  return randomBytes(32).toString('base64url');
}

export function hashRefreshToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

// ── Phone OTP ─────────────────────────────────

/** A uniformly random 6-digit code — randomInt, never Math.random. */
export function generateOtpCode() {
  return String(randomInt(0, 10 ** OTP_LENGTH)).padStart(OTP_LENGTH, '0');
}

/**
 * Codes are stored hashed, peppered with JWT_SECRET and bound to the mobile number: a leaked database is
 * not a list of working codes, and a hash lifted from one row cannot be replayed against another number.
 */
export function hashOtp(mobile, code) {
  return createHash('sha256').update(`${mobile}:${code}:${env.JWT_SECRET}`).digest('hex');
}
