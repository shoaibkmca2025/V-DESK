/**
 * Notifications Mongoose schemas. Collections: notification_templates, notification_log.
 *
 * `notification_log` is also the outgoing queue: a notification is stored PENDING by `notify()` (no external call
 * inside the request — rules.md §28) and sent later by `processDueNotifications()`, which claims one document at a
 * time with an atomic update and a lease. The rendered subject/body is kept only until the notification reaches a
 * final status, then cleared, so message content (which may be sensitive) doesn't linger.
 */
import mongoose from 'mongoose';
import { CHANNELS, NOTIFICATION_STATUSES } from './notifications.constants.js';

const { Schema } = mongoose;

// ──────────────────────────────────────────────
// Template
// ──────────────────────────────────────────────
const templateSchema = new Schema(
  {
    /** The template's human identifier (rules.md §15), e.g. `lead.confirmation`. Never reused, even after delete. */
    key: { type: String, required: true, unique: true },
    channel: { type: String, enum: CHANNELS, required: true },
    /** Email only. Plain text. */
    subject: { type: String, default: null },
    /** Plain text with `{{ variable }}` placeholders. */
    body: { type: String, required: true },
    variables: [{ type: String }],
    /** SMS must be transactional (PRD §50). */
    transactional: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    /** Bumped on every change; each notification records the version it was rendered from. */
    version: { type: Number, default: 1 },
    updatedBy: { type: String, required: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// ──────────────────────────────────────────────
// Notification (log + queue)
// ──────────────────────────────────────────────
const notificationSchema = new Schema(
  {
    ref: { type: String, required: true, unique: true },
    /** Caller-chosen key for "this message about this thing" (e.g. `lead.created:VD-…:confirmation`). */
    dedupeKey: { type: String, required: true, unique: true },
    requestHash: { type: String, required: true },
    templateKey: { type: String, required: true },
    templateVersion: { type: Number, required: true },
    channel: { type: String, enum: CHANNELS, required: true },
    /** Recipient (PII): never logged; staff see it masked. */
    to: { type: String, required: true },
    /** Rendered content; cleared once the notification is ACCEPTED or FAILED. */
    subject: { type: String, default: null },
    body: { type: String, default: null },
    status: { type: String, enum: NOTIFICATION_STATUSES, default: 'PENDING' },
    /** Claims so far (each claim is one send attempt). */
    attempts: { type: Number, default: 0 },
    nextAttemptAt: { type: Date, required: true },
    /** While SENDING: the claiming worker's lease and token (a stale worker can't overwrite a newer claim). */
    leaseUntil: { type: Date, default: null },
    claimToken: { type: String, default: null },
    lastError: {
      _id: false,
      code: { type: String },
      transient: { type: Boolean },
      at: { type: Date },
    },
    providerMessageId: { type: String, default: null },
    acceptedAt: { type: Date, default: null },
    failedAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

notificationSchema.index({ status: 1, channel: 1, nextAttemptAt: 1 });
notificationSchema.index({ status: 1, channel: 1, leaseUntil: 1 });
notificationSchema.index({ deletedAt: 1, createdAt: -1, ref: -1 });

export const NotificationTemplate = mongoose.model('NotificationTemplate', templateSchema, 'notification_templates');
export const Notification = mongoose.model('Notification', notificationSchema, 'notification_log');
