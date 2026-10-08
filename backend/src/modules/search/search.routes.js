/**
 * Search routes — mounted at /api/v1/search in src/routes.js.
 * Each route = path + middleware (validate, auth) + one controller function. No logic here.
 */
import { Router } from 'express';
import { validate } from '../../shared/middleware/validate.js';
import { requireStaff } from '../identity/index.js';
import * as controller from './search.controller.js';
import {
  configKeyParams,
  createConfigBody,
  createRedirectBody,
  redirectRefParams,
  searchQuery,
  suggestQuery,
  updateConfigBody,
  updateRedirectBody,
  validateConfigValue,
} from './search.validation.js';

export const searchRouter = Router();

// ── Public (read-only) ────────────────────────
searchRouter.get('/', validate({ query: searchQuery }), controller.search);
searchRouter.get('/suggest', validate({ query: suggestQuery }), controller.suggest);
searchRouter.get('/popular', controller.popular);

// ── Staff (Bearer token with search:manage, or x-admin-key during the switch-over) ──
const admin = Router();
admin.use(requireStaff('search:manage'));

admin.get('/synonyms', controller.listSynonyms);

admin.get('/redirects', controller.listRedirects);
admin.post('/redirects', validate({ body: createRedirectBody }), controller.createRedirect);
admin.patch(
  '/redirects/:ref',
  validate({ params: redirectRefParams, body: updateRedirectBody }),
  controller.updateRedirect,
);
admin.delete('/redirects/:ref', validate({ params: redirectRefParams }), controller.deleteRedirect);

admin.get('/config', controller.listConfig);
admin.post('/config', validate({ body: createConfigBody }), controller.createConfig);
admin.patch(
  '/config/:key',
  validate({ params: configKeyParams, body: updateConfigBody }),
  validateConfigValue,
  controller.updateConfig,
);
admin.delete('/config/:key', validate({ params: configKeyParams }), controller.deleteConfig);

searchRouter.use('/admin', admin);
