/**
 * CMS service — editable site content with a draft → publish workflow (PRD §56: content edits need no deploy).
 *
 * Rules:
 *  - Staff edit a draft; the site only ever serves the published copy. Publishing copies the draft exactly as the
 *    editor reviewed it (they send the draft `version`) and records a revision — both in one transaction.
 *  - Saves are optimistic: the editor sends the version they loaded; a stale version is 409 CONTENT_CHANGED.
 *  - Legal HTML is sanitised on save (cms.constants.js LEGAL_HTML) — the frontend renders it as HTML.
 *  - Trust claims ("10,000+ businesses served") are published only by someone allowed to approve them, and only
 *    with evidence on record (memory.md §5, PRD §22). The evidence is never public.
 *  - Logs carry types, keys, versions and the actor — never content.
 */
import sanitizeHtml from 'sanitize-html';
import { AppError, badRequest, conflict, notFound } from '../../shared/errors/AppError.js';
import { logger } from '../../shared/lib/logger.js';
import { withTransaction } from '../../shared/lib/transactions.js';
import { LEGAL_HTML } from './cms.constants.js';
import { mapPublic, mapRevision, mapStaff } from './cms.mapper.js';
import * as repo from './cms.repository.js';

const log = logger.child({ module: 'cms' });

const contentNotFound = (type, key) => notFound('CONTENT_NOT_FOUND', `No ${type} entry '${key}'`);

// ──────────────────────────────────────────────
// Public
// ──────────────────────────────────────────────

/** Published entries of a type in display order — guides newest first, optionally one category. */
export async function listPublished(type, { category } = {}) {
  let items = (await repo.findPublished(type)).map((doc) => mapPublic(type, doc));
  if (type === 'guides') {
    if (category) items = items.filter((guide) => guide.category.toLowerCase() === category.toLowerCase());
    items.sort((a, b) => b.date.localeCompare(a.date));
  }
  return items;
}

export async function getPublished(type, key) {
  const doc = await repo.findEntry(type, key);
  if (!doc?.published) throw contentNotFound(type, key);
  return mapPublic(type, doc);
}

/** SEO override for a page path, or null — the page then keeps the title it computes itself. */
export async function getSeo(path) {
  const doc = await repo.findEntry('seo', path);
  return doc?.published ? mapPublic('seo', doc) : null;
}

// ──────────────────────────────────────────────
// Staff
// ──────────────────────────────────────────────

/** Type-specific clean-up of validated content before it is stored. */
function prepare(type, data) {
  if (type !== 'legal') return data;
  const content = sanitizeHtml(data.content, LEGAL_HTML).trim();
  if (!content) throw badRequest('CONTENT_EMPTY', 'Nothing is left of the content after removing unsupported HTML');
  return { ...data, content };
}

async function findOrThrow(type, key) {
  const doc = await repo.findEntry(type, key);
  if (!doc) throw contentNotFound(type, key);
  return doc;
}

export async function listEntries(type) {
  return (await repo.findEntries(type)).map(mapStaff);
}

export async function getEntry(type, key) {
  return mapStaff(await findOrThrow(type, key));
}

/**
 * Creates the entry (no `version`) or replaces its draft (`version` = the one loaded). The live page doesn't change.
 */
export async function saveDraft(type, key, { data, order, version }, actor) {
  const draft = prepare(type, data);
  if (version === undefined) {
    const doc = await repo.insertEntry({ type, key, draft, order: order ?? 0, updatedBy: actor });
    if (!doc) throw conflict('CONTENT_EXISTS', `${type} '${key}' already exists — send its version to edit it`);
    log.info({ event: 'content.created', type, key, actor }, 'content created');
    return mapStaff(doc);
  }

  const set = { draft, updatedBy: actor, ...(order !== undefined && { order }) };
  const doc = await repo.updateEntryAtVersion(type, key, version, set, { bumpVersion: true });
  if (!doc) {
    const current = await findOrThrow(type, key);
    throw conflict('CONTENT_CHANGED', 'This content was changed since you loaded it. Reload and try again.', {
      version: current.version,
    });
  }
  log.info({ event: 'content.draft_saved', type, key, version: doc.version, actor }, 'content draft saved');
  return mapStaff(doc);
}

/**
 * Publishes the draft at `version`. `canApprove` says whether the actor may approve trust claims — checked here as
 * well as being the actor's permission (rules.md §20).
 */
export async function publish(type, key, { version }, actor, { canApprove = false } = {}) {
  const entry = await findOrThrow(type, key);
  if (entry.version !== version) {
    throw conflict('CONTENT_CHANGED', 'The draft changed since you reviewed it. Reload and try again.', {
      version: entry.version,
    });
  }
  if (type === 'trust-claims') {
    if (!canApprove) throw new AppError(403, 'APPROVAL_REQUIRED', 'Only a super admin can publish trust claims');
    if (!entry.draft.evidence) {
      throw badRequest('EVIDENCE_REQUIRED', 'Record where this claim comes from (evidence) before publishing it');
    }
  }

  const now = new Date();
  const doc = await withTransaction(async (session) => {
    const updated = await repo.updateEntryAtVersion(
      type,
      key,
      version,
      { published: entry.draft, publishedVersion: version, publishedAt: now, publishedBy: actor },
      { session },
    );
    if (!updated) throw conflict('CONTENT_CHANGED', 'The draft changed while publishing. Reload and try again.');
    await repo.insertRevision(
      { type, key, version, data: entry.draft, publishedBy: actor, publishedAt: now },
      { session },
    );
    return updated;
  });
  log.info({ event: 'content.published', type, key, version, actor }, 'content published');
  return mapStaff(doc);
}

/** Takes the entry off the site; the draft stays for later. */
export async function unpublish(type, key, actor) {
  await findOrThrow(type, key);
  const doc = await repo.updateEntry(type, key, {
    published: null,
    publishedVersion: null,
    publishedAt: null,
    publishedBy: null,
  });
  log.info({ event: 'content.unpublished', type, key, actor }, 'content unpublished');
  return mapStaff(doc);
}

/** Soft delete (rules.md §16); its revisions are kept. */
export async function deleteEntry(type, key, actor) {
  await findOrThrow(type, key);
  await repo.updateEntry(type, key, { deletedAt: new Date(), published: null, publishedVersion: null });
  log.info({ event: 'content.deleted', type, key, actor }, 'content deleted');
}

export async function listRevisions(type, key) {
  await findOrThrow(type, key);
  return (await repo.findRevisions(type, key)).map(mapRevision);
}
