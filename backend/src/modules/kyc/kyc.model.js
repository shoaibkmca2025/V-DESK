/**
 * KYC Mongoose schemas. Collections: kyc_applications, documents (audit entries go to the shared audit_log).
 *
 * Files never touch the database: `documents` holds metadata and the internal storage key only (rules.md §21). The
 * key, Mongo `_id`s and signed URLs never leave the API; signed URLs are not stored at all. Client file names are not
 * stored either — they often contain the person's name or document number.
 *
 * Every change and read is recorded in the shared append-only `audit_log` (src/shared/audit).
 */
import mongoose from 'mongoose';
import { APPLICATION_STATUSES, CONTENT_TYPES, DOCUMENT_STATUSES, DOCUMENT_TYPES } from './kyc.constants.js';

const { Schema } = mongoose;

const applicationSchema = new Schema(
  {
    /** KYC- + time + 10 random characters (unguessable; it appears in URLs). */
    ref: { type: String, required: true, unique: true },
    /** The verified customer principal that owns the application (identity's customer id). */
    customerId: { type: String, required: true },
    /** = customerId while the application is not APPROVED: at most one open application per customer. */
    openCustomerId: { type: String, default: null },
    status: { type: String, enum: APPLICATION_STATUSES, default: 'DRAFT' },
    /** +1 on every change to the application or its documents, so concurrent changes serialise (409 on a race). */
    version: { type: Number, default: 1 },
    consentAt: { type: Date, default: null },
    submittedAt: { type: Date, default: null },
    submissions: { type: Number, default: 0 },
    approvedAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

applicationSchema.index(
  { openCustomerId: 1 },
  { unique: true, partialFilterExpression: { openCustomerId: { $type: 'string' } } },
);
applicationSchema.index({ customerId: 1, createdAt: -1 });

const documentSchema = new Schema(
  {
    /** DOC- + time + 8 random characters — the `:id` in review URLs. */
    ref: { type: String, required: true, unique: true },
    applicationRef: { type: String, required: true },
    type: { type: String, enum: DOCUMENT_TYPES, required: true },
    status: { type: String, enum: DOCUMENT_STATUSES, default: 'UPLOAD_PENDING' },
    /** Declared by the client, bound into the signed URL and checked against the stored object. */
    contentType: { type: String, enum: CONTENT_TYPES, required: true },
    sizeBytes: { type: Number, required: true },
    /** Server-generated object key. Internal only. */
    storageKey: { type: String, required: true },
    uploadedAt: { type: Date, default: null },
    /** The stored object's etag when it was verified at submit; review re-checks it (no swap after submit). */
    uploadEtag: { type: String, default: null },
    reviewedAt: { type: Date, default: null },
    reviewedBy: { type: String, default: null },
    rejectionReason: { type: String, default: null },
    /** Set when the document is replaced by a newer upload of the same type. */
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// One current document per type per application; replaced ones are soft-deleted.
documentSchema.index({ applicationRef: 1, type: 1 }, { unique: true, partialFilterExpression: { deletedAt: null } });

export const KycApplication = mongoose.model('KycApplication', applicationSchema, 'kyc_applications');
export const KycDocument = mongoose.model('KycDocument', documentSchema, 'documents');
