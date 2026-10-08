/**
 * Pricing routes — mounted at /api/v1/pricing in src/routes.js.
 * Each route = path + middleware (validate, auth) + one controller function. No logic here.
 */
import { Router } from 'express';
import { rateLimit } from '../../shared/middleware/rateLimit.js';
import { validate } from '../../shared/middleware/validate.js';
import { requireStaff } from '../identity/index.js';
import * as controller from './pricing.controller.js';
import {
  createQuoteBody,
  itemSchema,
  listQuotesQuery,
  putRuleBody,
  quoteRefParams,
  quoteStatusBody,
  ruleKeyParams,
  validateRuleValue,
} from './pricing.validation.js';

export const pricingRouter = Router();

// ── Public ────────────────────────────────────
// Previews run on every configurator change, so they get a generous budget; stored quotes a tight one.
const previewLimit = rateLimit({ name: 'price previews', windowMs: 60_000, max: 120 });
const quoteLimit = rateLimit({ name: 'quotes', windowMs: 60_000, max: 10 });

pricingRouter.post('/quote-preview', previewLimit, validate({ body: itemSchema }), controller.previewQuote);
pricingRouter.post('/quotes', quoteLimit, validate({ body: createQuoteBody }), controller.createQuote);
pricingRouter.get('/quotes/:ref', validate({ params: quoteRefParams }), controller.getQuote);
pricingRouter.patch(
  '/quotes/:ref/status',
  quoteLimit,
  validate({ params: quoteRefParams, body: quoteStatusBody }),
  controller.changeQuoteStatus,
);

// ── Staff ─────────────────────────────────────
pricingRouter.get('/quotes', requireStaff('quotes:read'), validate({ query: listQuotesQuery }), controller.listQuotes);
pricingRouter.get('/rules', requireStaff('quotes:read'), controller.listRules);
pricingRouter.put(
  '/rules/:key',
  requireStaff('pricing:manage'),
  validate({ params: ruleKeyParams, body: putRuleBody }),
  validateRuleValue,
  controller.setRule,
);
pricingRouter.delete(
  '/rules/:key',
  requireStaff('pricing:manage'),
  validate({ params: ruleKeyParams }),
  controller.resetRule,
);
