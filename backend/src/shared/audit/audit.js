/**
 * Writing the audit trail (rules.md §26). Modules build entries with `auditEntry()` and save them with
 * `recordAudit(entries, { session })` inside the transaction of the change they describe.
 *
 *   actor   = { type: 'customer' | 'staff' | 'system', id, role? }
 *   context = { ip, requestId } from the request (null for jobs)
 */
import { AuditEntry } from './audit.model.js';

export function auditEntry(
  actor,
  context,
  at,
  { action, entityType, entityRef, scopeRef, before = null, after = null },
) {
  return {
    at,
    actorType: actor.type,
    actorId: actor.id,
    actorRole: actor.role ?? null,
    action,
    entityType,
    entityRef,
    scopeRef: scopeRef ?? entityRef,
    before,
    after,
    ip: context?.ip ?? null,
    requestId: context?.requestId ?? null,
  };
}

export async function recordAudit(entries, { session } = {}) {
  if (entries.length) await AuditEntry.insertMany(entries, { session });
}

/** The trail of one aggregate, oldest first (staff tooling and tests). */
export async function findAudit(scopeRef) {
  return AuditEntry.find({ scopeRef }, { _id: 0 }).sort({ at: 1, _id: 1 }).lean();
}
