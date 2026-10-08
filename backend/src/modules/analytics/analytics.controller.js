/**
 * Analytics controller — reads `req.validated`, calls analytics.service.js, sends `{ data, meta? }`.
 * No business rules and no database access here.
 */
import { badRequest } from '../../shared/errors/AppError.js';
import * as analyticsService from './analytics.service.js';

/**
 * navigator.sendBeacon posts `text/plain` (a JSON content type would need a CORS preflight a beacon can't
 * make), so the ingest route also accepts a JSON string in a text body.
 */
export function parseBeaconBody(req, _res, next) {
  if (typeof req.body !== 'string') return next();
  try {
    req.body = JSON.parse(req.body);
    next();
  } catch {
    next(badRequest('INVALID_JSON', 'Request body is not valid JSON'));
  }
}

/** POST /api/v1/analytics/events — 202: accepted for storage; duplicates are counted, not errors. */
export async function ingestEvents(req, res) {
  const data = await analyticsService.ingestEvents(req.validated.body.events);
  res.status(202).json({ data });
}

/** GET /api/v1/analytics/events — staff telemetry stream. */
export async function listEvents(req, res) {
  const query = req.validated.query;
  const { events, nextCursor } = await analyticsService.listEvents(query);
  res.json({ data: events, meta: { limit: query.limit, nextCursor } });
}

/** GET /api/v1/analytics/kpis */
export async function getKpis(req, res) {
  res.json({ data: await analyticsService.getKpis(req.validated.query) });
}

/** GET /api/v1/analytics/funnel */
export async function getFunnel(req, res) {
  res.json({ data: await analyticsService.getFunnel(req.validated.query) });
}
