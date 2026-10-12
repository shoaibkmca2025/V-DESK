/**
 * Enterprise request schemas (zod) — one per endpoint body / query / params,
 * applied with `validate({ body, query, params })` in enterprise.routes.js.
 *
 * Staff and member bodies are strict (unknown fields are a 400). The public RFP body drops unknown fields, like the
 * other public forms, so a client-sent price or status never reaches the service.
 */
import { z } from 'zod';
import {
  LIST_DEFAULT_LIMIT,
  LIST_MAX_LIMIT,
  MAX_DESKS,
  MAX_DISCOUNT_TIERS,
  MAX_MONTHS,
  MAX_RFP_CITIES,
  ORG_ROLES,
  RFP_STATUSES,
} from './enterprise.constants.js';

const MOBILE_PATTERN = /^(\+?91)?[6-9]\d{9}$/;
const GSTIN_PATTERN = /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

const blankToUndefined = (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value);
const text = (min, max) => z.string().trim().min(min).max(max);
const int = (min, max) => z.coerce.number().int().min(min).max(max);
const refOf = (prefix) =>
  z
    .string()
    .trim()
    .toUpperCase()
    .regex(new RegExp(`^${prefix}-[A-Z0-9]{8,40}$`), `Not a ${prefix} reference`);
/** A customer principal id (identity's customer ref). */
const customerId = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{2,5}-[A-Z0-9-]{3,40}$/, 'Not a customer id');
const email = z.preprocess(blankToUndefined, z.string().trim().toLowerCase().max(254).email().optional());

export const organisationParams = z.object({ ref: refOf('ORG') });
export const memberParams = z.object({ ref: refOf('ORG'), customerId });
export const rfpParams = z.object({ ref: refOf('RFP') });

const listQuery = {
  cursor: z.string().trim().min(1).max(500).optional(),
  limit: int(1, LIST_MAX_LIMIT).default(LIST_DEFAULT_LIMIT),
};
export const listOrganisationsQuery = z.object(listQuery);
export const listRfpsQuery = z.object({ status: z.enum(RFP_STATUSES).optional(), ...listQuery });

// ── Organisations and members ─────────────────

export const createOrganisationBody = z
  .object({
    name: text(2, 200),
    gstin: z.preprocess(
      blankToUndefined,
      z.string().trim().toUpperCase().regex(GSTIN_PATTERN, 'Invalid GSTIN').optional(),
    ),
    billingEmail: email,
    ownerCustomerId: customerId.optional(),
  })
  .strict();

export const updateOrganisationBody = z
  .object({
    name: text(2, 200).optional(),
    gstin: z.string().trim().toUpperCase().regex(GSTIN_PATTERN, 'Invalid GSTIN').nullable().optional(),
    billingEmail: z.string().trim().toLowerCase().max(254).email().nullable().optional(),
  })
  .strict()
  .refine((body) => Object.keys(body).length > 0, 'Nothing to change');

export const addMemberBody = z.object({ customerId, role: z.enum(ORG_ROLES) }).strict();
export const changeMemberBody = z.object({ role: z.enum(ORG_ROLES) }).strict();

// ── Team bookings, billing, price books ───────

export const linkBookingBody = z.object({ bookingRef: refOf('BK'), memberCustomerId: customerId.optional() }).strict();
export const linkOrderBody = z.object({ orderRef: refOf('ORD') }).strict();

const isoDate = z.coerce.date();
export const billingQuery = z
  .object({ from: isoDate.optional(), to: isoDate.optional() })
  .refine((q) => !q.from || !q.to || q.from < q.to, { message: '`from` must be before `to`', path: ['from'] });

/** Same shape as pricing's `enterprise_desks` rule, so pricing's engine prices it. */
export const priceBookBody = z
  .object({
    enterprise_desks: z
      .object({
        desk_month_paise: int(1, 100_000_000),
        bulk_discounts: z
          .array(z.object({ min_desks: int(1, MAX_DESKS), discount_bp: int(0, 10_000) }).strict())
          .max(MAX_DISCOUNT_TIERS)
          .refine((tiers) => new Set(tiers.map((t) => t.min_desks)).size === tiers.length, 'Duplicate min_desks'),
      })
      .strict(),
    note: z.string().trim().max(500).optional(),
    /** The version the editor loaded (null/absent for the first one) — optimistic locking. */
    expectedVersion: z.number().int().min(1).nullable().optional(),
  })
  .strict();

export const pricePreviewQuery = z.object({ desks: int(1, MAX_DESKS), months: int(1, MAX_MONTHS).default(12) });

// ── RFPs ──────────────────────────────────────

/** Body for public POST /api/v1/enterprise/rfps (Idempotency-Key header required). */
export const submitRfpBody = z.object({
  company: text(1, 200),
  contact: z.object({
    name: text(1, 120),
    mobile: z
      .string()
      .trim()
      .max(20)
      .transform((v) => v.replace(/[\s()-]/g, ''))
      .refine((v) => MOBILE_PATTERN.test(v), 'Enter a valid 10-digit Indian mobile number')
      .transform((v) => v.slice(-10)),
    email: email.transform((v) => v ?? null),
  }),
  desks: int(1, MAX_DESKS),
  months: int(1, MAX_MONTHS).default(12),
  cities: z
    .array(text(1, 60))
    .min(1, 'Pick at least one city')
    .max(MAX_RFP_CITIES)
    .transform((cities) => [...new Set(cities)]),
});

export const rfpStatusBody = z.object({ status: z.enum(RFP_STATUSES) }).strict();
