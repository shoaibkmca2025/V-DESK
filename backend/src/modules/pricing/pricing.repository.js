/**
 * Pricing repository — the only file that queries the database for this module.
 *
 * A quote's `item`, `pricing` and `history` are jsonb: they are written once and read whole, and freezing
 * them is the point — a later rule change must never alter a quote that has already been sent.
 */
import { cursorClause } from '../../shared/lib/pagination.js';
import { exec, row, rows, UNIQUE_VIOLATION } from '../../shared/lib/sql.js';

const RULE_COLUMNS = `key, value, updated_by AS "updatedBy", created_at AS "createdAt", updated_at AS "updatedAt"`;

const QUOTE_COLUMNS = `
  ref, status, product_type AS "productType", product, purpose, tenure, rate_month_paise,
  name, company, item, pricing,
  valid_until AS "validUntil",
  history,
  idempotency_key AS "idempotencyKey",
  request_hash AS "requestHash",
  deleted_at AS "deletedAt",
  created_at AS "createdAt",
  updated_at AS "updatedAt"`;

// ──────────────────────────────────────────────
// Rules
// ──────────────────────────────────────────────

export async function findRuleOverrides() {
  return rows(`SELECT ${RULE_COLUMNS} FROM pricing_rules`);
}

export async function upsertRule(key, value, updatedBy) {
  return row(
    `INSERT INTO pricing_rules (key, value, updated_by) VALUES ($1, $2::jsonb, $3)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_by = EXCLUDED.updated_by
       RETURNING ${RULE_COLUMNS}`,
    [key, JSON.stringify(value), updatedBy],
  );
}

/** Returns true when an override existed and was removed. */
export async function deleteRule(key) {
  return (await exec(`DELETE FROM pricing_rules WHERE key = $1`, [key])) === 1;
}

// ──────────────────────────────────────────────
// Quotes
// ──────────────────────────────────────────────

export async function findQuoteByRef(ref) {
  return row(`SELECT ${QUOTE_COLUMNS} FROM quotes WHERE ref = $1 AND deleted_at IS NULL`, [ref]);
}

export async function findQuoteByIdempotencyKey(idempotencyKey) {
  return row(`SELECT ${QUOTE_COLUMNS} FROM quotes WHERE idempotency_key = $1`, [idempotencyKey]);
}

/** Inserts a quote, or returns null when the Idempotency-Key was taken by a concurrent request. */
export async function insertQuote(data) {
  try {
    return await row(
      `INSERT INTO quotes (ref, status, product_type, product, purpose, tenure, rate_month_paise, name,
                           company, item, pricing, valid_until, history, idempotency_key, request_hash)
            VALUES ($1, coalesce($2, 'SENT'), $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11::jsonb, $12,
                    coalesce($13::jsonb, '[]'::jsonb), $14, $15)
         RETURNING ${QUOTE_COLUMNS}`,
      [
        data.ref,
        data.status ?? null,
        data.productType,
        data.product,
        data.purpose ?? '',
        data.tenure,
        data.rate_month_paise ?? null,
        data.name,
        data.company ?? '',
        JSON.stringify(data.item),
        JSON.stringify(data.pricing),
        data.validUntil,
        data.history ? JSON.stringify(data.history) : null,
        data.idempotencyKey ?? null,
        data.requestHash ?? null,
      ],
    );
  } catch (err) {
    if (err.code === UNIQUE_VIOLATION) return null;
    throw err;
  }
}

/** Newest first; fetches `limit + 1` so the service can tell whether there is another page. */
export async function findQuotes({ status, after, limit }) {
  const cursor = cursorClause(after, 2);
  return rows(
    `SELECT ${QUOTE_COLUMNS} FROM quotes
      WHERE deleted_at IS NULL AND ($1::text IS NULL OR status = $1) ${cursor.text}
      ORDER BY created_at DESC, ref DESC
      LIMIT $${cursor.next}`,
    [status ?? null, ...cursor.params, limit + 1],
  );
}

/**
 * Moves a quote to `to` only if it is still in `from` — two people accepting and rejecting at once can't
 * both win. Returns the updated quote, or null if it changed meanwhile.
 */
export async function updateQuoteStatus(ref, from, to, entry) {
  return row(
    `UPDATE quotes SET status = $3, history = history || $4::jsonb
      WHERE ref = $1 AND status = $2 AND deleted_at IS NULL
      RETURNING ${QUOTE_COLUMNS}`,
    [ref, from, to, JSON.stringify([entry])],
  );
}
