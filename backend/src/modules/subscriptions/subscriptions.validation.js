/**
 * Subscriptions request schemas (zod) — one per endpoint body / query / params,
 * applied with `validate({ body, query, params })` in subscriptions.routes.js.
 *
 * Bodies are strict: a client can never send a status, a period, a price or a payment confirmation.
 */
import { z } from 'zod';
import {
  GRACE_DAYS_MAX,
  LIST_DEFAULT_LIMIT,
  LIST_MAX_LIMIT,
  REASON_MAX,
  REASON_MIN,
  SUBSCRIPTION_STATUSES,
} from './subscriptions.constants.js';

const refOf = (prefix, min = 8) =>
  z
    .string()
    .trim()
    .toUpperCase()
    .regex(new RegExp(`^${prefix}-[A-Z0-9]{${min},40}$`), `Not a ${prefix} reference`);

const subscriptionRef = refOf('SUB');
const orderRef = refOf('ORD');

export const subscriptionParams = z.object({ ref: subscriptionRef });
export const renewalParams = z.object({ ref: subscriptionRef, renewalRef: refOf('RNW') });
export const agreementParams = z.object({ ref: subscriptionRef, agreementRef: refOf('AGR') });

/** POST /api/v1/subscriptions (staff) */
export const createSubscriptionBody = z
  .object({
    orderRef,
    kycRef: refOf('KYC', 10),
    /** Days of service after the period ends before suspension — the owner's policy, set per subscription. */
    graceDays: z.number().int().min(0).max(GRACE_DAYS_MAX),
  })
  .strict();

/** POST /:ref/suspend and /:ref/cancel — staff must say why. */
export const reasonBody = z.object({ reason: z.string().trim().min(REASON_MIN).max(REASON_MAX) }).strict();

/** POST /:ref/renewals/:renewalRef/apply — the order that paid for it (checked with orders). */
export const applyRenewalBody = z.object({ orderRef }).strict();

/** Endpoints that take no body: anything sent is refused rather than ignored. */
export const emptyBody = z.object({}).strict();

/** GET /api/v1/subscriptions (staff) */
export const listSubscriptionsQuery = z.object({
  status: z.enum(SUBSCRIPTION_STATUSES).optional(),
  customerId: z.string().trim().min(1).max(60).optional(),
  cursor: z.string().trim().min(1).max(500).optional(),
  limit: z.coerce.number().int().min(1).max(LIST_MAX_LIMIT).default(LIST_DEFAULT_LIMIT),
});
