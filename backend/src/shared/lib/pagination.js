import { badRequest } from '../errors/AppError.js';

/**
 * Opaque cursors for newest-first lists ordered by (createdAt, ref) — modules.md §6.
 * Built from public fields only (never the surrogate id), so a cursor reveals nothing a client couldn't
 * already see.
 */
export function encodeCursor(doc) {
  return Buffer.from(JSON.stringify({ c: doc.createdAt.toISOString(), r: doc.ref })).toString('base64url');
}

/** @returns {{ createdAt: Date, ref: string }} — throws 400 INVALID_CURSOR for anything it didn't produce. */
export function decodeCursor(cursor) {
  try {
    const { c, r } = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'));
    const createdAt = new Date(c);
    if (typeof r !== 'string' || Number.isNaN(createdAt.getTime())) throw new Error('bad cursor');
    return { createdAt, ref: r };
  } catch {
    throw badRequest('INVALID_CURSOR', 'The pagination cursor is invalid');
  }
}

/**
 * The "older than the cursor" condition under an `ORDER BY created_at DESC, ref DESC` sort, as a SQL
 * fragment the caller appends to its WHERE clause. Postgres compares the pair in one go, so the tie on
 * equal timestamps is broken by `ref` without a second OR branch.
 *
 * @param {{ createdAt: Date, ref: string } | undefined} after  a decoded cursor, or nothing for page one
 * @param {number} from  the next free parameter number ($1 is 1)
 * @returns {{ text: string, params: unknown[], next: number }} `text` is '' when there is no cursor
 */
export function cursorClause(after, from = 1) {
  if (!after) return { text: '', params: [], next: from };
  return {
    text: `AND (created_at, ref) < ($${from}, $${from + 1})`,
    params: [after.createdAt, after.ref],
    next: from + 2,
  };
}

/** Splits a `limit + 1` fetch into the page and the cursor for the next one. */
export function toPage(docs, limit) {
  const hasMore = docs.length > limit;
  const items = hasMore ? docs.slice(0, limit) : docs;
  return { items, nextCursor: hasMore ? encodeCursor(items.at(-1)) : null };
}
