/**
 * Enterprise controller — reads `req.validated`, calls enterprise.service.js, sends `{ data, meta? }`.
 * No business rules and no database access here. `req.principal` / `req.auditContext` come from the identity
 * module's principal guards.
 */
import * as service from './enterprise.service.js';

const params = (req) => req.validated.params;

// ── Public ────────────────────────────────────

/** POST /api/v1/enterprise/rfps — 201 new, 200 for a replayed Idempotency-Key. */
export async function submitRfp(req, res) {
  const { rfp, created } = await service.submitRfp(req.validated.body, req.get('idempotency-key'));
  res.status(created ? 201 : 200).json({ data: rfp });
}

// ── Customer ──────────────────────────────────

export async function listMyOrganisations(req, res) {
  res.json({ data: await service.listMyOrganisations(req.principal) });
}

// ── Organisations ─────────────────────────────

export async function listOrganisations(req, res) {
  const query = req.validated.query;
  const { organisations, nextCursor } = await service.listOrganisations(query, req.principal);
  res.json({ data: organisations, meta: { limit: query.limit, nextCursor } });
}

export async function createOrganisation(req, res) {
  const data = await service.createOrganisation(req.validated.body, req.principal, req.auditContext);
  res.status(201).json({ data });
}

export async function getOrganisation(req, res) {
  res.json({ data: await service.getOrganisation(params(req).ref, req.principal) });
}

export async function updateOrganisation(req, res) {
  const data = await service.updateOrganisation(params(req).ref, req.validated.body, req.principal, req.auditContext);
  res.json({ data });
}

export async function deleteOrganisation(req, res) {
  await service.deleteOrganisation(params(req).ref, req.principal, req.auditContext);
  res.status(204).end();
}

// ── Members ───────────────────────────────────

export async function addMember(req, res) {
  const data = await service.addMember(params(req).ref, req.validated.body, req.principal, req.auditContext);
  res.status(201).json({ data });
}

export async function changeMemberRole(req, res) {
  const { ref, customerId } = params(req);
  const data = await service.changeMemberRole(ref, customerId, req.validated.body, req.principal, req.auditContext);
  res.json({ data });
}

export async function removeMember(req, res) {
  const { ref, customerId } = params(req);
  await service.removeMember(ref, customerId, req.principal, req.auditContext);
  res.status(204).end();
}

// ── Team bookings, billing, price books, reports ─

export async function linkBooking(req, res) {
  const data = await service.linkBooking(params(req).ref, req.validated.body, req.principal, req.auditContext);
  res.status(201).json({ data });
}

export async function listTeamBookings(req, res) {
  res.json({ data: await service.listTeamBookings(params(req).ref, req.principal) });
}

export async function linkOrder(req, res) {
  const data = await service.linkOrder(params(req).ref, req.validated.body, req.principal, req.auditContext);
  res.status(201).json({ data });
}

export async function billingStatement(req, res) {
  res.json({ data: await service.billingStatement(params(req).ref, req.validated.query, req.principal) });
}

export async function billingStatementCsv(req, res) {
  const csv = await service.billingStatementCsv(params(req).ref, req.validated.query, req.principal);
  res
    .set({
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="billing-${params(req).ref}.csv"`,
      'Cache-Control': 'no-store',
    })
    .send(csv);
}

export async function setPriceBook(req, res) {
  const data = await service.setPriceBook(params(req).ref, req.validated.body, req.principal, req.auditContext);
  res.status(201).json({ data });
}

export async function listPriceBooks(req, res) {
  res.json({ data: await service.listPriceBooks(params(req).ref, req.principal) });
}

export async function previewPrice(req, res) {
  res.json({ data: await service.previewPrice(params(req).ref, req.validated.query, req.principal) });
}

export async function organisationReport(req, res) {
  res.json({ data: await service.organisationReport(params(req).ref, req.principal) });
}

// ── RFPs (staff) ──────────────────────────────

export async function listRfps(req, res) {
  const query = req.validated.query;
  const { rfps, nextCursor } = await service.listRfps(query, req.principal);
  res.json({ data: rfps, meta: { limit: query.limit, nextCursor } });
}

export async function getRfp(req, res) {
  res.json({ data: await service.getRfp(params(req).ref, req.principal) });
}

export async function changeRfpStatus(req, res) {
  const data = await service.changeRfpStatus(params(req).ref, req.validated.body, req.principal, req.auditContext);
  res.json({ data });
}
