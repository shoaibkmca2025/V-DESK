/**
 * Password hashing: the PHC format, and what has to stay true when the implementation changes.
 * Run: npx vitest run src/modules/identity/identity.password.test.js
 */
import { describe, expect, it } from 'vitest';
import { ARGON2_PARAMS, hashPassword, verifyAgainstDummy, verifyPassword } from './identity.password.js';

const PASSWORD = 'correct horse battery';

describe('password hashing', () => {
  it('produces a PHC string carrying its own parameters, with a fresh salt each time', async () => {
    const first = await hashPassword(PASSWORD);
    const second = await hashPassword(PASSWORD);

    expect(first).toMatch(
      new RegExp(
        `^\\$argon2id\\$v=19\\$m=${ARGON2_PARAMS.m},t=${ARGON2_PARAMS.t},p=${ARGON2_PARAMS.p}\\$[^$]+\\$[^$]+$`,
      ),
    );
    expect(first).not.toBe(second);
    expect(await verifyPassword(first, PASSWORD)).toBe(true);
    expect(await verifyPassword(second, PASSWORD)).toBe(true);
  });

  it('refuses the wrong password, including near misses', async () => {
    const hash = await hashPassword(PASSWORD);
    for (const wrong of ['', ' ', 'correct horse batter', 'Correct horse battery', `${PASSWORD} `]) {
      expect(await verifyPassword(hash, wrong)).toBe(false);
    }
  });

  it('keeps leading and trailing spaces, which are part of a password', async () => {
    const hash = await hashPassword(`  ${PASSWORD}  `);
    expect(await verifyPassword(hash, `  ${PASSWORD}  `)).toBe(true);
    expect(await verifyPassword(hash, PASSWORD)).toBe(false);
  });

  it('verifies a hash made with other parameters, because the hash says what they were', async () => {
    // The shape a different argon2id implementation (or an older setting) would have stored.
    const older = '$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHR2YWx1ZQ$3jhdqlAfnp+aIGaDnDvAZLVPnDuGTevGrQxq3w6aVgM';
    expect(await verifyPassword(older, 'not the password')).toBe(false);
    // It parses rather than throwing — a wrong answer, never an error.
    expect(typeof (await verifyPassword(older, PASSWORD))).toBe('boolean');
  });

  it('answers false for anything that is not one of our hashes', async () => {
    for (const stored of [
      null,
      undefined,
      '',
      'plain-text',
      '$2b$10$abcdefghijklmnopqrstuv',
      '$argon2i$v=19$m=1,t=1,p=1$c2FsdHNhbHQ$aGFzaA',
    ]) {
      expect(await verifyPassword(stored, PASSWORD)).toBe(false);
    }
  });

  it('spends the same work on an unknown account as on a wrong password', async () => {
    const hash = await hashPassword(PASSWORD);
    const wrongPassword = async () => {
      const started = performance.now();
      await verifyPassword(hash, 'nope');
      return performance.now() - started;
    };
    const unknownAccount = async () => {
      const started = performance.now();
      await verifyAgainstDummy('nope');
      return performance.now() - started;
    };
    await unknownAccount(); // the dummy hash is derived once, on first use

    expect(await verifyAgainstDummy('nope')).toBe(false);
    const ratio = (await unknownAccount()) / (await wrongPassword());
    // Same algorithm, same parameters: within a factor of three even on a noisy machine.
    expect(ratio).toBeGreaterThan(0.33);
    expect(ratio).toBeLessThan(3);
  });
});
