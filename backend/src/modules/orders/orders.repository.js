/**
 * Orders repository — the only file that queries the database for this module.
 * Hides soft-deleted records, except where idempotency needs to see them.
 *
 * Two unique indexes do the hard work: one on the Idempotency-Key, and one on (source, status) that allows
 * a single open order per quote or booking. `insertOrder` therefore treats a unique violation as a normal
 * answer and lets the service work out which of the two it was.
 */
import { cursorClause } from '../../shared/lib/pagination.js';
import { row, rows, UNIQUE_VIOLATION } from '../../shared/lib/sql.js';
import { OPEN_STATUS } from './orders.constants.js';

const ORDER_COLUMNS = `
  ref, status,
  jsonb_build_object('type', source_type, 'ref', source_ref) AS source,
  description, tenure, pricing, total_paise, currency,
  expires_at AS "expiresAt", history,
  idempotency_key AS "idempotencyKey", request_hash AS "requestHash",
  deleted_at AS "deletedAt", created_at AS "createdAt", updated_at AS "updatedAt"`;

export async function findOrderByRef(ref) {
  return row(`SELECT ${ORDER_COLUMNS} FROM orders WHERE ref = $1 AND deleted_at IS NULL`, [ref]);
}

export async function findOrderByIdempotencyKey(idempotencyKey) {
  return row(`SELECT ${ORDER_COLUMNS} FROM orders WHERE idempotency_key = $1`, [idempotencyKey]);
}

/** The open order for a quote / booking, if any. */
export async function findOpenOrderForSource(source) {
  return row(`SELECT ${ORDER_COLUMNS} FROM orders WHERE source_type = $1 AND source_ref = $2 AND status = $3`, [
    source.type,
    source.ref,
    OPEN_STATUS,
  ]);
}

/**
 * Inserts an order. Returns `{ order }`, or `{ duplicate: true }` when a unique index refused it (a
 * concurrent request with the same key, or another open order for the same source — the caller tells
 * them apart).
 */
export async function insertOrder(data) {
  try {
    const order = await row(
      `INSERT INTO orders (ref, status, source_type, source_ref, description, tenure, pricing, total_paise,
                           currency, expires_at, history, idempotency_key, request_hash)
            VALUES ($1, coalesce($2, 'PENDING_PAYMENT'), $3, $4, $5, $6, $7::jsonb, $8, coalesce($9, 'INR'),
                    $10, coalesce($11::jsonb, '[]'::jsonb), $12, $13)
         RETURNING ${ORDER_COLUMNS}`,
      [
        data.ref,
        data.status ?? null,
        data.source.type,
        data.source.ref,
        data.description,
        data.tenure ?? '',
        JSON.stringify(data.pricing),
        data.total_paise,
        data.currency ?? null,
        data.expiresAt,
        data.history ? JSON.stringify(data.history) : null,
        data.idempotencyKey ?? null,
        data.requestHash ?? null,
      ],
    );
    return { order };
  } catch (err) {
    if (err.code !== UNIQUE_VIOLATION) throw err;
    return { duplicate: true };
  }
}

/** Newest first; fetches `limit + 1` so the service can tell whether there is another page. */
export async function findOrders({ status, sourceType, after, limit }) {
  const cursor = cursorClause(after, 3);
  return rows(
    `SELECT ${ORDER_COLUMNS} FROM orders
      WHERE deleted_at IS NULL
        AND ($1::text IS NULL OR status = $1)
        AND ($2::text IS NULL OR source_type = $2)
        ${cursor.text}
      ORDER BY created_at DESC, ref DESC
      LIMIT $${cursor.next}`,
    [status ?? null, sourceType ?? null, ...cursor.params, limit + 1],
  );
}

/**
 * Moves an order to `to` only if it is still in `from` — two changes at once can't both win.
 * Returns the updated order, or null if it changed meanwhile.
 */
export async function updateOrderStatus(ref, from, to, entry) {
  return row(
    `UPDATE orders SET status = $3, history = history || $4::jsonb
      WHERE ref = $1 AND status = $2 AND deleted_at IS NULL
      RETURNING ${ORDER_COLUMNS}`,
    [ref, from, to, JSON.stringify([entry])],
  );
}
