/**
 * KYC constants — document types, file rules, statuses and the transition tables (rules.md §5).
 *
 * Document types, which of them are required, the accepted formats and the 5 MB limit are the ones the frontend
 * already shows (frontend/src/pages/account/KycPage.jsx), so the switch-over changes transport only.
 */

/** [type, required] — keys match the frontend's DOCUMENTS list. */
export const DOCUMENT_TYPE_RULES = Object.freeze([
  ['pan', true],
  ['aadhaar', true],
  ['incorporation', false],
  ['bank', true],
  ['photo', true],
  ['signature', false],
]);
export const DOCUMENT_TYPES = DOCUMENT_TYPE_RULES.map(([type]) => type);
export const REQUIRED_DOCUMENT_TYPES = DOCUMENT_TYPE_RULES.filter(([, required]) => required).map(([type]) => type);

/**
 * Accepted formats: content type → object-key extension and the leading bytes a real file of that type starts with.
 * The declared type is bound into the signed URL and the stored bytes are checked against it before review.
 */
export const FILE_FORMATS = Object.freeze({
  'application/pdf': { extension: 'pdf', magic: [Buffer.from('%PDF-')] },
  'image/jpeg': { extension: 'jpg', magic: [Buffer.from([0xff, 0xd8, 0xff])] },
  'image/png': { extension: 'png', magic: [Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])] },
});
export const CONTENT_TYPES = Object.keys(FILE_FORMATS);
export const MAX_FILE_BYTES = 5 * 1024 * 1024;
export const MAGIC_PREFIX_BYTES = 16;

/** Upload URLs ≤ 15 min, download URLs ≤ 5 min (rules.md §22). */
export const UPLOAD_URL_TTL_SECONDS = 10 * 60;
export const DOWNLOAD_URL_TTL_SECONDS = 5 * 60;

/**
 * Application lifecycle (modules.md §3.8: upload → UNDER_REVIEW → APPROVED/REJECTED, reason mandatory):
 *   DRAFT            the customer is uploading; nothing has been submitted
 *   UNDER_REVIEW     submitted; compliance reviews each document
 *   ACTION_REQUIRED  a document was rejected (with a reason); the customer replaces it and submits again
 *   APPROVED         every document approved — final
 * Rejection is per document and allows a re-upload (the frontend promises "a re-upload link"), so there is no final
 * REJECTED application state.
 */
export const APPLICATION_STATUSES = ['DRAFT', 'UNDER_REVIEW', 'ACTION_REQUIRED', 'APPROVED'];

export const APPLICATION_TRANSITIONS = Object.freeze({
  DRAFT: ['UNDER_REVIEW'],
  UNDER_REVIEW: ['ACTION_REQUIRED', 'APPROVED'],
  ACTION_REQUIRED: ['UNDER_REVIEW'],
  APPROVED: [],
});

/** The customer may add or replace documents, and submit, only in these. */
export const EDITABLE_STATUSES = ['DRAFT', 'ACTION_REQUIRED'];
/** Compliance may review uploaded documents in these. */
export const REVIEWABLE_STATUSES = ['UNDER_REVIEW', 'ACTION_REQUIRED'];

/**
 * Document lifecycle:
 *   UPLOAD_PENDING  an upload URL was issued; the file is checked in storage when the application is submitted
 *   UPLOADED        found in storage with the declared size, type and file signature; waiting for review
 *   APPROVED / REJECTED  reviewed by compliance (rejection carries a reason)
 * A replaced document (new upload for the same type) is soft-deleted and kept for the audit trail.
 */
export const DOCUMENT_STATUSES = ['UPLOAD_PENDING', 'UPLOADED', 'APPROVED', 'REJECTED'];

export const DOCUMENT_TRANSITIONS = Object.freeze({
  UPLOAD_PENDING: ['UPLOADED'],
  UPLOADED: ['APPROVED', 'REJECTED'],
  APPROVED: [],
  REJECTED: [],
});

/** A document of these statuses may be replaced by a new upload; APPROVED and awaiting-review ones may not. */
export const REPLACEABLE_DOCUMENT_STATUSES = ['UPLOAD_PENDING', 'REJECTED'];

export const REVIEW_DECISIONS = Object.freeze({ APPROVE: 'APPROVED', REJECT: 'REJECTED' });
export const REJECTION_REASON_MIN = 5;
export const REJECTION_REASON_MAX = 500;
