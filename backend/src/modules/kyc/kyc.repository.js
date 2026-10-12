/**
 * KYC repository — the only file that queries MongoDB for this module (through kyc.model.js).
 * Returns plain objects (`.lean()`) and hides soft-deleted records. Every write takes `{ session }` so the service can
 * group it with the audit entry (shared/audit) and the outbox event in one transaction.
 */
import { KycApplication, KycDocument } from './kyc.model.js';

const DUPLICATE_KEY = 11000;
const live = { deletedAt: null };

// ── Applications ──────────────────────────────

/** Inserts an application, or returns null when the customer already has an open one (unique index). */
export async function insertApplication(data, { session } = {}) {
  try {
    const [doc] = await KycApplication.create([data], { session });
    return doc.toObject();
  } catch (err) {
    if (err.code === DUPLICATE_KEY) return null;
    throw err;
  }
}

export async function findApplication(ref, { session } = {}) {
  return KycApplication.findOne({ ref, ...live }, null, { session }).lean();
}

export async function findOpenApplicationFor(customerId) {
  return KycApplication.findOne({ openCustomerId: customerId, ...live }).lean();
}

/**
 * Applies `set` and bumps the version, only while the application is still at `version` and in one of `statuses`.
 * Returns the updated application, or null when it changed in the meantime.
 */
export async function updateApplication(ref, { version, statuses }, set, { session } = {}) {
  return KycApplication.findOneAndUpdate(
    { ref, version, status: { $in: statuses }, ...live },
    { $set: set, $inc: { version: 1 } },
    { returnDocument: 'after', session },
  ).lean();
}

// ── Documents ─────────────────────────────────

/** Current (not replaced) documents of an application, in upload order. */
export async function findDocuments(applicationRef, { session } = {}) {
  return KycDocument.find({ applicationRef, ...live }, null, { session })
    .sort({ createdAt: 1, _id: 1 })
    .lean();
}

export async function findDocument(applicationRef, ref, { session } = {}) {
  return KycDocument.findOne({ applicationRef, ref, ...live }, null, { session }).lean();
}

export async function insertDocument(data, { session } = {}) {
  const [doc] = await KycDocument.create([data], { session });
  return doc.toObject();
}

/** Soft-deletes the current document while it is still in `status`. Returns false if it changed. */
export async function replaceDocument(ref, status, at, { session } = {}) {
  const res = await KycDocument.updateOne({ ref, status, ...live }, { $set: { deletedAt: at } }, { session });
  return res.modifiedCount === 1;
}

/** Moves a document from `from` to `set.status`; returns the updated document or null if it was not in `from`. */
export async function transitionDocument(ref, from, set, { session } = {}) {
  return KycDocument.findOneAndUpdate(
    { ref, status: from, ...live },
    { $set: set },
    { returnDocument: 'after', session },
  ).lean();
}
