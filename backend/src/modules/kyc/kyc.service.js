/**
 * KYC service — applications, document uploads through signed URLs, and compliance review (PRD §46–47,
 * modules.md §3.8). Framework-free: callers pass an `actor` ({ type: 'customer' | 'staff', id, role }) and a request
 * `context` ({ ip, requestId }) for the audit trail.
 *
 * Rules:
 *  - A customer sees and changes only their own applications (others read as 404); staff need `kyc:read` /
 *    `kyc:review`, checked here again after the route guard (rules.md §20).
 *  - Files go straight from the browser to object storage; this module stores metadata and a server-generated key,
 *    never bytes or signed URLs (rules.md §21–22). A file counts as uploaded only once submit has found it in storage
 *    with the declared size, type and file signature.
 *  - Every change and every read is written to the append-only audit log; changes, their audit entries and their
 *    outbox events (kyc.submitted / kyc.approved / kyc.rejected) commit in one transaction.
 *  - Every change bumps the application's version inside the transaction, so concurrent changes to one application
 *    serialise instead of interleaving.
 *  - Logs carry refs, types and statuses only — never reasons, file data or personal data.
 */
import { randomUUID } from 'node:crypto';
import { badRequest, conflict } from '../../shared/errors/AppError.js';
import { publish } from '../../shared/events/bus.js';
import { generateRef } from '../../shared/lib/refs.js';
import { withTransaction } from '../../shared/lib/transactions.js';
import {
  applicationChanged,
  applicationNotFound,
  assertCustomer,
  assertTransition,
  audit,
  eventActor,
  loadForActor,
  log,
  recordAudit,
  requireStorage,
  verifyUpload,
} from './kyc.common.js';
import {
  EDITABLE_STATUSES,
  FILE_FORMATS,
  REPLACEABLE_DOCUMENT_STATUSES,
  REQUIRED_DOCUMENT_TYPES,
  UPLOAD_URL_TTL_SECONDS,
} from './kyc.constants.js';
import { mapApplication, mapDocumentView } from './kyc.mapper.js';
import * as repo from './kyc.repository.js';

export { getKycStorage } from './kyc.common.js';
export { getDocumentDownloadUrl, reviewDocument } from './kyc.review.service.js';

// ──────────────────────────────────────────────
// Customer
// ──────────────────────────────────────────────

class ApplicationExists extends Error {}

/** Opens a DRAFT application for the signed-in customer. One open (not yet APPROVED) application per customer. */
export async function createApplication(actor, context) {
  assertCustomer(actor);
  const now = new Date();
  let app;
  try {
    app = await withTransaction(async (session) => {
      const doc = await repo.insertApplication(
        { ref: generateRef('KYC', 10), customerId: actor.id, openCustomerId: actor.id },
        { session },
      );
      if (!doc) throw new ApplicationExists();
      await recordAudit(
        [audit(actor, context, now, { action: 'application.created', application: doc.ref, after: doc.status })],
        { session },
      );
      return doc;
    });
  } catch (err) {
    if (!(err instanceof ApplicationExists)) throw err;
    const open = await repo.findOpenApplicationFor(actor.id);
    throw conflict('KYC_APPLICATION_EXISTS', 'You already have a KYC application in progress', { ref: open?.ref });
  }
  log.info({ event: 'kyc.application_created', applicationRef: app.ref }, 'kyc application created');
  return mapApplication(app, []);
}

function objectKey(applicationRef, documentRef, contentType) {
  const id = `${documentRef}-${randomUUID()}`.toLowerCase();
  return `kyc/${applicationRef.toLowerCase()}/${id}.${FILE_FORMATS[contentType].extension}`;
}

/** Inside the transaction: re-reads the application and its document of `type`, and checks both may change. */
async function lockForUpload(ref, type, session) {
  const app = await repo.findApplication(ref, { session });
  if (!app) throw applicationNotFound();
  if (!EDITABLE_STATUSES.includes(app.status)) {
    throw conflict('KYC_APPLICATION_LOCKED', `Documents cannot be changed while the application is ${app.status}`);
  }
  const current = (await repo.findDocuments(ref, { session })).find((doc) => doc.type === type);
  if (current && !REPLACEABLE_DOCUMENT_STATUSES.includes(current.status)) {
    throw current.status === 'APPROVED'
      ? conflict('DOCUMENT_ALREADY_APPROVED', `The ${type} document is already approved`)
      : conflict('DOCUMENT_AWAITING_REVIEW', `The ${type} document is waiting for review`);
  }
  return { app, current };
}

/**
 * Records a new document of `type` (replacing a pending or rejected one) and returns a short-lived signed PUT URL
 * for it. The URL is returned once and never stored; the object key is generated here, never by the client.
 */
export async function requestUploadUrl(ref, { type, contentType, sizeBytes }, actor, context) {
  const store = requireStorage();
  await loadForActor(ref, actor);
  const now = new Date();
  const documentRef = generateRef('DOC', 8);
  const storageKey = objectKey(ref, documentRef, contentType);

  const doc = await withTransaction(async (session) => {
    const { app, current } = await lockForUpload(ref, type, session);
    if (!(await repo.updateApplication(ref, { version: app.version, statuses: EDITABLE_STATUSES }, {}, { session }))) {
      throw applicationChanged();
    }
    const entries = [];
    if (current) {
      if (!(await repo.replaceDocument(current.ref, current.status, now, { session }))) throw applicationChanged();
      entries.push(
        audit(actor, context, now, { action: 'document.replaced', application: ref, document: current.ref }),
      );
    }
    const created = await repo.insertDocument(
      { ref: documentRef, applicationRef: ref, type, contentType, sizeBytes, storageKey },
      { session },
    );
    entries.push(
      audit(actor, context, now, {
        action: 'document.upload_url_issued',
        application: ref,
        document: documentRef,
        after: created.status,
      }),
    );
    await recordAudit(entries, { session });
    return created;
  });

  const upload = await store.createUploadUrl({
    key: storageKey,
    contentType,
    contentLength: sizeBytes,
    expiresInSeconds: UPLOAD_URL_TTL_SECONDS,
  });
  log.info({ event: 'kyc.upload_url_issued', applicationRef: ref, documentRef, type }, 'kyc upload url issued');
  return { document: mapDocumentView(doc), upload };
}

/** The documents an application needs before it can be submitted; throws the first problem found. */
function assertSubmittable(documents) {
  const rejected = documents.find((doc) => doc.status === 'REJECTED');
  if (rejected) {
    throw conflict('DOCUMENT_REJECTED', `Replace the rejected ${rejected.type} document before submitting`, {
      id: rejected.ref,
      type: rejected.type,
    });
  }
  const missing = REQUIRED_DOCUMENT_TYPES.filter((type) => !documents.some((doc) => doc.type === type));
  if (missing.length) throw conflict('DOCUMENTS_MISSING', 'Some required documents are missing', { missing });
}

/**
 * Submits the application for review: the customer consents, every required document is present, nothing rejected
 * is left, and every new upload is verified in storage. DRAFT / ACTION_REQUIRED → UNDER_REVIEW + `kyc.submitted`.
 */
export async function submitApplication(ref, { consent }, actor, context) {
  if (consent !== true) throw badRequest('CONSENT_REQUIRED', 'Consent is required to submit');
  const store = requireStorage();
  const app = await loadForActor(ref, actor);
  assertTransition(app.status, 'UNDER_REVIEW');
  const documents = await repo.findDocuments(ref);
  assertSubmittable(documents);
  const pending = documents.filter((doc) => doc.status === 'UPLOAD_PENDING');
  // Storage calls stay outside the transaction (it may be re-run); the version check below catches any change since.
  const etags = new Map();
  for (const doc of pending) etags.set(doc.ref, (await verifyUpload(store, doc)).etag);

  const now = new Date();
  const updated = await withTransaction(async (session) => {
    const entries = [];
    for (const doc of pending) {
      const set = { status: 'UPLOADED', uploadedAt: now, uploadEtag: etags.get(doc.ref) };
      if (!(await repo.transitionDocument(doc.ref, 'UPLOAD_PENDING', set, { session }))) throw applicationChanged();
      entries.push(audit(actor, context, now, { action: 'document.uploaded', application: ref, document: doc.ref }));
    }
    const set = { status: 'UNDER_REVIEW', consentAt: now, submittedAt: now, submissions: app.submissions + 1 };
    const saved = await repo.updateApplication(ref, { version: app.version, statuses: [app.status] }, set, { session });
    if (!saved) throw applicationChanged();
    entries.push(
      audit(actor, context, now, {
        action: 'application.submitted',
        application: ref,
        before: app.status,
        after: set.status,
      }),
    );
    await recordAudit(entries, { session });
    await publish(
      {
        type: 'kyc.submitted',
        entity: { type: 'kyc_application', ref },
        actor: eventActor(actor),
        payload: { submission: saved.submissions },
        occurredAt: now,
      },
      { session },
    );
    return saved;
  });

  log.info({ event: 'kyc.submitted', applicationRef: ref, submission: updated.submissions }, 'kyc submitted');
  return mapApplication(updated, await repo.findDocuments(ref));
}

/** The application and its current documents' metadata. Every read is audited (rules.md §26). */
export async function getApplication(ref, actor, context) {
  const app = await loadForActor(ref, actor, 'kyc:read');
  const documents = await repo.findDocuments(ref);
  await recordAudit([audit(actor, context, new Date(), { action: 'application.read', application: ref })]);
  return mapApplication(app, documents, { staff: actor.type === 'staff' });
}

/**
 * For other modules (index.js): an application's status and owner, nothing else — no documents, reasons or keys.
 * Subscriptions use it to check KYC is APPROVED for the same customer before activation (modules.md §3.9).
 * @returns {Promise<{ ref: string, status: string, customerId: string, approvedAt: Date | null }>}
 */
export async function getApplicationSummary(ref) {
  const app = await repo.findApplication(ref);
  if (!app) throw applicationNotFound();
  return { ref: app.ref, status: app.status, customerId: app.customerId, approvedAt: app.approvedAt };
}
