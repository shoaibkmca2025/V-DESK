/**
 * Subscriptions controller — reads `req.validated`, calls subscriptions.service.js, sends `{ data, meta? }`.
 * No business rules and no database access here. `req.principal` / `req.auditContext` come from the identity
 * module's principal guards.
 */
import * as service from './subscriptions.service.js';

// ── Customer (or staff) ───────────────────────

/** GET /api/v1/subscriptions/mine */
export async function listMine(req, res) {
  res.json({ data: await service.listMine(req.principal) });
}

/** GET /api/v1/subscriptions/:ref */
export async function getSubscription(req, res) {
  res.json({ data: await service.getSubscription(req.validated.params.ref, req.principal) });
}

/** POST /api/v1/subscriptions/:ref/renew — 201 for a new renewal quote, 200 when it already exists. */
export async function requestRenewal(req, res) {
  const { renewal, created } = await service.requestRenewal(req.validated.params.ref, req.principal, req.auditContext);
  res.status(created ? 201 : 200).json({ data: renewal });
}

// ── Staff ─────────────────────────────────────

export async function listSubscriptions(req, res) {
  const query = req.validated.query;
  const { subscriptions, nextCursor } = await service.listSubscriptions(query, req.principal);
  res.json({ data: subscriptions, meta: { limit: query.limit, nextCursor } });
}

export async function createSubscription(req, res) {
  const data = await service.createSubscription(req.validated.body, req.principal, req.auditContext);
  res.status(201).json({ data });
}

export async function activateSubscription(req, res) {
  res.json({ data: await service.activateSubscription(req.validated.params.ref, req.principal, req.auditContext) });
}

export async function suspendSubscription(req, res) {
  const { ref } = req.validated.params;
  res.json({ data: await service.suspendSubscription(ref, req.validated.body, req.principal, req.auditContext) });
}

export async function cancelSubscription(req, res) {
  const { ref } = req.validated.params;
  res.json({ data: await service.cancelSubscription(ref, req.validated.body, req.principal, req.auditContext) });
}

export async function applyRenewal(req, res) {
  const { ref, renewalRef } = req.validated.params;
  const data = await service.applyRenewal(ref, renewalRef, req.validated.body, req.principal, req.auditContext);
  res.json({ data });
}

export async function recordAgreementSigned(req, res) {
  const { ref, agreementRef } = req.validated.params;
  res.json({ data: await service.recordAgreementSigned(ref, agreementRef, req.principal, req.auditContext) });
}
