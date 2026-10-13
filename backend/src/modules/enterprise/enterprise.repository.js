/**
 * Enterprise repository — the only file that queries MongoDB for this module (through enterprise.model.js).
 * Returns plain objects (`.lean()`) and hides soft-deleted records. Writes take `{ session }`.
 */
import { olderThan } from '../../shared/lib/pagination.js';
import { Organisation, OrganisationLink, OrganisationMember, PriceBook, Rfp } from './enterprise.model.js';

const DUPLICATE_KEY = 11000;
const live = { deletedAt: null };

async function insertOne(Model, data, session) {
  try {
    const [doc] = await Model.create([data], { session });
    return doc.toObject();
  } catch (err) {
    if (err.code === DUPLICATE_KEY) return null;
    throw err;
  }
}

const page = (Model, filter, after, limit) =>
  Model.find({ ...filter, ...live, ...(after && olderThan(after)) })
    .sort({ createdAt: -1, ref: -1 })
    .limit(limit + 1)
    .lean();

// ── Organisations ─────────────────────────────

export const insertOrganisation = (data, { session } = {}) => insertOne(Organisation, data, session);

export async function findOrganisation(ref, { session } = {}) {
  return Organisation.findOne({ ref, ...live }, null, { session }).lean();
}

export async function findOrganisationsByRefs(refs) {
  return Organisation.find({ ref: { $in: refs }, ...live })
    .sort({ name: 1 })
    .lean();
}

export const findOrganisations = ({ after, limit }) => page(Organisation, {}, after, limit);

export async function updateOrganisation(ref, set, { session } = {}) {
  return Organisation.findOneAndUpdate({ ref, ...live }, { $set: set }, { returnDocument: 'after', session }).lean();
}

/** Bumps the membership counter inside a membership change's transaction (see the model). */
export async function touchMembers(ref, { session } = {}) {
  return Organisation.findOneAndUpdate({ ref, ...live }, { $inc: { membersVersion: 1 } }, { session }).lean();
}

/** Moves the organisation to price book `version`, only from `fromVersion` (two editors can't both win). */
export async function setPriceBookVersion(ref, fromVersion, version, { session } = {}) {
  return Organisation.findOneAndUpdate(
    { ref, priceBookVersion: fromVersion, ...live },
    { $set: { priceBookVersion: version } },
    { returnDocument: 'after', session },
  ).lean();
}

// ── Members ───────────────────────────────────

export const insertMember = (data, { session } = {}) => insertOne(OrganisationMember, data, session);

export async function findMember(organisationRef, customerId, { session } = {}) {
  return OrganisationMember.findOne({ organisationRef, customerId, ...live }, null, { session }).lean();
}

export async function findMembers(organisationRef, { session } = {}) {
  return OrganisationMember.find({ organisationRef, ...live }, null, { session })
    .sort({ createdAt: 1 })
    .lean();
}

export async function findMembershipsOf(customerId) {
  return OrganisationMember.find({ customerId, ...live }).lean();
}

export async function updateMember(organisationRef, customerId, fromRole, set, { session } = {}) {
  return OrganisationMember.findOneAndUpdate(
    { organisationRef, customerId, role: fromRole, ...live },
    { $set: set },
    { returnDocument: 'after', session },
  ).lean();
}

export async function countOwners(organisationRef, { session } = {}) {
  return OrganisationMember.countDocuments({ organisationRef, role: 'OWNER', ...live }, { session });
}

// ── Links (team bookings, billed orders) ──────

export const insertLink = (data, { session } = {}) => insertOne(OrganisationLink, data, session);

export async function findLinks(organisationRef, kind) {
  return OrganisationLink.find({ organisationRef, kind, ...live })
    .sort({ createdAt: 1 })
    .lean();
}

export async function findLink(kind, targetRef) {
  return OrganisationLink.findOne({ kind, targetRef, ...live }).lean();
}

// ── RFPs ──────────────────────────────────────

export const insertRfp = (data, { session } = {}) => insertOne(Rfp, data, session);

export async function findRfp(ref) {
  return Rfp.findOne({ ref, ...live }).lean();
}

export async function findRfpByIdempotencyKey(idempotencyKey) {
  return Rfp.findOne({ idempotencyKey }).lean();
}

export const findRfps = ({ status, after, limit }) => page(Rfp, status ? { status } : {}, after, limit);

export async function updateRfpStatus(ref, from, to, historyEntry, { session } = {}) {
  return Rfp.findOneAndUpdate(
    { ref, status: from, ...live },
    { $set: { status: to }, $push: { history: historyEntry } },
    { returnDocument: 'after', session },
  ).lean();
}

// ── Price books ───────────────────────────────

export const insertPriceBook = (data, { session } = {}) => insertOne(PriceBook, data, session);

export async function findPriceBook(organisationRef, version) {
  return PriceBook.findOne({ organisationRef, version }).lean();
}

export async function findPriceBooks(organisationRef) {
  return PriceBook.find({ organisationRef }).sort({ version: -1 }).lean();
}
