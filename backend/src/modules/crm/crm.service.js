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
import { AppError, badRequest, conflict, notFound } from '../../shared/errors/AppError.js';
import { publish } from '../../shared/events/bus.js';
import { csvRow } from '../../shared/lib/csv.js';
import { logger } from '../../shared/lib/logger.js';
import { withTransaction } from '../../shared/lib/transactions.js';
import {
  CONTACT_LIMIT,
  CONTACT_WINDOW_MS,
  FREE_EMAIL_PROVIDERS,
  LEAD_SCORE_RULES,
  LEAD_STATUSES,
  LEAD_TRANSITIONS,
  TOUCH_FIELDS,
} from './crm.constants.js';
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

/** The last 10 digits, so +91 98765 43210, 919876543210 and 98765-43210 count as one contact. */
export function mobileKey(mobile) {
  const digits = (mobile ?? '').replace(/\D/g, '');
  return digits ? digits.slice(-10) : null;
}

/**
 * Keeps the known touch fields; URLs lose their query string and hash (the UTM values arrive as their own fields,
 * and query strings can carry personal data). Returns null for an empty touch.
 */
export function cleanTouch(touch) {
  if (!touch) return null;
  const out = {};
  for (const field of TOUCH_FIELDS) {
    const value = touch[field];
    if (value) out[field] = field === 'referrer' || field === 'landingPage' ? value.split(/[?#]/)[0] : value;
  }
  if (touch.at) out.at = touch.at;
  return Object.keys(out).length > 0 ? out : null;
}

// ──────────────────────────────────────────────
// Public
// ──────────────────────────────────────────────

async function assertContactLimit({ mobileDigits, email }, now) {
  const since = new Date(now.getTime() - CONTACT_WINDOW_MS);
  if ((await repo.countRecentLeadsByContact({ mobileDigits, email, since })) >= CONTACT_LIMIT) {
    log.warn({ event: 'lead.contact_limited' }, 'enquiry refused: per-contact limit');
    throw new AppError(429, 'TOO_MANY_ENQUIRIES', 'We already have your enquiry — our team will contact you shortly.');
  }
}

/**
 * Records a website enquiry. Always starts at NEW. If the caller supplied a `ref` that already exists, nothing
 * is written and the original receipt is returned (`created: false`) — the client queues and retries forms.
 * A new enquiry from a mobile or email that already sent CONTACT_LIMIT within the window is 429.
 * @returns {Promise<{ lead: { ref: string, createdAt: Date }, created: boolean }>}
 */
export async function createLead(input, now = new Date()) {
  if (input.ref) {
    const existing = await repo.findAnyLeadByRef(input.ref);
    if (existing) return { lead: mapLeadReceipt(existing), created: false };
  }

  const { attribution, ...fields } = input;
  const mobileDigits = mobileKey(fields.mobile);
  await assertContactLimit({ mobileDigits, email: fields.email }, now);

  const data = {
    ...fields,
    ref: input.ref ?? generateLeadRef(),
    status: 'NEW',
    mobileDigits,
    attribution: { firstTouch: cleanTouch(attribution?.firstTouch), lastTouch: cleanTouch(attribution?.lastTouch) },
  };
  data.score = computeLeadScore(data);

  const doc = await insertLeadWithEvent(data);
  if (!doc) {
    // Lost a race with an identical retry; answer as a replay. A clash on a server ref is practically impossible.
    const existing = input.ref && (await repo.findAnyLeadByRef(input.ref));
    if (existing) return { lead: mapLeadReceipt(existing), created: false };
    throw conflict('LEAD_REF_CONFLICT', 'Could not allocate a lead reference. Please try again.');
  }

  log.info({ event: 'lead.created', leadRef: doc.ref, source: doc.source, score: doc.score }, 'lead created');
  return { lead: mapLeadReceipt(doc), created: true };
}

/** Thrown inside the transaction to abort it when the ref is already taken (a concurrent replay won). */
class RefTaken extends Error {}

/**
 * Saves the lead, its "created" activity and the `lead.created` event together (outbox, ADR-005). The event carries
 * refs only; handlers read the lead through this module's service. Returns null when the ref was taken meanwhile.
 */
async function insertLeadWithEvent(data) {
  try {
    return await withTransaction(async (session) => {
      const doc = await repo.insertLead(data, { session });
      if (!doc) throw new RefTaken();
      await repo.insertActivities([{ leadRef: doc.ref, type: 'created', to: 'NEW', actor: 'public' }], { session });
      await publish(
        {
          type: 'lead.created',
          entity: { type: 'lead', ref: doc.ref },
          actor: { type: 'public' },
          payload: { source: doc.source || null },
          occurredAt: doc.createdAt,
        },
        { session },
      );
      return doc;
    });
  } catch (err) {
    if (err instanceof RefTaken) return null;
    throw err;
  }
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
// CSV export (leads:export)
// ──────────────────────────────────────────────

const touchColumns = (key, label) =>
  ['source', 'medium', 'campaign'].map((field) => [`${label} ${field}`, (l) => l.attribution?.[key]?.[field]]);

/** Column order of the export; values are read from stored lead documents. */
const EXPORT_COLUMNS = [
  ['Ref', (l) => l.ref],
  ['Created at', (l) => l.createdAt],
  ['Name', (l) => l.name],
  ['Mobile', (l) => l.mobile],
  ['Email', (l) => l.email],
  ['Company', (l) => l.company],
  ['City', (l) => l.city],
  ['Service', (l) => l.service],
  ['Source', (l) => l.source],
  ['Status', (l) => l.status],
  ['Score', (l) => l.score],
  ['Assigned to', (l) => l.assignedTo],
  ['Message', (l) => l.notes],
  ...touchColumns('firstTouch', 'First touch'),
  ...touchColumns('lastTouch', 'Last touch'),
];

/**
 * Streams the filtered leads as CSV lines (header first, UTF-8 BOM so Excel reads ₹ and Indian names). Cells are
 * guarded against spreadsheet formula injection by csv.js. The export is logged with the row count and who ran it.
 */
export async function* exportLeadsCsv({ q, ...filters }, actor) {
  yield `\uFEFF${csvRow(EXPORT_COLUMNS.map(([header]) => header))}`;
  let rows = 0;
  for await (const lead of repo.streamLeads({ ...filters, search: q })) {
    yield csvRow(EXPORT_COLUMNS.map(([, value]) => value(lead)));
    rows += 1;
  }
  log.info({ event: 'leads.exported', rows, filters: Object.keys(filters), actor }, 'leads exported');
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
