import { createHash } from 'node:crypto';

/**
 * A stand-in for the key the sign-in page derives from a password (ADR-013), for integration tests.
 *
 * The API only ever sees the key and cannot tell how it was made, so tests skip the half-second argon2id run and
 * use a SHA-256 of email + password instead — same shape (43 base64url characters), same "different per account
 * and per password". The real derivation is tested on its own, against a vector shared with the frontend
 * (src/modules/identity/identity.password.test.js).
 */
export function testPasswordKey(email, password) {
  return createHash('sha256').update(`${email.trim().toLowerCase()}\n${password}`).digest('base64url');
}
