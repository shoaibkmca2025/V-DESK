/**
 * Analytics Mongoose schema. Collection: analytics_events.
 *
 * A regular collection rather than a time-series one: time-series collections can't hold the unique
 * `dedupeKey` index that makes client retries safe. KPIs are aggregated on read for now; a `kpi_daily`
 * rollup comes when volume needs it. No `deletedAt` — events are never edited, only aged out by TTL.
 */
import mongoose from 'mongoose';
import { DEVICES, RETENTION_SECONDS } from './analytics.constants.js';

const { Schema } = mongoose;

const analyticsEventSchema = new Schema(
  {
    ref: { type: String, required: true, unique: true }, // e.g. EVT-MUA1B2C3D4
    /** The client's own id (`EVT-` + time), kept for matching with the browser's local log. Not unique. */
    clientRef: { type: String, default: null },
    type: { type: String, required: true },
    /** Payload after PII stripping and size limits (analytics.privacy.js). */
    data: { type: Schema.Types.Mixed, default: {} },
    device: { type: String, enum: DEVICES, default: 'Unknown' },
    /** When it happened on the visitor's device (clamped); `createdAt` is when we received it. */
    occurredAt: { type: Date, required: true },
    /** Hash of the event's content — a retried batch inserts nothing new. */
    dedupeKey: { type: String, required: true, unique: true },
  },
  { timestamps: { createdAt: true, updatedAt: false }, minimize: false },
);

// Staff stream: newest first with a (createdAt, ref) cursor, optionally by type.
analyticsEventSchema.index({ createdAt: -1, ref: -1 });
analyticsEventSchema.index({ type: 1, createdAt: -1 });
// KPI / funnel aggregations over a time range.
analyticsEventSchema.index({ occurredAt: -1, type: 1 });
analyticsEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: RETENTION_SECONDS });

export const AnalyticsEvent = mongoose.model('AnalyticsEvent', analyticsEventSchema, 'analytics_events');
