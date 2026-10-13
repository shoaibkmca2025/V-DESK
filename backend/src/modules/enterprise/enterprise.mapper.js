/**
 * Enterprise mapper — shapes organisations, members, links, RFPs and price books for API responses.
 * Never included: Mongo `_id`, counters, idempotency data. RFP contact details are for staff views only.
 */

export function mapOrganisation(doc, { members } = {}) {
  return {
    ref: doc.ref,
    name: doc.name,
    gstin: doc.gstin,
    billingEmail: doc.billingEmail,
    priceBookVersion: doc.priceBookVersion,
    ...(members && { members: members.map(mapMember) }),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export function mapMember(doc) {
  return { customerId: doc.customerId, role: doc.role, since: doc.createdAt };
}

export function mapLink(doc) {
  return {
    kind: doc.kind,
    ref: doc.targetRef,
    memberCustomerId: doc.memberCustomerId,
    linkedAt: doc.createdAt,
  };
}

/** What the public submitter gets back — no contact details, so a replayed key reveals nothing. */
export function mapRfpReceipt(doc) {
  return { ref: doc.ref, status: doc.status, createdAt: doc.createdAt };
}

export function mapRfp(doc) {
  return {
    ref: doc.ref,
    status: doc.status,
    company: doc.company,
    contact: doc.contact,
    desks: doc.desks,
    months: doc.months,
    cities: doc.cities,
    estimate: doc.estimate,
    history: doc.history,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export function mapPriceBook(doc) {
  return {
    version: doc.version,
    enterprise_desks: doc.enterprise_desks,
    note: doc.note,
    createdBy: doc.createdBy,
    createdAt: doc.createdAt,
  };
}
