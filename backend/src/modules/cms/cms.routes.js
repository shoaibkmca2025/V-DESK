/**
 * CMS routes — mounted at /api/v1/content in src/routes.js.
 * Each route = path + middleware (validate, auth) + one controller function. No logic here.
 */
import { Router } from 'express';
import { validate } from '../../shared/middleware/validate.js';
import { requireStaff } from '../identity/index.js';
import * as controller from './cms.controller.js';
import {
  entryParams,
  publicEntryParams,
  publicListQuery,
  publicTypeParams,
  publishBody,
  saveBody,
  seoQuery,
  typeParams,
  validateContentData,
} from './cms.validation.js';

export const cmsRouter = Router();

// ── Fixed public paths (before /:type) ────────
cmsRouter.get('/sitemap.xml', controller.sitemap);
cmsRouter.get('/seo', validate({ query: seoQuery }), controller.getSeo);

// ── Staff (content:manage; publishing trust claims also needs content:approve) ──
const admin = Router();
admin.use(requireStaff('content:manage'));
admin.get('/:type', validate({ params: typeParams }), controller.listEntries);
admin.get('/:type/:key', validate({ params: entryParams }), controller.getEntry);
admin.put('/:type/:key', validate({ params: entryParams, body: saveBody }), validateContentData, controller.saveDraft);
admin.post('/:type/:key/publish', validate({ params: entryParams, body: publishBody }), controller.publish);
admin.post('/:type/:key/unpublish', validate({ params: entryParams }), controller.unpublish);
admin.delete('/:type/:key', validate({ params: entryParams }), controller.deleteEntry);
admin.get('/:type/:key/revisions', validate({ params: entryParams }), controller.listRevisions);
cmsRouter.use('/admin', admin);

// ── Public content ────────────────────────────
cmsRouter.get('/:type', validate({ params: publicTypeParams, query: publicListQuery }), controller.listPublished);
cmsRouter.get('/:type/:key', validate({ params: publicEntryParams }), controller.getPublished);
