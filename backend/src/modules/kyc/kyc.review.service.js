/**
 * KYC compliance service — document review and reviewer downloads (modules.md §3.8). Re-exported by kyc.service.js;
 * the same rules apply (see its header): permissions re-checked here, changes + audit + events in one transaction,
 * no reasons or personal data in logs or events.
 */
import { badRequest, conflict, notFound } from '../../shared/errors/AppError.js';
import { publish } from '../../shared/events/bus.js';
import { withTransaction } from '../../shared/lib/transactions.js';
import {
  applicationChanged,
  applicationNotFound,
  assertStaff,
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
  DOWNLOAD_URL_TTL_SECONDS,
  REQUIRED_DOCUMENT_TYPES,
  REVIEW_DECISIONS,
  REVIEWABLE_STATUSES,
} from './kyc.constants.js';
import { mapApplication, mapDocumentView } from './kyc.mapper.js';
import * as repo from './kyc.repository.js';

/** Approved = every required type present and every current document approved. */
function allApproved(documents) {
  return (
    REQUIRED_DOCUMENT_TYPES.every((type) => documents.some((doc) => doc.type === type)) &&
    documents.every((doc) => doc.status === 'APPROVED')
  );
}

/** Inside the transaction: the document to review, or `{ replay }` when the same decision was already recorded. */
async function loadForReview(ref, documentRef, target, reason, session) {
  const app = await repo.findApplication(ref, { session });
  if (!app) throw applicationNotFound();
  const doc = await repo.findDocument(ref, documentRef, { session });
  if (!doc) throw notFound('DOCUMENT_NOT_FOUND', 'Document not found');
  if (doc.status === target && (target === 'APPROVED' || doc.rejectionReason === reason)) {
    return { app, doc, replay: true };
  }
  if (doc.status === 'APPROVED' || doc.status === 'REJECTED') {
    throw conflict('DOCUMENT_ALREADY_REVIEWED', `This document is already ${doc.status}`, { status: doc.status });
  }
  if (doc.status !== 'UPLOADED' || !REVIEWABLE_STATUSES.includes(app.status)) {
    throw conflict('DOCUMENT_NOT_SUBMITTED', 'This document has not been submitted for review yet');
  }
  return { app, doc, replay: false };
}

/** The application status after `target` was recorded for one of its documents. */
function nextApplicationStatus(app, target, documents) {
  if (target === 'REJECTED') return 'ACTION_REQUIRED';
  if (app.status === 'UNDER_REVIEW' && allApproved(documents)) return 'APPROVED';
  return app.status;
}

/**
 * Before an approval: the stored file must still be exactly the one verified at submit. A signed upload URL can't be
 * revoked, so this (and the single-use URLs storage adapters must issue) stops a file swapped in after submit from
 * being approved. Storage is outside the transaction; the etag pins the object.
 */
async function assertFileUnchanged(ref, documentRef) {
  const store = requireStorage();
  const doc = await repo.findDocument(ref, documentRef);
  if (doc?.status === 'UPLOADED') await verifyUpload(store, doc);
}

/**
 * Approves or rejects one uploaded document (rejection needs a reason, shown to the customer). A rejection moves the
 * application to ACTION_REQUIRED and publishes `kyc.rejected`; the approval that completes the set moves it to
 * APPROVED and publishes `kyc.approved`. Repeating the same decision returns the current state without new events.
 */
export async function reviewDocument(ref, documentRef, { decision, reason }, actor, context) {
  assertStaff(actor, 'kyc:review');
  const target = REVIEW_DECISIONS[decision];
  if (!target) throw badRequest('INVALID_DECISION', 'Decision must be APPROVE or REJECT');
  if (target === 'REJECTED' && !reason?.trim()) throw badRequest('REASON_REQUIRED', 'A rejection needs a reason');
  if (target === 'APPROVED') await assertFileUnchanged(ref, documentRef);
  const now = new Date();

  const result = await withTransaction(async (session) => {
    const { app, doc, replay } = await loadForReview(ref, documentRef, target, reason, session);
    if (replay) return { app, doc, replay };

    const set = { status: target, reviewedAt: now, reviewedBy: actor.id, rejectionReason: reason ?? null };
    const reviewed = await repo.transitionDocument(doc.ref, 'UPLOADED', set, { session });
    if (!reviewed) throw applicationChanged();
    const next = nextApplicationStatus(app, target, await repo.findDocuments(ref, { session }));
    if (next !== app.status) assertTransition(app.status, next);
    const appSet = next === app.status ? {} : { status: next };
    if (next === 'APPROVED') Object.assign(appSet, { approvedAt: now, openCustomerId: null });
    const saved = await repo.updateApplication(ref, { version: app.version, statuses: [app.status] }, appSet, {
      session,
    });
    if (!saved) throw applicationChanged();

    await recordReview({ actor, context, now, ref, doc: reviewed, from: app.status, to: next }, session);
    return { app: saved, doc: reviewed, replay };
  });

  if (!result.replay) {
    const meta = { applicationRef: ref, documentRef, decision: target, applicationStatus: result.app.status };
    log.info({ event: 'kyc.document_reviewed', ...meta, reviewer: actor.id }, 'kyc document reviewed');
  }
  return {
    document: mapDocumentView(result.doc, { staff: true }),
    application: mapApplication(result.app, await repo.findDocuments(ref), { staff: true }),
  };
}

/** Audit entries and outbox events for one review, in the review's transaction. */
async function recordReview({ actor, context, now, ref, doc, from, to }, session) {
  const entries = [
    audit(actor, context, now, {
      action: `document.${doc.status.toLowerCase()}`,
      application: ref,
      document: doc.ref,
      before: 'UPLOADED',
      after: doc.status,
    }),
  ];
  if (to !== from) {
    entries.push(
      audit(actor, context, now, { action: 'application.status_changed', application: ref, before: from, after: to }),
    );
  }
  await recordAudit(entries, { session });

  const base = { entity: { type: 'kyc_application', ref }, actor: eventActor(actor), occurredAt: now };
  if (doc.status === 'REJECTED') {
    // The reason stays out of the event (free text); handlers read it through this module.
    await publish(
      { ...base, type: 'kyc.rejected', payload: { documentRef: doc.ref, documentType: doc.type } },
      { session },
    );
  }
  if (to === 'APPROVED') await publish({ ...base, type: 'kyc.approved', payload: {} }, { session });
}

/**
 * A short-lived signed download URL so a reviewer can look at a document. Staff only, audited, never stored and never
 * part of an ordinary read.
 */
export async function getDocumentDownloadUrl(ref, documentRef, actor, context) {
  assertStaff(actor, 'kyc:read');
  const store = requireStorage();
  await loadForActor(ref, actor, 'kyc:read');
  const doc = await repo.findDocument(ref, documentRef);
  if (!doc) throw notFound('DOCUMENT_NOT_FOUND', 'Document not found');
  if (doc.status === 'UPLOAD_PENDING') {
    throw conflict('DOCUMENT_NOT_SUBMITTED', 'This document has not been submitted for review yet');
  }
  await verifyUpload(store, doc);
  await recordAudit([
    audit(actor, context, new Date(), { action: 'document.download_url_issued', application: ref, document: doc.ref }),
  ]);
  return store.createDownloadUrl({ key: doc.storageKey, expiresInSeconds: DOWNLOAD_URL_TTL_SECONDS });
}
