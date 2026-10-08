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

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
