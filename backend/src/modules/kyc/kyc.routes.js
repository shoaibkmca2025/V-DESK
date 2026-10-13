/**
 * KYC routes — mounted at /api/v1/kyc in src/routes.js.
 * Each route = path + middleware (rate limit, auth, validate) + one controller function. No logic here.
 *
 * Customer routes need a verified customer and answer 503 CUSTOMER_AUTH_NOT_AVAILABLE until identity provides one
 * (identity.customer.js). Staff routes need a signed-in user with kyc:read / kyc:review (COMPLIANCE) — the legacy
 * x-admin-key is refused.
 */
import { Router } from 'express';
import { rateLimit } from '../../shared/middleware/rateLimit.js';
import { validate } from '../../shared/middleware/validate.js';
import { requireCustomer, requireCustomerOrStaff, requireStaffPrincipal } from '../identity/index.js';
import * as controller from './kyc.controller.js';
import {
  applicationParams,
  createApplicationBody,
  documentParams,
  reviewBody,
  submitBody,
  uploadUrlBody,
} from './kyc.validation.js';

export const kycRouter = Router();

const writeLimit = rateLimit({ name: 'KYC changes', windowMs: 60_000, max: 20 });
const readLimit = rateLimit({ name: 'KYC lookups', windowMs: 60_000, max: 60 });

// ── Customer ──────────────────────────────────
kycRouter.post(
  '/',
  writeLimit,
  requireCustomer,
  validate({ body: createApplicationBody }),
  controller.createApplication,
);
kycRouter.post(
  '/:ref/documents/upload-url',
  writeLimit,
  requireCustomer,
  validate({ params: applicationParams, body: uploadUrlBody }),
  controller.requestUploadUrl,
);
kycRouter.post(
  '/:ref/submit',
  writeLimit,
  requireCustomer,
  validate({ params: applicationParams, body: submitBody }),
  controller.submitApplication,
);

// ── Customer (own) or compliance ──────────────
kycRouter.get(
  '/:ref',
  readLimit,
  requireCustomerOrStaff('kyc:read'),
  validate({ params: applicationParams }),
  controller.getApplication,
);

// ── Compliance ────────────────────────────────
kycRouter.patch(
  '/:ref/documents/:id/review',
  requireStaffPrincipal('kyc:review'),
  validate({ params: documentParams, body: reviewBody }),
  controller.reviewDocument,
);
kycRouter.post(
  '/:ref/documents/:id/download-url',
  readLimit,
  requireStaffPrincipal('kyc:read'),
  validate({ params: documentParams }),
  controller.getDocumentDownloadUrl,
);
