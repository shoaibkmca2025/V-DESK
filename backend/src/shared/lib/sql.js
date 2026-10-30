/**
 * The SQL layer every repository goes through (ADR-010).
 *
 *   rows(text, params, tx)   — every matching row
 *   row(text, params, tx)    — the first row, or null
 *   exec(text, params, tx)   — how many rows the statement changed
 *   withTransaction(fn)      — one all-or-nothing transaction
 *
 * `tx` is the client a transaction is running on. Pass it to every call inside `withTransaction`, or the
 * statement runs on its own connection and lands outside the transaction. Without it, each call takes a
 * connection from the pool for the length of that one statement.
 *
 * Repositories write the SQL themselves — there is no query builder here on purpose, so what runs against
 * the database is what you read in the repository (rules.md §17).
 */
import { pool } from '../../config/db.js';

/** A `pg` error code → the duplicate-key one repositories check for. */
export const UNIQUE_VIOLATION = '23505';
/** A CHECK constraint or a domain (e.g. ist_date) refused the value. */
export const CHECK_VIOLATION = '23514';

export async function query(text, params = [], tx) {
  return (tx ?? pool).query(text, params);
}

export async function rows(text, params = [], tx) {
  return (await query(text, params, tx)).rows;
}

export async function row(text, params = [], tx) {
  return (await query(text, params, tx)).rows[0] ?? null;
}

export async function exec(text, params = [], tx) {
  return (await query(text, params, tx)).rowCount;
}

/**
 * Runs `fn(tx)` as one transaction: either every write inside it (the state change and the outbox event
 * that announces it) is saved, or none is.
 *
 * `fn` must not have side effects outside the database — no HTTP calls, no messages; publish an event
 * instead (rules.md §28), because a serialization failure or a deadlock aborts and the caller retries.
 * @template T
 * @param {(tx: import('pg').PoolClient) => Promise<T>} fn
 * @returns {Promise<T>}
 */
export async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    // The rollback itself can fail if the connection died; the original error is the useful one.
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

/**
 * `{ createdAt, deletedAt: null }`-style object keys → a `SET` clause and its parameters.
 * Repositories pass a column→value map, so the caller still decides exactly which columns move.
 * @param {Record<string, unknown>} columns
 * @param {number} from  the next free parameter number ($1 is 1)
 */
export function setClause(columns, from = 1) {
  const names = Object.keys(columns);
  return {
    text: names.map((name, i) => `${name} = $${from + i}`).join(', '),
    params: names.map((name) => columns[name]),
    count: names.length,
  };
}
