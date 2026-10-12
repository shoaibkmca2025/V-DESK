/**
 * Enterprise — bulk RFPs (PRD §63, §75). The website's enterprise estimator submits desks, months, cities and a
 * contact; the API prices a standard estimate with pricing's engine (never the client's figures) and staff work it
 * through the pipeline (enterprise.constants.js RFP_TRANSITIONS, mirroring crm's).
 *
 * Public submissions need an Idempotency-Key (the client retries queued forms): a replay returns the original
 * receipt; the same key with a different body is 409. The receipt never contains the contact details.
 */
import { createHash } from 'node:crypto';
import { badRequest, conflict, notFound } from '../../shared/errors/AppError.js';
import { decodeCursor, toPage } from '../../shared/lib/pagination.js';
import { generateRef } from '../../shared/lib/refs.js';
import { withTransaction } from '../../shared/lib/transactions.js';
import { previewItem } from '../pricing/index.js';
import { announce, assertStaff, audit, log, recordAudit } from './enterprise.common.js';
import { RFP_TRANSITIONS } from './enterprise.constants.js';
import { mapRfp, mapRfpReceipt } from './enterprise.mapper.js';
import * as repo from './enterprise.repository.js';

/** Thrown inside the transaction to abort it when the key was taken by a concurrent request. */
class KeyTaken extends Error {}

const hashRequest = (body) => createHash('sha256').update(JSON.stringify(body)).digest('hex');

async function findReplay(idempotencyKey, requestHash) {
  const existing = await repo.findRfpByIdempotencyKey(idempotencyKey);
  if (existing && existing.requestHash !== requestHash) {
    throw conflict('IDEMPOTENCY_KEY_REUSED', 'This Idempotency-Key was already used for a different RFP');
  }
  return existing;
}

/**
 * Public: records an RFP with a server-priced estimate and publishes `enterprise.rfp_submitted` in one transaction.
 * @returns {Promise<{ rfp: object, created: boolean }>}
 */
export async function submitRfp(input, idempotencyKey) {
  if (!idempotencyKey) {
    throw badRequest('IDEMPOTENCY_KEY_REQUIRED', 'Send an Idempotency-Key header (for example a UUID) with each RFP');
  }
  const requestHash = hashRequest(input);
  const replay = await findReplay(idempotencyKey, requestHash);
  if (replay) return { rfp: mapRfpReceipt(replay), created: false };

  const { desks, months, cities, company, contact } = input;
  const estimate = await previewItem({ product: 'enterprise_desks', desks, months });
  const now = new Date();
  const doc = await insertWithEvent(
    { desks, months, cities, company, contact, estimate, idempotencyKey, requestHash },
    now,
  );
  if (!doc) {
    // A concurrent request with the same key won; answer as its replay.
    const winner = await findReplay(idempotencyKey, requestHash);
    if (winner) return { rfp: mapRfpReceipt(winner), created: false };
    throw conflict('RFP_CONFLICT', 'Could not record the RFP. Please try again.');
  }
  log.info({ event: 'enterprise.rfp_submitted', rfpRef: doc.ref, desks, months }, 'rfp submitted');
  return { rfp: mapRfpReceipt(doc), created: true };
}

/** The RFP and `enterprise.rfp_submitted` in one transaction; null when the Idempotency-Key was taken meanwhile. */
async function insertWithEvent(
  { desks, months, cities, company, contact, estimate, idempotencyKey, requestHash },
  now,
) {
  try {
    return await withTransaction(async (session) => {
      const created = await repo.insertRfp(
        {
          ref: generateRef('RFP', 8),
          company,
          contact,
          desks,
          months,
          cities,
          estimate,
          history: [{ status: 'SUBMITTED', at: now, actor: 'public' }],
          idempotencyKey,
          requestHash,
        },
        { session },
      );
      if (!created) throw new KeyTaken();
      const payload = { desks, months, cities, total_paise: estimate.total_paise };
      const entity = { type: 'rfp', ref: created.ref };
      await announce('enterprise.rfp_submitted', entity, { type: 'public' }, payload, now, session);
      return created;
    });
  } catch (err) {
    if (err instanceof KeyTaken) return null;
    throw err;
  }
}

export async function listRfps({ status, cursor, limit }, actor) {
  assertStaff(actor, 'enterprise:read');
  const after = cursor ? decodeCursor(cursor) : undefined;
  const { items, nextCursor } = toPage(await repo.findRfps({ status, after, limit }), limit);
  return { rfps: items.map(mapRfp), nextCursor };
}

async function findRfpOrThrow(ref) {
  const rfp = await repo.findRfp(ref);
  if (!rfp) throw notFound('RFP_NOT_FOUND', 'RFP not found');
  return rfp;
}

export async function getRfp(ref, actor) {
  assertStaff(actor, 'enterprise:read');
  return mapRfp(await findRfpOrThrow(ref));
}

/** Staff move an RFP one step along the pipeline (or to LOST). Repeating the current status is a no-op. */
export async function changeRfpStatus(ref, { status: to }, actor, context) {
  assertStaff(actor, 'enterprise:manage');
  const rfp = await findRfpOrThrow(ref);
  if (rfp.status === to) return mapRfp(rfp);
  const allowed = RFP_TRANSITIONS[rfp.status] ?? [];
  if (!allowed.includes(to)) {
    throw conflict('INVALID_STATUS_TRANSITION', `An RFP cannot move from ${rfp.status} to ${to}`, {
      from: rfp.status,
      to,
      allowed,
    });
  }
  const now = new Date();
  const updated = await withTransaction(async (session) => {
    const doc = await repo.updateRfpStatus(ref, rfp.status, to, { status: to, at: now, actor: actor.id }, { session });
    if (!doc) throw conflict('RFP_CHANGED', 'This RFP was just changed. Reload and try again.');
    await recordAudit(
      [
        audit(actor, context, now, {
          action: 'rfp.status_changed',
          entityType: 'rfp',
          entityRef: ref,
          before: rfp.status,
          after: to,
        }),
      ],
      { session },
    );
    const payload = { from: rfp.status, to };
    await announce('enterprise.rfp_status_changed', { type: 'rfp', ref }, actor, payload, now, session);
    return doc;
  });
  log.info({ event: 'enterprise.rfp_status_changed', rfpRef: ref, from: rfp.status, to }, 'rfp status changed');
  return mapRfp(updated);
}
