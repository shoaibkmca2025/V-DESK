/**
 * Search Mongoose schemas. Collections: search_services, search_synonyms, search_redirects, search_config.
 *
 * No text index: Phase 1 searches catalog data in memory (decision 2026-10-07, docs/backend/memory.md); Atlas
 * Search replaces this in Phase 4. Unique indexes are on (natural key, deletedAt) so a soft-deleted record never
 * blocks re-creating the same key, while two live records with the same key are still impossible.
 */
import mongoose from 'mongoose';
import { CONFIG_KEYS } from './search.constants.js';

const { Schema } = mongoose;

// ──────────────────────────────────────────────
// Business service (seeded from frontend/src/data/services.js — same field names)
// ──────────────────────────────────────────────
const serviceSchema = new Schema(
  {
    ref: { type: String, required: true, unique: true }, // e.g. SVC-GST-REGISTRATION
    slug: { type: String, required: true },
    name: { type: String, required: true },
    icon: { type: String, default: '' },
    eyebrow: { type: String, default: '' },
    title: { type: String, default: '' },
    titleHighlight: { type: String, default: '' },
    description: { type: String, default: '' },
    /** The client's `startingPrice` (rupees), stored as integer paise (rules.md §13). */
    starting_price_paise: { type: Number, required: true },
    priceUnit: { type: String, default: '' },
    stats: [[String]],
    trust: [String],
    suitability: [String],
    features: [[String]],
    process: [[String]],
    faqs: [[String]],
    cta: { type: String, default: '' },
    ctaTo: { type: String, default: '' },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

serviceSchema.index({ slug: 1, deletedAt: 1 }, { unique: true });

// ──────────────────────────────────────────────
// Synonym: a word or phrase rewritten before the query is parsed (e.g. "bengaluru" → "bangalore")
// ──────────────────────────────────────────────
const synonymSchema = new Schema(
  {
    ref: { type: String, required: true, unique: true }, // e.g. SYN-3K9QZ
    /** Normalised (lower-case, single spaces). */
    term: { type: String, required: true },
    replacement: { type: String, required: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

synonymSchema.index({ term: 1, deletedAt: 1 }, { unique: true });

// ──────────────────────────────────────────────
// Redirect: an exact query that sends the visitor straight to a page
// ──────────────────────────────────────────────
const redirectSchema = new Schema(
  {
    ref: { type: String, required: true, unique: true }, // e.g. RDR-MU2E5O7Y
    /** Normalised (lower-case, single spaces); matched against the normalised visitor query. */
    query: { type: String, required: true },
    /** Site-relative path, e.g. /services/gst-registration. */
    target: { type: String, required: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

redirectSchema.index({ query: 1, deletedAt: 1 }, { unique: true });

// ──────────────────────────────────────────────
// Config entry: admin-managed search settings, one document per key (PRD §20)
// ──────────────────────────────────────────────
const configSchema = new Schema(
  {
    /** The entry's human identifier (rules.md §15) — used in URLs instead of a generated ref. */
    key: { type: String, enum: CONFIG_KEYS, required: true },
    /** promotedCentres: centre refs · popularSearches: query strings. Validated per key by search.validation.js. */
    value: { type: Schema.Types.Mixed, required: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

configSchema.index({ key: 1, deletedAt: 1 }, { unique: true });

export const SearchService = mongoose.model('SearchService', serviceSchema, 'search_services');
export const SearchSynonym = mongoose.model('SearchSynonym', synonymSchema, 'search_synonyms');
export const SearchRedirect = mongoose.model('SearchRedirect', redirectSchema, 'search_redirects');
export const SearchConfig = mongoose.model('SearchConfig', configSchema, 'search_config');
