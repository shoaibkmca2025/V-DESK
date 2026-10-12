import mongoose from 'mongoose';
import { supportsTransactions } from '../../config/db.js';

/**
 * Runs `fn(session)` as one all-or-nothing MongoDB transaction: either every write inside it (the state change and
 * the outbox event that announces it) is saved, or none is. Pass `session` to every repository call inside `fn`.
 *
 * The MongoDB driver retries the whole function on transient errors (e.g. a write conflict), so `fn` must not have
 * side effects outside the database — no HTTP calls, no messages; publish an event instead (rules.md §28).
 *
 * On a standalone MongoDB (local development only — production refuses to start, see config/db.js) there are no
 * transactions: `fn` runs once with `session` undefined, so a crash between two writes can leave one without the
 * other.
 * @template T
 * @param {(session: import('mongoose').ClientSession | undefined) => Promise<T>} fn
 * @returns {Promise<T>}
 */
export async function withTransaction(fn) {
  if (!supportsTransactions()) return fn(undefined);
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      result = await fn(session);
    });
    return result;
  } finally {
    await session.endSession();
  }
}
