/**
 * Orders service — the provider-independent order foundation (modules.md §3.7, phases.md Phase 2 week 2).
 *
 * Rules (docs/backend/rules.md):
 *  - An order is created from an ACCEPTED, still-valid quote or a live HELD booking, read through those modules'
 *    public services. It freezes the source's server-computed price breakdown (ADR-007); the client never sends an
 *    amount. Creation writes only the order — no other module's data — so there is no cross-module partial failure.
 *  - Idempotency-Key is required (§10): a replay returns the same order; reusing a key for a different body is 409.
 *  - At most one open (PENDING_PAYMENT) order per quote / booking, enforced by a partial unique index; another
 *    attempt gets 409 ORDER_ALREADY_OPEN with the open order's ref (it holds no customer data).
 *  - An open order stops being payable at its source's deadline (quote validUntil / booking hold expiry), and is
 *    cancelled by the system if its booking is no longer held. Both are applied when the order is read or acted on.
 *  - PAID is never set here: payments need a verified gateway confirmation, and the provider is still undecided.
 *    Invoices are issued after payment, so they are blocked too.
 *  - Logs carry order refs, source refs and totals — never customer details (§21). Orders store none.
 */
import { createHash } from 'node:crypto';
import { AppError, badRequest, conflict, notFound } from '../../shared/errors/AppError.js';
import { logger } from '../../shared/lib/logger.js';
import { decodeCursor, toPage } from '../../shared/lib/pagination.js';
import { generateRef } from '../../shared/lib/refs.js';
import { getBooking } from '../booking/index.js';
import { getQuote } from '../pricing/index.js';
import { OPEN_STATUS, ORDER_TRANSITIONS } from './orders.constants.js';
import { effectiveStatus, mapOrder, mapOrderForStaff } from './orders.mapper.js';
import * as repo from './orders.repository.js';

const log = logger.child({ module: 'orders' });

// ──────────────────────────────────────────────
// Sources
// ──────────────────────────────────────────────

const notPayable = (source, status) =>
  conflict('SOURCE_NOT_PAYABLE', `This ${source.type} cannot be ordered while it is ${status}`, {
    source: source.type,
    status,
  });

/**
 * The frozen breakdown, checked to reconcile to the paisa: lines add up to the subtotal, and
 * subtotal − discount + GST (or taxable + GST for GST-inclusive prices) is exactly the total.
 */
export function snapshotPricing(pricing) {
  const { currency, lines, subtotal_paise, discount, taxable_paise, gst, total_paise } = pricing;
  const discountPaise = discount?.amount_paise ?? 0;
  const amounts = [subtotal_paise, discountPaise, taxable_paise, gst?.amount_paise, total_paise];
  const reconciles =
    amounts.every(Number.isSafeInteger) &&
    lines.reduce((sum, l) => sum + l.amount_paise, 0) === subtotal_paise &&
    subtotal_paise - discountPaise === (gst.inclusive ? total_paise : taxable_paise) &&
    taxable_paise + gst.amount_paise === total_paise;
  if (!reconciles) {
    log.error({ event: 'order.pricing_inconsistent' }, 'source price breakdown does not reconcile');
    throw new AppError(500, 'PRICING_INCONSISTENT', 'The price could not be verified. Please try again later.');
  }
  return { currency, lines, subtotal_paise, discount, taxable_paise, gst, total_paise };
}

/** What the source sells and when it stops being payable; 404 / 409 when it can't be ordered. */
async function resolveSource(source, now) {
  if (source.type === 'quote') {
    const quote = await getQuote(source.ref, now);
    if (quote.status !== 'ACCEPTED') throw notPayable(source, quote.status);
    if (new Date(quote.validUntil) <= now) {
      throw conflict('QUOTE_EXPIRED', 'This quote is past its validity. Please ask your advisor for a fresh one.', {
        validUntil: quote.validUntil,
      });
    }
    return {
      description: quote.product,
      tenure: quote.tenure,
      pricing: snapshotPricing(quote.pricing),
      expiresAt: new Date(quote.validUntil),
    };
  }
  const booking = await getBooking(source.ref, now);
  if (booking.status !== 'HELD') throw notPayable(source, booking.status);
  return {
    description: `${booking.pricing.label} — ${booking.hub}`,
    tenure: booking.pricing.tenure,
    pricing: snapshotPricing(booking.pricing),
    expiresAt: new Date(booking.expiresAt),
  };
}

/** Whether a booking order's booking is still held; a missing booking counts as not held. */
async function bookingStillHeld(ref, now) {
  try {
    return (await getBooking(ref, now)).status === 'HELD';
  } catch (err) {
    if (err.status === 404) return false;
    throw err;
  }
}

/**
 * Brings an open order's stored status up to date: EXPIRED past its deadline, CANCELLED (by system) when its
 * booking is no longer held. Conditional writes, so it is safe to run concurrently. Returns the current document.
 */
async function refreshOpenOrder(order, now) {
  if (order.status !== OPEN_STATUS) return order;
  let to = null;
  let reason = null;
  if (effectiveStatus(order, now) === 'EXPIRED') to = 'EXPIRED';
  else if (order.source.type === 'booking' && !(await bookingStillHeld(order.source.ref, now))) {
    to = 'CANCELLED';
    reason = 'SOURCE_UNAVAILABLE';
  }
  if (!to) return order;

  const updated = await repo.updateOrderStatus(order.ref, OPEN_STATUS, to, {
    status: to,
    at: now,
    actor: 'system',
    reason,
  });
  if (updated) log.info({ event: `order.${to.toLowerCase()}`, orderRef: order.ref, reason }, 'order closed by system');
  return updated ?? (await repo.findOrderByRef(order.ref)) ?? order;
}

// ──────────────────────────────────────────────
// Create
// ──────────────────────────────────────────────

const hashRequest = (body) => createHash('sha256').update(JSON.stringify(body)).digest('hex');

async function findReplay(idempotencyKey, requestHash) {
  const existing = await repo.findOrderByIdempotencyKey(idempotencyKey);
  if (existing && existing.requestHash !== requestHash) {
    throw conflict('IDEMPOTENCY_KEY_REUSED', 'This Idempotency-Key was already used for a different order');
  }
  return existing;
}

const alreadyOpen = (order) =>
  conflict('ORDER_ALREADY_OPEN', 'There is already an open order for this purchase', { ref: order.ref });

/**
 * Creates a PENDING_PAYMENT order for a quote or booking at its frozen server price.
 * @returns {Promise<{ order: object, created: boolean }>} created=false when the key was replayed
 */
export async function createOrder({ source }, idempotencyKey, now = new Date()) {
  if (!idempotencyKey) {
    throw badRequest(
      'IDEMPOTENCY_KEY_REQUIRED',
      'Send an Idempotency-Key header (for example a UUID) with each new order',
    );
  }
  const requestHash = hashRequest({ source });
  const replay = await findReplay(idempotencyKey, requestHash);
  if (replay) return { order: mapOrder(await refreshOpenOrder(replay, now), now), created: false };

  const resolved = await resolveSource(source, now);
  const open = await repo.findOpenOrderForSource(source);
  if (open) {
    // A concurrent request with this same key may have created it after our replay lookup.
    const mine = await findReplay(idempotencyKey, requestHash);
    if (mine) return { order: mapOrder(mine, now), created: false };
    if ((await refreshOpenOrder(open, now)).status === OPEN_STATUS) throw alreadyOpen(open);
  }

  const result = await repo.insertOrder({
    ref: generateRef('ORD', 8),
    status: OPEN_STATUS,
    source,
    description: resolved.description,
    tenure: resolved.tenure,
    pricing: resolved.pricing,
    total_paise: resolved.pricing.total_paise,
    currency: resolved.pricing.currency,
    expiresAt: resolved.expiresAt,
    history: [{ status: OPEN_STATUS, at: now, actor: 'public', reason: null }],
    idempotencyKey,
    requestHash,
  });

  if (result.duplicate) {
    // A unique index refused the insert. When both the key and the source collide, which index the database
    // names is not what decides the answer, so check for our own key first: a concurrent request with the
    // same key → its replay; otherwise another order for the same source is open.
    const mine = await findReplay(idempotencyKey, requestHash);
    if (mine) return { order: mapOrder(mine, now), created: false };
    const winner = await repo.findOpenOrderForSource(source);
    if (winner) throw alreadyOpen(winner);
    throw conflict('ORDER_CONFLICT', 'Could not create the order. Please try again.');
  }

  const { order } = result;
  log.info(
    {
      event: 'order.created',
      orderRef: order.ref,
      sourceType: source.type,
      sourceRef: source.ref,
      total_paise: order.total_paise,
    },
    'order created',
  );
  return { order: mapOrder(order, now), created: true };
}

// ──────────────────────────────────────────────
// Read and cancel
// ──────────────────────────────────────────────

async function findOrderOrThrow(ref) {
  const order = await repo.findOrderByRef(ref);
  if (!order) throw notFound('ORDER_NOT_FOUND', `No order found for ref '${ref}'`);
  return order;
}

export async function getOrder(ref, now = new Date()) {
  return mapOrder(await refreshOpenOrder(await findOrderOrThrow(ref), now), now);
}

/** Cancels an open order. Repeating it is a no-op; an expired or paid order cannot be cancelled. */
export async function cancelOrder(ref, actor, now = new Date()) {
  const order = await refreshOpenOrder(await findOrderOrThrow(ref), now);
  const current = effectiveStatus(order, now);
  if (current === 'CANCELLED') return mapOrder(order, now);
  if (current === 'EXPIRED') {
    throw conflict('ORDER_EXPIRED', 'This order has expired', { expiresAt: order.expiresAt });
  }
  const allowed = ORDER_TRANSITIONS[current] ?? [];
  if (!allowed.includes('CANCELLED')) {
    throw conflict('INVALID_STATUS_TRANSITION', `An order cannot move from ${current} to CANCELLED`, {
      from: current,
      to: 'CANCELLED',
      allowed,
    });
  }
  const updated = await repo.updateOrderStatus(ref, current, 'CANCELLED', {
    status: 'CANCELLED',
    at: now,
    actor,
    reason: null,
  });
  if (!updated) throw conflict('ORDER_CHANGED', 'This order was just changed. Please reload and try again.');
  log.info({ event: 'order.cancelled', orderRef: ref, actor }, 'order cancelled');
  return mapOrder(updated, now);
}

/** Staff list, newest first, with each order's status timeline. */
export async function listOrders({ status, sourceType, cursor, limit }, now = new Date()) {
  const after = cursor ? decodeCursor(cursor) : undefined;
  const { items, nextCursor } = toPage(await repo.findOrders({ status, sourceType, after, limit }), limit);
  return { orders: items.map((doc) => mapOrderForStaff(doc, now)), nextCursor };
}
