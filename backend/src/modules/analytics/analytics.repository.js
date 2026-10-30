/**
 * Analytics repository — the only file that queries the database for this module.
 *
 * Events are never edited, only aged out by the purge job (src/shared/jobs/purge.js), so there is no
 * `deleted_at` here and every write is an insert.
 */
import { cursorClause } from '../../shared/lib/pagination.js';
import { rows } from '../../shared/lib/sql.js';

const EVENT_COLUMNS = `
  ref, client_ref AS "clientRef", type, data, device,
  occurred_at AS "occurredAt", dedupe_key AS "dedupeKey", created_at AS "createdAt"`;

/**
 * Inserts what it can and skips events already stored (same dedupeKey), so a retried batch is harmless.
 * ON CONFLICT does that in one statement, and RETURNING counts only the rows that were actually new.
 * @returns {Promise<number>} how many were new
 */
export async function insertEvents(events) {
  if (events.length === 0) return 0;
  const inserted = await rows(
    `INSERT INTO analytics_events (ref, client_ref, type, data, device, occurred_at, dedupe_key)
     SELECT * FROM unnest($1::text[], $2::text[], $3::text[], $4::jsonb[], $5::text[],
                          $6::timestamptz[], $7::text[])
     ON CONFLICT (dedupe_key) DO NOTHING
       RETURNING ref`,
    [
      events.map((event) => event.ref),
      events.map((event) => event.clientRef ?? null),
      events.map((event) => event.type),
      events.map((event) => JSON.stringify(event.data ?? {})),
      events.map((event) => event.device ?? 'Unknown'),
      events.map((event) => event.occurredAt),
      events.map((event) => event.dedupeKey),
    ],
  );
  return inserted.length;
}

/** Newest first; fetches `limit + 1` so the service can tell whether there is another page. */
export async function findEvents({ type, after, limit }) {
  const cursor = cursorClause(after, 2);
  return rows(
    `SELECT ${EVENT_COLUMNS} FROM analytics_events
      WHERE ($1::text IS NULL OR type = $1) ${cursor.text}
      ORDER BY created_at DESC, ref DESC
      LIMIT $${cursor.next}`,
    [type ?? null, ...cursor.params, limit + 1],
  );
}

/** `[{ value: type, count }]` for events since `since`, optionally only of `types`. */
export async function countByType(since, types) {
  return rows(
    `SELECT type AS value, count(*)::int AS count FROM analytics_events
      WHERE occurred_at >= $1 AND ($2::text[] IS NULL OR type = ANY($2))
      GROUP BY type`,
    [since, types ?? null],
  );
}

export async function countByDevice(since) {
  return rows(
    `SELECT device AS value, count(*)::int AS count FROM analytics_events
      WHERE occurred_at >= $1 GROUP BY device`,
    [since],
  );
}

/** Most frequent `data.query` values (trimmed, lower-cased) among events of `types` since `since`. */
export async function topQueries(since, types, limit) {
  return rows(
    `SELECT lower(btrim(data->>'query')) AS value, count(*)::int AS count
       FROM analytics_events
      WHERE occurred_at >= $1
        AND type = ANY($2)
        AND jsonb_typeof(data->'query') = 'string'
        AND btrim(data->>'query') <> ''
      GROUP BY value
      ORDER BY count DESC, value
      LIMIT $3`,
    [since, types, limit],
  );
}
