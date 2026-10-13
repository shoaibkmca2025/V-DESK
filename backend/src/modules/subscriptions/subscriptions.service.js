/**
 * Subscriptions service — service activation, suspension, cancellation, agreements and reads (modules.md §3.9).
 * Renewals and the lifecycle job live in subscriptions.renewal.service.js (re-exported here).
 *
 * Rules:
 *  - Activation (North Star, PRD §76): the order is PAID ∧ the KYC application is APPROVED for the same customer ∧
 *    ops activate → `service.activated`. Payment and KYC are read from the orders and kyc modules at that moment —
 *    nothing a client sends, and no stored flag, can stand in for them.
 *  - Every change is conditional on the subscription's version and commits with its audit entry and outbox event in
 *    one transaction; retrying a request can't apply it twice (activation, suspension and cancellation of a
 *    subscription already in the target state answer with its current state and publish nothing).
 *  - Customers see their own subscriptions only (others are 404); staff need subscriptions:* permissions, checked
 *    here again after the route guard (rules.md §20).
 *  - Logs carry refs and statuses only.
 */
import { conflict, forbidden, notFound } from '../../shared/errors/AppError.js';
import { publish } from '../../shared/events/bus.js';
import { decodeCursor, toPage } from '../../shared/lib/pagination.js';
import { generateRef } from '../../shared/lib/refs.js';
import { withTransaction } from '../../shared/lib/transactions.js';
import { getApplicationSummary } from '../kyc/index.js';
import { getOrder } from '../orders/index.js';
import {
  assertStaff,
  childAudit,
  issueAgreement,
  loadForActor,
  log,
  recordAudit,
  saveChange,
  subscriptionChanged,
} from './subscriptions.common.js';
import { TERM_MONTHS } from './subscriptions.constants.js';
import { mapAgreementView, mapSubscription } from './subscriptions.mapper.js';
import * as repo from './subscriptions.repository.js';
import { addDays, addMonthsIst } from './subscriptions.time.js';

export { applyRenewal, processSubscriptionLifecycle, requestRenewal } from './subscriptions.renewal.service.js';

const staffView = (sub) => mapSubscription(sub, { staff: true });

// ──────────────────────────────────────────────
// Create
// ──────────────────────────────────────────────

class SubscriptionExists extends Error {}

/** The order a subscription can be created from: a quote order (a service with a tenure), not cancelled/expired. */
function assertSubscribable(order) {
  if (order.source.type !== 'quote' || !TERM_MONTHS[order.tenure]) {
    throw conflict('ORDER_NOT_SUBSCRIBABLE', 'Only an order for a monthly or annual service can start a subscription');
  }
  if (!['PENDING_PAYMENT', 'PAID'].includes(order.status)) {
    throw conflict('ORDER_NOT_USABLE', `A ${order.status} order cannot start a subscription`, { status: order.status });
  }
}

/**
 * Ops create the subscription for an order and the buyer's KYC application (its customer becomes the owner). It waits
 * in PENDING_ACTIVATION; nothing about payment or KYC is decided here. One subscription per order.
 */
export async function createSubscription({ orderRef, kycRef, graceDays }, actor, context, now = new Date()) {
  assertStaff(actor, 'subscriptions:write');
  const order = await getOrder(orderRef);
  assertSubscribable(order);
  const kyc = await getApplicationSummary(kycRef);
  if (await repo.findRenewalByOrder(order.ref)) {
    throw conflict('ORDER_ALREADY_USED', 'This order already paid for a renewal');
  }

  let sub;
  try {
    sub = await withTransaction(async (session) => {
      const doc = await repo.insertSubscription(
        {
          ref: generateRef('SUB', 8),
          customerId: kyc.customerId,
          kycRef: kyc.ref,
          orderRef: order.ref,
          product: order.description,
          tenure: order.tenure,
          termMonths: TERM_MONTHS[order.tenure],
          price: { total_paise: order.total_paise, currency: order.currency, breakdown: order.pricing },
          graceDays,
          history: [{ status: 'PENDING_ACTIVATION', at: now, actor: actor.id }],
        },
        { session },
      );
      if (!doc) throw new SubscriptionExists();
      await recordCreated(doc, actor, context, now, session);
      return doc;
    });
  } catch (err) {
    if (!(err instanceof SubscriptionExists)) throw err;
    const existing = await repo.findSubscriptionByOrder(order.ref);
    throw conflict('SUBSCRIPTION_EXISTS', 'This order already has a subscription', { ref: existing?.ref });
  }
  log.info({ event: 'subscription.created', subscriptionRef: sub.ref, orderRef: sub.orderRef }, 'subscription created');
  return staffView(sub);
}

async function recordCreated(doc, actor, context, now, session) {
  await recordAudit(
    [
      childAudit(actor, context, now, {
        action: 'subscription.created',
        entityType: 'subscription',
        entityRef: doc.ref,
        after: doc.status,
      }),
    ],
    { session },
  );
  await publish(
    {
      type: 'subscription.created',
      entity: { type: 'subscription', ref: doc.ref },
      actor: { type: actor.type, id: actor.id },
      payload: { orderRef: doc.orderRef, kycRef: doc.kycRef },
      occurredAt: now,
    },
    { session },
  );
}

// ──────────────────────────────────────────────
// Activate / reinstate
// ──────────────────────────────────────────────

/** Payment and KYC, read from their owning modules now — never from the request or a stored flag. */
async function assertActivationConditions(sub) {
  const order = await getOrder(sub.orderRef);
  if (order.status !== 'PAID') {
    throw conflict('PAYMENT_NOT_CONFIRMED', 'The order for this subscription has not been paid', {
      orderStatus: order.status,
    });
  }
  const kyc = await getApplicationSummary(sub.kycRef);
  if (kyc.status !== 'APPROVED' || kyc.customerId !== sub.customerId) {
    throw conflict('KYC_NOT_APPROVED', 'KYC for this subscription is not approved', { kycStatus: kyc.status });
  }
}

async function firstActivation(sub, actor, context, now) {
  await assertActivationConditions(sub);
  const end = addMonthsIst(now, sub.termMonths);
  const meta = { actor, context, now };
  return withTransaction(async (session) => {
    const saved = await saveChange(
      sub,
      { status: 'ACTIVE', period: 1, currentPeriodStart: now, currentPeriodEnd: end, activatedAt: now },
      { ...meta, action: 'subscription.activated', event: { type: 'service.activated', payload: { period: 1 } } },
      session,
    );
    await issueAgreement(saved, 1, now, end, meta, session);
    return saved;
  });
}

/** Lifts a staff suspension: back to ACTIVE within the paid period, to GRACE within the grace days, else renew. */
async function reinstate(sub, actor, context, now) {
  if (sub.suspendedBy === 'system') {
    throw conflict('RENEWAL_REQUIRED', 'This subscription lapsed; apply a paid renewal to restart it');
  }
  const graceEndsAt = addDays(sub.currentPeriodEnd, sub.graceDays);
  if (now >= graceEndsAt) throw conflict('RENEWAL_REQUIRED', 'The paid period and grace days are over; renew first');
  const status = now < sub.currentPeriodEnd ? 'ACTIVE' : 'GRACE';
  const set = {
    status,
    suspendedBy: null,
    suspensionReason: null,
    graceEndsAt: status === 'GRACE' ? graceEndsAt : null,
  };
  return withTransaction((session) =>
    saveChange(
      sub,
      set,
      { actor, context, now, action: 'subscription.reinstated', event: { type: 'subscription.reinstated' } },
      session,
    ),
  );
}

/**
 * Ops activation. PENDING_ACTIVATION → ACTIVE once paid and KYC-approved (first period + agreement,
 * `service.activated`); a staff-SUSPENDED subscription is reinstated. Already ACTIVE → returned as is.
 */
export async function activateSubscription(ref, actor, context, now = new Date()) {
  const sub = await loadForActor(ref, actor, 'subscriptions:activate');
  if (sub.status === 'ACTIVE') return staffView(sub);
  let saved;
  if (sub.status === 'PENDING_ACTIVATION') saved = await firstActivation(sub, actor, context, now);
  else if (sub.status === 'SUSPENDED') saved = await reinstate(sub, actor, context, now);
  else throw conflict('INVALID_STATUS_TRANSITION', `A ${sub.status} subscription cannot be activated`);
  log.info({ event: 'subscription.activated', subscriptionRef: ref, status: saved.status }, 'subscription activated');
  return staffView(saved);
}

// ──────────────────────────────────────────────
// Suspend / cancel
// ──────────────────────────────────────────────

/** Ops suspend an ACTIVE or GRACE subscription, with a reason (staff-only). */
export async function suspendSubscription(ref, { reason }, actor, context, now = new Date()) {
  const sub = await loadForActor(ref, actor, 'subscriptions:write');
  if (sub.status === 'SUSPENDED' && sub.suspendedBy !== 'system') return staffView(sub);
  const saved = await withTransaction((session) =>
    saveChange(
      sub,
      { status: 'SUSPENDED', suspendedBy: actor.id, suspensionReason: reason },
      {
        actor,
        context,
        now,
        action: 'subscription.suspended',
        event: { type: 'subscription.suspended', payload: { by: 'staff' } },
      },
      session,
    ),
  );
  log.info({ event: 'subscription.suspended', subscriptionRef: ref, by: 'staff' }, 'subscription suspended');
  return staffView(saved);
}

/** Ops cancel (final), with a reason; open renewal quotes are voided in the same transaction. */
export async function cancelSubscription(ref, { reason }, actor, context, now = new Date()) {
  const sub = await loadForActor(ref, actor, 'subscriptions:write');
  if (sub.status === 'CANCELLED') return staffView(sub);
  const saved = await withTransaction(async (session) => {
    const result = await saveChange(
      sub,
      { status: 'CANCELLED', cancelledAt: now, cancellationReason: reason },
      { actor, context, now, action: 'subscription.cancelled', event: { type: 'subscription.cancelled' } },
      session,
    );
    await repo.voidQuotedRenewals(sub.ref, { session });
    return result;
  });
  log.info({ event: 'subscription.cancelled', subscriptionRef: ref }, 'subscription cancelled');
  return staffView(saved);
}

// ──────────────────────────────────────────────
// Agreements
// ──────────────────────────────────────────────

/** No e-sign provider yet (memory.md §6): ops record that the customer signed the agreement offline. */
export async function recordAgreementSigned(ref, agreementRef, actor, context, now = new Date()) {
  await loadForActor(ref, actor, 'subscriptions:write');
  const agreement = await repo.findAgreement(ref, agreementRef);
  if (!agreement) throw notFound('AGREEMENT_NOT_FOUND', 'Agreement not found');
  if (agreement.status === 'SIGNED') return mapAgreementView(agreement, { staff: true });
  const signed = await withTransaction(async (session) => {
    const set = { status: 'SIGNED', signedAt: now, signatureMethod: 'offline', signedRecordedBy: actor.id };
    const doc = await repo.updateAgreement(agreementRef, 'ISSUED', set, { session });
    if (!doc) throw subscriptionChanged();
    await recordAudit(
      [
        childAudit(actor, context, now, {
          action: 'agreement.signed',
          entityType: 'agreement',
          entityRef: agreementRef,
          scopeRef: ref,
          before: 'ISSUED',
          after: 'SIGNED',
        }),
      ],
      { session },
    );
    return doc;
  });
  return mapAgreementView(signed, { staff: true });
}

// ──────────────────────────────────────────────
// Reads
// ──────────────────────────────────────────────

/** One subscription with its agreements and renewals — the owner, or staff with subscriptions:read. */
export async function getSubscription(ref, actor) {
  const sub = await loadForActor(ref, actor, 'subscriptions:read');
  const [agreements, renewals] = await Promise.all([repo.findAgreements(ref), repo.findRenewals(ref)]);
  return mapSubscription(sub, { agreements, renewals, staff: actor.type === 'staff' });
}

/** The signed-in customer's subscriptions (GET /mine). */
export async function listMine(actor) {
  if (actor?.type !== 'customer' || !actor.id) throw forbidden();
  return (await repo.findSubscriptionsByCustomer(actor.id)).map((sub) => mapSubscription(sub));
}

/** Staff list, newest first, cursor-paginated (modules.md §6). */
export async function listSubscriptions({ status, customerId, cursor, limit }, actor) {
  assertStaff(actor, 'subscriptions:read');
  const after = cursor ? decodeCursor(cursor) : undefined;
  const { items, nextCursor } = toPage(await repo.findSubscriptions({ status, customerId, after, limit }), limit);
  return { subscriptions: items.map(staffView), nextCursor };
}
