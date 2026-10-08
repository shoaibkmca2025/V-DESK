/**
 * Pricing repository — the only file that queries MongoDB for this module (through pricing.model.js).
 */
import { olderThan } from '../../shared/lib/pagination.js';
import { PricingRule, Quote } from './pricing.model.js';

const DUPLICATE_KEY = 11000;
const notDeleted = { deletedAt: null };

// ──────────────────────────────────────────────
// Rules
// ──────────────────────────────────────────────

export async function findRuleOverrides() {
  return PricingRule.find().lean();
}

export async function upsertRule(key, value, updatedBy) {
  return PricingRule.findOneAndUpdate(
    { key },
    { $set: { value, updatedBy } },
    { upsert: true, returnDocument: 'after' },
  ).lean();
}

/** Returns true when an override existed and was removed. */
export async function deleteRule(key) {
  const res = await PricingRule.deleteOne({ key });
  return res.deletedCount === 1;
}

// ──────────────────────────────────────────────
// Quotes
// ──────────────────────────────────────────────

export async function findQuoteByRef(ref) {
  return Quote.findOne({ ref, ...notDeleted }).lean();
}

export async function findQuoteByIdempotencyKey(idempotencyKey) {
  return Quote.findOne({ idempotencyKey }).lean();
}

/** Inserts a quote, or returns null when the Idempotency-Key was taken by a concurrent request. */
export async function insertQuote(data) {
  try {
    const doc = await Quote.create(data);
    return doc.toObject();
  } catch (err) {
    if (err.code === DUPLICATE_KEY) return null;
    throw err;
  }
}

/** Newest first; fetches `limit + 1` so the service can tell whether there is another page. */
export async function findQuotes({ status, after, limit }) {
  const filter = { ...notDeleted, ...(status && { status }), ...(after && olderThan(after)) };
  return Quote.find(filter)
    .sort({ createdAt: -1, ref: -1 })
    .limit(limit + 1)
    .lean();
}

/**
 * Moves a quote to `to` only if it is still in `from` — two people accepting and rejecting at once can't
 * both win. Returns the updated quote, or null if it changed meanwhile.
 */
export async function updateQuoteStatus(ref, from, to, entry) {
  return Quote.findOneAndUpdate(
    { ref, status: from, ...notDeleted },
    { $set: { status: to }, $push: { history: entry } },
    { returnDocument: 'after' },
  ).lean();
}
