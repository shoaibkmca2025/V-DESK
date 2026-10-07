/**
 * Search request schemas (zod) — one per endpoint body / query / params,
 * applied with `validate({ body, query, params })` in search.routes.js.
 *
 * Filter values are the explorer's own (`all`, `2-5`, `price-asc`, `Meeting Rooms`, …) so the client can send its
 * filter state unchanged (rules.md §42). `maxPrice` is in rupees, like catalog's workspace query.
 */
import { z } from 'zod';
import { badRequest } from '../../shared/errors/AppError.js';
import {
  CAPACITY_BUCKETS,
  CONFIG_KEYS,
  POPULAR_MAX,
  PROMOTED_MAX,
  REDIRECT_REF_PATTERN,
  SORTS,
  WORKSPACE_TYPES,
} from './search.constants.js';
import { normalizeQuery } from './search.intent.js';

const blankToUndefined = (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value);
const optionalText = (max) => z.preprocess(blankToUndefined, z.string().trim().max(max).optional());
const normalizedText = (max) => z.string().trim().min(1).max(max).transform(normalizeQuery);

const noDuplicates = (values) => new Set(values.map((v) => v.toLowerCase())).size === values.length;

/** Query for GET /api/v1/search. Every filter is optional; sent filters override what the query implies. */
export const searchQuery = z.object({
  q: optionalText(200),
  city: optionalText(120),
  type: z.enum(['all', ...WORKSPACE_TYPES]).optional(),
  capacity: z.enum(CAPACITY_BUCKETS).optional(),
  maxPrice: z.coerce.number().int().positive().optional(),
  sort: z.enum(SORTS).optional(),
});

/** Query for GET /api/v1/search/suggest */
export const suggestQuery = z.object({
  q: z.string().trim().min(1, 'Type at least one character').max(100),
});

// ── Redirects ─────────────────────────────────

/** A site-relative path. Protocol-relative (`//x`) and backslash forms are refused so a redirect can't leave the site. */
const redirectTarget = z
  .string()
  .trim()
  .max(500)
  .regex(
    /^\/(?![/\\])[^\s\\]*$/,
    'Target must be a site path starting with a single "/", e.g. /services/gst-registration',
  );

export const createRedirectBody = z.object({
  query: normalizedText(200),
  target: redirectTarget,
});

export const updateRedirectBody = z
  .object({ query: normalizedText(200).optional(), target: redirectTarget.optional() })
  .refine((body) => body.query !== undefined || body.target !== undefined, {
    message: 'Send at least one of query or target',
  });

export const redirectRefParams = z.object({
  ref: z.string().trim().toUpperCase().regex(REDIRECT_REF_PATTERN, 'Redirect ref must look like RDR-XXXX'),
});

// ── Config ────────────────────────────────────

/** Allowed value per config key. Centre refs are checked against catalog by the service. */
export const CONFIG_VALUE_SCHEMAS = Object.freeze({
  promotedCentres: z
    .array(z.string().trim().toUpperCase().min(1).max(40))
    .max(PROMOTED_MAX)
    .refine(noDuplicates, 'Centre refs must not repeat'),
  popularSearches: z
    .array(z.string().trim().min(1).max(100))
    .max(POPULAR_MAX)
    .refine(noDuplicates, 'Popular searches must not repeat'),
});

export const createConfigBody = z.discriminatedUnion(
  'key',
  CONFIG_KEYS.map((key) => z.object({ key: z.literal(key), value: CONFIG_VALUE_SCHEMAS[key] })),
);

/** PATCH body shape only; the value itself is checked against its key by `validateConfigValue`. */
export const updateConfigBody = z.object({ value: z.unknown().refine((v) => v !== undefined, 'value is required') });

export const configKeyParams = z.object({ key: z.enum(CONFIG_KEYS) });

/**
 * Runs after `validate({ params: configKeyParams, body: updateConfigBody })`: the right schema for `value`
 * depends on the `:key` in the URL, which a plain body schema can't see.
 */
export function validateConfigValue(req, _res, next) {
  const { key } = req.validated.params;
  const result = CONFIG_VALUE_SCHEMAS[key].safeParse(req.validated.body.value);
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
