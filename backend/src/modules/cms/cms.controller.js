/**
 * CMS controller — reads `req.validated`, calls cms.service.js, sends `{ data }`.
 * No business rules and no database access here.
 */
import { hasPermission } from '../identity/index.js';
import { PUBLIC_CACHE_SECONDS } from './cms.constants.js';
import * as cmsService from './cms.service.js';
import { buildSitemap } from './cms.sitemap.js';

const publicCache = (res) => res.set('Cache-Control', `public, max-age=${PUBLIC_CACHE_SECONDS}`);

// ── Public ────────────────────────────────────

/** GET /api/v1/content/:type — published FAQs, testimonials, guides (?category=), legal pages or trust claims. */
export async function listPublished(req, res) {
  const data = await cmsService.listPublished(req.validated.params.type, req.validated.query);
  publicCache(res).json({ data });
}

/** GET /api/v1/content/:type/:key */
export async function getPublished(req, res) {
  const { type, key } = req.validated.params;
  publicCache(res).json({ data: await cmsService.getPublished(type, key) });
}

/** GET /api/v1/content/seo?path= — the page's SEO override, or null. */
export async function getSeo(req, res) {
  publicCache(res).json({ data: await cmsService.getSeo(req.validated.query.path) });
}

/** GET /api/v1/content/sitemap.xml */
export async function sitemap(_req, res) {
  const xml = await buildSitemap();
  res.set({ 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' }).send(xml);
}

// ── Staff (content:manage) ────────────────────

export async function listEntries(req, res) {
  res.json({ data: await cmsService.listEntries(req.validated.params.type) });
}

export async function getEntry(req, res) {
  const { type, key } = req.validated.params;
  res.json({ data: await cmsService.getEntry(type, key) });
}

/** PUT /api/v1/content/admin/:type/:key — 201 when created, 200 when a draft is updated. */
export async function saveDraft(req, res) {
  const { type, key } = req.validated.params;
  const data = await cmsService.saveDraft(type, key, req.validated.body, req.actor);
  res.status(req.validated.body.version === undefined ? 201 : 200).json({ data });
}

export async function publish(req, res) {
  const { type, key } = req.validated.params;
  // The legacy admin key has full access; otherwise the signed-in role decides (identity PERMISSIONS).
  const canApprove = req.actor === 'admin-key' || hasPermission(req.user?.role, 'content:approve');
  res.json({ data: await cmsService.publish(type, key, req.validated.body, req.actor, { canApprove }) });
}

export async function unpublish(req, res) {
  const { type, key } = req.validated.params;
  res.json({ data: await cmsService.unpublish(type, key, req.actor) });
}

export async function deleteEntry(req, res) {
  const { type, key } = req.validated.params;
  await cmsService.deleteEntry(type, key, req.actor);
  res.status(204).end();
}

export async function listRevisions(req, res) {
  const { type, key } = req.validated.params;
  res.json({ data: await cmsService.listRevisions(type, key) });
}
