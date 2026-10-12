/**
 * CMS repository — the only file that queries MongoDB for this module (through cms.model.js).
 * Soft-deleted entries are invisible everywhere.
 */
import { ContentEntry, ContentRevision } from './cms.model.js';

const DUPLICATE_KEY = 11000;
const live = { deletedAt: null };

export async function findEntry(type, key) {
  return ContentEntry.findOne({ type, key, ...live }).lean();
}

/** Staff list: every live entry of a type, drafts included. */
export async function findEntries(type) {
  return ContentEntry.find({ type, ...live })
    .sort({ order: 1, key: 1 })
    .lean();
}

/** Public list: only entries with a published copy. */
export async function findPublished(type) {
  return ContentEntry.find({ type, ...live, published: { $ne: null } })
    .sort({ order: 1, key: 1 })
    .lean();
}

/** Inserts a new entry, or returns null when (type, key) is already live. */
export async function insertEntry(data) {
  try {
    const doc = await ContentEntry.create(data);
    return doc.toObject();
  } catch (err) {
    if (err.code === DUPLICATE_KEY) return null;
    throw err;
  }
}

/**
 * Applies `set` only while the draft is still at `version` (optimistic locking): two editors can't overwrite each
 * other. `bumpVersion` adds one to the version (draft saves do; publish/unpublish don't). Returns the entry or null.
 */
export async function updateEntryAtVersion(type, key, version, set, { bumpVersion = false, session } = {}) {
  const update = { $set: set, ...(bumpVersion && { $inc: { version: 1 } }) };
  return ContentEntry.findOneAndUpdate({ type, key, version, ...live }, update, {
    returnDocument: 'after',
    session,
  }).lean();
}

export async function updateEntry(type, key, set) {
  return ContentEntry.findOneAndUpdate({ type, key, ...live }, { $set: set }, { returnDocument: 'after' }).lean();
}

export async function insertRevision(data, { session } = {}) {
  await ContentRevision.create([data], { session });
}

export async function findRevisions(type, key) {
  return ContentRevision.find({ type, key }).sort({ publishedAt: -1 }).lean();
}
