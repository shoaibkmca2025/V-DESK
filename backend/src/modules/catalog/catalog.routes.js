/**
 * Catalog routes — mounted at /api/v1/catalog in src/routes.js.
 * Each route = path + validate() middleware + one controller function. No logic here.
 */
import { Router } from 'express';
import { validate } from '../../shared/middleware/validate.js';
import { requireStaff } from '../identity/index.js';
import * as controller from './catalog.controller.js';
import {
  centreRefParams,
  citySlugAdminParams,
  citySlugParams,
  createCentreBody,
  createCityBody,
  createWorkspaceBody,
  listCentresAdminQuery,
  listCentresQuery,
  listWorkspacesAdminQuery,
  listWorkspacesQuery,
  refAdminParams,
  updateCentreBody,
  updateCityBody,
  updateWorkspaceBody,
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

// ── Staff (catalog:manage) ────────────────────
const admin = Router();
admin.use(requireStaff('catalog:manage'));

admin.get('/cities', controller.listCitiesForStaff);
admin.post('/cities', validate({ body: createCityBody }), controller.createCity);
admin.patch('/cities/:slug', validate({ params: citySlugAdminParams, body: updateCityBody }), controller.updateCity);
admin.delete('/cities/:slug', validate({ params: citySlugAdminParams }), controller.deleteCity);

admin.get('/centres', validate({ query: listCentresAdminQuery }), controller.listCentresForStaff);
admin.post('/centres', validate({ body: createCentreBody }), controller.createCentre);
admin.patch('/centres/:ref', validate({ params: refAdminParams, body: updateCentreBody }), controller.updateCentre);
admin.delete('/centres/:ref', validate({ params: refAdminParams }), controller.deleteCentre);

admin.get('/workspaces', validate({ query: listWorkspacesAdminQuery }), controller.listWorkspacesForStaff);
admin.post('/workspaces', validate({ body: createWorkspaceBody }), controller.createWorkspace);
admin.patch(
  '/workspaces/:ref',
  validate({ params: refAdminParams, body: updateWorkspaceBody }),
  controller.updateWorkspace,
);
admin.delete('/workspaces/:ref', validate({ params: refAdminParams }), controller.deleteWorkspace);

catalogRouter.use('/admin', admin);
