/**
 * KYC mapper — shapes applications and documents for API responses.
 * Never included: Mongo `_id`, storage keys, signed URLs, file contents, and (for customers) who reviewed.
 */
import { REQUIRED_DOCUMENT_TYPES } from './kyc.constants.js';

function mapDocument(doc, { staff }) {
  return {
    id: doc.ref,
    type: doc.type,
    status: doc.status,
    contentType: doc.contentType,
    sizeBytes: doc.sizeBytes,
    uploadedAt: doc.uploadedAt,
    reviewedAt: doc.reviewedAt,
    rejectionReason: doc.rejectionReason,
    ...(staff && { reviewedBy: doc.reviewedBy }),
    createdAt: doc.createdAt,
  };
}

/** One document, as returned by the upload-url and review endpoints. */
export function mapDocumentView(doc, { staff = false } = {}) {
  return mapDocument(doc, { staff });
}

/** The application with its current documents. `staff` adds the owning customer id and reviewer refs. */
export function mapApplication(app, documents, { staff = false } = {}) {
  const present = new Set(documents.map((d) => d.type));
  return {
    ref: app.ref,
    status: app.status,
    requiredDocumentTypes: REQUIRED_DOCUMENT_TYPES,
    missingDocumentTypes: REQUIRED_DOCUMENT_TYPES.filter((type) => !present.has(type)),
    documents: documents.map((doc) => mapDocument(doc, { staff })),
    consentAt: app.consentAt,
    submittedAt: app.submittedAt,
    approvedAt: app.approvedAt,
    ...(staff && { customerId: app.customerId }),
    createdAt: app.createdAt,
    updatedAt: app.updatedAt,
  };
}
