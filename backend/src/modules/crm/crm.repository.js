/**
 * CRM repository — the only file that queries MongoDB for this module (through crm.model.js).
 * Returns plain objects (`.lean()`) and hides soft-deleted leads, except where idempotency needs to see them.
 */
import { Lead, LeadActivity } from './crm.model.js';

const DUPLICATE_KEY = 11000;
const notDeleted = { deletedAt: null };

// ──────────────────────────────────────────────
// Leads
// ──────────────────────────────────────────────

/** Returns a non-deleted lead by ref, or null. */
export async function findLeadByRef(ref) {
  return Lead.findOne({ ref, ...notDeleted }).lean();
}

/** Returns any lead with this ref, deleted or not — used so a replayed submission never creates a second lead. */
export async function findAnyLeadByRef(ref) {
  return Lead.findOne({ ref }).select({ ref: 1, createdAt: 1 }).lean();
}

/** Inserts a lead and returns it, or returns null when the ref is already taken (a concurrent replay). */
export async function insertLead(data) {
  try {
    const doc = await Lead.create(data);
    return doc.toObject();
  } catch (err) {
    if (err.code === DUPLICATE_KEY) return null;
    throw err;
  }
}

/**
 * Lists leads newest first. `after` is the decoded cursor `{ createdAt, ref }` of the last item already seen.
 * Fetches `limit + 1` so the service can tell whether another page exists.
 */
export async function findLeads({ status, city, source, assignedTo, search, after, limit }) {
  const filter = { ...notDeleted };
  if (status) filter.status = status;
  if (city) filter.city = city;
  if (source) filter.source = source;
  if (assignedTo) filter.assignedTo = assignedTo;
  if (search) {
    const pattern = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ name: pattern }, { mobile: pattern }, { email: pattern }, { city: pattern }];
  }
  if (after) {
    const page = {
      $or: [{ createdAt: { $lt: after.createdAt } }, { createdAt: after.createdAt, ref: { $lt: after.ref } }],
    };
    filter.$and = [page];
  }
  return Lead.find(filter)
    .sort({ createdAt: -1, ref: -1 })
    .limit(limit + 1)
    .lean();
}

/**
 * Applies `changes` only if the lead still has `expectedStatus`, so two staff members moving the same lead at
 * once cannot both succeed. Returns the updated lead, or null if it changed or disappeared meanwhile.
 */
export async function updateLeadIfStatus(ref, expectedStatus, changes) {
  return Lead.findOneAndUpdate(
    { ref, status: expectedStatus, ...notDeleted },
    { $set: changes },
    { returnDocument: 'after' },
  ).lean();
}

/** Counts non-deleted leads grouped by `field` → `[{ _id: value, count }]`. */
export async function countLeadsBy(field) {
  return Lead.aggregate([{ $match: notDeleted }, { $group: { _id: `$${field}`, count: { $sum: 1 } } }]);
}

// ──────────────────────────────────────────────
// Activities
// ──────────────────────────────────────────────

export async function insertActivities(activities) {
  if (activities.length === 0) return;
  await LeadActivity.insertMany(activities);
}

/** Timeline for one lead, oldest first. */
export async function findActivities(leadRef) {
  return LeadActivity.find({ leadRef }).sort({ createdAt: 1, _id: 1 }).lean();
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
