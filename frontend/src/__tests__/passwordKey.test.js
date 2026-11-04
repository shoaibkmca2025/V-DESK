import { describe, expect, it } from 'vitest';
import { derivePasswordKey, PASSWORD_KEY_PARAMS, passwordKeySalt } from '@/features/auth/passwordKey.js';

/*
 * The same vector is checked in backend/src/modules/identity/identity.password.test.js (and was cross-checked with
 * Node's own argon2). If this page and the API's scripts ever derive different keys, one of the two tests fails —
 * instead of every staff member finding their password "wrong".
 */
const VECTOR = {
  email: ' Asha@VDESK.in ',
  password: 'correct horse battery 42',
  key: 'u3SEnVGIztJZQZ64eCUWuFls5ciW0KnJqLromGXkR7Q',
};

describe('staff password key (ADR-013)', () => {
  it('matches the vector shared with the backend', async () => {
    expect(PASSWORD_KEY_PARAMS).toEqual({ m: 19_456, t: 2, p: 1, dkLen: 32 });
    expect(passwordKeySalt(VECTOR.email)).toBe('vdesk-staff-password:asha@vdesk.in');
    expect(await derivePasswordKey(VECTOR.email, VECTOR.password)).toBe(VECTOR.key);
  }, 20_000);
});
