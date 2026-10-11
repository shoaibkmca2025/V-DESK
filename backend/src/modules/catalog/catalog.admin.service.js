/**
 * Catalog staff service — create, edit, deactivate and delete cities, centres and workspaces (modules.md §3.2).
 * The public read side lives in catalog.service.js.
 *
 * Rules:
 *  - Refs never change and are never reused: new centres/workspaces continue the seeded numbering
 *    (CTR-NSK-003), counting deleted ones; city refs are CITY- + the slug.
 *  - `active: false` hides a record from the public API without deleting it; DELETE is a soft delete
 *    (rules.md §16) and is refused while a city still has centres or a centre still has workspaces.
 *  - A centre's city and a workspace's centre are fixed at creation; the copied `city` / `locality` names
 *    follow from them. Renaming a city updates the copies.
 *  - Logs carry refs, changed field names and the actor, never field values.
 */
import { conflict, notFound } from '../../shared/errors/AppError.js';
import { logger } from '../../shared/lib/logger.js';
import { REF_ALLOCATION_ATTEMPTS, REF_NUMBER_DIGITS } from './catalog.constants.js';
import { mapCentre, mapCity, mapWorkspace } from './catalog.mapper.js';
import * as repo from './catalog.repository.js';

const log = logger.child({ module: 'catalog' });

async function findOrThrow(kind, filter, code, label) {
  const doc = await repo.findForStaff(kind, filter);
  if (!doc) throw notFound(code, `No ${kind} found for ${label}`);
  return doc;
}

/** Inserts with the next free `prefix-NNN` ref, retrying if a parallel create took the same number. */
async function insertWithNextRef(kind, prefix, data) {
  for (let attempt = 0; attempt < REF_ALLOCATION_ATTEMPTS; attempt++) {
    const next = (await repo.highestRefNumber(kind, prefix)) + 1;
    const doc = await repo.insertDoc(kind, {
      ...data,
      ref: `${prefix}-${String(next).padStart(REF_NUMBER_DIGITS, '0')}`,
    });
    if (doc) return doc;
  }
  throw conflict('REF_CONFLICT', 'Could not allocate a reference. Please try again.');
}

/** CITY-NSK → NSK, CITY-INDORE → INDORE; CTR-NSK-002 → NSK. Used to number children. */
const codeOfCity = (cityRef) => cityRef.replace(/^CITY-/, '');
const codeOfCentre = (centreRef) => centreRef.replace(/^CTR-/, '').replace(/-\d+$/, '');

function logChange(event, ref, fields, actor) {
  log.info({ event: `catalog.${event}`, ref, fields, actor }, 'catalog changed');
}

// ──────────────────────────────────────────────
// Cities
// ──────────────────────────────────────────────

export async function listCitiesForStaff() {
  return (await repo.findCitiesForStaff()).map(mapCity);
}

export async function createCity(input, actor) {
  const doc = await repo.insertDoc('city', { ...input, ref: `CITY-${input.slug.toUpperCase()}` });
  if (!doc) throw conflict('CITY_EXISTS', `A city with slug '${input.slug}' already exists (it may have been deleted)`);
  logChange('city_created', doc.ref, Object.keys(input), actor);
  return mapCity(doc);
}

export async function updateCity(slug, changes, actor) {
  const city = await findOrThrow('city', { slug }, 'CITY_NOT_FOUND', `slug '${slug}'`);
  const updated = await repo.updateDoc('city', city.ref, changes);
  if (changes.name && changes.name !== city.name) await repo.renameCityInChildren(city.ref, changes.name);
  logChange('city_updated', city.ref, Object.keys(changes), actor);
  return mapCity(updated);
}

export async function deleteCity(slug, actor) {
  const city = await findOrThrow('city', { slug }, 'CITY_NOT_FOUND', `slug '${slug}'`);
  if ((await repo.countCentresInCity(city.ref)) > 0) {
    throw conflict('CITY_HAS_CENTRES', 'Delete or move this city’s centres first, or set it inactive instead');
  }
  await repo.softDelete('city', city.ref, new Date());
  logChange('city_deleted', city.ref, [], actor);
}

// ──────────────────────────────────────────────
// Centres
// ──────────────────────────────────────────────

export async function listCentresForStaff({ city } = {}) {
  let cityRef;
  if (city) cityRef = (await findOrThrow('city', { slug: city }, 'CITY_NOT_FOUND', `slug '${city}'`)).ref;
  return (await repo.findCentresForStaff({ cityRef })).map(mapCentre);
}

export async function createCentre({ citySlug, ...input }, actor) {
  const city = await findOrThrow('city', { slug: citySlug }, 'CITY_NOT_FOUND', `slug '${citySlug}'`);
  const doc = await insertWithNextRef('centre', `CTR-${codeOfCity(city.ref)}`, {
    ...input,
    cityRef: city.ref,
    city: city.name,
  });
  logChange('centre_created', doc.ref, Object.keys(input), actor);
  return mapCentre(doc);
}

export async function updateCentre(ref, changes, actor) {
  await findOrThrow('centre', { ref }, 'CENTRE_NOT_FOUND', `ref '${ref}'`);
  const updated = await repo.updateDoc('centre', ref, changes);
  logChange('centre_updated', ref, Object.keys(changes), actor);
  return mapCentre(updated);
}

export async function deleteCentre(ref, actor) {
  await findOrThrow('centre', { ref }, 'CENTRE_NOT_FOUND', `ref '${ref}'`);
  if ((await repo.countWorkspacesInCentre(ref)) > 0) {
    throw conflict('CENTRE_HAS_WORKSPACES', 'Delete this centre’s workspaces first, or set it inactive instead');
  }
  await repo.softDelete('centre', ref, new Date());
  logChange('centre_deleted', ref, [], actor);
}

// ──────────────────────────────────────────────
// Workspaces
// ──────────────────────────────────────────────

export async function listWorkspacesForStaff({ centreRef } = {}) {
  return (await repo.findWorkspacesForStaff({ centreRef })).map(mapWorkspace);
}

export async function createWorkspace({ centreRef, locality, ...input }, actor) {
  const centre = await findOrThrow('centre', { ref: centreRef }, 'CENTRE_NOT_FOUND', `ref '${centreRef}'`);
  const doc = await insertWithNextRef('workspace', `WS-${codeOfCentre(centre.ref)}`, {
    ...input,
    centreRef: centre.ref,
    city: centre.city,
    locality: locality ?? centre.areaName,
  });
  logChange('workspace_created', doc.ref, Object.keys(input), actor);
  return mapWorkspace(doc);
}

export async function updateWorkspace(ref, changes, actor) {
  await findOrThrow('workspace', { ref }, 'WORKSPACE_NOT_FOUND', `ref '${ref}'`);
  const updated = await repo.updateDoc('workspace', ref, changes);
  logChange('workspace_updated', ref, Object.keys(changes), actor);
  return mapWorkspace(updated);
}

export async function deleteWorkspace(ref, actor) {
  await findOrThrow('workspace', { ref }, 'WORKSPACE_NOT_FOUND', `ref '${ref}'`);
  await repo.softDelete('workspace', ref, new Date());
  logChange('workspace_deleted', ref, [], actor);
}
