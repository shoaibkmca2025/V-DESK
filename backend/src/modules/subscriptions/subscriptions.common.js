/**
 * Subscriptions service internals shared by subscriptions.service.js (create, activate, suspend, cancel, read) and
 * subscriptions.renewal.service.js (renewals and the lifecycle job): access checks, transitions, audit, events.
 * Not exported from index.js.
 */
import { auditEntry, recordAudit } from '../../shared/audit/audit.js';
import { conflict, forbidden, notFound } from '../../shared/errors/AppError.js';
import { publish } from '../../shared/events/bus.js';
import { logger } from '../../shared/lib/logger.js';
import { generateRef } from '../../shared/lib/refs.js';
import { hasPermission } from '../identity/index.js';
import { SUBSCRIPTION_TRANSITIONS } from './subscriptions.constants.js';
import * as repo from './subscriptions.repository.js';

export const log = logger.child({ module: 'subscriptions' });

export const SYSTEM = Object.freeze({ type: 'system', id: 'system', role: null });

export const subscriptionNotFound = () => notFound('SUBSCRIPTION_NOT_FOUND', 'Subscription not found');
export const subscriptionChanged = () =>
  conflict('SUBSCRIPTION_CHANGED', 'The subscription changed while saving. Reload and try again.');

/** A signed-in staff member whose role holds `permission` (never the legacy admin key — see identity.principal.js). */
export function assertStaff(actor, permission) {
  const allowed = actor?.type === 'staff' && Boolean(actor.role) && hasPermission(actor.role, permission);
  if (!allowed) throw forbidden();
}

/**
 * Loads a subscription the actor may use: the owner (customer), or any with `staffPermission` (staff). A customer
 * asking for someone else's subscription gets 404, so refs can't be probed.
 */
export async function loadForActor(ref, actor, staffPermission) {
  if (actor?.type === 'staff') assertStaff(actor, staffPermission);
  else if (actor?.type !== 'customer' || !actor.id) throw forbidden();
  const sub = await repo.findSubscription(ref);
  if (!sub || (actor.type === 'customer' && sub.customerId !== actor.id)) throw subscriptionNotFound();
  return sub;
}

export function assertTransition(from, to) {
  if (!SUBSCRIPTION_TRANSITIONS[from]?.includes(to)) {
    throw conflict('INVALID_STATUS_TRANSITION', `A ${from} subscription cannot become ${to}`, { from, to });
  }
}

/**
 * Inside a transaction: moves the subscription from its loaded state to `set` (a status change is checked against
 * the transition table), records the audit entry and publishes `event` (if any). Throws SUBSCRIPTION_CHANGED when the
 * subscription changed since it was loaded.
 */
export async function saveChange(sub, set, { actor, context, now, action, event }, session) {
  const to = set.status ?? sub.status;
  if (to !== sub.status) assertTransition(sub.status, to);
  const history = to !== sub.status ? { status: to, at: now, actor: actor.id } : null;
  const saved = await repo.updateSubscription(sub.ref, sub.version, set, history, { session });
  if (!saved) throw subscriptionChanged();
  await recordAudit(
    [
      auditEntry(actor, context, now, {
        action: `subscriptions.${action}`,
        entityType: 'subscription',
        entityRef: sub.ref,
        before: sub.status,
        after: to,
      }),
    ],
    { session },
  );
  if (event) {
    await publish(
      {
        type: event.type,
        entity: { type: 'subscription', ref: sub.ref },
        actor: { type: actor.type, id: actor.id },
        payload: event.payload ?? {},
        occurredAt: now,
      },
      { session },
    );
  }
  return saved;
}

/** An audit entry for an agreement or renewal of a subscription. */
export function childAudit(actor, context, now, { action, entityType, entityRef, scopeRef, before, after }) {
  return auditEntry(actor, context, now, {
    action: `subscriptions.${action}`,
    entityType,
    entityRef,
    scopeRef,
    before,
    after,
  });
}

export { recordAudit };

/** Inside a transaction: issues the agreement for `period` (unique per period, so a retry can't issue two). */
export async function issueAgreement(sub, period, start, end, { actor, context, now }, session) {
  const agreement = await repo.insertAgreement(
    { ref: generateRef('AGR', 8), subscriptionRef: sub.ref, period, periodStart: start, periodEnd: end },
    { session },
  );
  if (!agreement) throw subscriptionChanged();
  await recordAudit(
    [
      childAudit(actor, context, now, {
        action: 'agreement.issued',
        entityType: 'agreement',
        entityRef: agreement.ref,
        scopeRef: sub.ref,
        after: agreement.status,
      }),
    ],
    { session },
  );
  return agreement;
}
