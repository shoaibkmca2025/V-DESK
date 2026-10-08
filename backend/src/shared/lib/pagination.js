import { badRequest } from '../errors/AppError.js';

/**
 * Opaque cursors for newest-first lists ordered by (createdAt, ref) — modules.md §6.
 * Built from public fields only (never _id), so a cursor reveals nothing a client couldn't already see.
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

/** Mongo filter for "older than the cursor" under a (createdAt desc, ref desc) sort. */
export function olderThan(after) {
  return { $or: [{ createdAt: { $lt: after.createdAt } }, { createdAt: after.createdAt, ref: { $lt: after.ref } }] };
}

/** Splits a `limit + 1` fetch into the page and the cursor for the next one. */
export function toPage(docs, limit) {
  const hasMore = docs.length > limit;
  const items = hasMore ? docs.slice(0, limit) : docs;
  return { items, nextCursor: hasMore ? encodeCursor(items.at(-1)) : null };
}
