/**
 * Catalog Mongoose schemas.
 * Collections: cities, centres, workspaces.
 *
 * Rules (docs/backend/rules.md):
 *  - timestamps: true on every schema
 *  - `ref` is the human identifier used in URLs; _id never leaves the API
 *  - `deletedAt` enables soft deletes (§16)
 *  - prices stored as integer paise (§13); vo_price_paise / cw_price_paise / price_month_paise / price_hour_paise
 *  - All indexes declared here and reviewed alongside the queries that need them (§17)
 */
import mongoose from 'mongoose';

const { Schema } = mongoose;

// ──────────────────────────────────────────────
// City
// ──────────────────────────────────────────────
const citySchema = new Schema(
  {
    ref: { type: String, required: true, unique: true, index: true }, // e.g. CITY-MUM
    slug: { type: String, required: true, unique: true, index: true }, // e.g. 'mumbai'
    name: { type: String, required: true },
    state: { type: String, required: true },
    tier: { type: String, enum: ['Tier-1', 'Tier-2', 'Tier-3'], required: true },
    tagline: { type: String, default: '' },
    localities: [{ type: String }],
    active: { type: Boolean, default: true, index: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// ──────────────────────────────────────────────
// Centre (a physical location / commercial building)
// ──────────────────────────────────────────────
const centreSchema = new Schema(
  {
    ref: { type: String, required: true, unique: true, index: true }, // e.g. CTR-NSK-001
    cityRef: { type: String, required: true, index: true }, // FK → City.ref
    city: { type: String, required: true }, // denormalised for query convenience
    areaName: { type: String, required: true },
    fullName: { type: String, required: true },
    address: { type: String, required: true },
    services: [{ type: String }],
    /** Virtual Office price per month — integer paise (rules.md §13). */
    vo_price_paise: { type: Number, default: null },
    /** Coworking price per day — integer paise. */
    cw_price_paise: { type: Number, default: null },
    meetingCapacity: { type: String, default: '' },
    status: { type: String, enum: ['available', 'limited', 'unavailable'], default: 'available', index: true },
    flagship: { type: Boolean, default: false },
    active: { type: Boolean, default: true, index: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// Composite index: city + status for the most common list query
centreSchema.index({ cityRef: 1, status: 1 });

// ──────────────────────────────────────────────
// Workspace (a bookable space inside a centre)
// ──────────────────────────────────────────────
const workspaceSchema = new Schema(
  {
    ref: { type: String, required: true, unique: true, index: true }, // e.g. WS-MUM-001
    centreRef: { type: String, required: true, index: true }, // FK → Centre.ref
    city: { type: String, required: true, index: true },
    locality: { type: String, required: true },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['Virtual Office', 'Coworking', 'Meeting Rooms', 'Private Office'],
      required: true,
      index: true,
    },
    capacity: { type: Number, required: true },
    /** Price per calendar month — integer paise. */
    price_month_paise: { type: Number, required: true },
    /** Price per hour — integer paise. */
    price_hour_paise: { type: Number, required: true },
    amenities: [{ type: String }],
    status: { type: String, enum: ['available', 'limited', 'unavailable'], default: 'available', index: true },
    rating: { type: Number, min: 0, max: 5, default: null },
    reviews: { type: Number, default: 0 },
    active: { type: Boolean, default: true, index: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// Composite indexes for the workspace list query (city + type + capacity + price)
workspaceSchema.index({ city: 1, type: 1, status: 1 });
workspaceSchema.index({ city: 1, capacity: 1 });
workspaceSchema.index({ city: 1, price_month_paise: 1 });

export const City = mongoose.model('City', citySchema, 'cities');
export const Centre = mongoose.model('Centre', centreSchema, 'centres');
export const Workspace = mongoose.model('Workspace', workspaceSchema, 'workspaces');
