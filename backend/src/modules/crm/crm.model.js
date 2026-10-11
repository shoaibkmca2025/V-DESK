/**
 * CRM Mongoose schemas. Collections: leads, lead_activities (campaigns comes with attribution work).
 *
 * Field names match the frontend lead object (features/crm/leadStore.js): name, mobile, email, city,
 * service, company, notes, source, status — rules.md §42. The client's `id` is stored as `ref` (§15).
 */
import mongoose from 'mongoose';
import { ACTIVITY_TYPES, LEAD_STATUSES, TOUCH_FIELDS } from './crm.constants.js';

const { Schema } = mongoose;

// ──────────────────────────────────────────────
// Lead
// ──────────────────────────────────────────────

/** One marketing touch (PRD §60). URLs are stored without query string or hash — those can carry personal data. */
const touchSchema = new Schema(
  {
    ...Object.fromEntries(TOUCH_FIELDS.map((field) => [field, { type: String, default: null }])),
    at: { type: Date, default: null },
  },
  { _id: false },
);

const leadSchema = new Schema(
  {
    ref: { type: String, required: true, unique: true }, // e.g. VD-MU2E5O7Y
    name: { type: String, required: true },
    mobile: { type: String, default: '' },
    email: { type: String, default: '' },
    city: { type: String, default: '' },
    service: { type: String, default: '' },
    company: { type: String, default: '' },
    /** Free-text message the visitor typed into the form. Staff notes live in lead_activities. */
    notes: { type: String, default: '' },
    source: { type: String, default: '' },
    status: { type: String, enum: LEAD_STATUSES, default: 'NEW' },
    /** Recomputed by the service on every write (modules.md §3.5). */
    score: { type: Number, required: true },
    /** Staff member handling the lead. Free text until identity provides user refs. */
    assignedTo: { type: String, default: null },
    /** First visit that brought the contact in, and the visit that led to this form (both optional). */
    attribution: {
      firstTouch: { type: touchSchema, default: null },
      lastTouch: { type: touchSchema, default: null },
    },
    /** Last 10 digits of `mobile`, so one contact matches across formats (+91 98765 43210 = 9876543210). */
    mobileDigits: { type: String, default: null },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// List query: newest first with (createdAt, ref) as the cursor; optionally filtered by status.
leadSchema.index({ deletedAt: 1, createdAt: -1, ref: -1 });
leadSchema.index({ deletedAt: 1, status: 1, createdAt: -1 });
// Per-contact limit: recent leads for one mobile or email.
leadSchema.index(
  { mobileDigits: 1, createdAt: -1 },
  { partialFilterExpression: { mobileDigits: { $type: 'string' } } },
);
leadSchema.index({ email: 1, createdAt: -1 }, { partialFilterExpression: { email: { $gt: '' } } });

// ──────────────────────────────────────────────
// Lead activity (append-only timeline: created, status changes, assignment, staff notes)
// ──────────────────────────────────────────────
const leadActivitySchema = new Schema(
  {
    leadRef: { type: String, required: true }, // FK → Lead.ref
    type: { type: String, enum: ACTIVITY_TYPES, required: true },
    from: { type: String, default: null },
    to: { type: String, default: null },
    assignedTo: { type: String, default: null },
    note: { type: String, default: null },
    /** Who did it: 'public' for website submissions, 'admin-key' until staff logins exist. */
    actor: { type: String, required: true },
  },
  { timestamps: true },
);

leadActivitySchema.index({ leadRef: 1, createdAt: 1 });

export const Lead = mongoose.model('Lead', leadSchema, 'leads');
export const LeadActivity = mongoose.model('LeadActivity', leadActivitySchema, 'lead_activities');
