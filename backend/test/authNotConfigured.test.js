import { describe, expect, it, vi } from 'vitest';
import { isAuthConfigured, login, refreshSession } from '../src/modules/identity/identity.service.js';

// Needs JWT_SECRET / MFA_ENCRYPTION_KEY unset, which vitest.config.js sets for every other test.
vi.mock('../src/config/env.js', () => ({ env: { NODE_ENV: 'test', LOG_LEVEL: 'silent' } }));

describe('identity without secrets configured', () => {
  it('refuses sign-in with 503 AUTH_NOT_CONFIGURED instead of signing with an empty key', async () => {
    expect(isAuthConfigured()).toBe(false);
    await expect(login({ email: 'a@vdesk.in', password: 'whatever' })).rejects.toMatchObject({
      status: 503,
      code: 'AUTH_NOT_CONFIGURED',
    });
    await expect(refreshSession('token')).rejects.toMatchObject({ status: 503, code: 'AUTH_NOT_CONFIGURED' });
  });
});
