/**
 * KYC request schemas (zod) — one per endpoint body / query / params,
 * applied with `validate({ body, query, params })` in kyc.routes.js.
 *
 * Bodies are strict: an unexpected field (a client-chosen storage key, file name, status, owner…) is a 400, not
 * silently ignored, because nothing about a KYC record may be steered by the client beyond what is listed here.
 */
import { z } from 'zod';
import {
  CONTENT_TYPES,
  DOCUMENT_TYPES,
  MAX_FILE_BYTES,
  REJECTION_REASON_MAX,
  REJECTION_REASON_MIN,
} from './kyc.constants.js';

const applicationRef = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^KYC-[A-Z0-9]{10,30}$/, 'Not a KYC application reference');
const documentRef = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^DOC-[A-Z0-9]{8,30}$/, 'Not a document reference');

export const applicationParams = z.object({ ref: applicationRef });
export const documentParams = z.object({ ref: applicationRef, id: documentRef });

/** POST /api/v1/kyc — the owner comes from the signed-in customer, never from the body. */
export const createApplicationBody = z.object({}).strict();

/** POST /api/v1/kyc/:ref/documents/upload-url */
export const uploadUrlBody = z
  .object({
    type: z.enum(DOCUMENT_TYPES),
    contentType: z.enum(CONTENT_TYPES),
    sizeBytes: z.number().int().min(1).max(MAX_FILE_BYTES, 'Files must be 5 MB or smaller'),
  })
  .strict();

/** POST /api/v1/kyc/:ref/submit — mirrors the frontend's consent checkbox. */
export const submitBody = z.object({ consent: z.literal(true, 'Consent is required to submit') }).strict();

/** PATCH /api/v1/kyc/:ref/documents/:id/review — a rejection must say why (the customer sees the reason). */
export const reviewBody = z.discriminatedUnion('decision', [
  z.object({ decision: z.literal('APPROVE') }).strict(),
  z
    .object({
      decision: z.literal('REJECT'),
      reason: z.string().trim().min(REJECTION_REASON_MIN).max(REJECTION_REASON_MAX),
    })
    .strict(),
]);
