/**
 * Catalog request schemas (zod) — one per endpoint body / query / params,
 * applied with `validate({ body, query, params })` in catalog.routes.js.
 *
 * Parsed values land on `req.validated`; controllers read from there, never raw req.query.
 */
import { z } from 'zod';
import { AVAILABILITY_STATUSES, CITY_TIERS, SLUG_PATTERN, WORKSPACE_TYPES } from './catalog.constants.js';

/** Query params for GET /api/v1/catalog/centres */
export const listCentresQuery = z.object({
  /** Filter by city slug, e.g. ?city=mumbai */
  city: z.string().trim().toLowerCase().optional(),
});

/** Query params for GET /api/v1/catalog/workspaces */
export const listWorkspacesQuery = z.object({
  /** Filter by city name (case-insensitive match after normalisation) */
  city: z.string().trim().optional(),
  /** Filter by workspace type */
  type: z.enum(WORKSPACE_TYPES).optional(),
  /** Minimum number of seats required */
  capacity: z.coerce.number().int().positive().optional(),
  /** Maximum monthly price in rupees (service converts to paise) */
  maxPrice: z.coerce.number().int().positive().optional(),
});

/** Path params for GET /api/v1/catalog/centres/:ref */
export const centreRefParams = z.object({
  ref: z.string().trim().min(1),
});

/** Path params for GET /api/v1/catalog/workspaces/:ref */
export const workspaceRefParams = z.object({
  ref: z.string().trim().min(1),
});

/** Path params for GET /api/v1/catalog/cities/:slug */
export const citySlugParams = z.object({
  slug: z.string().trim().toLowerCase().min(1),
});

// ──────────────────────────────────────────────
// Staff (/catalog/admin) — prices in integer paise; unknown fields are dropped
// ──────────────────────────────────────────────

const text = (max) => z.string().trim().min(1).max(max);
const paise = z.number().int().min(0).max(1_000_000_000);
const atLeastOne = (schema) =>
  schema.refine((body) => Object.values(body).some((value) => value !== undefined), {
    message: 'Send at least one field to change',
  });
/** Staff refs are case-insensitive in URLs; stored refs are upper-case. */
const upperRef = z.string().trim().toUpperCase().min(1).max(40);

export const citySlugAdminParams = z.object({ slug: z.string().trim().toLowerCase().min(1).max(60) });
export const refAdminParams = z.object({ ref: upperRef });

const cityFields = {
  name: text(80),
  state: text(80),
  tier: z.enum(CITY_TIERS),
  tagline: z.string().trim().max(200),
  localities: z.array(text(80)).max(50),
  active: z.boolean(),
};

export const createCityBody = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .max(60)
    .regex(SLUG_PATTERN, 'Use lower-case words joined by dashes, e.g. navi-mumbai'),
  ...cityFields,
  tagline: cityFields.tagline.default(''),
  localities: cityFields.localities.default([]),
  active: cityFields.active.default(true),
});

/** The slug is part of public URLs, so it can't be changed — create a new city instead. */
export const updateCityBody = atLeastOne(z.object(cityFields).partial());

const centreFields = {
  areaName: text(120),
  fullName: text(200),
  address: text(500),
  services: z.array(text(60)).max(20),
  vo_price_paise: paise.nullable(),
  cw_price_paise: paise.nullable(),
  meetingCapacity: z.string().trim().max(40),
  status: z.enum(AVAILABILITY_STATUSES),
  flagship: z.boolean(),
  active: z.boolean(),
};

export const createCentreBody = z.object({
  citySlug: z.string().trim().toLowerCase().min(1).max(60),
  ...centreFields,
  services: centreFields.services.default([]),
  vo_price_paise: centreFields.vo_price_paise.default(null),
  cw_price_paise: centreFields.cw_price_paise.default(null),
  meetingCapacity: centreFields.meetingCapacity.default(''),
  status: centreFields.status.default('available'),
  flagship: centreFields.flagship.default(false),
  active: centreFields.active.default(true),
});

export const updateCentreBody = atLeastOne(z.object(centreFields).partial());

export const listCentresAdminQuery = z.object({
  city: z.string().trim().toLowerCase().min(1).max(60).optional(),
});

const workspaceFields = {
  name: text(200),
  type: z.enum(WORKSPACE_TYPES),
  capacity: z.number().int().min(1).max(1000),
  price_month_paise: paise,
  price_hour_paise: paise,
  amenities: z.array(text(60)).max(40),
  status: z.enum(AVAILABILITY_STATUSES),
  locality: text(120),
  rating: z.number().min(0).max(5).nullable(),
  reviews: z.number().int().min(0),
  active: z.boolean(),
};

export const createWorkspaceBody = z.object({
  centreRef: upperRef,
  ...workspaceFields,
  /** Defaults to the centre's area name. */
  locality: workspaceFields.locality.optional(),
  amenities: workspaceFields.amenities.default([]),
  status: workspaceFields.status.default('available'),
  rating: workspaceFields.rating.default(null),
  reviews: workspaceFields.reviews.default(0),
  active: workspaceFields.active.default(true),
});

export const updateWorkspaceBody = atLeastOne(z.object(workspaceFields).partial());

export const listWorkspacesAdminQuery = z.object({
  centreRef: upperRef.optional(),
});
