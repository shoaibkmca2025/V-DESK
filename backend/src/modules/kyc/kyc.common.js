/**
 * KYC service internals shared by kyc.service.js (customer) and kyc.review.service.js (compliance): the storage
 * adapter, access checks, the status-transition check and audit entries. Not exported from index.js.
 */
import { env } from '../../config/env.js';
import { selectStorage } from '../../integrations/storage.js';
import { auditEntry, recordAudit } from '../../shared/audit/audit.js';
import { AppError, conflict, forbidden, notFound } from '../../shared/errors/AppError.js';
import { logger } from '../../shared/lib/logger.js';
import { hasPermission } from '../identity/index.js';
import { APPLICATION_TRANSITIONS, FILE_FORMATS, MAGIC_PREFIX_BYTES, MAX_FILE_BYTES } from './kyc.constants.js';
import * as repo from './kyc.repository.js';

export const log = logger.child({ module: 'kyc' });

const storage = selectStorage({ driver: env.STORAGE_DRIVER, nodeEnv: env.NODE_ENV });

/** The adapter in use (null when storage is not configured). Tests use it to play the browser's upload. */
export function getKycStorage() {
  return storage;
}

export function requireStorage() {
  if (!storage) throw new AppError(503, 'STORAGE_NOT_CONFIGURED', 'Document uploads are not available right now');
  return storage;
}

// ──────────────────────────────────────────────
// Access
// ──────────────────────────────────────────────

export const applicationNotFound = () => notFound('KYC_APPLICATION_NOT_FOUND', 'KYC application not found');
export const applicationChanged = () =>
  conflict('KYC_APPLICATION_CHANGED', 'The application changed while saving. Reload and try again.');

export function assertCustomer(actor) {
  if (actor?.type !== 'customer' || !actor.id) throw forbidden();
}

/**
 * A signed-in staff member whose role holds `permission`. The legacy x-admin-key is deliberately not accepted for
 * KYC: identity documents may only be read or decided by a named, MFA-verified person with the KYC permission.
 */
export function assertStaff(actor, permission) {
  const allowed = actor?.type === 'staff' && Boolean(actor.role) && hasPermission(actor.role, permission);
  if (!allowed) throw forbidden();
}

/**
 * Loads an application the actor may use: their own (customer) or any (staff holding `staffPermission`). Without a
 * `staffPermission` the action is the customer's alone.
 */
export async function loadForActor(ref, actor, staffPermission = null) {
  if (actor?.type === 'staff' && staffPermission) assertStaff(actor, staffPermission);
  else assertCustomer(actor);
  const app = await repo.findApplication(ref);
  // Someone else's application reads as missing, so refs can't be probed.
  if (!app || (actor.type === 'customer' && app.customerId !== actor.id)) throw applicationNotFound();
  return app;
}

export function assertTransition(from, to) {
  if (!APPLICATION_TRANSITIONS[from]?.includes(to)) {
    throw conflict('INVALID_STATUS_TRANSITION', `A ${from} application cannot become ${to}`, { from, to });
  }
}

// ──────────────────────────────────────────────
// Audit
// ──────────────────────────────────────────────

/** An audit_log entry (shared/audit) for a KYC application, or for one of its documents when `document` is set. */
export function audit(actor, context, at, { action, application, document, before = null, after = null }) {
  return auditEntry(actor, context, at, {
    action: `kyc.${action}`,
    entityType: document ? 'kyc_document' : 'kyc_application',
    entityRef: document ?? application,
    scopeRef: application,
    before,
    after,
  });
}

export { recordAudit };

export const eventActor = (actor) => ({ type: actor.type, id: actor.id });

// ──────────────────────────────────────────────
// Stored files
// ──────────────────────────────────────────────

const startsWith = (prefix, magic) => prefix.length >= magic.length && prefix.subarray(0, magic.length).equals(magic);

/**
 * Checks the stored object is the declared file: exact size, content type and file signature — and, once a document
 * was verified at submit, still the very same object (etag), so nothing can be swapped in between submit and review.
 * Returns what storage reported.
 */
export async function verifyUpload(store, doc) {
  const found = await store.inspect(doc.storageKey, { prefixBytes: MAGIC_PREFIX_BYTES });
  const details = { id: doc.ref, type: doc.type };
  if (!found) throw conflict('DOCUMENT_NOT_UPLOADED', `The ${doc.type} document has not been uploaded yet`, details);
  if (doc.uploadEtag && found.etag !== doc.uploadEtag) {
    throw conflict('DOCUMENT_UPLOAD_CHANGED', `The ${doc.type} file changed after it was submitted`, details);
  }
  const valid =
    found.contentLength === doc.sizeBytes &&
    found.contentLength <= MAX_FILE_BYTES &&
    found.contentType === doc.contentType &&
    FILE_FORMATS[doc.contentType].magic.some((magic) => startsWith(found.prefix, magic));
  if (!valid) {
    throw conflict('DOCUMENT_UPLOAD_INVALID', `The uploaded ${doc.type} file is not the declared file`, details);
  }
  return found;
}
