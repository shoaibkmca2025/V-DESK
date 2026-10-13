/**
 * `audit_log` — the append-only audit trail (rules.md §26, logs.md §2): who did what to which record, when, and from
 * which request. Written in the same transaction as the change it records; reads of sensitive data (KYC) are logged
 * too. Statuses and refs only — never personal data, document contents or free-text reasons.
 */
import mongoose from 'mongoose';

const { Schema } = mongoose;

export const ACTOR_TYPES = ['customer', 'staff', 'system'];

const auditSchema = new Schema(
  {
    at: { type: Date, required: true },
    actorType: { type: String, enum: ACTOR_TYPES, required: true },
    actorId: { type: String, required: true },
    actorRole: { type: String, default: null },
    /** `<module>.<entity>.<verb>`, e.g. `kyc.document.rejected`, `subscriptions.subscription.activated`. */
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    entityRef: { type: String, required: true },
    /** The aggregate the entity belongs to (e.g. the KYC application of a document); = entityRef otherwise. */
    scopeRef: { type: String, required: true },
    before: { type: String, default: null },
    after: { type: String, default: null },
    ip: { type: String, default: null },
    requestId: { type: String, default: null },
  },
  { versionKey: false },
);

auditSchema.index({ scopeRef: 1, at: 1 });
auditSchema.index({ entityRef: 1, at: 1 });

// Append-only: every update and delete issued through the model is refused.
const refuse = function () {
  throw new Error('audit_log is append-only');
};
for (const op of [
  'updateOne',
  'updateMany',
  'findOneAndUpdate',
  'replaceOne',
  'findOneAndReplace',
  'deleteOne',
  'deleteMany',
  'findOneAndDelete',
]) {
  auditSchema.pre(op, refuse);
}

export const AuditEntry = mongoose.model('AuditEntry', auditSchema, 'audit_log');
