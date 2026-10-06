/**
 * CRM controller — reads `req.validated`, calls crm.service.js, sends `{ data, meta? }`.
 * No business rules and no database access here. Express 5 forwards async errors — no try/catch needed.
 */
import * as crmService from './crm.service.js';

/** POST /api/v1/leads — 201 for a new lead, 200 when a known ref is replayed. */
export async function createLead(req, res) {
  const { lead, created } = await crmService.createLead(req.validated.body);
  res.status(created ? 201 : 200).json({ data: lead });
}

/** GET /api/v1/leads — staff list with filters and cursor pagination. */
export async function listLeads(req, res) {
  const query = req.validated.query;
  const { leads, nextCursor } = await crmService.listLeads(query);
  res.json({ data: leads, meta: { limit: query.limit, nextCursor } });
}

/** GET /api/v1/leads/stats — pipeline totals for the admin dashboard. */
export async function getLeadStats(_req, res) {
  const data = await crmService.getLeadStats();
  res.json({ data });
}

/** GET /api/v1/leads/:ref — one lead with its activity timeline. */
export async function getLead(req, res) {
  const data = await crmService.getLead(req.validated.params.ref);
  res.json({ data });
}

/** PATCH /api/v1/leads/:ref — status / assignment / note. */
export async function updateLead(req, res) {
  const data = await crmService.updateLead(req.validated.params.ref, req.validated.body, req.actor);
  res.json({ data });
}
