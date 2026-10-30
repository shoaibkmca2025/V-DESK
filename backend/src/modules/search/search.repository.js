/**
 * Search repository — the only file that queries the database for this module.
 * Hides soft-deleted records; each natural key is unique among live rows only, so a deleted term, query
 * or config key can be created again.
 */
import { exec, row, rows, UNIQUE_VIOLATION } from '../../shared/lib/sql.js';

const SERVICE_COLUMNS = `
  ref, slug, name, icon, eyebrow, title, title_highlight AS "titleHighlight", description,
  starting_price_paise, price_unit AS "priceUnit",
  stats, trust, suitability, features, process, faqs, cta, cta_to AS "ctaTo",
  deleted_at AS "deletedAt", created_at AS "createdAt", updated_at AS "updatedAt"`;

const SYNONYM_COLUMNS = `
  ref, term, replacement,
  deleted_at AS "deletedAt", created_at AS "createdAt", updated_at AS "updatedAt"`;

const REDIRECT_COLUMNS = `
  ref, "query", target,
  deleted_at AS "deletedAt", created_at AS "createdAt", updated_at AS "updatedAt"`;

const CONFIG_COLUMNS = `
  key, value,
  deleted_at AS "deletedAt", created_at AS "createdAt", updated_at AS "updatedAt"`;

// ──────────────────────────────────────────────
// Services
// ──────────────────────────────────────────────

export async function findServices() {
  return rows(`SELECT ${SERVICE_COLUMNS} FROM search_services WHERE deleted_at IS NULL ORDER BY created_at, id`);
}

/**
 * Insert-or-update a live service by slug (used by the seed script). The jsonb columns hold the client's
 * own shapes — `stats` and `features` are arrays of pairs — so they are stored as given.
 */
export async function upsertServiceBySlug(slug, data) {
  await exec(
    `INSERT INTO search_services (ref, slug, name, icon, eyebrow, title, title_highlight, description,
                                  starting_price_paise, price_unit, stats, trust, suitability, features,
                                  process, faqs, cta, cta_to)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb, $12::text[], $13::text[],
                  $14::jsonb, $15::jsonb, $16::jsonb, $17, $18)
     ON CONFLICT (slug) WHERE deleted_at IS NULL DO UPDATE
         SET name = EXCLUDED.name, icon = EXCLUDED.icon, eyebrow = EXCLUDED.eyebrow,
             title = EXCLUDED.title, title_highlight = EXCLUDED.title_highlight,
             description = EXCLUDED.description, starting_price_paise = EXCLUDED.starting_price_paise,
             price_unit = EXCLUDED.price_unit, stats = EXCLUDED.stats, trust = EXCLUDED.trust,
             suitability = EXCLUDED.suitability, features = EXCLUDED.features, process = EXCLUDED.process,
             faqs = EXCLUDED.faqs, cta = EXCLUDED.cta, cta_to = EXCLUDED.cta_to`,
    [
      data.ref,
      slug,
      data.name,
      data.icon ?? '',
      data.eyebrow ?? '',
      data.title ?? '',
      data.titleHighlight ?? '',
      data.description ?? '',
      data.starting_price_paise,
      data.priceUnit ?? '',
      JSON.stringify(data.stats ?? []),
      data.trust ?? [],
      data.suitability ?? [],
      JSON.stringify(data.features ?? []),
      JSON.stringify(data.process ?? []),
      JSON.stringify(data.faqs ?? []),
      data.cta ?? '',
      data.ctaTo ?? '',
    ],
  );
}

// ──────────────────────────────────────────────
// Synonyms
// ──────────────────────────────────────────────

export async function findSynonyms() {
  return rows(`SELECT ${SYNONYM_COLUMNS} FROM search_synonyms WHERE deleted_at IS NULL ORDER BY term`);
}

// ──────────────────────────────────────────────
// Redirects
// ──────────────────────────────────────────────

export async function findRedirects() {
  return rows(`SELECT ${REDIRECT_COLUMNS} FROM search_redirects WHERE deleted_at IS NULL ORDER BY "query"`);
}

export async function findRedirectByQuery(query) {
  return row(`SELECT ${REDIRECT_COLUMNS} FROM search_redirects WHERE "query" = $1 AND deleted_at IS NULL`, [query]);
}

export async function findRedirectByRef(ref) {
  return row(`SELECT ${REDIRECT_COLUMNS} FROM search_redirects WHERE ref = $1 AND deleted_at IS NULL`, [ref]);
}

/** Inserts a redirect, or returns null when that query already has a live one. */
export async function insertRedirect(data) {
  try {
    return await row(
      `INSERT INTO search_redirects (ref, "query", target) VALUES ($1, $2, $3) RETURNING ${REDIRECT_COLUMNS}`,
      [data.ref, data.query, data.target],
    );
  } catch (err) {
    if (err.code === UNIQUE_VIOLATION) return null;
    throw err;
  }
}

/** Updates a redirect: the row, null when there is none, or `false` when the new query is already taken. */
export async function updateRedirect(ref, set) {
  const fields = Object.keys(set);
  const columns = { query: '"query"', target: 'target' };
  const text = fields
    .map((field, i) => {
      if (!columns[field]) throw new Error(`search.repository: no column for redirect field '${field}'`);
      return `${columns[field]} = $${i + 2}`;
    })
    .join(', ');
  try {
    return await row(
      `UPDATE search_redirects SET ${text} WHERE ref = $1 AND deleted_at IS NULL RETURNING ${REDIRECT_COLUMNS}`,
      [ref, ...fields.map((field) => set[field])],
    );
  } catch (err) {
    if (err.code === UNIQUE_VIOLATION) return false;
    throw err;
  }
}

export async function deleteRedirect(ref) {
  const changed = await exec(`UPDATE search_redirects SET deleted_at = now() WHERE ref = $1 AND deleted_at IS NULL`, [
    ref,
  ]);
  return changed === 1;
}

// ──────────────────────────────────────────────
// Config
// ──────────────────────────────────────────────

export async function findConfigEntries() {
  return rows(`SELECT ${CONFIG_COLUMNS} FROM search_config WHERE deleted_at IS NULL ORDER BY key`);
}

export async function findConfigEntry(key) {
  return row(`SELECT ${CONFIG_COLUMNS} FROM search_config WHERE key = $1 AND deleted_at IS NULL`, [key]);
}

/** Inserts a config entry, or returns null when that key already has a live one. */
export async function insertConfigEntry(data) {
  try {
    return await row(`INSERT INTO search_config (key, value) VALUES ($1, $2::jsonb) RETURNING ${CONFIG_COLUMNS}`, [
      data.key,
      JSON.stringify(data.value),
    ]);
  } catch (err) {
    if (err.code === UNIQUE_VIOLATION) return null;
    throw err;
  }
}

export async function updateConfigEntry(key, value) {
  return row(
    `UPDATE search_config SET value = $2::jsonb WHERE key = $1 AND deleted_at IS NULL RETURNING ${CONFIG_COLUMNS}`,
    [key, JSON.stringify(value)],
  );
}

export async function deleteConfigEntry(key) {
  const changed = await exec(`UPDATE search_config SET deleted_at = now() WHERE key = $1 AND deleted_at IS NULL`, [
    key,
  ]);
  return changed === 1;
}
