/**
 * withTransaction over PostgreSQL: a transaction commits as a whole or leaves nothing behind, and the
 * connection goes back to the pool either way.
 * Run: npx vitest run test/transactions.test.js
 */
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { withTransaction } from '../src/shared/lib/sql.js';
import { clearTestDb, count, query, startTestDb, stopTestDb } from './db.js';

/** A write that goes through the transaction's own client, which is what makes it part of it. */
const addCity = (tx, slug) =>
  tx.query(`INSERT INTO cities (ref, slug, name, state, tier) VALUES ($1, $2, 'City', 'MH', 'Tier-1')`, [
    `CITY-${slug.toUpperCase()}`,
    slug,
  ]);

beforeAll(startTestDb);
afterEach(clearTestDb);
afterAll(stopTestDb);

describe('withTransaction', () => {
  it('commits every write together and returns the function result', async () => {
    const result = await withTransaction(async (tx) => {
      await addCity(tx, 'pune');
      await addCity(tx, 'nashik');
      return 'done';
    });
    expect(result).toBe('done');
    expect(await count('cities')).toBe(2);
  });

  it('leaves nothing behind when the function throws', async () => {
    await expect(
      withTransaction(async (tx) => {
        await addCity(tx, 'pune');
        throw new Error('the second write failed');
      }),
    ).rejects.toThrow('the second write failed');
    expect(await count('cities')).toBe(0);
  });

  it('rolls back when the database itself refuses a write', async () => {
    await expect(
      withTransaction(async (tx) => {
        await addCity(tx, 'pune');
        await addCity(tx, 'pune'); // same slug: the unique index says no
      }),
    ).rejects.toMatchObject({ code: '23505' });
    expect(await count('cities')).toBe(0);
  });

  it('returns its connection to the pool, so more transactions than the pool holds still run', async () => {
    for (let i = 0; i < 12; i++) {
      await withTransaction((tx) => addCity(tx, `city-${i}`));
    }
    expect(await count('cities')).toBe(12);
  });

  it('a statement outside the transaction is not part of it', async () => {
    await expect(
      withTransaction(async (tx) => {
        await addCity(tx, 'inside');
        // No `tx`: this takes its own connection, so it commits on its own.
        await query(
          `INSERT INTO cities (ref, slug, name, state, tier) VALUES ('CITY-OUT', 'outside', 'O', 'MH', 'Tier-1')`,
        );
        throw new Error('rolled back');
      }),
    ).rejects.toThrow('rolled back');
    expect(await count('cities')).toBe(1);
    expect(await count('cities', 'slug = $1', ['outside'])).toBe(1);
  });
});
