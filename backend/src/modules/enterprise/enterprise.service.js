/**
 * Enterprise service — organisations and their members (multi-user access, modules.md §3.13). RFPs live in
 * enterprise.rfp.service.js, team bookings / billing / price books / reports in enterprise.billing.service.js; both
 * are re-exported here.
 *
 * Rules:
 *  - Staff manage organisations (enterprise:manage) and read them (enterprise:read). A customer sees an organisation
 *    only as a member, and can do what their organisation role allows (ORG_PERMISSIONS) — checked in the service.
 *  - Only an OWNER (or staff) can grant or take away OWNER; an organisation always keeps at least one OWNER. Every
 *    membership change bumps the organisation's counter inside its transaction, so two concurrent demotions cannot
 *    both pass the last-owner check.
 *  - Changes commit with their audit entries and outbox events; logs carry refs and roles only.
 */
import { conflict, forbidden } from '../../shared/errors/AppError.js';
import { decodeCursor, toPage } from '../../shared/lib/pagination.js';
import { generateRef } from '../../shared/lib/refs.js';
import { withTransaction } from '../../shared/lib/transactions.js';
import {
  announce,
  assertStaff,
  audit,
  loadOrgForActor,
  log,
  orgCan,
  organisationNotFound,
  recordAudit,
} from './enterprise.common.js';
import { mapMember, mapOrganisation } from './enterprise.mapper.js';
import * as repo from './enterprise.repository.js';

export { changeRfpStatus, getRfp, listRfps, submitRfp } from './enterprise.rfp.service.js';
export {
  billingStatement,
  billingStatementCsv,
  linkBooking,
  linkOrder,
  listPriceBooks,
  listTeamBookings,
  organisationReport,
  previewPrice,
  setPriceBook,
} from './enterprise.billing.service.js';

const orgEntity = (ref) => ({ type: 'organisation', ref });

// ──────────────────────────────────────────────
// Organisations (staff)
// ──────────────────────────────────────────────

class Taken extends Error {}

/** Creates an organisation, optionally with its first OWNER (a customer id). */
export async function createOrganisation({ name, gstin, billingEmail, ownerCustomerId }, actor, context) {
  assertStaff(actor, 'enterprise:manage');
  const now = new Date();
  const org = await withTransaction(async (session) => {
    const doc = await repo.insertOrganisation(
      {
        ref: generateRef('ORG', 8),
        name,
        gstin: gstin ?? null,
        billingEmail: billingEmail ?? null,
        createdBy: actor.id,
      },
      { session },
    );
    const entries = [audit(actor, context, now, { action: 'organisation.created', entityRef: doc.ref })];
    if (ownerCustomerId) {
      await repo.insertMember(
        { organisationRef: doc.ref, customerId: ownerCustomerId, role: 'OWNER', addedBy: actor.id },
        { session },
      );
      entries.push(memberAudit(actor, context, now, doc.ref, ownerCustomerId, null, 'OWNER'));
    }
    await recordAudit(entries, { session });
    await announce('enterprise.organisation_created', orgEntity(doc.ref), actor, {}, now, session);
    return doc;
  });
  log.info({ event: 'enterprise.organisation_created', organisationRef: org.ref }, 'organisation created');
  return mapOrganisation(org, { members: await repo.findMembers(org.ref) });
}

export async function updateOrganisation(ref, patch, actor, context) {
  const { org } = await loadOrgForActor(ref, actor, { staff: 'enterprise:manage' });
  const now = new Date();
  const updated = await withTransaction(async (session) => {
    const doc = await repo.updateOrganisation(org.ref, patch, { session });
    await recordAudit([audit(actor, context, now, { action: 'organisation.updated', entityRef: ref })], { session });
    return doc;
  });
  return mapOrganisation(updated);
}

/** Soft delete (rules.md §16) — refused while the organisation still has members. */
export async function deleteOrganisation(ref, actor, context) {
  const { org } = await loadOrgForActor(ref, actor, { staff: 'enterprise:manage' });
  if ((await repo.findMembers(ref)).length > 0) {
    throw conflict('ORGANISATION_NOT_EMPTY', 'Remove the members before deleting the organisation');
  }
  const now = new Date();
  await withTransaction(async (session) => {
    await repo.updateOrganisation(org.ref, { deletedAt: now }, { session });
    await recordAudit([audit(actor, context, now, { action: 'organisation.deleted', entityRef: ref })], { session });
  });
}

export async function listOrganisations({ cursor, limit }, actor) {
  assertStaff(actor, 'enterprise:read');
  const after = cursor ? decodeCursor(cursor) : undefined;
  const { items, nextCursor } = toPage(await repo.findOrganisations({ after, limit }), limit);
  return { organisations: items.map((doc) => mapOrganisation(doc)), nextCursor };
}

// ──────────────────────────────────────────────
// Organisations (staff or member)
// ──────────────────────────────────────────────

/** Staff and members who manage members see the member list; other members see only their own role. */
export async function getOrganisation(ref, actor) {
  const { org, membership } = await loadOrgForActor(ref, actor, { staff: 'enterprise:read', member: 'org:read' });
  if (!membership || orgCan(membership.role, 'org:members')) {
    return mapOrganisation(org, { members: await repo.findMembers(ref) });
  }
  return { ...mapOrganisation(org), myRole: membership.role };
}

/** The signed-in customer's organisations, with their role in each. */
export async function listMyOrganisations(actor) {
  if (actor?.type !== 'customer' || !actor.id) throw forbidden();
  const memberships = await repo.findMembershipsOf(actor.id);
  const roles = new Map(memberships.map((m) => [m.organisationRef, m.role]));
  const orgs = await repo.findOrganisationsByRefs([...roles.keys()]);
  return orgs.map((org) => ({ ...mapOrganisation(org), myRole: roles.get(org.ref) }));
}

// ──────────────────────────────────────────────
// Members
// ──────────────────────────────────────────────

function memberAudit(actor, context, now, orgRef, customerId, before, after) {
  const action = !before ? 'member.added' : !after ? 'member.removed' : 'member.role_changed';
  return audit(actor, context, now, {
    action,
    entityType: 'organisation_member',
    entityRef: `${orgRef}:${customerId}`,
    scopeRef: orgRef,
    before,
    after,
  });
}

/** Staff with enterprise:manage, or a member allowed to manage members; touching OWNER needs org:owners. */
async function loadForMemberChange(ref, actor, rolesInvolved) {
  const access = await loadOrgForActor(ref, actor, { staff: 'enterprise:manage', member: 'org:members' });
  const ownerChange = rolesInvolved.includes('OWNER');
  if (ownerChange && access.membership && !orgCan(access.membership.role, 'org:owners')) {
    throw forbidden('OWNER_REQUIRED', 'Only an owner can grant or remove the owner role');
  }
  return access;
}

/**
 * Inside a transaction: serialises membership changes of the organisation, then (after the change) refuses to leave
 * it without an OWNER.
 */
async function guardOwners(ref, session, change) {
  if (!(await repo.touchMembers(ref, { session }))) throw organisationNotFound();
  const result = await change();
  if ((await repo.countOwners(ref, { session })) === 0) {
    throw conflict('LAST_OWNER', 'An organisation needs at least one owner');
  }
  return result;
}

export async function addMember(ref, { customerId, role }, actor, context) {
  await loadForMemberChange(ref, actor, [role]);
  const now = new Date();
  try {
    const member = await withTransaction(async (session) => {
      if (!(await repo.touchMembers(ref, { session }))) throw organisationNotFound();
      const doc = await repo.insertMember({ organisationRef: ref, customerId, role, addedBy: actor.id }, { session });
      if (!doc) throw new Taken();
      await recordAudit([memberAudit(actor, context, now, ref, customerId, null, role)], { session });
      await announce('enterprise.member_added', orgEntity(ref), actor, { customerId, role }, now, session);
      return doc;
    });
    log.info({ event: 'enterprise.member_added', organisationRef: ref, role }, 'member added');
    return mapMember(member);
  } catch (err) {
    if (err instanceof Taken) throw conflict('MEMBER_EXISTS', 'That customer is already a member');
    throw err;
  }
}

export async function changeMemberRole(ref, customerId, { role }, actor, context) {
  const current = await repo.findMember(ref, customerId);
  if (!current) throw conflict('MEMBER_NOT_FOUND', 'That customer is not a member');
  if (current.role === role) {
    await loadOrgForActor(ref, actor, { staff: 'enterprise:manage', member: 'org:members' });
    return mapMember(current);
  }
  await loadForMemberChange(ref, actor, [current.role, role]);
  const now = new Date();
  const updated = await withTransaction((session) =>
    guardOwners(ref, session, async () => {
      const doc = await repo.updateMember(ref, customerId, current.role, { role }, { session });
      if (!doc) throw conflict('MEMBER_CHANGED', 'The membership changed meanwhile. Reload and try again.');
      await recordAudit([memberAudit(actor, context, now, ref, customerId, current.role, role)], { session });
      const payload = { customerId, from: current.role, to: role };
      await announce('enterprise.member_role_changed', orgEntity(ref), actor, payload, now, session);
      return doc;
    }),
  );
  return mapMember(updated);
}

export async function removeMember(ref, customerId, actor, context) {
  const current = await repo.findMember(ref, customerId);
  if (!current) throw conflict('MEMBER_NOT_FOUND', 'That customer is not a member');
  await loadForMemberChange(ref, actor, [current.role]);
  const now = new Date();
  await withTransaction((session) =>
    guardOwners(ref, session, async () => {
      const doc = await repo.updateMember(ref, customerId, current.role, { deletedAt: now }, { session });
      if (!doc) throw conflict('MEMBER_CHANGED', 'The membership changed meanwhile. Reload and try again.');
      await recordAudit([memberAudit(actor, context, now, ref, customerId, current.role, null)], { session });
      await announce('enterprise.member_removed', orgEntity(ref), actor, { customerId }, now, session);
    }),
  );
}
