/**
 * CMS mapper — public shapes match the frontend's data files (rules.md §42); staff see draft and published side by
 * side. A trust claim's `evidence` is internal and never public.
 */

/** The published copy of an entry, shaped like the frontend object it replaces. */
export function mapPublic(type, doc) {
  const data = doc.published;
  switch (type) {
    case 'faqs': // data/faqs.js FAQ_GROUPS item
      return { id: doc.key, title: data.title, icon: data.icon ?? null, items: data.items };
    case 'testimonials': // data/testimonials.js
      return { key: doc.key, quote: data.quote, name: data.name, role: data.role, location: data.location };
    case 'guides': // data/guides.js
      return { slug: doc.key, ...data };
    case 'legal': // content/legal.js LEGAL_DOCUMENTS[key]
      return { key: doc.key, title: data.title, content: data.content, lastUpdated: data.lastUpdated ?? null };
    case 'trust-claims':
      return { key: doc.key, value: data.value, label: data.label };
    case 'seo':
      return { path: doc.key, title: data.title, description: data.description, noindex: data.noindex };
    default:
      throw new Error(`No public shape for content type '${type}'`);
  }
}

export function mapStaff(doc) {
  return {
    type: doc.type,
    key: doc.key,
    draft: doc.draft,
    published: doc.published,
    version: doc.version,
    publishedVersion: doc.publishedVersion,
    /** The draft has edits the site doesn't show yet. */
    hasUnpublishedChanges: doc.publishedVersion !== doc.version,
    order: doc.order,
    updatedBy: doc.updatedBy,
    publishedAt: doc.publishedAt,
    publishedBy: doc.publishedBy,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export function mapRevision(doc) {
  return { version: doc.version, data: doc.data, publishedBy: doc.publishedBy, publishedAt: doc.publishedAt };
}
