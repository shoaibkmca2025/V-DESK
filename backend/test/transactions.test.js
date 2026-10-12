import { describe, expect, it, vi } from 'vitest';
import { withTransaction } from '../src/shared/lib/transactions.js';

// A standalone MongoDB (local development only): no transactions, so the function runs once without a session.
// The replica-set path is covered by src/shared/events/bus.test.js ("saves the event only if the transaction commits").
vi.mock('../src/config/db.js', () => ({ supportsTransactions: () => false }));

describe('withTransaction on a standalone server', () => {
  it('runs the function once with no session and returns its result', async () => {
    const fn = vi.fn(async (session) => ({ session }));
    expect(await withTransaction(fn)).toEqual({ session: undefined });
    expect(fn).toHaveBeenCalledOnce();
  });
});
