/**
 * CRM repository — the only file that queries the database for this module.
 * Hides soft-deleted leads, except where idempotency and the per-contact limit need to see them.
 */
import { cursorClause } from '../../shared/lib/pagination.js';
import { exec, row, rows, UNIQUE_VIOLATION } from '../../shared/lib/sql.js';

const LEAD_COLUMNS = `
  ref, name, mobile, email, city, service, company, notes, source, status, score,
  assigned_to AS "assignedTo",
  attribution,
  mobile_digits AS "mobileDigits",
  deleted_at AS "deletedAt",
  created_at AS "createdAt",
  updated_at AS "updatedAt"`;

const ACTIVITY_COLUMNS = `
  lead_ref AS "leadRef", type,
  from_status AS "from",
  to_status AS "to",
  assigned_to AS "assignedTo",
  note, actor,
  created_at AS "createdAt",
  updated_at AS "updatedAt"`;

/** Fields the service writes on a lead → their columns. */
const COLUMN_FOR = {
  name: 'name',
  mobile: 'mobile',
  email: 'email',
  city: 'city',
  service: 'service',
  company: 'company',
  notes: 'notes',
  source: 'source',
  status: 'status',
  score: 'score',
  assignedTo: 'assigned_to',
  attribution: 'attribution',
  mobileDigits: 'mobile_digits',
  deletedAt: 'deleted_at',
};

function columnOf(field) {
  const column = COLUMN_FOR[field];
  if (!column) throw new Error(`crm.repository: no column for lead field '${field}'`);
  return column;
}

/** How many rows one export query fetches before asking for the next page. */
const EXPORT_BATCH = 500;

// ──────────────────────────────────────────────
// Leads
// ──────────────────────────────────────────────

/** A non-deleted lead by ref, or null. */
export async function findLeadByRef(ref) {
  return row(`SELECT ${LEAD_COLUMNS} FROM leads WHERE ref = $1 AND deleted_at IS NULL`, [ref]);
}

/** Any lead with this ref, deleted or not — so a replayed submission never creates a second lead. */
export async function findAnyLeadByRef(ref) {
  return row(`SELECT ref, created_at AS "createdAt" FROM leads WHERE ref = $1`, [ref]);
}

/** Inserts a lead and returns it, or returns null when the ref is already taken (a concurrent replay). */
export async function insertLead(data, { session: tx } = {}) {
  try {
    return await row(
      `INSERT INTO leads (ref, name, mobile, email, city, service, company, notes, source, status, score,
                          assigned_to, attribution, mobile_digits)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, coalesce($10, 'NEW'), $11, $12,
                    coalesce($13, '{"firstTouch": null, "lastTouch": null}'::jsonb), $14)
         RETURNING ${LEAD_COLUMNS}`,
      [
        data.ref,
        data.name,
        data.mobile ?? '',
        data.email ?? '',
        data.city ?? '',
        data.service ?? '',
        data.company ?? '',
        data.notes ?? '',
        data.source ?? '',
        data.status ?? null,
        data.score,
        data.assignedTo ?? null,
        data.attribution ? JSON.stringify(data.attribution) : null,
        data.mobileDigits ?? null,
      ],
      tx,
    );
  } catch (err) {
    if (err.code === UNIQUE_VIOLATION) return null;
    throw err;
  }
}

/**
 * Lists leads newest first. `after` is the decoded cursor `{ createdAt, ref }` of the last item already
 * seen. Fetches `limit + 1` so the service can tell whether another page exists.
 */
export async function findLeads({ after, limit, ...filters }) {
  const where = leadWhere(filters);
  const cursor = cursorClause(after, where.next);
  return rows(
    `SELECT ${LEAD_COLUMNS} FROM leads
      WHERE ${where.text} ${cursor.text}
      ORDER BY created_at DESC, ref DESC
      LIMIT $${cursor.next}`,
    [...where.params, ...cursor.params, limit + 1],
  );
}

/**
 * Every lead matching the staff filters, newest first, for the CSV export — in pages, so a big export
 * never holds the whole table in memory. Each page starts where the last one ended, using the same
 * (created_at, ref) key as the list cursor, so a lead can neither be skipped nor repeated.
 */
export async function* streamLeads(filters) {
  let after;
  for (;;) {
    const page = await findLeads({ ...filters, after, limit: EXPORT_BATCH });
    const batch = page.slice(0, EXPORT_BATCH);
    for (const lead of batch) yield lead;
    if (page.length <= EXPORT_BATCH) return;
    after = { createdAt: batch.at(-1).createdAt, ref: batch.at(-1).ref };
  }
}

/** Filters shared by the list and the export. `from` / `to` bound created_at. */
function leadWhere({ status, city, source, assignedTo, search, from, to }, start = 1) {
  const conditions = ['deleted_at IS NULL'];
  const params = [];
  /** `$n` stands for "this condition's parameter" — the search clause names it in four columns at once. */
  const add = (sql, value) => {
    params.push(value);
    conditions.push(sql.replaceAll('$n', `$${start + params.length - 1}`));
  };

  if (status) add('status = $n', status);
  if (city) add('city = $n', city);
  if (source) add('source = $n', source);
  if (assignedTo) add('assigned_to = $n', assignedTo);
  // One parameter, four columns: the same text is matched against each, case-insensitively.
  if (search) add('(name ILIKE $n OR mobile ILIKE $n OR email ILIKE $n OR city ILIKE $n)', `%${escapeLike(search)}%`);
  if (from) add('created_at >= $n', from);
  if (to) add('created_at <= $n', to);

  return { text: conditions.join(' AND '), params, next: start + params.length };
}

/** Leads created since `since` with this mobile (last 10 digits) or email. Deleted ones count too. */
export async function countRecentLeadsByContact({ mobileDigits, email, since }) {
  if (!mobileDigits && !email) return 0;
  const result = await row(
    `SELECT count(*)::int AS n FROM leads
      WHERE created_at >= $1
        AND ((($2::text IS NOT NULL) AND mobile_digits = $2) OR (($3::text IS NOT NULL) AND email = $3))`,
    [since, mobileDigits ?? null, email ?? null],
  );
  return result.n;
}

/**
 * Applies `changes` only if the lead still has `expectedStatus`, so two staff members moving the same lead
 * at once cannot both succeed. Returns the updated lead, or null if it changed or disappeared meanwhile.
 */
export async function updateLeadIfStatus(ref, expectedStatus, changes) {
  const fields = Object.keys(changes);
  const assignments = fields
    .map((field, i) => `${columnOf(field)} = $${i + 3}${field === 'attribution' ? '::jsonb' : ''}`)
    .join(', ');
  return row(
    `UPDATE leads SET ${assignments}
      WHERE ref = $1 AND status = $2 AND deleted_at IS NULL
      RETURNING ${LEAD_COLUMNS}`,
    [
      ref,
      expectedStatus,
      ...fields.map((field) => (field === 'attribution' ? JSON.stringify(changes[field]) : changes[field])),
    ],
  );
}

/** Counts non-deleted leads grouped by `field` → `[{ value, count }]`. */
export async function countLeadsBy(field) {
  const column = columnOf(field);
  return rows(
    `SELECT ${column} AS value, count(*)::int AS count FROM leads WHERE deleted_at IS NULL GROUP BY ${column}`,
  );
}

// ──────────────────────────────────────────────
// Activities
// ──────────────────────────────────────────────

export async function insertActivities(activities, { session: tx } = {}) {
  if (activities.length === 0) return;
  // One statement for the whole timeline: unnest turns six arrays into six columns of rows.
  await exec(
    `INSERT INTO lead_activities (lead_ref, type, from_status, to_status, assigned_to, note, actor)
     SELECT * FROM unnest($1::text[], $2::text[], $3::text[], $4::text[], $5::text[], $6::text[], $7::text[])`,
    [
      activities.map((a) => a.leadRef),
      activities.map((a) => a.type),
      activities.map((a) => a.from ?? null),
      activities.map((a) => a.to ?? null),
      activities.map((a) => a.assignedTo ?? null),
      activities.map((a) => a.note ?? null),
      activities.map((a) => a.actor),
    ],
    tx,
  );
}

/** Timeline for one lead, oldest first. */
export async function findActivities(leadRef) {
  return rows(`SELECT ${ACTIVITY_COLUMNS} FROM lead_activities WHERE lead_ref = $1 ORDER BY created_at, id`, [leadRef]);
}

/** `%` and `_` are wildcards in LIKE; a search for "50%" must look for that text, not "50 anything". */
function escapeLike(text) {
  return text.replace(/[\\%_]/g, (character) => `\\${character}`);
}
