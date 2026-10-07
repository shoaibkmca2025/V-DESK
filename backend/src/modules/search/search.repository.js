/**
 * Search repository — the only file that queries MongoDB for this module (through search.model.js).
 * Returns plain objects (`.lean()`) and hides soft-deleted records.
 */
import { SearchConfig, SearchRedirect, SearchService, SearchSynonym } from './search.model.js';

const DUPLICATE_KEY = 11000;
const notDeleted = { deletedAt: null };

/** Runs an insert and returns the document, or null when a unique key is already taken by a live record. */
async function insertUnique(model, data) {
  try {
    const doc = await model.create(data);
    return doc.toObject();
  } catch (err) {
    if (err.code === DUPLICATE_KEY) return null;
    throw err;
  }
}

/** Applies `$set`, returning the updated document, null if not found, or `false` on a unique-key clash. */
async function updateUnique(model, filter, set) {
  try {
    return await model
      .findOneAndUpdate({ ...filter, ...notDeleted }, { $set: set }, { returnDocument: 'after' })
      .lean();
  } catch (err) {
    if (err.code === DUPLICATE_KEY) return false;
    throw err;
  }
}

/** Soft-deletes one live record; returns true if one was deleted. */
async function softDelete(model, filter) {
  const result = await model.updateOne({ ...filter, ...notDeleted }, { $set: { deletedAt: new Date() } });
  return result.modifiedCount === 1;
}

// ──────────────────────────────────────────────
// Services
// ──────────────────────────────────────────────

export async function findServices() {
  return SearchService.find(notDeleted).sort({ createdAt: 1, _id: 1 }).lean();
}

/** Insert-or-update a live service by slug (used by the seed script). */
export async function upsertServiceBySlug(slug, data) {
  await SearchService.updateOne({ slug, ...notDeleted }, { $set: data }, { upsert: true });
}

// ──────────────────────────────────────────────
// Synonyms
// ──────────────────────────────────────────────

export async function findSynonyms() {
  return SearchSynonym.find(notDeleted).sort({ term: 1 }).lean();
}

// ──────────────────────────────────────────────
// Redirects
// ──────────────────────────────────────────────

export async function findRedirects() {
  return SearchRedirect.find(notDeleted).sort({ query: 1 }).lean();
}

export async function findRedirectByQuery(query) {
  return SearchRedirect.findOne({ query, ...notDeleted }).lean();
}

export async function findRedirectByRef(ref) {
  return SearchRedirect.findOne({ ref, ...notDeleted }).lean();
}

export const insertRedirect = (data) => insertUnique(SearchRedirect, data);
export const updateRedirect = (ref, set) => updateUnique(SearchRedirect, { ref }, set);
export const deleteRedirect = (ref) => softDelete(SearchRedirect, { ref });

// ──────────────────────────────────────────────
// Config
// ──────────────────────────────────────────────

export async function findConfigEntries() {
  return SearchConfig.find(notDeleted).sort({ key: 1 }).lean();
}

export async function findConfigEntry(key) {
  return SearchConfig.findOne({ key, ...notDeleted }).lean();
}

export const insertConfigEntry = (data) => insertUnique(SearchConfig, data);
export const updateConfigEntry = (key, value) => updateUnique(SearchConfig, { key }, { value });
export const deleteConfigEntry = (key) => softDelete(SearchConfig, { key });
