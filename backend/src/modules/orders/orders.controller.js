/**
 * Orders controller — reads `req.validated`, calls orders.service.js, sends `{ data, meta? }`.
 * No business rules and no database access here.
 */
import * as ordersService from './orders.service.js';

// ── Public ────────────────────────────────────

/** POST /api/v1/orders — 201 for a new order, 200 when the Idempotency-Key is replayed. */
export async function createOrder(req, res) {
  const { order, created } = await ordersService.createOrder(req.validated.body, req.get('idempotency-key'));
  res.status(created ? 201 : 200).json({ data: order });
}

/** GET /api/v1/orders/:ref */
export async function getOrder(req, res) {
  res.json({ data: await ordersService.getOrder(req.validated.params.ref) });
}

/** POST /api/v1/orders/:ref/cancel — the customer abandons an unpaid order. */
export async function cancelOrder(req, res) {
  res.json({ data: await ordersService.cancelOrder(req.validated.params.ref, 'public') });
}

// ── Staff ─────────────────────────────────────

export async function listOrders(req, res) {
  const query = req.validated.query;
  const { orders, nextCursor } = await ordersService.listOrders(query);
  res.json({ data: orders, meta: { limit: query.limit, nextCursor } });
}
