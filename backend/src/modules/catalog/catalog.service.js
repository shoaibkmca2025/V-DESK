/**
 * Catalog service — business rules for cities, centres, and workspaces.
 *
 * Rules (docs/backend/rules.md):
 *  - No req/res here — framework-free, easy to unit-test and reuse by jobs.
 *  - Throws AppError with stable codes; callers (controllers) do not need try/catch.
 *  - Converts the frontend-facing "rupee" query param `maxPrice` to paise before the DB query.
 *  - Never calls another module's repository; cross-module data goes through that module's service.
 */
import { notFound } from '../../shared/errors/AppError.js';
import { mapCentre, mapCity, mapWorkspace } from './catalog.mapper.js';
import * as repo from './catalog.repository.js';

// ──────────────────────────────────────────────
// Cities
// ──────────────────────────────────────────────

/**
 * Returns all active cities.
 * @returns {Promise<object[]>}
 */
export async function listCities() {
  const docs = await repo.findAllCities();
  return docs.map(mapCity);
}

/**
 * Returns a single city by slug, or throws CITY_NOT_FOUND.
 * @param {string} slug
 */
export async function getCity(slug) {
  const doc = await repo.findCityBySlug(slug);
  if (!doc) throw notFound('CITY_NOT_FOUND', `No city found for slug '${slug}'`);
  return mapCity(doc);
}

// ──────────────────────────────────────────────
// Centres
// ──────────────────────────────────────────────

/**
 * Returns centres, optionally filtered by city slug.
 * If a city slug is provided but the city doesn't exist, throws CITY_NOT_FOUND.
 * @param {{ city?: string }} filters
 */
export async function listCentres({ city } = {}) {
  let cityRef;
  if (city) {
    const cityDoc = await repo.findCityBySlug(city);
    if (!cityDoc) throw notFound('CITY_NOT_FOUND', `No city found for slug '${city}'`);
    cityRef = cityDoc.ref;
  }
  const docs = await repo.findCentres({ cityRef });
  return docs.map(mapCentre);
}

/**
 * Returns a single centre by ref, or throws CENTRE_NOT_FOUND.
 * @param {string} ref
 */
export async function getCentre(ref) {
  const doc = await repo.findCentreByRef(ref);
  if (!doc) throw notFound('CENTRE_NOT_FOUND', `No centre found for ref '${ref}'`);
  return mapCentre(doc);
}

// ──────────────────────────────────────────────
// Workspaces
// ──────────────────────────────────────────────

/**
 * Returns workspaces matching the given filters.
 *
 * `maxPrice` is expressed in rupees (as the frontend sends it) and converted to
 * integer paise before querying — money is always stored as paise (rules.md §13).
 *
 * @param {{ city?: string, type?: string, capacity?: number, maxPrice?: number }} filters
 */
export async function listWorkspaces({ city, type, capacity, maxPrice } = {}) {
  const maxPricePaise = maxPrice != null ? Math.round(maxPrice) * 100 : undefined;
  const docs = await repo.findWorkspaces({ city, type, capacity, maxPricePaise });
  return docs.map(mapWorkspace);
}

/**
 * Returns a single workspace by ref, or throws WORKSPACE_NOT_FOUND.
 * @param {string} ref
 */
export async function getWorkspace(ref) {
  const doc = await repo.findWorkspaceByRef(ref);
  if (!doc) throw notFound('WORKSPACE_NOT_FOUND', `No workspace found for ref '${ref}'`);
  return mapWorkspace(doc);
}

// ──────────────────────────────────────────────
// Full catalog bundle
// ──────────────────────────────────────────────

/**
 * Returns cities + centres + workspaces in one call for the frontend bundle endpoint.
 * Equivalent to the static catalogStore.js the frontend currently uses.
 */
export async function getCatalogBundle() {
  const [cities, centres, workspaces] = await Promise.all([
    repo.findAllCities(),
    repo.findCentres(),
    repo.findWorkspaces(),
  ]);
  return {
    cities: cities.map(mapCity),
    centres: centres.map(mapCentre),
    workspaces: workspaces.map(mapWorkspace),
  };
}
