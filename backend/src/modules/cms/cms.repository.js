/**
 * CMS repository — the only file that queries the database for this module.
 * Soft-deleted entries are invisible everywhere.
 *
 * `draft` and `published` are jsonb: their shape is the content type's own, validated by cms.validation.js,
 * and the site reads an entry whole. `order` is a SQL keyword, so the column is `order_index`.
 */
import { exec, row, rows, UNIQUE_VIOLATION } from '../../shared/lib/sql.js';

const ENTRY_COLUMNS = `
  type, key, draft, published, version,
  published_version AS "publishedVersion",
  order_index AS "order",
  updated_by AS "updatedBy",
  published_at AS "publishedAt",
  published_by AS "publishedBy",
  deleted_at AS "deletedAt",
  created_at AS "createdAt",
  updated_at AS "updatedAt"`;

const REVISION_COLUMNS = `
  type, key, version, data,
  published_by AS "publishedBy", published_at AS "publishedAt", created_at AS "createdAt"`;

const COLUMN_FOR = {
  draft: 'draft',
  published: 'published',
  version: 'version',
  publishedVersion: 'published_version',
  order: 'order_index',
  updatedBy: 'updated_by',
  publishedAt: 'published_at',
  publishedBy: 'published_by',
  deletedAt: 'deleted_at',
};

/** These hold the content itself, so their values travel as JSON text. */
const JSON_COLUMNS = new Set(['draft', 'published']);

function assignments(set, from) {
  const fields = Object.keys(set);
  const columns = fields.map((field) => {
    const column = COLUMN_FOR[field];
    if (!column) throw new Error(`cms.repository: no column for entry field '${field}'`);
    return column;
  });
  return {
    text: columns.map((column, i) => `${column} = $${from + i}${JSON_COLUMNS.has(column) ? '::jsonb' : ''}`).join(', '),
    params: fields.map((field, i) =>
      JSON_COLUMNS.has(columns[i]) && set[field] !== undefined ? JSON.stringify(set[field] ?? null) : set[field],
    ),
  };
}

export async function findEntry(type, key) {
  return row(`SELECT ${ENTRY_COLUMNS} FROM content_entries WHERE type = $1 AND key = $2 AND deleted_at IS NULL`, [
    type,
    key,
  ]);
}

/** Staff list: every live entry of a type, drafts included. */
export async function findEntries(type) {
  return rows(
    `SELECT ${ENTRY_COLUMNS} FROM content_entries
      WHERE type = $1 AND deleted_at IS NULL ORDER BY order_index, key`,
    [type],
  );
}

/** Public list: only entries with a published copy. */
export async function findPublished(type) {
  return rows(
    `SELECT ${ENTRY_COLUMNS} FROM content_entries
      WHERE type = $1 AND deleted_at IS NULL AND published IS NOT NULL
      ORDER BY order_index, key`,
    [type],
  );
}

/** Inserts a new entry, or returns null when (type, key) is already live. */
export async function insertEntry(data) {
  try {
    return await row(
      `INSERT INTO content_entries (type, key, draft, published, version, published_version, order_index,
                                    updated_by, published_at, published_by)
            VALUES ($1, $2, $3::jsonb, $4::jsonb, coalesce($5, 1), $6, coalesce($7, 0), $8, $9, $10)
         RETURNING ${ENTRY_COLUMNS}`,
      [
        data.type,
        data.key,
        JSON.stringify(data.draft),
        data.published === undefined || data.published === null ? null : JSON.stringify(data.published),
        data.version ?? null,
        data.publishedVersion ?? null,
        data.order ?? null,
        data.updatedBy,
        data.publishedAt ?? null,
        data.publishedBy ?? null,
      ],
    );
  } catch (err) {
    if (err.code === UNIQUE_VIOLATION) return null;
    throw err;
  }
}

/**
 * Applies `set` only while the draft is still at `version` (optimistic locking): two editors can't
 * overwrite each other. `bumpVersion` adds one to the version (draft saves do; publish/unpublish don't).
 * Returns the entry or null.
 */
export async function updateEntryAtVersion(type, key, version, set, { bumpVersion = false, session: tx } = {}) {
  const { text, params } = assignments(set, 4);
  return row(
    `UPDATE content_entries SET ${text}${bumpVersion ? ', version = version + 1' : ''}
      WHERE type = $1 AND key = $2 AND version = $3 AND deleted_at IS NULL
      RETURNING ${ENTRY_COLUMNS}`,
    [type, key, version, ...params],
    tx,
  );
}

export async function updateEntry(type, key, set) {
  const { text, params } = assignments(set, 3);
  return row(
    `UPDATE content_entries SET ${text}
      WHERE type = $1 AND key = $2 AND deleted_at IS NULL
      RETURNING ${ENTRY_COLUMNS}`,
    [type, key, ...params],
  );
}

export async function insertRevision(data, { session: tx } = {}) {
  await exec(
    `INSERT INTO content_revisions (type, key, version, data, published_by, published_at)
          VALUES ($1, $2, $3, $4::jsonb, $5, $6)`,
    [data.type, data.key, data.version, JSON.stringify(data.data), data.publishedBy, data.publishedAt],
    tx,
  );
}

export async function findRevisions(type, key) {
  return rows(
    `SELECT ${REVISION_COLUMNS} FROM content_revisions
      WHERE type = $1 AND key = $2 ORDER BY published_at DESC`,
    [type, key],
  );
}
