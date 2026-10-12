/**
 * Domain events — the transactional outbox (ADR-005, ADR-008). Collection: domain_events.
 *
 * An event is inserted in the same transaction as the change it announces, so the two are saved together or not at
 * all. The worker (src/worker.js) then delivers it to every subscribed handler (bus.js). The document doubles as the
 * delivery record: which handlers are done, attempts, the current claim and the last error.
 * Shape follows modules.md §4: { type, version, occurredAt, actor, entity, payload }.
 */
import mongoose from 'mongoose';

const { Schema } = mongoose;

export const EVENT_STATUSES = ['PENDING', 'DONE', 'DEAD'];

const domainEventSchema = new Schema(
  {
    ref: { type: String, required: true, unique: true }, // e.g. DE-MV4ABCD1234
    type: { type: String, required: true }, // e.g. lead.created
    version: { type: Number, default: 1 },
    occurredAt: { type: Date, required: true },
    actor: {
      type: { type: String, required: true }, // user | public | system | admin-key
      id: { type: String, default: null },
    },
    entity: {
      type: { type: String, required: true }, // e.g. lead
      ref: { type: String, required: true }, // e.g. VD-MU2E5O7Y
    },
    /** Small and free of personal data — handlers read current details through the owning module's service. */
    payload: { type: Schema.Types.Mixed, default: {} },

    status: { type: String, enum: EVENT_STATUSES, default: 'PENDING' },
    /** Names of the handlers that have finished; a retry only runs the others. */
    handled: { type: [String], default: [] },
    attempts: { type: Number, default: 0 },
    nextAttemptAt: { type: Date, required: true },
    /** Current claim: only the worker holding `claimToken` may record results, and only until `leaseUntil`. */
    claimToken: { type: String, default: null },
    leaseUntil: { type: Date, default: null },
    lastError: {
      handler: { type: String, default: null },
      code: { type: String, default: null },
      at: { type: Date, default: null },
    },
    completedAt: { type: Date, default: null },
    /** Set when DONE; a TTL index removes delivered events after the retention period. DEAD ones are kept. */
    expireAt: { type: Date, default: null },
  },
  { timestamps: true, minimize: false },
);

// The dispatcher's claim query: due PENDING events, oldest first.
domainEventSchema.index({ status: 1, nextAttemptAt: 1 });
// "What happened to this lead/booking?" lookups.
domainEventSchema.index({ 'entity.ref': 1, type: 1 });
domainEventSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

export const DomainEvent = mongoose.model('DomainEvent', domainEventSchema, 'domain_events');
