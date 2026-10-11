/**
 * Orders repository — the only file that queries MongoDB for this module (through orders.model.js).
 * Returns plain objects (`.lean()`) and hides soft-deleted records.
 */
import { olderThan } from '../../shared/lib/pagination.js';
import { OPEN_STATUS } from './orders.constants.js';
import { Order } from './orders.model.js';

const DUPLICATE_KEY = 11000;
const notDeleted = { deletedAt: null };

export async function findOrderByRef(ref) {
  return Order.findOne({ ref, ...notDeleted }).lean();
}

export async function findOrderByIdempotencyKey(idempotencyKey) {
  return Order.findOne({ idempotencyKey }).lean();
}

/** The open order for a quote / booking, if any. */
export async function findOpenOrderForSource(source) {
  return Order.findOne({ 'source.type': source.type, 'source.ref': source.ref, status: OPEN_STATUS }).lean();
}

/**
 * Inserts an order. Returns `{ order }`, or `{ duplicate: true }` when a unique index refused it (a concurrent
 * request with the same key, or another open order for the same source — the caller tells them apart).
 */
export async function insertOrder(data) {
  try {
    const doc = await Order.create(data);
    return { order: doc.toObject() };
  } catch (err) {
    if (err.code !== DUPLICATE_KEY) throw err;
    return { duplicate: true };
  }
}

/** Newest first; fetches `limit + 1` so the service can tell whether there is another page. */
export async function findOrders({ status, sourceType, after, limit }) {
  const filter = {
    ...notDeleted,
    ...(status && { status }),
    ...(sourceType && { 'source.type': sourceType }),
    ...(after && olderThan(after)),
  };
  return Order.find(filter)
    .sort({ createdAt: -1, ref: -1 })
    .limit(limit + 1)
    .lean();
}

/**
 * Moves an order to `to` only if it is still in `from` — two changes at once can't both win.
 * Returns the updated order, or null if it changed meanwhile.
 */
export async function updateOrderStatus(ref, from, to, entry) {
  return Order.findOneAndUpdate(
    { ref, status: from, ...notDeleted },
    { $set: { status: to }, $push: { history: entry } },
    { returnDocument: 'after' },
  ).lean();
}
