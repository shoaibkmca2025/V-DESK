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
 *  - Every saved change publishes `catalog.updated` in the same transaction (outbox, ADR-005) so caches of the
 *    public catalog can be invalidated; an edit that changes no value saves nothing and publishes nothing.
 *  - Logs and events carry refs, changed field names and the actor, never field values.
 */
import { conflict, notFound } from '../../shared/errors/AppError.js';
import { publish } from '../../shared/events/bus.js';
import { logger } from '../../shared/lib/logger.js';
import { withTransaction } from '../../shared/lib/transactions.js';
import { REF_ALLOCATION_ATTEMPTS, REF_NUMBER_DIGITS } from './catalog.constants.js';
import { mapCentre, mapCity, mapWorkspace } from './catalog.mapper.js';
import * as repo from './catalog.repository.js';

const log = logger.child({ module: 'catalog' });

async function findOrThrow(kind, filter, code, label) {
  const doc = await repo.findForStaff(kind, filter);
  if (!doc) throw notFound(code, `No ${kind} found for ${label}`);
  return doc;
}

/** Staff actors are a user ref or 'admin-key' (the legacy shared key). */
const eventActor = (actor) => (actor === 'admin-key' ? { type: 'admin-key' } : { type: 'user', id: actor ?? null });

/**
 * Runs `write(session)` and records `catalog.updated` for the record it returns, in one transaction.
 * `action` is created | updated | deleted; `fields` are the changed field names (never their values).
 */
async function writeWithEvent(kind, action, fields, actor, write) {
  return withTransaction(async (session) => {
    const doc = await write(session);
    await publish(
      {
        type: 'catalog.updated',
        entity: { type: kind, ref: doc.ref },
        actor: eventActor(actor),
        payload: { action, fields },
      },
      { session },
    );
    return doc;
  });
}

/** Thrown inside the transaction to abort it when a parallel create took the same ref. */
class RefTaken extends Error {}

/** Inserts with the next free `prefix-NNN` ref, retrying if a parallel create took the same number. */
async function insertWithNextRef(kind, prefix, data, actor) {
  for (let attempt = 0; attempt < REF_ALLOCATION_ATTEMPTS; attempt++) {
    const next = (await repo.highestRefNumber(kind, prefix)) + 1;
    const ref = `${prefix}-${String(next).padStart(REF_NUMBER_DIGITS, '0')}`;
    try {
      return await writeWithEvent(kind, 'created', Object.keys(data), actor, async (session) => {
        const doc = await repo.insertDoc(kind, { ...data, ref }, { session });
        if (!doc) throw new RefTaken();
        return doc;
      });
    } catch (err) {
      if (!(err instanceof RefTaken)) throw err;
    }
  }
  throw conflict('REF_CONFLICT', 'Could not allocate a reference. Please try again.');
}

/** The fields of `changes` whose value differs from `current` — an edit to the same value is not a change. */
const changedFields = (current, changes) =>
  Object.keys(changes).filter((key) => JSON.stringify(current[key]) !== JSON.stringify(changes[key]));

/** Applies the changed fields of `changes` with a `catalog.updated` event; returns the record (unchanged if none). */
async function updateWithEvent(kind, current, changes, actor, afterWrite) {
  const fields = changedFields(current, changes);
  if (fields.length === 0) return current;
  const set = Object.fromEntries(fields.map((key) => [key, changes[key]]));
  return writeWithEvent(kind, 'updated', fields, actor, async (session) => {
    const updated = await repo.updateDoc(kind, current.ref, set, { session });
    if (!updated) throw notFound(`${kind.toUpperCase()}_NOT_FOUND`, `No ${kind} found for ref '${current.ref}'`);
    if (afterWrite) await afterWrite(set, session);
    return updated;
  });
}

/** Soft-deletes with a `catalog.updated` event; 404 (and no event) if a concurrent delete got there first. */
async function deleteWithEvent(kind, ref, actor) {
  await writeWithEvent(kind, 'deleted', [], actor, async (session) => {
    if (!(await repo.softDelete(kind, ref, new Date(), { session }))) {
      throw notFound(`${kind.toUpperCase()}_NOT_FOUND`, `No ${kind} found for ref '${ref}'`);
    }
    return { ref };
  });
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
  const doc = await writeWithEvent('city', 'created', Object.keys(input), actor, async (session) => {
    const inserted = await repo.insertDoc('city', { ...input, ref: `CITY-${input.slug.toUpperCase()}` }, { session });
    if (!inserted) {
      throw conflict('CITY_EXISTS', `A city with slug '${input.slug}' already exists (it may have been deleted)`);
    }
    return inserted;
  });
  logChange('city_created', doc.ref, Object.keys(input), actor);
  return mapCity(doc);
}

export async function updateCity(slug, changes, actor) {
  const city = await findOrThrow('city', { slug }, 'CITY_NOT_FOUND', `slug '${slug}'`);
  // A rename reaches the copied city name on its centres and workspaces in the same transaction.
  const updated = await updateWithEvent('city', city, changes, actor, async (set, session) => {
    if (set.name) await repo.renameCityInChildren(city.ref, set.name, { session });
  });
  logChange('city_updated', city.ref, changedFields(city, changes), actor);
  return mapCity(updated);
}

export async function deleteCity(slug, actor) {
  const city = await findOrThrow('city', { slug }, 'CITY_NOT_FOUND', `slug '${slug}'`);
  if ((await repo.countCentresInCity(city.ref)) > 0) {
    throw conflict('CITY_HAS_CENTRES', 'Delete or move this city’s centres first, or set it inactive instead');
  }
  await deleteWithEvent('city', city.ref, actor);
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
  const doc = await insertWithNextRef(
    'centre',
    `CTR-${codeOfCity(city.ref)}`,
    { ...input, cityRef: city.ref, city: city.name },
    actor,
  );
  logChange('centre_created', doc.ref, Object.keys(input), actor);
  return mapCentre(doc);
}

export async function updateCentre(ref, changes, actor) {
  const centre = await findOrThrow('centre', { ref }, 'CENTRE_NOT_FOUND', `ref '${ref}'`);
  const updated = await updateWithEvent('centre', centre, changes, actor);
  logChange('centre_updated', ref, changedFields(centre, changes), actor);
  return mapCentre(updated);
}

export async function deleteCentre(ref, actor) {
  await findOrThrow('centre', { ref }, 'CENTRE_NOT_FOUND', `ref '${ref}'`);
  if ((await repo.countWorkspacesInCentre(ref)) > 0) {
    throw conflict('CENTRE_HAS_WORKSPACES', 'Delete this centre’s workspaces first, or set it inactive instead');
  }
  await deleteWithEvent('centre', ref, actor);
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
  const doc = await insertWithNextRef(
    'workspace',
    `WS-${codeOfCentre(centre.ref)}`,
    { ...input, centreRef: centre.ref, city: centre.city, locality: locality ?? centre.areaName },
    actor,
  );
  logChange('workspace_created', doc.ref, Object.keys(input), actor);
  return mapWorkspace(doc);
}

export async function updateWorkspace(ref, changes, actor) {
  const workspace = await findOrThrow('workspace', { ref }, 'WORKSPACE_NOT_FOUND', `ref '${ref}'`);
  const updated = await updateWithEvent('workspace', workspace, changes, actor);
  logChange('workspace_updated', ref, changedFields(workspace, changes), actor);
  return mapWorkspace(updated);
}

export async function deleteWorkspace(ref, actor) {
  await findOrThrow('workspace', { ref }, 'WORKSPACE_NOT_FOUND', `ref '${ref}'`);
  await deleteWithEvent('workspace', ref, actor);
  logChange('workspace_deleted', ref, [], actor);
}
