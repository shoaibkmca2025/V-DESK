/**
 * Enterprise Mongoose schemas. Collections: organisations, organisation_members, organisation_links,
 * enterprise_rfps, price_books.
 *
 * Organisations hold company data only. Members are customer ids (identity's customer principal) with an
 * organisation role. Links attribute another module's record (a booking, an order) to an organisation by ref — the
 * record itself stays in its own module and is read through that module's public service. RFPs hold the requester's
 * contact details (shown to staff only, never logged). Price books are versioned and append-only.
 */
import mongoose from 'mongoose';
import { LINK_KINDS, ORG_ROLES, RFP_STATUSES } from './enterprise.constants.js';

const { Schema } = mongoose;

const organisationSchema = new Schema(
  {
    /** ORG- + time + 8 random characters. */
    ref: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    gstin: { type: String, default: null },
    billingEmail: { type: String, default: null },
    /** The active price book version (null = standard pricing). */
    priceBookVersion: { type: Number, default: null },
    /** +1 on every membership change, inside its transaction: concurrent changes serialise (last-owner guard). */
    membersVersion: { type: Number, default: 0 },
    createdBy: { type: String, required: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);
organisationSchema.index({ deletedAt: 1, createdAt: -1, ref: -1 });

const memberSchema = new Schema(
  {
    organisationRef: { type: String, required: true },
    customerId: { type: String, required: true },
    role: { type: String, enum: ORG_ROLES, required: true },
    addedBy: { type: String, required: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);
// One live membership per customer per organisation.
memberSchema.index(
  { organisationRef: 1, customerId: 1 },
  { unique: true, partialFilterExpression: { deletedAt: null } },
);
memberSchema.index({ customerId: 1, deletedAt: 1 });

const linkSchema = new Schema(
  {
    organisationRef: { type: String, required: true },
    kind: { type: String, enum: LINK_KINDS, required: true },
    /** The booking / order ref in its own module. */
    targetRef: { type: String, required: true },
    /** For team bookings: the member it was booked for (optional). */
    memberCustomerId: { type: String, default: null },
    linkedBy: { type: String, required: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);
// A booking or order belongs to at most one organisation.
linkSchema.index({ kind: 1, targetRef: 1 }, { unique: true, partialFilterExpression: { deletedAt: null } });
linkSchema.index({ organisationRef: 1, kind: 1, createdAt: 1 });

const rfpSchema = new Schema(
  {
    /** RFP- + time + 8 random characters. */
    ref: { type: String, required: true, unique: true },
    status: { type: String, enum: RFP_STATUSES, default: 'SUBMITTED' },
    company: { type: String, required: true },
    contact: {
      name: { type: String, required: true },
      mobile: { type: String, required: true },
      email: { type: String, default: null },
    },
    desks: { type: Number, required: true },
    months: { type: Number, required: true },
    cities: { type: [String], required: true },
    /** Standard-price estimate from the pricing engine at submission (paise, ADR-007), frozen. */
    estimate: { type: Schema.Types.Mixed, required: true },
    history: [
      {
        _id: false,
        status: { type: String, enum: RFP_STATUSES, required: true },
        at: { type: Date, required: true },
        actor: { type: String, required: true },
      },
    ],
    idempotencyKey: { type: String, required: true },
    requestHash: { type: String, required: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true, minimize: false },
);
rfpSchema.index({ idempotencyKey: 1 }, { unique: true });
rfpSchema.index({ deletedAt: 1, createdAt: -1, ref: -1 });
rfpSchema.index({ deletedAt: 1, status: 1, createdAt: -1 });

const priceBookSchema = new Schema(
  {
    organisationRef: { type: String, required: true },
    version: { type: Number, required: true },
    /** Replaces pricing's `enterprise_desks` rule for this organisation: { desk_month_paise, bulk_discounts }. */
    enterprise_desks: { type: Schema.Types.Mixed, required: true },
    note: { type: String, default: '' },
    createdBy: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false }, minimize: false },
);
// Versions are append-only; two concurrent edits can't both become version n.
priceBookSchema.index({ organisationRef: 1, version: 1 }, { unique: true });

export const Organisation = mongoose.model('Organisation', organisationSchema, 'organisations');
export const OrganisationMember = mongoose.model('OrganisationMember', memberSchema, 'organisation_members');
export const OrganisationLink = mongoose.model('OrganisationLink', linkSchema, 'organisation_links');
export const Rfp = mongoose.model('Rfp', rfpSchema, 'enterprise_rfps');
export const PriceBook = mongoose.model('PriceBook', priceBookSchema, 'price_books');
