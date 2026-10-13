/**
 * Subscriptions repository — the only file that queries MongoDB for this module (through subscriptions.model.js).
 * Returns plain objects (`.lean()`) and hides soft-deleted records. Writes take `{ session }` so the service can group
 * them with audit entries and outbox events in one transaction.
 */
import { olderThan } from '../../shared/lib/pagination.js';
import { Agreement, Renewal, Subscription } from './subscriptions.model.js';

const DUPLICATE_KEY = 11000;
const live = { deletedAt: null };

async function insertOne(Model, data, session) {
  try {
    const [doc] = await Model.create([data], { session });
    return doc.toObject();
  } catch (err) {
    if (err.code === DUPLICATE_KEY) return null;
    throw err;
  }
}

// ── Subscriptions ─────────────────────────────

/** Inserts a subscription, or returns null when its order already has one. */
export const insertSubscription = (data, { session } = {}) => insertOne(Subscription, data, session);

export async function findSubscription(ref, { session } = {}) {
  return Subscription.findOne({ ref, ...live }, null, { session }).lean();
}

export async function findSubscriptionByOrder(orderRef) {
  return Subscription.findOne({ orderRef, ...live }).lean();
}

export async function findSubscriptionsByCustomer(customerId) {
  return Subscription.find({ customerId, ...live })
    .sort({ createdAt: -1 })
    .lean();
}

export async function findSubscriptions({ status, customerId, after, limit }) {
  const filter = { ...live };
  if (status) filter.status = status;
  if (customerId) filter.customerId = customerId;
  if (after) Object.assign(filter, olderThan(after));
  return Subscription.find(filter)
    .sort({ createdAt: -1, ref: -1 })
    .limit(limit + 1)
    .lean();
}

/**
 * Applies `set` (and a history entry) only while the subscription is still at `version` — the worker and the API
 * never overwrite each other. Returns the updated subscription, or null when it changed meanwhile.
 */
export async function updateSubscription(ref, version, set, historyEntry, { session } = {}) {
  const update = { $set: set, $inc: { version: 1 } };
  if (historyEntry) update.$push = { history: historyEntry };
  return Subscription.findOneAndUpdate({ ref, version, ...live }, update, { returnDocument: 'after', session }).lean();
}

/** Lifecycle job candidates: subscriptions in `status` whose `field` is in (after, until], soonest first. */
export async function findDue(status, field, { after, until }, limit) {
  const range = { $ne: null, $lte: until, ...(after && { $gt: after }) };
  return Subscription.find({ status, [field]: range, ...live })
    .sort({ [field]: 1 })
    .limit(limit)
    .lean();
}

// ── Agreements ────────────────────────────────

export const insertAgreement = (data, { session } = {}) => insertOne(Agreement, data, session);

export async function findAgreements(subscriptionRef) {
  return Agreement.find({ subscriptionRef, ...live })
    .sort({ period: 1 })
    .lean();
}

export async function findAgreement(subscriptionRef, ref) {
  return Agreement.findOne({ subscriptionRef, ref, ...live }).lean();
}

export async function updateAgreement(ref, fromStatus, set, { session } = {}) {
  return Agreement.findOneAndUpdate(
    { ref, status: fromStatus, ...live },
    { $set: set },
    {
      returnDocument: 'after',
      session,
    },
  ).lean();
}

// ── Renewals ──────────────────────────────────

export const insertRenewal = (data, { session } = {}) => insertOne(Renewal, data, session);

export async function findRenewals(subscriptionRef) {
  return Renewal.find({ subscriptionRef, ...live })
    .sort({ forPeriod: 1 })
    .lean();
}

export async function findRenewal(subscriptionRef, ref, { session } = {}) {
  return Renewal.findOne({ subscriptionRef, ref, ...live }, null, { session }).lean();
}

export async function findRenewalForPeriod(subscriptionRef, forPeriod) {
  return Renewal.findOne({ subscriptionRef, forPeriod, ...live }).lean();
}

export async function findRenewalByOrder(orderRef) {
  return Renewal.findOne({ orderRef, ...live }).lean();
}

export async function updateRenewal(ref, fromStatus, set, { session } = {}) {
  return Renewal.findOneAndUpdate(
    { ref, status: fromStatus, ...live },
    { $set: set },
    {
      returnDocument: 'after',
      session,
    },
  ).lean();
}

export async function voidQuotedRenewals(subscriptionRef, { session } = {}) {
  await Renewal.updateMany({ subscriptionRef, status: 'QUOTED', ...live }, { $set: { status: 'VOID' } }, { session });
}
