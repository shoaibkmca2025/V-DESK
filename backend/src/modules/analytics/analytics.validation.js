/**
 * Analytics request schemas (zod) — one per endpoint body / query / params,
 * applied with `validate({ body, query, params })` in analytics.routes.js.
 */
import { z } from 'zod';
import {
  DEFAULT_RANGE,
  DEVICES,
  EVENT_TYPE_PATTERN,
  LIST_DEFAULT_LIMIT,
  LIST_MAX_LIMIT,
  MAX_BATCH,
  RANGES,
} from './analytics.constants.js';

/** One client event, as trackSearchEvent builds it. Unknown fields are dropped. */
const eventSchema = z.object({
  id: z.string().trim().min(1).max(64).optional(),
  type: z.string().trim().regex(EVENT_TYPE_PATTERN, 'Event type must be snake_case, e.g. search_submitted'),
  data: z.record(z.string(), z.unknown()).optional(),
  /** Anything other than the client's two values is stored as Unknown rather than rejected. */
  device: z.preprocess((value) => (DEVICES.includes(value) ? value : 'Unknown'), z.enum(DEVICES)),
  timestamp: z.string().max(40).optional(),
});

/** Body for POST /api/v1/analytics/events */
export const ingestBody = z.object({
  events: z
    .array(eventSchema)
    .min(1, 'Send at least one event')
    .max(MAX_BATCH, `At most ${MAX_BATCH} events per batch`),
});

/** Query for GET /api/v1/analytics/events */
export const listEventsQuery = z.object({
  type: z.string().trim().regex(EVENT_TYPE_PATTERN).optional(),
  cursor: z.string().trim().min(1).max(500).optional(),
  limit: z.coerce.number().int().min(1).max(LIST_MAX_LIMIT).default(LIST_DEFAULT_LIMIT),
});

/** Query for GET /api/v1/analytics/kpis and /funnel */
export const rangeQuery = z.object({
  range: z.enum(Object.keys(RANGES)).default(DEFAULT_RANGE),
});
