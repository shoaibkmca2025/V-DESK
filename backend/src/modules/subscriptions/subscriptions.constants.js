/**
 * Subscriptions constants — statuses, transition tables (rules.md §5) and the renewal schedule.
 *
 * Documented (modules.md §3.9, phases.md Phase 2–3): activation = payment.succeeded ∧ kyc.approved ∧ ops activates →
 * `service.activated`; renewal reminders at T-30 / T-7 / T-1, renewal quote, grace period, suspension, cancellation.
 * Not documented, so not invented here: the length of the grace period (set per subscription by ops at creation,
 * GRACE_DAYS_MAX caps it) and any automatic cancellation after suspension (ops cancel explicitly).
 */

/**
 *   PENDING_ACTIVATION  created from an order + KYC application; waits for payment, KYC approval and ops
 *   ACTIVE              in a paid period
 *   GRACE               the period ended without a renewal; service continues until graceEndsAt
 *   SUSPENDED           grace ran out (by `system`) or ops suspended it (with a reason)
 *   CANCELLED           final
 */
export const SUBSCRIPTION_STATUSES = ['PENDING_ACTIVATION', 'ACTIVE', 'GRACE', 'SUSPENDED', 'CANCELLED'];

export const SUBSCRIPTION_TRANSITIONS = Object.freeze({
  PENDING_ACTIVATION: ['ACTIVE', 'CANCELLED'],
  ACTIVE: ['GRACE', 'SUSPENDED', 'CANCELLED'],
  GRACE: ['ACTIVE', 'SUSPENDED', 'CANCELLED'],
  SUSPENDED: ['ACTIVE', 'GRACE', 'CANCELLED'],
  CANCELLED: [],
});

/** A renewal can be quoted / applied while the subscription is in one of these. */
export const RENEWABLE_STATUSES = ['ACTIVE', 'GRACE', 'SUSPENDED'];

/** Order tenures (pricing: 'monthly' | 'annual') → months per period. */
export const TERM_MONTHS = Object.freeze({ monthly: 1, annual: 12 });

/** Days before the period ends at which a renewal reminder is due (PRD §49). */
export const REMINDER_DAYS = Object.freeze([30, 7, 1]);

export const GRACE_DAYS_MAX = 90;

export const AGREEMENT_STATUSES = ['ISSUED', 'SIGNED'];
/** No e-sign provider is chosen (memory.md §6): ops record a signature obtained offline. */
export const SIGNATURE_METHODS = ['offline'];

/**
 *   QUOTED   the price for the next period, waiting for payment
 *   APPLIED  paid (verified through orders) and the next period added
 *   VOID     the subscription was cancelled before it was applied
 */
export const RENEWAL_STATUSES = ['QUOTED', 'APPLIED', 'VOID'];

export const REASON_MIN = 5;
export const REASON_MAX = 500;

export const LIST_DEFAULT_LIMIT = 25;
export const LIST_MAX_LIMIT = 100;
/** Per worker run, per lifecycle step. */
export const LIFECYCLE_BATCH = 100;
