/**
 * CMS Mongoose schemas. Collections: content_entries, content_revisions.
 *
 * One collection for every content type (FAQ groups, testimonials, guides, legal pages, trust claims, SEO text)
 * instead of one per type: they share the draft → publish workflow, versioning and history, and their `data` is
 * validated per type by cms.validation.js. Each entry keeps the staff's working `draft` and the `published` copy the
 * site serves, so editing never changes the live page until someone publishes.
 */
import mongoose from 'mongoose';
import { CONTENT_TYPES } from './cms.constants.js';

const { Schema } = mongoose;

const contentEntrySchema = new Schema(
  {
    type: { type: String, enum: CONTENT_TYPES, required: true },
    /** The entry's human identifier within its type (rules.md §15): a slug, or a page path for seo. */
    key: { type: String, required: true },
    draft: { type: Schema.Types.Mixed, required: true },
    published: { type: Schema.Types.Mixed, default: null },
    /** Draft version, +1 on every save; staff send the version they loaded (optimistic locking). */
    version: { type: Number, default: 1 },
    publishedVersion: { type: Number, default: null },
    /** Position in public lists (lower first); guides are listed by date instead. */
    order: { type: Number, default: 0 },
    updatedBy: { type: String, required: true },
    publishedAt: { type: Date, default: null },
    publishedBy: { type: String, default: null },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true, minimize: false },
);

// One live entry per (type, key); a deleted key can be created again.
contentEntrySchema.index({ type: 1, key: 1 }, { unique: true, partialFilterExpression: { deletedAt: null } });
// Public lists: published entries of a type, in order.
contentEntrySchema.index({ type: 1, deletedAt: 1, order: 1, key: 1 });

/** Append-only: what was published, when and by whom — the history behind every live page. */
const contentRevisionSchema = new Schema(
  {
    type: { type: String, enum: CONTENT_TYPES, required: true },
    key: { type: String, required: true },
    version: { type: Number, required: true },
    data: { type: Schema.Types.Mixed, required: true },
    publishedBy: { type: String, required: true },
    publishedAt: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false }, minimize: false },
);

contentRevisionSchema.index({ type: 1, key: 1, publishedAt: -1 });

export const ContentEntry = mongoose.model('ContentEntry', contentEntrySchema, 'content_entries');
export const ContentRevision = mongoose.model('ContentRevision', contentRevisionSchema, 'content_revisions');
