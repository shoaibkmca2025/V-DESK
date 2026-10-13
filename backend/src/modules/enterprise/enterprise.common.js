/**
 * Enterprise service internals shared by the organisation, RFP and billing services: access checks (staff
 * permissions and organisation roles), audit entries and outbox events. Not exported from index.js.
 */
import { auditEntry, recordAudit } from '../../shared/audit/audit.js';
import { forbidden, notFound } from '../../shared/errors/AppError.js';
import { publish } from '../../shared/events/bus.js';
import { logger } from '../../shared/lib/logger.js';
import { hasPermission } from '../identity/index.js';
import { ORG_PERMISSIONS } from './enterprise.constants.js';
import * as repo from './enterprise.repository.js';

export const log = logger.child({ module: 'enterprise' });

export const organisationNotFound = () => notFound('ORGANISATION_NOT_FOUND', 'Organisation not found');

/** A signed-in staff member whose role holds `permission` (never the legacy admin key — identity.principal.js). */
export function isStaffWith(actor, permission) {
  return actor?.type === 'staff' && Boolean(actor.role) && hasPermission(actor.role, permission);
}

export function assertStaff(actor, permission) {
  if (!isStaffWith(actor, permission)) throw forbidden();
}

export const orgCan = (role, permission) => ORG_PERMISSIONS[permission]?.includes(role) ?? false;

/**
 * Loads an organisation the actor may use:
 *  - staff whose role holds `staff` (an identity permission), or
 *  - a customer who is a member and whose organisation role holds `member` (an ORG_PERMISSIONS key).
 * A customer who isn't a member gets 404 (the organisation's existence isn't revealed); a member without the needed
 * role gets 403. Omitting `staff` or `member` closes that path. Returns `{ org, membership }`.
 */
export async function loadOrgForActor(ref, actor, { staff = null, member = null }) {
  if (actor?.type === 'staff') {
    if (!staff) throw forbidden();
    assertStaff(actor, staff);
  } else if (actor?.type !== 'customer' || !actor.id) {
    throw forbidden();
  }
  const org = await repo.findOrganisation(ref);
  if (!org) throw organisationNotFound();
  if (actor.type === 'staff') return { org, membership: null };

  const membership = await repo.findMember(ref, actor.id);
  if (!membership) throw organisationNotFound();
  if (!member || !orgCan(membership.role, member)) throw forbidden();
  return { org, membership };
}

/** An audit_log entry for an organisation or something inside it. */
export function audit(actor, context, at, { action, entityType = 'organisation', entityRef, scopeRef, before, after }) {
  return auditEntry(actor, context, at, {
    action: `enterprise.${action}`,
    entityType,
    entityRef,
    scopeRef,
    before: before ?? null,
    after: after ?? null,
  });
}

/** Publishes an enterprise event inside the caller's transaction (payloads: refs, roles, counts — no PII). */
export async function announce(type, entity, actor, payload, at, session) {
  await publish({ type, entity, actor: { type: actor.type, id: actor.id }, payload, occurredAt: at }, { session });
}

export { recordAudit };
