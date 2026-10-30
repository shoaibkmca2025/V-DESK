/**
 * Event bus over the transactional outbox (ADR-005, ADR-008; rules.md §4).
 *
 *   publish(event, { session })      — the owning module, inside withTransaction() with its own writes
 *   subscribe(type, name, handler)   — a consuming module, in its <module>.events.js (registered in src/events.js)
 *   dispatchDueEvents()              — the worker (src/jobs.js), every second
 *
 * Delivery is at least once: a handler can run again after a crash or a lease timeout, so every handler must be
 * idempotent (e.g. notify() with a stable dedupeKey). Handlers of one event are tracked separately — a retry runs
 * only the ones that haven't finished. There is no ordering guarantee between events.
 *
 * A handler signals failure by throwing; the event is retried with backoff and marked DEAD after MAX_ATTEMPTS.
 * A handler that decides an event needs no action (missing template, bad recipient) just returns.
 */
import { randomUUID } from 'node:crypto';
import { logger } from '../lib/logger.js';
import { generateRef } from '../lib/refs.js';
import { exec, row } from '../lib/sql.js';

const log = logger.child({ module: 'events' });

export const EVENT_TYPE_PATTERN = /^[a-z][a-z_]*(\.[a-z][a-z_]*)+$/;
/** PENDING until every handler is done, DEAD once it has given up. Matches the CHECK on domain_events. */
export const EVENT_STATUSES = ['PENDING', 'DONE', 'DEAD'];
export const MAX_ATTEMPTS = 8;
/** Wait before attempt n+1 (seconds): 10 s, 1 min, 5 min, 15 min, 1 h, 3 h, 6 h. */
export const RETRY_DELAYS_SECONDS = [10, 60, 300, 900, 3600, 10800, 21600];
export const LEASE_SECONDS = 60;
export const RETENTION_DAYS = 30;

const subscribers = new Map();

// ──────────────────────────────────────────────
// Publishing
// ──────────────────────────────────────────────

/**
 * Records an event in the outbox. Call inside withTransaction() and pass its client as `session`, so the event
 * is saved if and only if the change it announces is.
 * @param {{ type: string, entity: { type: string, ref: string }, actor?: { type: string, id?: string|null },
 *           payload?: object, occurredAt?: Date }} event
 * @param {{ session?: import('pg').PoolClient }} [options]
 */
export async function publish(event, { session: tx } = {}) {
  if (!EVENT_TYPE_PATTERN.test(event.type)) throw new Error(`Invalid event type '${event.type}'`);
  if (!event.entity?.type || !event.entity?.ref)
    throw new Error(`Event '${event.type}' needs entity.type and entity.ref`);
  const occurredAt = event.occurredAt ?? new Date();
  const doc = await row(
    `INSERT INTO domain_events (ref, type, occurred_at, actor_type, actor_id, entity_type, entity_ref,
                                payload, next_attempt_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $3)
       RETURNING ref`,
    [
      generateRef('DE', 6),
      event.type,
      occurredAt,
      event.actor?.type ?? 'system',
      event.actor?.id ?? null,
      event.entity.type,
      event.entity.ref,
      JSON.stringify(event.payload ?? {}),
    ],
    tx,
  );
  return { ref: doc.ref };
}

// ──────────────────────────────────────────────
// Subscribing
// ──────────────────────────────────────────────

/**
 * Registers `handler(event)` for `type` under a stable `name` (e.g. 'notifications.lead_confirmation'). The name is
 * what the outbox records as done, so renaming a handler makes undelivered events run it again.
 */
export function subscribe(type, name, handler) {
  if (!EVENT_TYPE_PATTERN.test(type)) throw new Error(`Invalid event type '${type}'`);
  const list = subscribers.get(type) ?? [];
  subscribers.set(type, [...list.filter((s) => s.name !== name), { name, handler }]);
}

export function handlersFor(type) {
  return subscribers.get(type) ?? [];
}

// ──────────────────────────────────────────────
// Dispatching (worker)
// ──────────────────────────────────────────────

const secondsAfter = (now, seconds) => new Date(now.getTime() + seconds * 1000);

/** What a handler sees: the event as published, without delivery bookkeeping. */
const viewOf = (doc) =>
  Object.freeze({
    ref: doc.ref,
    type: doc.type,
    version: doc.version,
    occurredAt: doc.occurredAt,
    actor: doc.actor,
    entity: doc.entity,
    payload: doc.payload,
  });

/**
 * Takes the next due event: oldest first, in one statement. `FOR UPDATE SKIP LOCKED` is what lets several
 * workers run at once, each stepping over rows another has already taken.
 */
async function claimNext(now) {
  return row(
    `UPDATE domain_events
        SET claim_token = $1, lease_until = $2, attempts = attempts + 1
      WHERE id = (
        SELECT id FROM domain_events
         WHERE status = 'PENDING' AND next_attempt_at <= $3 AND (lease_until IS NULL OR lease_until <= $3)
         ORDER BY next_attempt_at, id
         FOR UPDATE SKIP LOCKED
         LIMIT 1
      )
      RETURNING ref, type, version, occurred_at AS "occurredAt",
                jsonb_build_object('type', actor_type, 'id', actor_id) AS actor,
                jsonb_build_object('type', entity_type, 'ref', entity_ref) AS entity,
                payload, status, handled, attempts,
                next_attempt_at AS "nextAttemptAt", claim_token AS "claimToken", lease_until AS "leaseUntil"`,
    [randomUUID(), secondsAfter(now, LEASE_SECONDS), now],
  );
}

/** Records one finished handler, while this worker still holds the claim. */
async function markHandled(event, name) {
  await exec(
    `UPDATE domain_events SET handled = array_append(handled, $3)
      WHERE ref = $1 AND claim_token = $2 AND NOT (handled @> ARRAY[$3])`,
    [event.ref, event.claimToken, name],
  );
}

/**
 * Releases the claim and writes the outcome, but only while this worker still holds it; returns false when
 * the lease was lost to another worker in the meantime.
 */
async function releaseClaim(
  event,
  { status = null, completedAt = null, expireAt = null, nextAttemptAt = null, failure = null },
) {
  const changed = await exec(
    `UPDATE domain_events
        SET claim_token = NULL,
            lease_until = NULL,
            status = coalesce($3, status),
            completed_at = coalesce($4, completed_at),
            expire_at = coalesce($5, expire_at),
            next_attempt_at = coalesce($6, next_attempt_at),
            last_error = coalesce($7::jsonb, last_error)
      WHERE ref = $1 AND claim_token = $2`,
    [
      event.ref,
      event.claimToken,
      status,
      completedAt,
      expireAt,
      nextAttemptAt,
      failure ? JSON.stringify(failure) : null,
    ],
  );
  return changed === 1;
}

/** Runs the handlers this event still needs and records the outcome. Returns 'done' | 'retry' | 'dead' | 'lost'. */
async function deliver(event, now) {
  const meta = { eventRef: event.ref, type: event.type, attempt: event.attempts };
  let failure = null;

  for (const { name, handler } of handlersFor(event.type)) {
    if (event.handled.includes(name)) continue;
    try {
      await handler(viewOf(event));
      await markHandled(event, name);
    } catch (err) {
      // Codes and names only — error messages can carry personal data (rules.md §21).
      failure = { handler: name, code: String(err?.code ?? err?.name ?? 'ERROR'), at: new Date() };
      log.warn({ event: 'event.handler_failed', ...meta, handler: name, errorCode: failure.code }, 'handler failed');
    }
  }

  const finishedAt = new Date();
  if (!failure) {
    const done = {
      status: 'DONE',
      completedAt: finishedAt,
      expireAt: secondsAfter(finishedAt, RETENTION_DAYS * 86400),
    };
    return (await releaseClaim(event, done)) ? 'done' : 'lost';
  }
  if (event.attempts >= MAX_ATTEMPTS) {
    const ok = await releaseClaim(event, { status: 'DEAD', failure });
    if (ok) log.error({ event: 'event.dead', ...meta, handler: failure.handler }, 'event gave up after max attempts');
    return ok ? 'dead' : 'lost';
  }
  const retryAt = secondsAfter(now, RETRY_DELAYS_SECONDS[event.attempts - 1]);
  const ok = await releaseClaim(event, { nextAttemptAt: retryAt, failure });
  return ok ? 'retry' : 'lost';
}

/**
 * Delivers due events, one claim at a time, until none is due or `limit` is reached. Safe to run in several
 * workers at once: a claim is an atomic update with a lease. `now` pins the clock (tests only).
 * @returns {Promise<{ done: number, retry: number, dead: number, lost: number }>}
 */
export async function dispatchDueEvents({ limit = 50, now: pinnedNow } = {}) {
  const summary = { done: 0, retry: 0, dead: 0, lost: 0 };
  for (let i = 0; i < limit; i++) {
    const now = pinnedNow ?? new Date();
    const event = await claimNext(now);
    if (!event) break;
    summary[await deliver(event, now)] += 1;
  }
  return summary;
}
