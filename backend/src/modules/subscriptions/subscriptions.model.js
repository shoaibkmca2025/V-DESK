/**
 * Subscriptions Mongoose schemas. Collections: subscriptions, agreements, renewals.
 *
 * A subscription stores no customer details: its owner is the KYC application's customer id, its product and price
 * are frozen from the order it was created from. Payment and KYC are never stored as flags a client could set — they
 * are checked through the orders and kyc modules when ops activate or apply a renewal.
 */
import mongoose from 'mongoose';
import {
  AGREEMENT_STATUSES,
  RENEWAL_STATUSES,
  SIGNATURE_METHODS,
  SUBSCRIPTION_STATUSES,
} from './subscriptions.constants.js';

const { Schema } = mongoose;

const priceSchema = new Schema(
  {
    total_paise: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    /** The order's server-computed breakdown (paise, ADR-007), frozen. */
    breakdown: { type: Schema.Types.Mixed, required: true },
  },
  { _id: false, minimize: false },
);

const subscriptionSchema = new Schema(
  {
    /** SUB- + time + 8 random characters. */
    ref: { type: String, required: true, unique: true },
    customerId: { type: String, required: true },
    kycRef: { type: String, required: true },
    /** The order that bought the first period — one subscription per order. */
    orderRef: { type: String, required: true, unique: true },
    product: { type: String, required: true },
    tenure: { type: String, required: true },
    termMonths: { type: Number, required: true },
    price: { type: priceSchema, required: true },
    graceDays: { type: Number, required: true },
    status: { type: String, enum: SUBSCRIPTION_STATUSES, default: 'PENDING_ACTIVATION' },
    /** 0 before activation, then 1, 2, … — one agreement per period. */
    period: { type: Number, default: 0 },
    currentPeriodStart: { type: Date, default: null },
    currentPeriodEnd: { type: Date, default: null },
    graceEndsAt: { type: Date, default: null },
    /** Smallest reminder offset (days) already announced for the current period — reminders never repeat. */
    lastReminderDays: { type: Number, default: null },
    activatedAt: { type: Date, default: null },
    /** 'system' (grace ran out) or the staff ref; a staff suspension is lifted only by staff. */
    suspendedBy: { type: String, default: null },
    /** Staff-written reasons — shown to staff only. */
    suspensionReason: { type: String, default: null },
    cancellationReason: { type: String, default: null },
    cancelledAt: { type: Date, default: null },
    /** +1 on every change; every write is conditional on it (no lost updates between API and worker). */
    version: { type: Number, default: 1 },
    history: [
      {
        _id: false,
        status: { type: String, enum: SUBSCRIPTION_STATUSES, required: true },
        at: { type: Date, required: true },
        actor: { type: String, required: true },
      },
    ],
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

subscriptionSchema.index({ customerId: 1, createdAt: -1 });
subscriptionSchema.index({ deletedAt: 1, createdAt: -1, ref: -1 });
// Lifecycle job scans: periods ending soon / ended, grace ending.
subscriptionSchema.index({ status: 1, currentPeriodEnd: 1 });
subscriptionSchema.index({ status: 1, graceEndsAt: 1 });

const agreementSchema = new Schema(
  {
    /** AGR- + time + 8 random characters. */
    ref: { type: String, required: true, unique: true },
    subscriptionRef: { type: String, required: true },
    period: { type: Number, required: true },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    status: { type: String, enum: AGREEMENT_STATUSES, default: 'ISSUED' },
    signedAt: { type: Date, default: null },
    signatureMethod: { type: String, enum: [...SIGNATURE_METHODS, null], default: null },
    signedRecordedBy: { type: String, default: null },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// One agreement per period: a retried activation or renewal cannot issue a second one.
agreementSchema.index({ subscriptionRef: 1, period: 1 }, { unique: true });

const renewalSchema = new Schema(
  {
    /** RNW- + time + 8 random characters. */
    ref: { type: String, required: true, unique: true },
    subscriptionRef: { type: String, required: true },
    /** The period this renewal buys. */
    forPeriod: { type: Number, required: true },
    status: { type: String, enum: RENEWAL_STATUSES, default: 'QUOTED' },
    price: { type: priceSchema, required: true },
    termMonths: { type: Number, required: true },
    /** When the subscription will be suspended unless this renewal is applied (period end + grace days). */
    dueBy: { type: Date, required: true },
    /** The paid order applied to this renewal (verified through orders). */
    orderRef: { type: String, default: null },
    appliedAt: { type: Date, default: null },
    appliedBy: { type: String, default: null },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// One renewal per period, and an order pays for at most one renewal.
renewalSchema.index({ subscriptionRef: 1, forPeriod: 1 }, { unique: true });
renewalSchema.index({ orderRef: 1 }, { unique: true, partialFilterExpression: { orderRef: { $type: 'string' } } });

export const Subscription = mongoose.model('Subscription', subscriptionSchema, 'subscriptions');
export const Agreement = mongoose.model('Agreement', agreementSchema, 'agreements');
export const Renewal = mongoose.model('Renewal', renewalSchema, 'renewals');
