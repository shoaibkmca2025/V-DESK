/**
 * Catalog request schemas (zod) — one per endpoint body / query / params,
 * applied with `validate({ body, query, params })` in catalog.routes.js.
 *
 * Parsed values land on `req.validated`; controllers read from there, never raw req.query.
 */
import { z } from 'zod';

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
  type: z.enum(['Virtual Office', 'Coworking', 'Meeting Rooms', 'Private Office']).optional(),
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
