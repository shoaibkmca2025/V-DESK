/**
 * Notifications repository — the only file that queries MongoDB for this module (through notifications.model.js).
 * Returns plain objects (`.lean()`) and hides soft-deleted records.
 */
import { olderThan } from '../../shared/lib/pagination.js';
import { Notification, NotificationTemplate } from './notifications.model.js';

const DUPLICATE_KEY = 11000;
const notDeleted = { deletedAt: null };

// ──────────────────────────────────────────────
// Templates
// ──────────────────────────────────────────────

export async function findTemplates() {
  return NotificationTemplate.find(notDeleted).sort({ key: 1 }).lean();
}

export async function findTemplate(key) {
  return NotificationTemplate.findOne({ key, ...notDeleted }).lean();
}

/** Inserts a template, or returns null when the key is taken (including by a deleted template). */
export async function insertTemplate(data) {
  try {
    return (await NotificationTemplate.create(data)).toObject();
  } catch (err) {
    if (err.code === DUPLICATE_KEY) return null;
    throw err;
  }
}

/** Updates a template only if it is still at `version` (so two editors can't silently overwrite each other). */
export async function updateTemplate(key, version, set) {
  return NotificationTemplate.findOneAndUpdate(
    { key, version, ...notDeleted },
    { $set: set, $inc: { version: 1 } },
    { returnDocument: 'after' },
  ).lean();
}

export async function softDeleteTemplate(key, actor, now) {
  return NotificationTemplate.findOneAndUpdate(
    { key, ...notDeleted },
    { $set: { deletedAt: now, active: false, updatedBy: actor } },
    { returnDocument: 'after' },
  ).lean();
}

// ──────────────────────────────────────────────
// Notifications
// ──────────────────────────────────────────────

export async function findNotificationByDedupeKey(dedupeKey) {
  return Notification.findOne({ dedupeKey }).lean();
}

/** Inserts a notification, or returns null when the dedupe key was taken by a concurrent request. */
export async function insertNotification(data) {
  try {
    return (await Notification.create(data)).toObject();
  } catch (err) {
    if (err.code === DUPLICATE_KEY) return null;
    throw err;
  }
}

/**
 * Atomically claims the next notification to send on one of `channels`: a PENDING one that is due, or a SENDING
 * one whose worker's lease ran out. Counts the claim as an attempt. Returns the claimed document or null.
 */
export async function claimNext({ channels, now, leaseUntil, claimToken }) {
  return Notification.findOneAndUpdate(
    {
      channel: { $in: channels },
      ...notDeleted,
      $or: [
        { status: 'PENDING', nextAttemptAt: { $lte: now } },
        { status: 'SENDING', leaseUntil: { $lte: now } },
      ],
    },
    { $set: { status: 'SENDING', leaseUntil, claimToken }, $inc: { attempts: 1 } },
    { sort: { nextAttemptAt: 1 }, returnDocument: 'after' },
  ).lean();
}

/**
 * Applies the outcome of a send, only if this worker still holds the claim. Returns the updated document, or null
 * when the claim was lost (lease expired and another worker took it).
 */
export async function settleClaim(ref, claimToken, set) {
  return Notification.findOneAndUpdate(
    { ref, status: 'SENDING', claimToken },
    { $set: { ...set, leaseUntil: null, claimToken: null } },
    { returnDocument: 'after' },
  ).lean();
}

/** Newest first; fetches `limit + 1` so the service can tell whether there is another page. */
export async function findNotifications({ status, channel, templateKey, after, limit }) {
  const filter = {
    ...notDeleted,
    ...(status && { status }),
    ...(channel && { channel }),
    ...(templateKey && { templateKey }),
    ...(after && olderThan(after)),
  };
  return Notification.find(filter)
    .sort({ createdAt: -1, ref: -1 })
    .limit(limit + 1)
    .lean();
}
