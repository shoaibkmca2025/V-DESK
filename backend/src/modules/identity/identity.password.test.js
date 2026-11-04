/**
 * Staff password storage (ADR-013): the browser's argon2id key derivation, and the API's cheap salted check of
 * the key. Run: npx vitest run src/modules/identity/identity.password.test.js
 */
import { describe, expect, it } from 'vitest';
import { hashPasswordKey, isLegacyPasswordHash, verifyAgainstDummy, verifyPasswordKey } from './identity.password.js';
import { derivePasswordKey, PASSWORD_KEY_PARAMS, passwordKeySalt } from './identity.passwordKey.js';

/*
 * The same vector is checked in frontend/src/__tests__/passwordKey.test.js. If either side changes its
 * parameters, salt or encoding, one of the two tests fails — instead of every staff member being locked out.
 */
const VECTOR = {
  email: ' Asha@VDESK.in ',
  password: 'correct horse battery 42',
  // Cross-checked with Node's own argon2 (crypto.argon2Sync), an implementation independent of @noble/hashes.
  key: 'u3SEnVGIztJZQZ64eCUWuFls5ciW0KnJqLromGXkR7Q',
};

describe('derivePasswordKey (the browser half)', () => {
  it('matches the shared test vector', async () => {
    expect(PASSWORD_KEY_PARAMS).toEqual({ m: 19_456, t: 2, p: 1, dkLen: 32 });
    expect(passwordKeySalt(VECTOR.email)).toBe('vdesk-staff-password:asha@vdesk.in');
    expect(await derivePasswordKey(VECTOR.email, VECTOR.password)).toBe(VECTOR.key);
  });

  it('differs per account and per password', async () => {
    const key = await derivePasswordKey('a@vdesk.in', 'correct horse battery 42');
    expect(key).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(await derivePasswordKey('b@vdesk.in', 'correct horse battery 42')).not.toBe(key);
    expect(await derivePasswordKey('a@vdesk.in', 'correct horse battery 43')).not.toBe(key);
  });
});

describe('hashPasswordKey / verifyPasswordKey (the API half)', () => {
  const KEY = 'k'.repeat(43);

  it('salts every hash and verifies only the same key', () => {
    const first = hashPasswordKey(KEY);
    const second = hashPasswordKey(KEY);
    expect(first).toMatch(/^\$vdk-key\$v=1\$[A-Za-z0-9_-]{22}\$[A-Za-z0-9_-]{43}$/);
    expect(first).not.toBe(second);
    expect(verifyPasswordKey(first, KEY)).toBe(true);
    expect(verifyPasswordKey(second, KEY)).toBe(true);
    for (const wrong of ['j'.repeat(43), `${KEY}x`, '', undefined]) expect(verifyPasswordKey(first, wrong)).toBe(false);
  });

  it('never matches a malformed, legacy or missing hash', () => {
    for (const stored of [
      null,
      '',
      '$vdk-key$v=1$',
      '$vdk-key$v=1$abc',
      '$argon2id$v=19$m=19456,t=2,p=1$c2FsdA$aGFzaA',
    ]) {
      expect(verifyPasswordKey(stored, KEY)).toBe(false);
    }
    expect(isLegacyPasswordHash('$argon2id$v=19$m=19456,t=2,p=1$c2FsdA$aGFzaA')).toBe(true);
    expect(isLegacyPasswordHash(hashPasswordKey(KEY))).toBe(false);
    expect(verifyAgainstDummy(KEY)).toBe(false);
  });

  it('is cheap enough for the Workers free plan (10 ms of CPU per request)', () => {
    const stored = hashPasswordKey(KEY);
    const started = performance.now();
    for (let i = 0; i < 100; i++) verifyPasswordKey(stored, KEY);
    expect((performance.now() - started) / 100).toBeLessThan(1);
  });
});
