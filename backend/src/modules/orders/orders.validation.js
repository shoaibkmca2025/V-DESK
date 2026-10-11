/**
 * Orders request schemas (zod) — one per endpoint body / query / params,
 * applied with `validate({ body, query, params })` in orders.routes.js.
 *
 * Unknown body fields are dropped, so a client-sent amount or status never reaches the service.
 */
import { z } from 'zod';
import { LIST_DEFAULT_LIMIT, LIST_MAX_LIMIT, ORDER_STATUSES, SOURCE_TYPES } from './orders.constants.js';

const int = (min, max) => z.coerce.number().int().min(min).max(max);
const ref = z.string().trim().toUpperCase().min(1).max(60);

/** Body for POST /api/v1/orders (Idempotency-Key header required). */
export const createOrderBody = z.object({
  source: z.object({
    type: z.enum(SOURCE_TYPES),
    /** A quote ref (VDQ-…) or booking ref (BK-…). */
    ref,
  }),
});

export const orderRefParams = z.object({ ref });

/** Query for GET /api/v1/orders (staff). */
export const listOrdersQuery = z.object({
  status: z.enum(ORDER_STATUSES).optional(),
  sourceType: z.enum(SOURCE_TYPES).optional(),
  cursor: z.string().trim().min(1).max(500).optional(),
  limit: int(1, LIST_MAX_LIMIT).default(LIST_DEFAULT_LIMIT),
});
