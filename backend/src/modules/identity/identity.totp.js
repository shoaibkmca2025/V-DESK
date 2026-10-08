/**
 * TOTP (RFC 6238, SHA-1, 6 digits, 30 s) and encryption of the shared secret at rest.
 * Built on node:crypto so there is no extra dependency; the RFC test vectors live in identity.totp.test.js.
 */
import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { TOTP_DIGITS, TOTP_ISSUER, TOTP_PERIOD_SECONDS, TOTP_WINDOW } from './identity.constants.js';

const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function base32Encode(buffer) {
  let bits = 0;
  let value = 0;
  let out = '';
  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += BASE32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += BASE32[(value << (5 - bits)) & 31];
  return out;
}

export function base32Decode(text) {
  const clean = text.replace(/[\s=]/g, '').toUpperCase();
  let bits = 0;
  let value = 0;
  const bytes = [];
  for (const char of clean) {
    const index = BASE32.indexOf(char);
    if (index === -1) throw new Error('invalid base32');
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

/** 160-bit secret, the size RFC 4226 recommends for HMAC-SHA1. */
export function generateTotpSecret() {
  return base32Encode(randomBytes(20));
}

/** HOTP value for one counter step (RFC 4226 §5.3). */
export function hotp(secretBase32, counter, digits = TOTP_DIGITS) {
  const message = Buffer.alloc(8);
  message.writeBigUInt64BE(BigInt(counter));
  const hmac = createHmac('sha1', base32Decode(secretBase32)).update(message).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const binary = hmac.readUInt32BE(offset) & 0x7fffffff;
  return String(binary % 10 ** digits).padStart(digits, '0');
}

export function totpStep(timeMs = Date.now()) {
  return Math.floor(timeMs / 1000 / TOTP_PERIOD_SECONDS);
}

/**
 * Returns the matched time step, or null. Callers store the step and refuse it (or older) next time,
 * so a code seen over someone's shoulder can't be replayed within its 30 seconds.
 */
export function verifyTotp(secretBase32, code, { timeMs = Date.now(), afterStep = -1 } = {}) {
  if (!/^\d{6}$/.test(code)) return null;
  const current = totpStep(timeMs);
  for (let step = current - TOTP_WINDOW; step <= current + TOTP_WINDOW; step++) {
    if (step <= afterStep) continue;
    if (timingSafeEqual(Buffer.from(hotp(secretBase32, step)), Buffer.from(code))) return step;
  }
  return null;
}

/** The URI authenticator apps (Google Authenticator, Authy, 1Password…) read from a QR code. */
export function otpauthUrl(secretBase32, accountName) {
  const label = encodeURIComponent(`${TOTP_ISSUER}:${accountName}`);
  const params = new URLSearchParams({
    secret: secretBase32,
    issuer: TOTP_ISSUER,
    digits: String(TOTP_DIGITS),
    period: String(TOTP_PERIOD_SECONDS),
  });
  return `otpauth://totp/${label}?${params}`;
}

// ──────────────────────────────────────────────
// Secret encryption (AES-256-GCM) — a database dump alone must not yield working MFA secrets
// ──────────────────────────────────────────────

const keyFrom = (material) => createHash('sha256').update(material).digest();

/** → "iv.tag.ciphertext" (base64url parts). */
export function encryptSecret(plaintext, keyMaterial) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', keyFrom(keyMaterial), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  return [iv, cipher.getAuthTag(), ciphertext].map((part) => part.toString('base64url')).join('.');
}

export function decryptSecret(sealed, keyMaterial) {
  const [iv, tag, ciphertext] = sealed.split('.').map((part) => Buffer.from(part, 'base64url'));
  const decipher = createDecipheriv('aes-256-gcm', keyFrom(keyMaterial), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
}
