/**
 * CMS — public content, the seed script and sitemap.xml. Staff editing is in cms.admin.test.js.
 * SITE_URL comes from vitest.config.js.
 * Run: npx vitest run src/modules/cms/cms.test.js
 */
import request from 'supertest';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { FAQ_GROUPS } from '../../../../frontend/src/data/faqs.js';
import { GUIDES } from '../../../../frontend/src/data/guides.js';
import { TESTIMONIALS } from '../../../../frontend/src/data/testimonials.js';
import { createApp } from '../../app.js';
import { seedContent } from '../../../scripts/seed-content.js';
import { seedSearch } from '../../../scripts/seed-search.js';
import { clearTestDb, startTestDb, stopTestDb } from '../../../test/db.js';
import { ADMIN_KEY } from '../../../test/staff.js';
import { City } from '../catalog/catalog.model.js';

const app = createApp();
const get = (path) => request(app).get(`/api/v1/content${path}`);
const admin = (method, path) => request(app)[method](`/api/v1/content/admin${path}`).set('x-admin-key', ADMIN_KEY);

beforeAll(startTestDb);
afterEach(clearTestDb);
afterAll(stopTestDb);

describe('seeded content, served in the frontend shapes', () => {
  beforeEach(seedContent);

  it('creates everything once and leaves it alone on a re-run', async () => {
    expect(await seedContent()).toEqual({});
    const claims = (await admin('get', '/trust-claims')).body.data;
    expect(claims).toHaveLength(6);
    expect(claims.every((claim) => claim.published === null)).toBe(true);
  });

  it('FAQs equal data/faqs.js FAQ_GROUPS', async () => {
    const res = await get('/faqs');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(FAQ_GROUPS);
    expect(res.headers['cache-control']).toBe('public, max-age=300');
    expect(res.headers.etag).toBeTruthy();
  });

  it('testimonials equal data/testimonials.js, plus a key', async () => {
    const res = await get('/testimonials');
    expect(res.body.data.map(({ key: _key, ...rest }) => rest)).toEqual(TESTIMONIALS);
    expect(res.body.data[0].key).toBe('priya-kulkarni');
  });

  it('guides newest first, by category, and one by slug', async () => {
    const all = (await get('/guides')).body.data;
    expect(all).toHaveLength(GUIDES.length);
    const dates = all.map((guide) => guide.date);
    expect(dates).toEqual([...dates].sort().reverse());

    const gst = (await get('/guides?category=gst')).body.data;
    expect(gst.length).toBeGreaterThan(0);
    expect(gst.every((guide) => guide.category === 'GST')).toBe(true);

    const one = await get(`/guides/${GUIDES[0].slug}`);
    expect(one.body.data).toEqual(GUIDES[0]);
  });

  it('legal pages keep their HTML; drafts and unknown keys are 404', async () => {
    const privacy = (await get('/legal/privacy')).body.data;
    expect(privacy).toMatchObject({
      key: 'privacy',
      title: 'Privacy Policy & Data Protection',
      lastUpdated: '2026-09-15',
    });
    expect(privacy.content).toContain('<h4>1. Information Governance');
    expect(privacy.content).toContain('<li><strong>KYC &amp; Statutory Records:</strong>');

    expect((await get('/legal/cookies')).body.error.code).toBe('CONTENT_NOT_FOUND');
    expect((await get('/trust-claims')).body.data).toEqual([]);
    expect((await get('/trust-claims/businesses-served')).status).toBe(404);
  });

  it('rejects unknown content types', async () => {
    expect((await get('/blog')).status).toBe(400);
  });
});

describe('SEO overrides', () => {
  it('serves the published override for a path, or null', async () => {
    await admin('put', `/seo/${encodeURIComponent('/virtual-office')}`).send({
      data: {
        title: 'Virtual Office in India from ₹999/mo | V-DESK',
        description: 'GST-ready business address in 10+ cities.',
      },
    });
    await admin('post', `/seo/${encodeURIComponent('/virtual-office')}/publish`).send({ version: 1 });

    const res = await get('/seo?path=/virtual-office');
    expect(res.body.data).toEqual({
      path: '/virtual-office',
      title: 'Virtual Office in India from ₹999/mo | V-DESK',
      description: 'GST-ready business address in 10+ cities.',
      noindex: false,
    });
    expect((await get('/seo?path=/pricing')).body.data).toBeNull();
    expect((await get('/seo?path=not-a-path')).status).toBe(400);
  });
});

describe('sitemap.xml', () => {
  it('lists static pages, cities, services, guides and legal pages, minus noindex', async () => {
    await City.create({ ref: 'CITY-NSK', slug: 'nashik', name: 'Nashik', state: 'Maharashtra', tier: 'Tier-2' });
    await seedSearch();
    await seedContent();
    await admin('put', `/seo/${encodeURIComponent('/pricing')}`).send({
      data: { title: 'Pricing', description: 'Hidden from search', noindex: true },
    });
    await admin('post', `/seo/${encodeURIComponent('/pricing')}/publish`).send({ version: 1 });

    const res = await get('/sitemap.xml');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('application/xml; charset=utf-8');
    const xml = res.text;
    expect(xml).toMatch(
      /^<\?xml version="1.0" encoding="UTF-8"\?>\n<urlset xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9">/,
    );
    for (const path of [
      '/',
      '/virtual-office',
      '/locations/nashik',
      '/workspaces/nashik',
      '/locations/nashik/coworking',
      '/services/gst-registration',
      '/legal/refund-policy',
    ]) {
      expect(xml).toContain(`<loc>https://vdesk.test${path}</loc>`);
    }
    expect(xml).toContain(
      `<loc>https://vdesk.test/resources/${GUIDES[0].slug}</loc><lastmod>${GUIDES[0].date}</lastmod>`,
    );
    expect(xml).not.toContain('<loc>https://vdesk.test/pricing</loc>');
    expect(xml.match(/<loc>https:\/\/vdesk.test\/<\/loc>/g)).toHaveLength(1);
  });
});
