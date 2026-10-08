/**
 * Analytics service — event ingest, the staff event stream, KPIs and the conversion funnel.
 *
 * Rules:
 *  - Ingest is fire-and-forget for the client: it never fails a batch because some events were seen before.
 *  - Nothing personal is stored (rules.md §21) — see analytics.privacy.js. Ingest is not logged per event.
 *  - KPIs and the funnel are computed from stored events at request time (no rollup yet).
 *  - Lead and revenue numbers belong to crm (/leads/stats) and, later, orders — not to client-reported events.
 */
import { createHash } from 'node:crypto';
import { decodeCursor, toPage } from '../../shared/lib/pagination.js';
import { generateRef } from '../../shared/lib/refs.js';
import {
  FUNNEL_STEPS,
  MAX_CLOCK_SKEW_MS,
  MAX_EVENT_AGE_MS,
  NO_RESULT_TYPE,
  RANGES,
  SEARCH_TYPES,
  TOP_N,
} from './analytics.constants.js';
import { mapEvent } from './analytics.mapper.js';
import { sanitizeEventData } from './analytics.privacy.js';
import * as repo from './analytics.repository.js';

// ──────────────────────────────────────────────
// Ingest
// ──────────────────────────────────────────────

/** Trusts the device clock only within a sane window around the time the event reached us. */
export function resolveOccurredAt(timestamp, now) {
  const time = timestamp ? new Date(timestamp) : null;
  if (!time || Number.isNaN(time.getTime())) return now;
  if (time > new Date(now.getTime() + MAX_CLOCK_SKEW_MS) || time < new Date(now.getTime() - MAX_EVENT_AGE_MS)) {
    return now;
  }
  return time;
}

/** Same event content → same key. Used to make a re-sent batch insert nothing. */
export function dedupeKeyFor({ clientRef, type, device, occurredAt, data }) {
  const content = JSON.stringify([clientRef, type, device, occurredAt.toISOString(), data]);
  return createHash('sha256').update(content).digest('hex');
}

/**
 * Stores a batch of client events (already shape-validated).
 * @param {{ id?: string, type: string, data?: object, device: string, timestamp?: string }[]} events
 * @returns {Promise<{ accepted: number, duplicates: number }>}
 */
export async function ingestEvents(events, now = new Date()) {
  const docs = events.map((event) => {
    const doc = {
      clientRef: event.id ?? null,
      type: event.type,
      device: event.device,
      occurredAt: resolveOccurredAt(event.timestamp, now),
      data: sanitizeEventData(event.data),
    };
    return { ...doc, ref: generateRef('EVT'), dedupeKey: dedupeKeyFor(doc) };
  });
  // The same event twice inside one batch is a duplicate too.
  const unique = [...new Map(docs.map((doc) => [doc.dedupeKey, doc])).values()];
  const accepted = await repo.insertEvents(unique);
  return { accepted, duplicates: events.length - accepted };
}

// ──────────────────────────────────────────────
// Staff reads
// ──────────────────────────────────────────────

/** The admin telemetry stream, newest first. */
export async function listEvents({ type, cursor, limit }) {
  const after = cursor ? decodeCursor(cursor) : undefined;
  const { items, nextCursor } = toPage(await repo.findEvents({ type, after, limit }), limit);
  return { events: items.map(mapEvent), nextCursor };
}

function rangeStart(range, now) {
  return new Date(now.getTime() - RANGES[range] * 24 * 60 * 60 * 1000);
}

const percent = (part, whole) => (whole > 0 ? Math.round((part / whole) * 1000) / 10 : null);
const toCounts = (rows) => Object.fromEntries(rows.map(({ _id, count }) => [_id, count]));
const sumOf = (counts, types) => types.reduce((sum, type) => sum + (counts[type] ?? 0), 0);

/** Website KPIs for the admin dashboard over `range` (24h / 7d / 30d / 90d). */
export async function getKpis({ range }, now = new Date()) {
  const since = rangeStart(range, now);
  const [typeRows, deviceRows, topSearches, topNoResults] = await Promise.all([
    repo.countByType(since),
    repo.countByDevice(since),
    repo.topQueries(since, SEARCH_TYPES, TOP_N),
    repo.topQueries(since, [NO_RESULT_TYPE], TOP_N),
  ]);

  const byType = toCounts(typeRows);
  const searches = sumOf(byType, SEARCH_TYPES);
  const noResults = byType[NO_RESULT_TYPE] ?? 0;
  const asQueryList = (rows) => rows.map(({ _id, count }) => ({ query: _id, count }));

  return {
    range: { key: range, from: since, to: now },
    events: { total: typeRows.reduce((sum, { count }) => sum + count, 0), byType },
    devices: toCounts(deviceRows),
    search: {
      searches,
      noResults,
      noResultRate: percent(noResults, searches),
      topQueries: asQueryList(topSearches),
      topNoResultQueries: asQueryList(topNoResults),
    },
    conversion: {
      quotesStarted: byType.quote_started ?? 0,
      checkoutsStarted: byType.checkout_started ?? 0,
      kycSubmitted: byType.kyc_submitted ?? 0,
      payments: byType.payment_success ?? 0,
    },
  };
}

/** Funnel step counts, with the share kept from the previous step and from the first. */
export async function getFunnel({ range }, now = new Date()) {
  const since = rangeStart(range, now);
  const counts = toCounts(
    await repo.countByType(
      since,
      FUNNEL_STEPS.flatMap((step) => step.types),
    ),
  );
  const totals = FUNNEL_STEPS.map((step) => sumOf(counts, step.types));

  const steps = FUNNEL_STEPS.map(({ key, label, types }, i) => ({
    key,
    label,
    types,
    count: totals[i],
    fromPrevious: i === 0 ? null : percent(totals[i], totals[i - 1]),
    fromStart: i === 0 ? null : percent(totals[i], totals[0]),
  }));
  return { range: { key: range, from: since, to: now }, basis: 'events', steps };
}
