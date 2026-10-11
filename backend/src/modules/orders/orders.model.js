/**
 * Orders Mongoose schemas. Collection: orders.
 *
 * The planned `payments`, `invoices` and `refunds` collections are not created yet: the payment provider and the
 * invoice series / GSTIN are still open questions (docs/backend/memory.md §6), so there is nothing truthful to store.
 *
 * An order stores no customer details: it points at its quote or booking (which hold them) and freezes that
 * source's server-computed price breakdown, so later rule changes never alter what is owed.
 */
import mongoose from 'mongoose';
import { OPEN_STATUS, ORDER_STATUSES, SOURCE_TYPES } from './orders.constants.js';

const { Schema } = mongoose;

const orderSchema = new Schema(
  {
    /** ORD- + time + 8 random characters: the ref is the customer's key to the order, so it must not be guessable. */
    ref: { type: String, required: true, unique: true },
    status: { type: String, enum: ORDER_STATUSES, default: OPEN_STATUS },
    source: {
      type: { type: String, enum: SOURCE_TYPES, required: true },
      ref: { type: String, required: true },
    },
    /** What is being bought, as the source labels it (e.g. "Conference Room (8 Pax)"). */
    description: { type: String, required: true },
    tenure: { type: String, default: '' },
    /** The source's price breakdown (paise, ADR-007), frozen at order creation. */
    pricing: { type: Schema.Types.Mixed, required: true },
    total_paise: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    /** When the order stops being payable: the quote's validity or the booking's hold expiry. */
    expiresAt: { type: Date, required: true },
    history: [
      {
        _id: false,
        status: { type: String, enum: ORDER_STATUSES, required: true },
        at: { type: Date, required: true },
        actor: { type: String, required: true },
        reason: { type: String, default: null },
      },
    ],
    /** Idempotency-Key of the creating request (rules.md §10) and a hash of its body, to spot reuse. */
    idempotencyKey: { type: String, default: null },
    requestHash: { type: String, default: null },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true, minimize: false },
);

orderSchema.index(
  { idempotencyKey: 1 },
  { unique: true, partialFilterExpression: { idempotencyKey: { $type: 'string' } } },
);
/** At most one open order per quote / booking — the database, not the service, settles concurrent attempts. */
orderSchema.index(
  { 'source.type': 1, 'source.ref': 1 },
  { unique: true, partialFilterExpression: { status: OPEN_STATUS } },
);
orderSchema.index({ deletedAt: 1, createdAt: -1, ref: -1 });
orderSchema.index({ deletedAt: 1, status: 1, createdAt: -1 });

export const Order = mongoose.model('Order', orderSchema, 'orders');
