/**
 * Subscriptions routes — mounted at /api/v1/subscriptions in src/routes.js.
 * Each route = path + middleware (rate limit, auth, validate) + one controller function. No logic here.
 *
 * Customer routes need a verified customer and answer 503 CUSTOMER_AUTH_NOT_AVAILABLE until identity provides one
 * (identity.customer.js). Staff routes need a signed-in user with subscriptions:* — the legacy x-admin-key is refused.
 */
import { Router } from 'express';
import { rateLimit } from '../../shared/middleware/rateLimit.js';
import { validate } from '../../shared/middleware/validate.js';
import { requireCustomer, requireCustomerOrStaff, requireStaffPrincipal as staff } from '../identity/index.js';
import * as controller from './subscriptions.controller.js';
import {
  agreementParams,
  applyRenewalBody,
  createSubscriptionBody,
  emptyBody,
  listSubscriptionsQuery,
  reasonBody,
  renewalParams,
  subscriptionParams,
} from './subscriptions.validation.js';

export const subscriptionsRouter = Router();

const readLimit = rateLimit({ name: 'subscription lookups', windowMs: 60_000, max: 60 });
const writeLimit = rateLimit({ name: 'subscription changes', windowMs: 60_000, max: 20 });

// Fixed paths before /:ref.
subscriptionsRouter.get('/mine', readLimit, requireCustomer, controller.listMine);
subscriptionsRouter.get(
  '/',
  staff('subscriptions:read'),
  validate({ query: listSubscriptionsQuery }),
  controller.listSubscriptions,
);
subscriptionsRouter.post(
  '/',
  staff('subscriptions:write'),
  validate({ body: createSubscriptionBody }),
  controller.createSubscription,
);

// ── Owner or staff ────────────────────────────
subscriptionsRouter.get(
  '/:ref',
  readLimit,
  requireCustomerOrStaff('subscriptions:read'),
  validate({ params: subscriptionParams }),
  controller.getSubscription,
);
subscriptionsRouter.post(
  '/:ref/renew',
  writeLimit,
  requireCustomerOrStaff('subscriptions:write'),
  validate({ params: subscriptionParams, body: emptyBody }),
  controller.requestRenewal,
);

// ── Staff ─────────────────────────────────────
subscriptionsRouter.post(
  '/:ref/activate',
  staff('subscriptions:activate'),
  validate({ params: subscriptionParams, body: emptyBody }),
  controller.activateSubscription,
);
subscriptionsRouter.post(
  '/:ref/suspend',
  staff('subscriptions:write'),
  validate({ params: subscriptionParams, body: reasonBody }),
  controller.suspendSubscription,
);
subscriptionsRouter.post(
  '/:ref/cancel',
  staff('subscriptions:write'),
  validate({ params: subscriptionParams, body: reasonBody }),
  controller.cancelSubscription,
);
subscriptionsRouter.post(
  '/:ref/renewals/:renewalRef/apply',
  staff('subscriptions:write'),
  validate({ params: renewalParams, body: applyRenewalBody }),
  controller.applyRenewal,
);
subscriptionsRouter.post(
  '/:ref/agreements/:agreementRef/sign',
  staff('subscriptions:write'),
  validate({ params: agreementParams, body: emptyBody }),
  controller.recordAgreementSigned,
);
