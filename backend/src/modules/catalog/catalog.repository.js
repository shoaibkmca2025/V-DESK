/**
 * Catalog repository — the only file that queries the database for this module.
 *
 * Every public query excludes soft-deleted (`deleted_at IS NULL`) and inactive records; the staff queries
 * below see inactive ones too, never deleted ones. Columns are aliased to the field names the mappers and
 * the frontend already use, prices included (`vo_price_paise` is snake in JS as well — rules.md §13).
 */
import { exec, row, rows, UNIQUE_VIOLATION } from '../../shared/lib/sql.js';

const CITY_COLUMNS = `
  ref, slug, name, state, tier, tagline, localities, active,
  deleted_at AS "deletedAt", created_at AS "createdAt", updated_at AS "updatedAt"`;

const CENTRE_COLUMNS = `
  ref, city_ref AS "cityRef", city, area_name AS "areaName", full_name AS "fullName", address, services,
  vo_price_paise, cw_price_paise, meeting_capacity AS "meetingCapacity", status, flagship, active,
  deleted_at AS "deletedAt", created_at AS "createdAt", updated_at AS "updatedAt"`;

const WORKSPACE_COLUMNS = `
  ref, centre_ref AS "centreRef", city, locality, name, type, capacity,
  price_month_paise, price_hour_paise, amenities, status, rating, reviews, active,
  deleted_at AS "deletedAt", created_at AS "createdAt", updated_at AS "updatedAt"`;

/**
 * The three kinds staff can manage, each with its table, its read columns and the field → column map the
 * generic insert/update/find below use. Writing it out once is what lets those three stay generic without
 * guessing at column names.
 */
const KINDS = {
  city: {
    table: 'cities',
    columns: CITY_COLUMNS,
    column: {
      ref: 'ref',
      slug: 'slug',
      name: 'name',
      state: 'state',
      tier: 'tier',
      tagline: 'tagline',
      localities: 'localities',
      active: 'active',
      deletedAt: 'deleted_at',
    },
  },
  centre: {
    table: 'centres',
    columns: CENTRE_COLUMNS,
    column: {
      ref: 'ref',
      cityRef: 'city_ref',
      city: 'city',
      areaName: 'area_name',
      fullName: 'full_name',
      address: 'address',
      services: 'services',
      vo_price_paise: 'vo_price_paise',
      cw_price_paise: 'cw_price_paise',
      meetingCapacity: 'meeting_capacity',
      status: 'status',
      flagship: 'flagship',
      active: 'active',
      deletedAt: 'deleted_at',
    },
  },
  workspace: {
    table: 'workspaces',
    columns: WORKSPACE_COLUMNS,
    column: {
      ref: 'ref',
      centreRef: 'centre_ref',
      city: 'city',
      locality: 'locality',
      name: 'name',
      type: 'type',
      capacity: 'capacity',
      price_month_paise: 'price_month_paise',
      price_hour_paise: 'price_hour_paise',
      amenities: 'amenities',
      status: 'status',
      rating: 'rating',
      reviews: 'reviews',
      active: 'active',
      deletedAt: 'deleted_at',
    },
  },
};

function columnOf(kind, field) {
  const column = KINDS[kind].column[field];
  if (!column) throw new Error(`catalog.repository: no column for ${kind} field '${field}'`);
  return column;
}

// ──────────────────────────────────────────────
// City queries
// ──────────────────────────────────────────────

/** All active, non-deleted cities, ordered by name. */
export async function findAllCities() {
  return rows(`SELECT ${CITY_COLUMNS} FROM cities WHERE active AND deleted_at IS NULL ORDER BY name`);
}

/** One city by its slug (e.g. 'mumbai'). */
export async function findCityBySlug(slug) {
  return row(`SELECT ${CITY_COLUMNS} FROM cities WHERE slug = $1 AND active AND deleted_at IS NULL`, [slug]);
}

// ──────────────────────────────────────────────
// Centre queries
// ──────────────────────────────────────────────

/** All active, non-deleted centres, optionally in one city, flagship first then by name. */
export async function findCentres({ cityRef } = {}) {
  return rows(
    `SELECT ${CENTRE_COLUMNS} FROM centres
      WHERE active AND deleted_at IS NULL AND ($1::text IS NULL OR city_ref = $1)
      ORDER BY flagship DESC, full_name`,
    [cityRef ?? null],
  );
}

export async function findCentreByRef(ref) {
  return row(`SELECT ${CENTRE_COLUMNS} FROM centres WHERE ref = $1 AND active AND deleted_at IS NULL`, [ref]);
}

// ──────────────────────────────────────────────
// Workspace queries
// ──────────────────────────────────────────────

/**
 * Workspaces filtered by optional city, type, minimum capacity and maximum monthly price (paise).
 * City is an exact, case-insensitive match on the name ('mumbai' finds 'Mumbai'). Cheapest first.
 */
export async function findWorkspaces({ city, type, capacity, maxPricePaise } = {}) {
  return rows(
    `SELECT ${WORKSPACE_COLUMNS} FROM workspaces
      WHERE active AND deleted_at IS NULL
        AND ($1::text IS NULL OR lower(city) = lower($1))
        AND ($2::text IS NULL OR type = $2)
        AND ($3::int IS NULL OR capacity >= $3)
        AND ($4::bigint IS NULL OR price_month_paise <= $4)
      ORDER BY price_month_paise`,
    [city ?? null, type ?? null, capacity ?? null, maxPricePaise ?? null],
  );
}

export async function findWorkspaceByRef(ref) {
  return row(`SELECT ${WORKSPACE_COLUMNS} FROM workspaces WHERE ref = $1 AND active AND deleted_at IS NULL`, [ref]);
}

// ──────────────────────────────────────────────
// Staff — see inactive records too, never deleted ones
// ──────────────────────────────────────────────

export async function findCitiesForStaff() {
  return rows(`SELECT ${CITY_COLUMNS} FROM cities WHERE deleted_at IS NULL ORDER BY name`);
}

export async function findCentresForStaff({ cityRef } = {}) {
  return rows(
    `SELECT ${CENTRE_COLUMNS} FROM centres
      WHERE deleted_at IS NULL AND ($1::text IS NULL OR city_ref = $1)
      ORDER BY city_ref, ref`,
    [cityRef ?? null],
  );
}

export async function findWorkspacesForStaff({ centreRef } = {}) {
  return rows(
    `SELECT ${WORKSPACE_COLUMNS} FROM workspaces
      WHERE deleted_at IS NULL AND ($1::text IS NULL OR centre_ref = $1)
      ORDER BY centre_ref, ref`,
    [centreRef ?? null],
  );
}

/** Active or not, as long as it isn't deleted. `filter` is one or more fields, e.g. `{ ref }` or `{ slug }`. */
export async function findForStaff(kind, filter) {
  const fields = Object.keys(filter);
  const where = fields.map((field, i) => `${columnOf(kind, field)} = $${i + 1}`).join(' AND ');
  return row(
    `SELECT ${KINDS[kind].columns} FROM ${KINDS[kind].table} WHERE ${where} AND deleted_at IS NULL`,
    fields.map((field) => filter[field]),
  );
}

/** Inserts and returns the record, or null when a unique field (ref, slug) is already taken. */
export async function insertDoc(kind, data) {
  const fields = Object.keys(data);
  const columns = fields.map((field) => columnOf(kind, field));
  try {
    return await row(
      `INSERT INTO ${KINDS[kind].table} (${columns.join(', ')})
            VALUES (${fields.map((_, i) => `$${i + 1}`).join(', ')})
         RETURNING ${KINDS[kind].columns}`,
      fields.map((field) => data[field]),
    );
  } catch (err) {
    if (err.code === UNIQUE_VIOLATION) return null;
    throw err;
  }
}

export async function updateDoc(kind, ref, set) {
  const fields = Object.keys(set);
  const assignments = fields.map((field, i) => `${columnOf(kind, field)} = $${i + 2}`).join(', ');
  return row(
    `UPDATE ${KINDS[kind].table} SET ${assignments}
      WHERE ref = $1 AND deleted_at IS NULL RETURNING ${KINDS[kind].columns}`,
    [ref, ...fields.map((field) => set[field])],
  );
}

export async function softDelete(kind, ref, now) {
  const changed = await exec(
    `UPDATE ${KINDS[kind].table} SET deleted_at = $2, active = false WHERE ref = $1 AND deleted_at IS NULL`,
    [ref, now],
  );
  return changed === 1;
}

export async function countCentresInCity(cityRef) {
  return (await row(`SELECT count(*)::int AS n FROM centres WHERE city_ref = $1 AND deleted_at IS NULL`, [cityRef])).n;
}

export async function countWorkspacesInCentre(centreRef) {
  return (
    await row(`SELECT count(*)::int AS n FROM workspaces WHERE centre_ref = $1 AND deleted_at IS NULL`, [centreRef])
  ).n;
}

/**
 * Highest number used after `prefix-` (e.g. CTR-NSK → 2 for CTR-NSK-002), deleted records included, so a
 * deleted ref is never handed out again.
 */
export async function highestRefNumber(kind, prefix) {
  const pattern = `^${escapeRegex(prefix)}-(\\d+)$`;
  const result = await row(
    `SELECT coalesce(max(substring(ref from $1)::int), 0) AS highest
       FROM ${KINDS[kind].table} WHERE ref ~ $1`,
    [pattern],
  );
  return Number(result.highest);
}

/** Centres and workspaces copy the city name for fast filtering; a rename has to reach them too. */
export async function renameCityInChildren(cityRef, name) {
  await exec(`UPDATE centres SET city = $2 WHERE city_ref = $1`, [cityRef, name]);
  await exec(`UPDATE workspaces SET city = $2 WHERE centre_ref IN (SELECT ref FROM centres WHERE city_ref = $1)`, [
    cityRef,
    name,
  ]);
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
