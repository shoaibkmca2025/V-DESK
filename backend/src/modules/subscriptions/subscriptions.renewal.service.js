/**
 * Subscriptions — renewals and the lifecycle job (PRD §49, phases.md Phase 3). Re-exported by subscriptions.service.js.
 *
 *   requestRenewal         the renewal quote for the next period (one per period; asking again returns it)
 *   applyRenewal           ops apply a PAID order (verified through orders) → next period + agreement
 *   processSubscriptionLifecycle   worker job: T-30/T-7/T-1 reminders, period end → GRACE, grace end → SUSPENDED
 *
 * The renewal price is the last period's frozen price (the order's server-computed breakdown). Re-pricing against
 * current pricing rules needs pricing to re-price a stored quote item, which it doesn't expose yet — see README.
 *
 * Every lifecycle step is one conditional update + audit entry + outbox event in a transaction, so several workers,
 * retries or a crash can never send a reminder twice or move a subscription twice.
 */
import { conflict, notFound } from '../../shared/errors/AppError.js';
import { publish } from '../../shared/events/bus.js';
import { generateRef } from '../../shared/lib/refs.js';
import { withTransaction } from '../../shared/lib/transactions.js';
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
  SYSTEM,
} from './subscriptions.common.js';
import { LIFECYCLE_BATCH, REMINDER_DAYS, RENEWABLE_STATUSES } from './subscriptions.constants.js';
import { mapRenewal, mapSubscription } from './subscriptions.mapper.js';
import * as repo from './subscriptions.repository.js';
import { addDays, addMonthsIst, DAY_MS } from './subscriptions.time.js';

// ──────────────────────────────────────────────
// Renewal quote
// ──────────────────────────────────────────────

class RenewalExists extends Error {}

/**
 * The renewal quote for the next period — the owner or staff (subscriptions:write). Idempotent: asking again for the
 * same period returns the same renewal (`created: false`) and publishes nothing.
 */
export async function requestRenewal(ref, actor, context, now = new Date()) {
  const sub = await loadForActor(ref, actor, 'subscriptions:write');
  if (!RENEWABLE_STATUSES.includes(sub.status)) {
    throw conflict('NOT_RENEWABLE', `A ${sub.status} subscription cannot be renewed`, { status: sub.status });
  }
  const forPeriod = sub.period + 1;
  const staff = actor.type === 'staff';
  const existing = await repo.findRenewalForPeriod(ref, forPeriod);
  if (existing) return { renewal: mapRenewal(existing, { staff }), created: false };

  try {
    const renewal = await withTransaction(async (session) => {
      const doc = await repo.insertRenewal(
        {
          ref: generateRef('RNW', 8),
          subscriptionRef: ref,
          forPeriod,
          price: sub.price,
          termMonths: sub.termMonths,
          dueBy: addDays(sub.currentPeriodEnd, sub.graceDays),
        },
        { session },
      );
      if (!doc) throw new RenewalExists();
      await recordAudit(
        [
          childAudit(actor, context, now, {
            action: 'renewal.quoted',
            entityType: 'renewal',
            entityRef: doc.ref,
            scopeRef: ref,
            after: doc.status,
          }),
        ],
        { session },
      );
      await publish(
        {
          type: 'subscription.renewal_quoted',
          entity: { type: 'subscription', ref },
          actor: { type: actor.type, id: actor.id },
          payload: { renewalRef: doc.ref, forPeriod, total_paise: doc.price.total_paise },
          occurredAt: now,
        },
        { session },
      );
      return doc;
    });
    log.info({ event: 'subscription.renewal_quoted', subscriptionRef: ref, renewalRef: renewal.ref }, 'renewal quoted');
    return { renewal: mapRenewal(renewal, { staff }), created: true };
  } catch (err) {
    if (!(err instanceof RenewalExists)) throw err;
    // A concurrent request for the same period won; answer with its renewal.
    return { renewal: mapRenewal(await repo.findRenewalForPeriod(ref, forPeriod), { staff }), created: false };
  }
}

// ──────────────────────────────────────────────
// Apply a paid renewal
// ──────────────────────────────────────────────

/** The order must be PAID (read from orders — never trusted from the request) and not already used. */
async function assertPaidUnusedOrder(orderRef) {
  const order = await getOrder(orderRef);
  if (order.status !== 'PAID') {
    throw conflict('PAYMENT_NOT_CONFIRMED', 'That order has not been paid', { orderStatus: order.status });
  }
  if ((await repo.findSubscriptionByOrder(order.ref)) || (await repo.findRenewalByOrder(order.ref))) {
    throw conflict('ORDER_ALREADY_USED', 'That order already paid for another subscription or renewal');
  }
  return order;
}

/**
 * The next period: it continues from the current period's end, unless the subscription lapsed (suspended by the
 * system after its grace days), when it starts now. A staff suspension stays in place — the period is added, the hold
 * is not lifted.
 */
function nextPeriod(sub, now) {
  const lapsed = sub.status === 'SUSPENDED' && now > sub.currentPeriodEnd;
  const start = lapsed ? now : sub.currentPeriodEnd;
  const end = addMonthsIst(start, sub.termMonths);
  const staffHold = sub.status === 'SUSPENDED' && sub.suspendedBy !== 'system';
  // A period already over (renewed very late) becomes ACTIVE and moves to GRACE at the next job run.
  const status = staffHold ? 'SUSPENDED' : 'ACTIVE';
  return {
    status,
    period: sub.period + 1,
    currentPeriodStart: start,
    currentPeriodEnd: end,
    graceEndsAt: null,
    lastReminderDays: null,
    ...(!staffHold && { suspendedBy: null, suspensionReason: null }),
  };
}

/**
 * Ops apply a renewal once its order is paid: the renewal becomes APPLIED, the subscription gets its next period and
 * agreement, `subscription.renewed` is published — all in one transaction. Re-applying the same order is a no-op.
 */
export async function applyRenewal(ref, renewalRef, { orderRef }, actor, context, now = new Date()) {
  assertStaff(actor, 'subscriptions:write');
  const sub = await loadForActor(ref, actor, 'subscriptions:write');
  const renewal = await repo.findRenewal(ref, renewalRef);
  if (!renewal) throw notFound('RENEWAL_NOT_FOUND', 'Renewal not found');
  if (renewal.status === 'APPLIED' && renewal.orderRef === orderRef) {
    return mapSubscription(sub, { renewals: [renewal], staff: true });
  }
  if (renewal.status !== 'QUOTED') throw conflict('RENEWAL_NOT_OPEN', `This renewal is ${renewal.status}`);
  if (!RENEWABLE_STATUSES.includes(sub.status)) throw conflict('NOT_RENEWABLE', `The subscription is ${sub.status}`);
  if (renewal.forPeriod !== sub.period + 1) throw conflict('RENEWAL_OUT_OF_DATE', 'This renewal is for another period');
  await assertPaidUnusedOrder(orderRef);

  const set = nextPeriod(sub, now);
  const meta = { actor, context, now };
  const { saved, applied } = await withTransaction(async (session) => {
    const applySet = { status: 'APPLIED', orderRef, appliedAt: now, appliedBy: actor.id };
    const appliedDoc = await repo.updateRenewal(renewalRef, 'QUOTED', applySet, { session });
    if (!appliedDoc) throw subscriptionChanged();
    await recordAudit(
      [
        childAudit(actor, context, now, {
          action: 'renewal.applied',
          entityType: 'renewal',
          entityRef: renewalRef,
          scopeRef: ref,
          before: 'QUOTED',
          after: 'APPLIED',
        }),
      ],
      { session },
    );
    const event = { type: 'subscription.renewed', payload: { renewalRef, period: set.period } };
    const savedDoc = await saveChange(sub, set, { ...meta, action: 'subscription.renewed', event }, session);
    await issueAgreement(savedDoc, set.period, set.currentPeriodStart, set.currentPeriodEnd, meta, session);
    return { saved: savedDoc, applied: appliedDoc };
  });
  log.info({ event: 'subscription.renewed', subscriptionRef: ref, renewalRef, period: set.period }, 'renewal applied');
  return mapSubscription(saved, { renewals: [applied], staff: true });
}

// ──────────────────────────────────────────────
// Lifecycle job (worker)
// ──────────────────────────────────────────────

/** The most urgent reminder due at `now` for a period ending at `end` (e.g. 7 at T-5), or null before T-30. */
export function dueReminder(end, now) {
  const due = [...REMINDER_DAYS].sort((a, b) => a - b).find((days) => now.getTime() >= end.getTime() - days * DAY_MS);
  return due ?? null;
}

/** Runs one conditional lifecycle change; a subscription changed by someone else meanwhile is skipped. */
async function step(sub, set, action, event, now) {
  try {
    await withTransaction((session) =>
      saveChange(sub, set, { actor: SYSTEM, context: null, now, action, event }, session),
    );
    return true;
  } catch (err) {
    if (err.code === 'SUBSCRIPTION_CHANGED') return false;
    throw err;
  }
}

async function sendReminders(now, limit, counts) {
  const until = addDays(now, Math.max(...REMINDER_DAYS));
  for (const sub of await repo.findDue('ACTIVE', 'currentPeriodEnd', { after: now, until }, limit)) {
    const days = dueReminder(sub.currentPeriodEnd, now);
    // Only ever announce a more urgent offset than the last one (a worker that was down sends T-7, not T-30 + T-7).
    if (days === null || (sub.lastReminderDays !== null && sub.lastReminderDays <= days)) continue;
    const payload = { daysBefore: days, period: sub.period, periodEnd: sub.currentPeriodEnd };
    const event = { type: 'subscription.renewal_reminder_due', payload };
    const ok = await step(sub, { lastReminderDays: days }, 'subscription.renewal_reminder', event, now);
    counts[ok ? 'reminders' : 'skipped'] += 1;
  }
}

async function startGrace(now, limit, counts) {
  for (const sub of await repo.findDue('ACTIVE', 'currentPeriodEnd', { until: now }, limit)) {
    const graceEndsAt = addDays(sub.currentPeriodEnd, sub.graceDays);
    const event = { type: 'subscription.grace_started', payload: { graceEndsAt } };
    const ok = await step(sub, { status: 'GRACE', graceEndsAt }, 'subscription.grace_started', event, now);
    counts[ok ? 'grace' : 'skipped'] += 1;
  }
}

async function suspendLapsed(now, limit, counts) {
  for (const sub of await repo.findDue('GRACE', 'graceEndsAt', { until: now }, limit)) {
    const set = { status: 'SUSPENDED', suspendedBy: 'system', suspensionReason: null };
    const event = { type: 'subscription.suspended', payload: { by: 'system', reason: 'RENEWAL_OVERDUE' } };
    const ok = await step(sub, set, 'subscription.suspended', event, now);
    counts[ok ? 'suspended' : 'skipped'] += 1;
  }
}

/**
 * Worker job (src/jobs.js): renewal reminders, grace periods and suspensions that are due at `now`. Safe in several
 * workers at once and on retry. `now` pins the clock (tests).
 * @returns {Promise<{ reminders: number, grace: number, suspended: number, skipped: number }>}
 */
export async function processSubscriptionLifecycle({ now = new Date(), limit = LIFECYCLE_BATCH } = {}) {
  const counts = { reminders: 0, grace: 0, suspended: 0, skipped: 0 };
  await sendReminders(now, limit, counts);
  await startGrace(now, limit, counts);
  await suspendLapsed(now, limit, counts);
  return counts;
}
