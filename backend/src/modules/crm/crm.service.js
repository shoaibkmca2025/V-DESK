/**
 * CRM service — business rules for website leads and the sales pipeline.
 *
 * Rules (docs/backend/rules.md):
 *  - No req/res and no Mongoose here; data goes through crm.repository.js.
 *  - Status moves follow the single transition table in crm.constants.js; illegal moves are 409 (§5).
 *  - The score is recomputed on every write (modules.md §3.5).
 *  - Public submissions are idempotent on a caller-supplied ref so the client can retry safely (§43).
 *  - Logs carry refs and sources only, never names, phones or emails (§21).
 */
import { randomInt } from 'node:crypto';
import { badRequest, conflict, notFound } from '../../shared/errors/AppError.js';
import { logger } from '../../shared/lib/logger.js';
import { FREE_EMAIL_PROVIDERS, LEAD_SCORE_RULES, LEAD_STATUSES, LEAD_TRANSITIONS } from './crm.constants.js';
import { mapActivity, mapLead, mapLeadReceipt } from './crm.mapper.js';
import * as repo from './crm.repository.js';

const log = logger.child({ module: 'crm' });

// ──────────────────────────────────────────────
// Pure rules
// ──────────────────────────────────────────────

/**
 * Lead score 0–100 (PRD §44): base 40, +20 mobile, +15 corporate email, +10 company, +15 when QUALIFIED.
 * Kept identical to the client's calculateLeadScore so the admin board shows the same numbers.
 */
export function computeLeadScore(lead) {
  const rules = LEAD_SCORE_RULES;
  const email = (lead.email || '').toLowerCase();
  let score = rules.base;
  if (lead.mobile) score += rules.mobile;
  if (email && !FREE_EMAIL_PROVIDERS.some((provider) => email.includes(provider))) score += rules.corporateEmail;
  if (lead.company) score += rules.company;
  if (lead.status === 'QUALIFIED') score += rules.qualified;
  return Math.min(rules.max, score);
}

/** Throws 409 INVALID_STATUS_TRANSITION unless `to` is an allowed next status for `from`. */
export function assertTransition(from, to) {
  const allowed = LEAD_TRANSITIONS[from] ?? [];
  if (!allowed.includes(to)) {
    throw conflict('INVALID_STATUS_TRANSITION', `A lead cannot move from ${from} to ${to}`, { from, to, allowed });
  }
}

/** Same shape as the client's ids (VD- + base-36 time) plus 4 random characters so two requests in one ms differ. */
export function generateLeadRef() {
  const suffix = Array.from({ length: 4 }, () => randomInt(36).toString(36)).join('');
  return `VD-${Date.now().toString(36)}${suffix}`.toUpperCase();
}

// ──────────────────────────────────────────────
// Public
// ──────────────────────────────────────────────

/**
 * Records a website enquiry. Always starts at NEW. If the caller supplied a `ref` that already exists, nothing
 * is written and the original receipt is returned (`created: false`) — the client queues and retries forms.
 * @returns {Promise<{ lead: { ref: string, createdAt: Date }, created: boolean }>}
 */
export async function createLead(input) {
  if (input.ref) {
    const existing = await repo.findAnyLeadByRef(input.ref);
    if (existing) return { lead: mapLeadReceipt(existing), created: false };
  }

  const data = { ...input, ref: input.ref ?? generateLeadRef(), status: 'NEW' };
  data.score = computeLeadScore(data);

  const doc = await repo.insertLead(data);
  if (!doc) {
    // Lost a race with an identical retry; answer as a replay. A clash on a server ref is practically impossible.
    const existing = input.ref && (await repo.findAnyLeadByRef(input.ref));
    if (existing) return { lead: mapLeadReceipt(existing), created: false };
    throw conflict('LEAD_REF_CONFLICT', 'Could not allocate a lead reference. Please try again.');
  }

  await repo.insertActivities([{ leadRef: doc.ref, type: 'created', to: 'NEW', actor: 'public' }]);
  log.info({ event: 'lead.created', leadRef: doc.ref, source: doc.source, score: doc.score }, 'lead created');
  return { lead: mapLeadReceipt(doc), created: true };
}

// ──────────────────────────────────────────────
// Staff
// ──────────────────────────────────────────────

/**
 * Lists leads newest first with cursor pagination (modules.md §6).
 * @returns {Promise<{ leads: object[], nextCursor: string | null }>}
 */
export async function listLeads({ status, city, source, assignedTo, q, cursor, limit }) {
  const after = cursor ? decodeCursor(cursor) : undefined;
  const docs = await repo.findLeads({ status, city, source, assignedTo, search: q, after, limit });
  const hasMore = docs.length > limit;
  const page = hasMore ? docs.slice(0, limit) : docs;
  const nextCursor = hasMore ? encodeCursor(page.at(-1)) : null;
  return { leads: page.map(mapLead), nextCursor };
}

/** Returns one lead with its activity timeline, or throws LEAD_NOT_FOUND. */
export async function getLead(ref) {
  const doc = await repo.findLeadByRef(ref);
  if (!doc) throw notFound('LEAD_NOT_FOUND', `No lead found for ref '${ref}'`);
  const activities = await repo.findActivities(ref);
  return { ...mapLead(doc), activities: activities.map(mapActivity) };
}

/**
 * Staff update: move status (transition table), assign/unassign (`assignedTo: null`), and/or add a note.
 * Setting a field to its current value is a no-op, so retries are harmless.
 * @param {string} ref
 * @param {{ status?: string, assignedTo?: string | null, note?: string }} changes
 * @param {string} actor who made the change, recorded on the timeline
 */
export async function updateLead(ref, { status, assignedTo, note }, actor) {
  const lead = await repo.findLeadByRef(ref);
  if (!lead) throw notFound('LEAD_NOT_FOUND', `No lead found for ref '${ref}'`);

  const set = {};
  const activities = [];
  if (status && status !== lead.status) {
    assertTransition(lead.status, status);
    set.status = status;
    activities.push({ type: 'status_changed', from: lead.status, to: status });
  }
  if (assignedTo !== undefined && assignedTo !== lead.assignedTo) {
    set.assignedTo = assignedTo;
    activities.push({ type: 'assigned', assignedTo });
  }
  if (note) activities.push({ type: 'note', note });

  if (Object.keys(set).length > 0) {
    set.score = computeLeadScore({ ...lead, ...set });
    const updated = await repo.updateLeadIfStatus(ref, lead.status, set);
    if (!updated) throw conflict('LEAD_CHANGED', 'This lead was changed by someone else. Reload and try again.');
  }
  await repo.insertActivities(activities.map((activity) => ({ ...activity, leadRef: ref, actor })));

  if (set.status) {
    log.info({ event: 'lead.status_changed', leadRef: ref, from: lead.status, to: set.status }, 'lead status changed');
  }
  return getLead(ref);
}

/** Totals for the admin dashboard: all leads, per status (every status present, zero if none) and per source. */
export async function getLeadStats() {
  const [statusCounts, sourceCounts] = await Promise.all([repo.countLeadsBy('status'), repo.countLeadsBy('source')]);
  const byStatus = Object.fromEntries(LEAD_STATUSES.map((s) => [s, 0]));
  for (const { _id, count } of statusCounts) byStatus[_id] = count;
  const bySource = Object.fromEntries(sourceCounts.map(({ _id, count }) => [_id || 'Unknown', count]));
  const total = statusCounts.reduce((sum, { count }) => sum + count, 0);
  return { total, byStatus, bySource };
}

// ──────────────────────────────────────────────
// Cursor helpers — opaque to clients, built from public fields only (never _id)
// ──────────────────────────────────────────────

function encodeCursor(doc) {
  return Buffer.from(JSON.stringify({ c: doc.createdAt.toISOString(), r: doc.ref })).toString('base64url');
}

function decodeCursor(cursor) {
  try {
    const { c, r } = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'));
    const createdAt = new Date(c);
    if (typeof r !== 'string' || Number.isNaN(createdAt.getTime())) throw new Error('bad cursor');
    return { createdAt, ref: r };
  } catch {
    throw badRequest('INVALID_CURSOR', 'The pagination cursor is invalid');
  }
}
