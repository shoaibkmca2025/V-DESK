/**
 * Catalog repository — the only file that queries MongoDB for this module (through catalog.model.js).
 *
 * Every query:
 *  - excludes soft-deleted records (deletedAt: null) and inactive records
 *  - uses .lean() to return plain objects — the mapper then strips _id/__v/deletedAt
 *  - never returns _id to callers (callers use the `ref` field instead)
 */
import { Centre, City, Workspace } from './catalog.model.js';

// ──────────────────────────────────────────────
// City queries
// ──────────────────────────────────────────────

/** Returns all active, non-deleted cities ordered by name. */
export async function findAllCities() {
  return City.find({ active: true, deletedAt: null }).sort({ name: 1 }).lean();
}

/** Returns a single city by its slug (e.g. 'mumbai'). */
export async function findCityBySlug(slug) {
  return City.findOne({ slug, active: true, deletedAt: null }).lean();
}

// ──────────────────────────────────────────────
// Centre queries
// ──────────────────────────────────────────────

/**
 * Returns all active, non-deleted centres, optionally filtered by cityRef.
 * Results are sorted flagship-first, then by fullName.
 */
export async function findCentres({ cityRef } = {}) {
  const filter = { active: true, deletedAt: null };
  if (cityRef) filter.cityRef = cityRef;
  return Centre.find(filter).sort({ flagship: -1, fullName: 1 }).lean();
}

/** Returns a single centre by its ref. */
export async function findCentreByRef(ref) {
  return Centre.findOne({ ref, active: true, deletedAt: null }).lean();
}

// ──────────────────────────────────────────────
// Workspace queries
// ──────────────────────────────────────────────

/**
 * Returns workspaces filtered by optional city, type, minimum capacity, and max monthly price (paise).
 * City is an exact, case-insensitive match on the name ('mumbai' finds 'Mumbai').
 * Sorted by price_month_paise ascending.
 */
export async function findWorkspaces({ city, type, capacity, maxPricePaise } = {}) {
  const filter = { active: true, deletedAt: null };
  if (city) filter.city = new RegExp(`^${escapeRegex(city)}$`, 'i');
  if (type) filter.type = type;
  if (capacity) filter.capacity = { $gte: capacity };
  if (maxPricePaise != null) filter.price_month_paise = { $lte: maxPricePaise };
  return Workspace.find(filter).sort({ price_month_paise: 1 }).lean();
}

/** Returns a single workspace by its ref. */
export async function findWorkspaceByRef(ref) {
  return Workspace.findOne({ ref, active: true, deletedAt: null }).lean();
}

// ──────────────────────────────────────────────
// Staff — see inactive records too, never deleted ones
// ──────────────────────────────────────────────

const DUPLICATE_KEY = 11000;
const MODELS = { city: City, centre: Centre, workspace: Workspace };
const notDeleted = { deletedAt: null };

export async function findCitiesForStaff() {
  return City.find(notDeleted).sort({ name: 1 }).lean();
}

export async function findCentresForStaff({ cityRef } = {}) {
  return Centre.find({ ...notDeleted, ...(cityRef && { cityRef }) })
    .sort({ cityRef: 1, ref: 1 })
    .lean();
}

export async function findWorkspacesForStaff({ centreRef } = {}) {
  return Workspace.find({ ...notDeleted, ...(centreRef && { centreRef }) })
    .sort({ centreRef: 1, ref: 1 })
    .lean();
}

/** Active or not, as long as it isn't deleted. */
export async function findForStaff(kind, filter) {
  return MODELS[kind].findOne({ ...filter, ...notDeleted }).lean();
}

/** Inserts and returns the document, or null when a unique field (ref, slug) is already taken. */
export async function insertDoc(kind, data) {
  try {
    const doc = await MODELS[kind].create(data);
    return doc.toObject();
  } catch (err) {
    if (err.code === DUPLICATE_KEY) return null;
    throw err;
  }
}

export async function updateDoc(kind, ref, set) {
  return MODELS[kind].findOneAndUpdate({ ref, ...notDeleted }, { $set: set }, { returnDocument: 'after' }).lean();
}

export async function softDelete(kind, ref, now) {
  const res = await MODELS[kind].updateOne({ ref, ...notDeleted }, { $set: { deletedAt: now, active: false } });
  return res.modifiedCount === 1;
}

export async function countCentresInCity(cityRef) {
  return Centre.countDocuments({ cityRef, ...notDeleted });
}

export async function countWorkspacesInCentre(centreRef) {
  return Workspace.countDocuments({ centreRef, ...notDeleted });
}

/**
 * Highest number used after `prefix-` (e.g. CTR-NSK → 2 for CTR-NSK-002), deleted records included, so a
 * deleted ref is never handed out again. Catalog collections are small, so reading the refs is cheap.
 */
export async function highestRefNumber(kind, prefix) {
  const pattern = new RegExp(`^${escapeRegex(prefix)}-(\\d+)$`);
  const docs = await MODELS[kind].find({ ref: pattern }).select({ ref: 1 }).lean();
  return docs.reduce((max, { ref }) => Math.max(max, Number(ref.match(pattern)[1])), 0);
}

/** Centres and workspaces copy the city name for fast filtering; a rename has to reach them too. */
export async function renameCityInChildren(cityRef, name) {
  await Centre.updateMany({ cityRef }, { $set: { city: name } });
  const centreRefs = await Centre.distinct('ref', { cityRef });
  await Workspace.updateMany({ centreRef: { $in: centreRefs } }, { $set: { city: name } });
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
