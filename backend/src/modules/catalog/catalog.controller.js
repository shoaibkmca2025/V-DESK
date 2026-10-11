/**
 * Catalog controller — reads `req.validated`, calls catalog.service.js, sends `{ data }`.
 * No business rules and no database access here (rules.md §2, §3).
 * Express 5 propagates async errors automatically — no try/catch needed.
 */
import * as adminService from './catalog.admin.service.js';
import * as catalogService from './catalog.service.js';

// ──────────────────────────────────────────────
// Bundle
// ──────────────────────────────────────────────

/** GET /api/v1/catalog — full catalog bundle (cities + centres + workspaces). */
export async function getBundle(_req, res) {
  const data = await catalogService.getCatalogBundle();
  res.json({ data });
}

// ──────────────────────────────────────────────
// Cities
// ──────────────────────────────────────────────

/** GET /api/v1/catalog/cities — list all active cities. */
export async function listCities(_req, res) {
  const data = await catalogService.listCities();
  res.json({ data });
}

/** GET /api/v1/catalog/cities/:slug — single city. */
export async function getCity(req, res) {
  const { slug } = req.validated.params;
  const data = await catalogService.getCity(slug);
  res.json({ data });
}

// ──────────────────────────────────────────────
// Centres
// ──────────────────────────────────────────────

/** GET /api/v1/catalog/centres — list centres, optionally filtered by ?city=. */
export async function listCentres(req, res) {
  const { city } = req.validated.query;
  const data = await catalogService.listCentres({ city });
  res.json({ data });
}

/** GET /api/v1/catalog/centres/:ref — single centre. */
export async function getCentre(req, res) {
  const { ref } = req.validated.params;
  const data = await catalogService.getCentre(ref);
  res.json({ data });
}

// ──────────────────────────────────────────────
// Workspaces
// ──────────────────────────────────────────────

/** GET /api/v1/catalog/workspaces — list workspaces with optional filters. */
export async function listWorkspaces(req, res) {
  const { city, type, capacity, maxPrice } = req.validated.query;
  const data = await catalogService.listWorkspaces({ city, type, capacity, maxPrice });
  res.json({ data });
}

/** GET /api/v1/catalog/workspaces/:ref — single workspace. */
export async function getWorkspace(req, res) {
  const { ref } = req.validated.params;
  const data = await catalogService.getWorkspace(ref);
  res.json({ data });
}

// ──────────────────────────────────────────────
// Staff (/catalog/admin)
// ──────────────────────────────────────────────

export async function listCitiesForStaff(_req, res) {
  res.json({ data: await adminService.listCitiesForStaff() });
}

export async function createCity(req, res) {
  res.status(201).json({ data: await adminService.createCity(req.validated.body, req.actor) });
}

export async function updateCity(req, res) {
  res.json({ data: await adminService.updateCity(req.validated.params.slug, req.validated.body, req.actor) });
}

export async function deleteCity(req, res) {
  await adminService.deleteCity(req.validated.params.slug, req.actor);
  res.status(204).end();
}

export async function listCentresForStaff(req, res) {
  res.json({ data: await adminService.listCentresForStaff(req.validated.query) });
}

export async function createCentre(req, res) {
  res.status(201).json({ data: await adminService.createCentre(req.validated.body, req.actor) });
}

export async function updateCentre(req, res) {
  res.json({ data: await adminService.updateCentre(req.validated.params.ref, req.validated.body, req.actor) });
}

export async function deleteCentre(req, res) {
  await adminService.deleteCentre(req.validated.params.ref, req.actor);
  res.status(204).end();
}

export async function listWorkspacesForStaff(req, res) {
  res.json({ data: await adminService.listWorkspacesForStaff(req.validated.query) });
}

export async function createWorkspace(req, res) {
  res.status(201).json({ data: await adminService.createWorkspace(req.validated.body, req.actor) });
}

export async function updateWorkspace(req, res) {
  res.json({ data: await adminService.updateWorkspace(req.validated.params.ref, req.validated.body, req.actor) });
}

export async function deleteWorkspace(req, res) {
  await adminService.deleteWorkspace(req.validated.params.ref, req.actor);
  res.status(204).end();
}
