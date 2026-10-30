/**
 * Event bus / outbox — integration tests on a real PostgreSQL (real transactions).
 * Each test uses its own event type, because subscriptions are registered process-wide.
 * Run: npx vitest run src/shared/events/bus.test.js
 */
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { clearTestDb, query, row, rows, startTestDb, stopTestDb } from '../../../test/db.js';
import { withTransaction } from '../lib/sql.js';
import { MAX_ATTEMPTS, RETRY_DELAYS_SECONDS, dispatchDueEvents, publish, subscribe } from './bus.js';

const entity = { type: 'lead', ref: 'VD-TEST-0001' };
const later = (date, seconds) => new Date(date.getTime() + seconds * 1000);

/** One stored event, under the field names the bus and its handlers use. */
const storedEvent = (ref) =>
  row(
    `SELECT ref, type, version, status, handled, attempts, payload,
            jsonb_build_object('type', actor_type, 'id', actor_id) AS actor,
            jsonb_build_object('type', entity_type, 'ref', entity_ref) AS entity,
            next_attempt_at AS "nextAttemptAt", claim_token AS "claimToken",
            lease_until AS "leaseUntil", last_error AS "lastError",
            completed_at AS "completedAt", expire_at AS "expireAt"
       FROM domain_events WHERE ref = $1`,
    [ref],
  );

beforeAll(startTestDb);
afterEach(clearTestDb);
afterAll(stopTestDb);

describe('publish', () => {
  it('saves the event only if the transaction commits', async () => {
    await withTransaction((tx) => publish({ type: 'test.committed', entity }, { session: tx }));
    await expect(
      withTransaction(async (tx) => {
        await publish({ type: 'test.rolled_back', entity }, { session: tx });
        throw new Error('the business write failed');
      }),
    ).rejects.toThrow('the business write failed');

    const types = (await rows('SELECT type FROM domain_events ORDER BY created_at')).map((e) => e.type);
    expect(types).toEqual(['test.committed']);
  });

  it('stores the modules.md §4 shape and rejects malformed events', async () => {
    const { ref } = await publish({
      type: 'test.shape',
      entity,
      actor: { type: 'user', id: 'USR-1' },
      payload: { a: 1 },
    });
    expect(ref).toMatch(/^DE-[A-Z0-9]+$/);
    expect(await storedEvent(ref)).toMatchObject({
      type: 'test.shape',
      version: 1,
      actor: { type: 'user', id: 'USR-1' },
      entity,
      payload: { a: 1 },
      status: 'PENDING',
      handled: [],
      attempts: 0,
    });
    await expect(publish({ type: 'NotAType', entity })).rejects.toThrow('Invalid event type');
    await expect(publish({ type: 'test.no_entity' })).rejects.toThrow('entity');
  });
});

describe('dispatchDueEvents', () => {
  it('runs every handler once and marks the event DONE with a retention date', async () => {
    const first = vi.fn();
    const second = vi.fn();
    subscribe('test.delivered', 'first', first);
    subscribe('test.delivered', 'second', second);
    const { ref } = await publish({ type: 'test.delivered', entity, payload: { n: 1 } });

    expect(await dispatchDueEvents()).toEqual({ done: 1, retry: 0, dead: 0, lost: 0 });
    expect(first).toHaveBeenCalledOnce();
    expect(first.mock.calls[0][0]).toMatchObject({ ref, type: 'test.delivered', entity, payload: { n: 1 } });
    expect(second).toHaveBeenCalledOnce();

    const doc = await storedEvent(ref);
    expect(doc).toMatchObject({ status: 'DONE', handled: ['first', 'second'], claimToken: null });
    expect(doc.expireAt.getTime()).toBeGreaterThan(Date.now() + 29 * 86400_000);
    expect(await dispatchDueEvents()).toEqual({ done: 0, retry: 0, dead: 0, lost: 0 });
  });

  it('marks an event with no subscribers DONE', async () => {
    await publish({ type: 'test.nobody_listens', entity });
    expect((await dispatchDueEvents()).done).toBe(1);
  });

  it('retries only the handler that failed, after a backoff', async () => {
    const ok = vi.fn();
    const flaky = vi.fn().mockRejectedValueOnce(Object.assign(new Error('provider down'), { code: 'TIMEOUT' }));
    subscribe('test.partial', 'ok', ok);
    subscribe('test.partial', 'flaky', flaky);
    const start = new Date();
    const { ref } = await publish({ type: 'test.partial', entity, occurredAt: start });

    expect((await dispatchDueEvents({ now: start })).retry).toBe(1);
    let doc = await storedEvent(ref);
    expect(doc).toMatchObject({ status: 'PENDING', handled: ['ok'], lastError: { handler: 'flaky', code: 'TIMEOUT' } });
    expect(doc.nextAttemptAt).toEqual(later(start, RETRY_DELAYS_SECONDS[0]));

    // Not due yet.
    expect((await dispatchDueEvents({ now: later(start, 5) })).retry).toBe(0);
    expect((await dispatchDueEvents({ now: later(start, 11) })).done).toBe(1);
    expect(ok).toHaveBeenCalledOnce();
    expect(flaky).toHaveBeenCalledTimes(2);
    doc = await storedEvent(ref);
    expect(doc).toMatchObject({ status: 'DONE', handled: ['ok', 'flaky'], attempts: 2 });
  });

  it('gives up after MAX_ATTEMPTS and keeps the event as DEAD', async () => {
    subscribe('test.always_fails', 'broken', async () => {
      throw new Error('nope');
    });
    let now = new Date();
    const { ref } = await publish({ type: 'test.always_fails', entity, occurredAt: now });
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const summary = await dispatchDueEvents({ now });
      expect(summary[attempt < MAX_ATTEMPTS ? 'retry' : 'dead']).toBe(1);
      now = later(now, 6 * 3600 + 1);
    }
    expect(await storedEvent(ref)).toMatchObject({ status: 'DEAD', attempts: MAX_ATTEMPTS, expireAt: null });
    expect(await dispatchDueEvents({ now })).toEqual({ done: 0, retry: 0, dead: 0, lost: 0 });
  });

  it('delivers each event once when two workers dispatch at the same time', async () => {
    const handler = vi.fn(async () => new Promise((resolve) => setTimeout(resolve, 20)));
    subscribe('test.parallel', 'slow', handler);
    for (let i = 0; i < 6; i++) await publish({ type: 'test.parallel', entity: { type: 'lead', ref: `VD-P-${i}` } });

    const [a, b] = await Promise.all([dispatchDueEvents(), dispatchDueEvents()]);
    expect(a.done + b.done).toBe(6);
    expect(handler).toHaveBeenCalledTimes(6);
    expect(new Set(handler.mock.calls.map(([event]) => event.entity.ref)).size).toBe(6);
  });

  it('takes over an event whose worker died, once its lease runs out', async () => {
    const handler = vi.fn();
    subscribe('test.crashed', 'h', handler);
    const now = new Date();
    const { ref } = await publish({ type: 'test.crashed', entity, occurredAt: now });
    // A worker claimed it and died without recording anything.
    await query(
      `UPDATE domain_events SET claim_token = 'dead-worker', lease_until = $2, attempts = attempts + 1
        WHERE ref = $1`,
      [ref, later(now, 60)],
    );

    expect((await dispatchDueEvents({ now: later(now, 30) })).done).toBe(0);
    expect((await dispatchDueEvents({ now: later(now, 61) })).done).toBe(1);
    expect(handler).toHaveBeenCalledOnce();
  });
});
