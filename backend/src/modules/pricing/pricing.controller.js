/**
 * Pricing controller — reads `req.validated`, calls pricing.service.js, sends `{ data, meta? }`.
 * No business rules and no database access here.
 */
import * as pricingService from './pricing.service.js';

// ── Public ────────────────────────────────────

/** POST /api/v1/pricing/quote-preview — price breakdown, nothing stored. */
export async function previewQuote(req, res) {
  res.json({ data: await pricingService.previewItem(req.validated.body) });
}

/** POST /api/v1/pricing/quotes — 201 for a new quote, 200 when the Idempotency-Key is replayed. */
export async function createQuote(req, res) {
  const { quote, created } = await pricingService.createQuote(req.validated.body, req.get('idempotency-key'));
  res.status(created ? 201 : 200).json({ data: quote });
}

/** GET /api/v1/pricing/quotes/:ref — the shareable proposal. */
export async function getQuote(req, res) {
  res.json({ data: await pricingService.getQuote(req.validated.params.ref) });
}

/** PATCH /api/v1/pricing/quotes/:ref/status — viewed / accepted / rejected by the customer. */
export async function changeQuoteStatus(req, res) {
  const data = await pricingService.changeQuoteStatus(req.validated.params.ref, req.validated.body.status, 'public');
  res.json({ data });
}

// ── Staff ─────────────────────────────────────

export async function listQuotes(req, res) {
  const query = req.validated.query;
  const { quotes, nextCursor } = await pricingService.listQuotes(query);
  res.json({ data: quotes, meta: { limit: query.limit, nextCursor } });
}

export async function listRules(_req, res) {
  res.json({ data: await pricingService.listRules() });
}

export async function setRule(req, res) {
  const data = await pricingService.setRule(req.validated.params.key, req.validated.body.value, req.actor);
  res.json({ data });
}

export async function resetRule(req, res) {
  res.json({ data: await pricingService.resetRule(req.validated.params.key, req.actor) });
}
