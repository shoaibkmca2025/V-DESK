/**
 * Analytics repository — the only file that queries MongoDB for this module (through analytics.model.js).
 */
import { olderThan } from '../../shared/lib/pagination.js';
import { AnalyticsEvent } from './analytics.model.js';

const DUPLICATE_KEY = 11000;

/**
 * Inserts what it can and skips events already stored (same dedupeKey), so a retried batch is harmless.
 * @returns {Promise<number>} how many were new
 */
export async function insertEvents(events) {
  try {
    const docs = await AnalyticsEvent.insertMany(events, { ordered: false });
    return docs.length;
  } catch (err) {
    // Mongoose wraps each driver write error as { err, index }.
    const codes = (err.writeErrors ?? []).map((e) => e.err?.code ?? e.code);
    if (codes.length === 0 || codes.some((code) => code !== DUPLICATE_KEY)) throw err;
    return err.insertedDocs?.length ?? events.length - codes.length;
  }
}

/** Newest first; fetches `limit + 1` so the service can tell whether there is another page. */
export async function findEvents({ type, after, limit }) {
  const filter = { ...(type && { type }), ...(after && olderThan(after)) };
  return AnalyticsEvent.find(filter)
    .sort({ createdAt: -1, ref: -1 })
    .limit(limit + 1)
    .lean();
}

/** `[{ _id: type, count }]` for events since `since`, optionally only of `types`. */
export async function countByType(since, types) {
  const match = { occurredAt: { $gte: since }, ...(types && { type: { $in: types } }) };
  return AnalyticsEvent.aggregate([{ $match: match }, { $group: { _id: '$type', count: { $sum: 1 } } }]);
}

export async function countByDevice(since) {
  return AnalyticsEvent.aggregate([
    { $match: { occurredAt: { $gte: since } } },
    { $group: { _id: '$device', count: { $sum: 1 } } },
  ]);
}

/** Most frequent `data.query` values (trimmed, lower-cased) among events of `types` since `since`. */
export async function topQueries(since, types, limit) {
  return AnalyticsEvent.aggregate([
    { $match: { occurredAt: { $gte: since }, type: { $in: types }, 'data.query': { $type: 'string' } } },
    { $project: { query: { $toLower: { $trim: { input: '$data.query' } } } } },
    { $match: { query: { $ne: '' } } },
    { $group: { _id: '$query', count: { $sum: 1 } } },
    { $sort: { count: -1, _id: 1 } },
    { $limit: limit },
  ]);
}
