/**
 * Catalog routes — mounted at /api/v1/catalog in src/routes.js.
 * Each route = path + validate() middleware + one controller function. No logic here.
 */
import { Router } from 'express';
import { validate } from '../../shared/middleware/validate.js';
import * as controller from './catalog.controller.js';
import {
  centreRefParams,
  citySlugParams,
  listCentresQuery,
  listWorkspacesQuery,
  workspaceRefParams,
} from './catalog.validation.js';

export const catalogRouter = Router();

// ── Bundle ────────────────────────────────────
/** Full catalog bundle — replaces the static catalogStore.js on the frontend. */
catalogRouter.get('/', controller.getBundle);

// ── Cities ────────────────────────────────────
catalogRouter.get('/cities', controller.listCities);
catalogRouter.get('/cities/:slug', validate({ params: citySlugParams }), controller.getCity);

// ── Centres ───────────────────────────────────
catalogRouter.get('/centres', validate({ query: listCentresQuery }), controller.listCentres);
catalogRouter.get('/centres/:ref', validate({ params: centreRefParams }), controller.getCentre);

// ── Workspaces ────────────────────────────────
catalogRouter.get('/workspaces', validate({ query: listWorkspacesQuery }), controller.listWorkspaces);
catalogRouter.get('/workspaces/:ref', validate({ params: workspaceRefParams }), controller.getWorkspace);
