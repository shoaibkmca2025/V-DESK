import { describe, expect, it, vi } from 'vitest';
import { buildSitemap } from '../src/modules/cms/cms.sitemap.js';

// Needs SITE_URL unset, which vitest.config.js sets for the other tests.
vi.mock('../src/config/env.js', () => ({ env: { NODE_ENV: 'test', LOG_LEVEL: 'silent' } }));

describe('sitemap without SITE_URL', () => {
  it('answers 503 SITEMAP_NOT_CONFIGURED instead of emitting links to an unknown host', async () => {
    await expect(buildSitemap()).rejects.toMatchObject({ status: 503, code: 'SITEMAP_NOT_CONFIGURED' });
  });
});
