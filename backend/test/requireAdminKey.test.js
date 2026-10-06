import { describe, expect, it, vi } from 'vitest';
import { requireAdminKey } from '../src/shared/middleware/requireAdminKey.js';

// The happy path and wrong-key cases are covered through /api/v1/leads in crm.test.js; this file covers the
// server-side misconfiguration, which needs ADMIN_API_KEY to be unset.
vi.mock('../src/config/env.js', () => ({ env: { ADMIN_API_KEY: undefined } }));

describe('requireAdminKey', () => {
  it('refuses with 503 ADMIN_AUTH_NOT_CONFIGURED when no key is configured, even if one is sent', () => {
    const next = vi.fn();
    requireAdminKey({ get: () => 'anything-at-all-long-enough' }, {}, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 503, code: 'ADMIN_AUTH_NOT_CONFIGURED' }));
  });
});
