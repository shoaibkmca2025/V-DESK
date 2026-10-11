/**
 * CRM request schemas (zod) — one per endpoint body / query / params,
 * applied with `validate({ body, query, params })` in crm.routes.js.
 *
 * Unknown body fields are dropped, so the client can keep posting its whole form object.
 */
import { z } from 'zod';
import {
  LEAD_REF_PATTERN,
  LEAD_STATUSES,
  LIST_DEFAULT_LIMIT,
  LIST_MAX_LIMIT,
  MOBILE_PATTERN,
} from './crm.constants.js';

/** Forms send '' for untouched inputs; treat that the same as "not sent". */
const blankToUndefined = (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value);
const optionalText = (max) => z.preprocess(blankToUndefined, z.string().trim().max(max).optional());

const leadRef = z
  .string()
  .trim()
  .toUpperCase()
  .regex(LEAD_REF_PATTERN, 'Lead ref must look like VD-XXXX (letters, digits, dashes)');

/** One marketing touch: UTM values, ad click ids, referrer and landing page, and when it happened. */
const touch = z.object({
  source: optionalText(100),
  medium: optionalText(100),
  campaign: optionalText(200),
  term: optionalText(200),
  content: optionalText(200),
  referrer: optionalText(500),
  landingPage: optionalText(500),
  gclid: optionalText(200),
  fbclid: optionalText(200),
  at: z.preprocess(blankToUndefined, z.coerce.date().optional()),
});

/** Body for POST /api/v1/leads (public website forms). Status is never accepted here — new leads start at NEW. */
export const createLeadBody = z
  .object({
    /** Optional client-generated ref (the frontend's `id`), making retries idempotent. */
    ref: z.preprocess(blankToUndefined, leadRef.optional()),
    name: z.string().trim().min(1, 'Name is required').max(120),
    mobile: z.preprocess(
      blankToUndefined,
      z
        .string()
        .trim()
        .max(20)
        .refine((v) => MOBILE_PATTERN.test(v.replace(/[\s()-]/g, '')), 'Enter a valid 10-digit Indian mobile number')
        .optional(),
    ),
    email: z.preprocess(
      blankToUndefined,
      z.string().trim().toLowerCase().max(254).email('Enter a valid email').optional(),
    ),
    city: optionalText(120),
    service: optionalText(200),
    company: optionalText(200),
    notes: optionalText(2000),
    source: optionalText(200),
    /** Marketing attribution (PRD §60): the visit that first brought the contact in, and this visit. */
    attribution: z.object({ firstTouch: touch.optional(), lastTouch: touch.optional() }).optional(),
  })
  .refine((lead) => lead.mobile || lead.email, {
    message: 'Provide a mobile number or an email address',
    path: ['mobile'],
  });

/** Query for GET /api/v1/leads */
export const listLeadsQuery = z.object({
  status: z.enum(LEAD_STATUSES).optional(),
  city: optionalText(120),
  source: optionalText(200),
  assignedTo: optionalText(120),
  /** Case-insensitive match on name, mobile, email or city (same fields as the admin table search). */
  q: optionalText(100),
  cursor: optionalText(500),
  limit: z.coerce.number().int().min(1).max(LIST_MAX_LIMIT).default(LIST_DEFAULT_LIMIT),
});

/** Query for GET /api/v1/leads/export.csv — the list filters plus a created-at window, no paging. */
export const exportLeadsQuery = listLeadsQuery
  .omit({ cursor: true, limit: true })
  .extend({
    from: z.preprocess(blankToUndefined, z.coerce.date().optional()),
    to: z.preprocess(blankToUndefined, z.coerce.date().optional()),
  })
  .refine((query) => !query.from || !query.to || query.from <= query.to, {
    message: '`from` must be on or before `to`',
    path: ['from'],
  });

/** Path params for /api/v1/leads/:ref */
export const leadRefParams = z.object({
  ref: z.string().trim().toUpperCase().min(1).max(50),
});

/** Body for PATCH /api/v1/leads/:ref — any of status / assignedTo (null unassigns) / note. */
export const updateLeadBody = z
  .object({
    status: z.enum(LEAD_STATUSES).optional(),
    assignedTo: z.string().trim().min(1).max(120).nullable().optional(),
    note: z.string().trim().min(1).max(2000).optional(),
  })
  .refine((body) => Object.values(body).some((value) => value !== undefined), {
    message: 'Send at least one of status, assignedTo or note',
  });
