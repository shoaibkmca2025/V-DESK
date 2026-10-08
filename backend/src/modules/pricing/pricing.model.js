/**
 * Pricing Mongoose schemas. Collections: pricing_rules, quotes.
 *
 * Quote line items are embedded in the quote (frozen at creation) rather than kept in a separate
 * quote_items collection: a quote is always read whole, and later rule changes must not alter it.
 */
import mongoose from 'mongoose';
import { PRODUCTS, QUOTE_STATUSES, RULE_KEYS } from './pricing.constants.js';

const { Schema } = mongoose;

// ──────────────────────────────────────────────
// Pricing rule override — one document per key; absent key = DEFAULT_PRICING_RULES
// ──────────────────────────────────────────────
const pricingRuleSchema = new Schema(
  {
    /** The rule's human identifier (rules.md §15), used in URLs. */
    key: { type: String, enum: RULE_KEYS, required: true, unique: true },
    /** Shape validated per key by pricing.validation.js (ruleValueSchemas). */
    value: { type: Schema.Types.Mixed, required: true },
    updatedBy: { type: String, required: true },
  },
  { timestamps: true, minimize: false },
);

// ──────────────────────────────────────────────
// Quote
// ──────────────────────────────────────────────
const quoteSchema = new Schema(
  {
    /** VDQ- + time + 8 random characters: it is the share link, so it must not be guessable. */
    ref: { type: String, required: true, unique: true },
    status: { type: String, enum: QUOTE_STATUSES, default: 'SENT' },
    productType: { type: String, enum: PRODUCTS, required: true },
    /** Client-facing fields, named as in features/quote/quoteStore.js (rules.md §42). */
    product: { type: String, required: true },
    purpose: { type: String, default: '' },
    tenure: { type: String, required: true },
    rate_month_paise: { type: Number, default: null },
    name: { type: String, required: true },
    company: { type: String, default: '' },
    /** The validated request item, so a quote can be re-priced or audited later. */
    item: { type: Schema.Types.Mixed, required: true },
    /** Breakdown from pricing.engine.js at creation time. */
    pricing: { type: Schema.Types.Mixed, required: true },
    validUntil: { type: Date, required: true },
    history: [
      {
        _id: false,
        status: { type: String, enum: QUOTE_STATUSES, required: true },
        at: { type: Date, required: true },
        actor: { type: String, required: true },
      },
    ],
    /** Idempotency-Key of the creating request (rules.md §10) and a hash of its body, to spot reuse. */
    idempotencyKey: { type: String, default: null },
    requestHash: { type: String, default: null },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true, minimize: false },
);

quoteSchema.index(
  { idempotencyKey: 1 },
  { unique: true, partialFilterExpression: { idempotencyKey: { $type: 'string' } } },
);
quoteSchema.index({ deletedAt: 1, createdAt: -1, ref: -1 });
quoteSchema.index({ deletedAt: 1, status: 1, createdAt: -1 });

export const PricingRule = mongoose.model('PricingRule', pricingRuleSchema, 'pricing_rules');
export const Quote = mongoose.model('Quote', quoteSchema, 'quotes');
