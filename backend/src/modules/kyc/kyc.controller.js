/**
 * KYC controller — reads `req.validated`, calls kyc.service.js, sends `{ data }`.
 * No business rules and no database access here. `req.principal` / `req.auditContext` come from identity's
 * principal guards.
 */
import * as kycService from './kyc.service.js';

// ── Customer ──────────────────────────────────

/** POST /api/v1/kyc */
export async function createApplication(req, res) {
  res.status(201).json({ data: await kycService.createApplication(req.principal, req.auditContext) });
}

/** POST /api/v1/kyc/:ref/documents/upload-url — the signed URL is in this response only. */
export async function requestUploadUrl(req, res) {
  const { ref } = req.validated.params;
  const data = await kycService.requestUploadUrl(ref, req.validated.body, req.principal, req.auditContext);
  res.set('Cache-Control', 'no-store').status(201).json({ data });
}

/** POST /api/v1/kyc/:ref/submit */
export async function submitApplication(req, res) {
  const { ref } = req.validated.params;
  res.json({ data: await kycService.submitApplication(ref, req.validated.body, req.principal, req.auditContext) });
}

/** GET /api/v1/kyc/:ref — the owner, or staff with kyc:read. */
export async function getApplication(req, res) {
  const data = await kycService.getApplication(req.validated.params.ref, req.principal, req.auditContext);
  res.set('Cache-Control', 'no-store').json({ data });
}

// ── Compliance ────────────────────────────────

/** PATCH /api/v1/kyc/:ref/documents/:id/review */
export async function reviewDocument(req, res) {
  const { ref, id } = req.validated.params;
  res.json({ data: await kycService.reviewDocument(ref, id, req.validated.body, req.principal, req.auditContext) });
}

/** POST /api/v1/kyc/:ref/documents/:id/download-url — the signed URL is in this response only. */
export async function getDocumentDownloadUrl(req, res) {
  const { ref, id } = req.validated.params;
  const data = await kycService.getDocumentDownloadUrl(ref, id, req.principal, req.auditContext);
  res.set('Cache-Control', 'no-store').json({ data });
}
