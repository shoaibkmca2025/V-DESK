/**
 * Orders routes — mounted at /api/v1/orders in src/routes.js.
 * Each route = path + middleware (validate, auth) + one controller function. No logic here.
 */
import { Router } from 'express';
import { rateLimit } from '../../shared/middleware/rateLimit.js';
import { validate } from '../../shared/middleware/validate.js';
import { requireStaff } from '../identity/index.js';
import * as controller from './orders.controller.js';
import { createOrderBody, listOrdersQuery, orderRefParams } from './orders.validation.js';

export const ordersRouter = Router();

// Creating an order records money owed, so it gets a tight budget; reads by ref a looser one.
const createLimit = rateLimit({ name: 'orders', windowMs: 60_000, max: 10 });
const readLimit = rateLimit({ name: 'order lookups', windowMs: 60_000, max: 60 });

// ── Public ────────────────────────────────────
ordersRouter.post('/', createLimit, validate({ body: createOrderBody }), controller.createOrder);

// ── Staff ─────────────────────────────────────
ordersRouter.get('/', requireStaff('orders:read'), validate({ query: listOrdersQuery }), controller.listOrders);

// ── Public (order ref) ────────────────────────
ordersRouter.get('/:ref', readLimit, validate({ params: orderRefParams }), controller.getOrder);
ordersRouter.post('/:ref/cancel', readLimit, validate({ params: orderRefParams }), controller.cancelOrder);
