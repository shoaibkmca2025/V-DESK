/**
 * Identity — unit tests for TOTP, base32 and secret encryption (no database).
 * Run: npx vitest run src/modules/identity/identity.totp.test.js
 */
import { describe, expect, it } from 'vitest';
import {
  base32Decode,
  base32Encode,
  decryptSecret,
  encryptSecret,
  generateTotpSecret,
  hotp,
  otpauthUrl,
  totpStep,
  verifyTotp,
} from './identity.totp.js';

// RFC 6238 Appendix B (SHA-1): ASCII secret "12345678901234567890", 8 digits.
const RFC_SECRET = base32Encode(Buffer.from('12345678901234567890'));
const RFC_VECTORS = [
  [59, '94287082'],
  [1111111109, '07081804'],
  [1111111111, '14050471'],
  [1234567890, '89005924'],
  [2000000000, '69279037'],
  [20000000000, '65353130'],
];

describe('identity TOTP', () => {
  it.each(RFC_VECTORS)('matches the RFC 6238 vector at t=%i', (seconds, expected) => {
    expect(hotp(RFC_SECRET, totpStep(seconds * 1000), 8)).toBe(expected);
  });

  it('round-trips base32 and rejects characters outside the alphabet', () => {
    const bytes = Buffer.from([0, 1, 2, 250, 251, 252, 253, 254, 255]);
    expect(base32Decode(base32Encode(bytes))).toEqual(bytes);
    expect(base32Encode(Buffer.from('foobar'))).toBe('MZXW6YTBOI');
    expect(() => base32Decode('NOT-BASE32!')).toThrow();
  });

  it('generates 160-bit secrets', () => {
    expect(base32Decode(generateTotpSecret())).toHaveLength(20);
  });

  it('accepts the current, previous and next step but nothing further', () => {
    const secret = generateTotpSecret();
    const now = 1_700_000_000_000;
    const step = totpStep(now);
    expect(verifyTotp(secret, hotp(secret, step), { timeMs: now })).toBe(step);
    expect(verifyTotp(secret, hotp(secret, step - 1), { timeMs: now })).toBe(step - 1);
    expect(verifyTotp(secret, hotp(secret, step + 1), { timeMs: now })).toBe(step + 1);
    expect(verifyTotp(secret, hotp(secret, step - 2), { timeMs: now })).toBeNull();
    expect(verifyTotp(secret, hotp(secret, step + 2), { timeMs: now })).toBeNull();
  });

  it('refuses a step at or before the last one used (replay)', () => {
    const secret = generateTotpSecret();
    const now = 1_700_000_000_000;
    const step = totpStep(now);
    expect(verifyTotp(secret, hotp(secret, step), { timeMs: now, afterStep: step })).toBeNull();
    expect(verifyTotp(secret, hotp(secret, step), { timeMs: now, afterStep: step - 1 })).toBe(step);
  });

  it('rejects malformed codes without throwing', () => {
    const secret = generateTotpSecret();
    for (const code of ['', '12345', '1234567', 'abcdef', '12 345']) expect(verifyTotp(secret, code)).toBeNull();
  });

  it('builds an otpauth URL authenticator apps can read', () => {
    const url = new URL(otpauthUrl('JBSWY3DPEHPK3PXP', 'ops@vdesk.in'));
    expect(url.protocol).toBe('otpauth:');
    expect(url.host).toBe('totp');
    expect(decodeURIComponent(url.pathname)).toBe('/V-DESK:ops@vdesk.in');
    expect(url.searchParams.get('secret')).toBe('JBSWY3DPEHPK3PXP');
    expect(url.searchParams.get('issuer')).toBe('V-DESK');
  });

  it('encrypts secrets so they only open with the same key', () => {
    const sealed = encryptSecret('JBSWY3DPEHPK3PXP', 'key-one-0123456789-0123456789-abcd');
    expect(sealed).not.toContain('JBSWY3DPEHPK3PXP');
    expect(decryptSecret(sealed, 'key-one-0123456789-0123456789-abcd')).toBe('JBSWY3DPEHPK3PXP');
    expect(() => decryptSecret(sealed, 'key-two-0123456789-0123456789-abcd')).toThrow();
    // A fresh IV each time: the same secret never encrypts to the same text twice.
    expect(encryptSecret('JBSWY3DPEHPK3PXP', 'k'.repeat(32))).not.toBe(
      encryptSecret('JBSWY3DPEHPK3PXP', 'k'.repeat(32)),
    );
  });
});
