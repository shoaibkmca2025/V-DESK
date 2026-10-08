/**
 * Pricing request schemas (zod) — one per endpoint body / query / params,
 * applied with `validate({ body, query, params })` in pricing.routes.js.
 */
import { z } from 'zod';
import { badRequest } from '../../shared/errors/AppError.js';
import {
  CUSTOMER_STATUS_CHANGES,
  LIST_DEFAULT_LIMIT,
  LIST_MAX_LIMIT,
  QUOTE_STATUSES,
  RULE_KEYS,
} from './pricing.constants.js';

const blankToUndefined = (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value);
const optionalText = (max) => z.preprocess(blankToUndefined, z.string().trim().max(max).optional());
const int = (min, max) => z.coerce.number().int().min(min).max(max);

// ──────────────────────────────────────────────
// Items (what is being priced)
// ──────────────────────────────────────────────

const virtualOfficeItem = z.object({
  product: z.literal('virtual_office'),
  /** Catalog centre ref; the price comes from the catalog, never from the client. */
  centreRef: z.string().trim().toUpperCase().min(1).max(40),
  tenure: z.enum(['monthly', 'annual']).default('annual'),
  purpose: optionalText(120),
  addons: z
    .object({
      gst: z.boolean().optional(),
      mail: z.boolean().optional(),
      meetingCredits: z.boolean().optional(),
      incorporation: z.boolean().optional(),
    })
    .optional(),
});

const meetingRoomItem = z.object({
  product: z.literal('meeting_room'),
  room: z.string().trim().min(1).max(60),
  hours: int(1, 12),
});

const enterpriseItem = z.object({
  product: z.literal('enterprise_desks'),
  desks: int(1, 10_000),
  months: int(1, 60).default(12),
});

const bundleItem = z.object({
  product: z.literal('bundle'),
  services: z.array(z.string().trim().min(1).max(60)).min(1, 'Pick at least one service').max(20),
});

/** Body for POST /api/v1/pricing/quote-preview */
export const itemSchema = z.discriminatedUnion('product', [
  virtualOfficeItem,
  meetingRoomItem,
  enterpriseItem,
  bundleItem,
]);

/** Body for POST /api/v1/pricing/quotes (Idempotency-Key header required). */
export const createQuoteBody = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  company: optionalText(200),
  item: itemSchema,
});

export const quoteRefParams = z.object({
  ref: z.string().trim().toUpperCase().min(1).max(60),
});

/** Body for PATCH /api/v1/pricing/quotes/:ref/status — what the share-link holder may do. */
export const quoteStatusBody = z.object({
  status: z.enum(CUSTOMER_STATUS_CHANGES),
});

export const listQuotesQuery = z.object({
  status: z.enum(QUOTE_STATUSES).optional(),
  cursor: z.string().trim().min(1).max(500).optional(),
  limit: int(1, LIST_MAX_LIMIT).default(LIST_DEFAULT_LIMIT),
});

// ──────────────────────────────────────────────
// Rule overrides (staff)
// ──────────────────────────────────────────────

export const ruleKeyParams = z.object({ key: z.enum(RULE_KEYS) });
export const putRuleBody = z.object({ value: z.unknown().refine((v) => v !== undefined, 'value is required') });

const paise = z.number().int().min(0).max(10_000_000_000);
const bp = z.number().int().min(0).max(10_000);
const label = z.string().trim().min(1).max(80);

/** A complete rule value per key — overrides replace the whole key, never merge into it. */
export const RULE_VALUE_SCHEMAS = {
  tax: z.strictObject({ gst_bp: bp }),
  virtual_office: z.strictObject({
    addons_month_paise: z.strictObject({ gst: paise, mail: paise, meetingCredits: paise }),
    incorporation_once_paise: paise,
    annual_discount_bp: bp,
    city_adjustments: z.record(z.string().trim().min(1).max(60), z.strictObject({ adj_month_paise: paise, label })),
  }),
  meeting_room: z.strictObject({
    rooms: z
      .array(z.strictObject({ name: label, capacity: z.string().trim().max(30), hour_paise: paise.min(1) }))
      .min(1)
      .max(50),
    duration_discounts: z
      .array(z.strictObject({ min_hours: z.number().int().min(1).max(24), discount_bp: bp }))
      .max(10),
  }),
  enterprise_desks: z.strictObject({
    desk_month_paise: paise.min(1),
    bulk_discounts: z
      .array(z.strictObject({ min_desks: z.number().int().min(1).max(100_000), discount_bp: bp }))
      .max(10),
  }),
  bundle: z.strictObject({
    items: z.record(z.string().regex(/^[a-z0-9-]{1,60}$/), z.strictObject({ label, price_paise: paise.min(1) })),
    discount_min_items: z.number().int().min(1).max(20),
    discount_bp: bp,
  }),
};

/** Runs after `validate({ params: ruleKeyParams, body: putRuleBody })`: the schema depends on `:key`. */
export function validateRuleValue(req, _res, next) {
  const { key } = req.validated.params;
  const result = RULE_VALUE_SCHEMAS[key].safeParse(req.validated.body.value);
  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      in: 'body',
      path: ['value', ...issue.path].join('.'),
      message: issue.message,
    }));
    return next(badRequest('VALIDATION_FAILED', 'Some fields are missing or invalid', details));
  }
  req.validated.body.value = result.data;
  next();
}
