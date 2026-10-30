/**
 * Notifications repository — the only file that queries the database for this module.
 * Hides soft-deleted records, except where deduplication needs to see them.
 *
 * `notification_log` doubles as the outgoing queue, and `claimNext` is how a worker takes the next message:
 * one statement that picks a due row, locks it, and marks it SENDING. `FOR UPDATE SKIP LOCKED` means two
 * workers running at once step over each other's rows instead of fighting for the same one.
 */
import { cursorClause } from '../../shared/lib/pagination.js';
import { row, rows, UNIQUE_VIOLATION } from '../../shared/lib/sql.js';

const TEMPLATE_COLUMNS = `
  key, channel, subject, body, variables, transactional, active, version,
  updated_by AS "updatedBy", deleted_at AS "deletedAt",
  created_at AS "createdAt", updated_at AS "updatedAt"`;

/** `to` is a SQL keyword, so the column is `recipient` and comes back under its old name. */
const NOTIFICATION_COLUMNS = `
  ref, dedupe_key AS "dedupeKey", request_hash AS "requestHash",
  template_key AS "templateKey", template_version AS "templateVersion",
  channel, recipient AS "to", subject, body, status, attempts,
  next_attempt_at AS "nextAttemptAt", lease_until AS "leaseUntil", claim_token AS "claimToken",
  last_error AS "lastError", provider_message_id AS "providerMessageId",
  accepted_at AS "acceptedAt", failed_at AS "failedAt",
  deleted_at AS "deletedAt", created_at AS "createdAt", updated_at AS "updatedAt"`;

const TEMPLATE_COLUMN_FOR = {
  channel: 'channel',
  subject: 'subject',
  body: 'body',
  variables: 'variables',
  transactional: 'transactional',
  active: 'active',
  updatedBy: 'updated_by',
  deletedAt: 'deleted_at',
};

const NOTIFICATION_COLUMN_FOR = {
  status: 'status',
  subject: 'subject',
  body: 'body',
  attempts: 'attempts',
  nextAttemptAt: 'next_attempt_at',
  leaseUntil: 'lease_until',
  claimToken: 'claim_token',
  lastError: 'last_error',
  providerMessageId: 'provider_message_id',
  acceptedAt: 'accepted_at',
  failedAt: 'failed_at',
  deletedAt: 'deleted_at',
};

/** jsonb columns need their value handed over as JSON text, not as an object. */
const JSON_COLUMNS = new Set(['last_error']);

function assignments(set, map, from, label) {
  const fields = Object.keys(set);
  const columns = fields.map((field) => {
    const column = map[field];
    if (!column) throw new Error(`notifications.repository: no column for ${label} field '${field}'`);
    return column;
  });
  return {
    text: columns.map((column, i) => `${column} = $${from + i}${JSON_COLUMNS.has(column) ? '::jsonb' : ''}`).join(', '),
    params: fields.map((field, i) =>
      JSON_COLUMNS.has(columns[i]) && set[field] != null ? JSON.stringify(set[field]) : set[field],
    ),
  };
}

// ──────────────────────────────────────────────
// Templates
// ──────────────────────────────────────────────

export async function findTemplates() {
  return rows(`SELECT ${TEMPLATE_COLUMNS} FROM notification_templates WHERE deleted_at IS NULL ORDER BY key`);
}

export async function findTemplate(key) {
  return row(`SELECT ${TEMPLATE_COLUMNS} FROM notification_templates WHERE key = $1 AND deleted_at IS NULL`, [key]);
}

/** Inserts a template, or returns null when the key is taken (including by a deleted template). */
export async function insertTemplate(data) {
  try {
    return await row(
      `INSERT INTO notification_templates (key, channel, subject, body, variables, transactional, active, updated_by)
            VALUES ($1, $2, $3, $4, coalesce($5::text[], '{}'), coalesce($6, false), coalesce($7, true), $8)
         RETURNING ${TEMPLATE_COLUMNS}`,
      [
        data.key,
        data.channel,
        data.subject ?? null,
        data.body,
        data.variables ?? null,
        data.transactional ?? null,
        data.active ?? null,
        data.updatedBy,
      ],
    );
  } catch (err) {
    if (err.code === UNIQUE_VIOLATION) return null;
    throw err;
  }
}

/** Updates a template only if it is still at `version` (so two editors can't silently overwrite each other). */
export async function updateTemplate(key, version, set) {
  const { text, params } = assignments(set, TEMPLATE_COLUMN_FOR, 3, 'template');
  return row(
    `UPDATE notification_templates SET ${text}, version = version + 1
      WHERE key = $1 AND version = $2 AND deleted_at IS NULL
      RETURNING ${TEMPLATE_COLUMNS}`,
    [key, version, ...params],
  );
}

export async function softDeleteTemplate(key, actor, now) {
  return row(
    `UPDATE notification_templates SET deleted_at = $2, active = false, updated_by = $3
      WHERE key = $1 AND deleted_at IS NULL
      RETURNING ${TEMPLATE_COLUMNS}`,
    [key, now, actor],
  );
}

// ──────────────────────────────────────────────
// Notifications
// ──────────────────────────────────────────────

export async function findNotificationByDedupeKey(dedupeKey) {
  return row(`SELECT ${NOTIFICATION_COLUMNS} FROM notification_log WHERE dedupe_key = $1`, [dedupeKey]);
}

/** Inserts a notification, or returns null when the dedupe key was taken by a concurrent request. */
export async function insertNotification(data) {
  try {
    return await row(
      `INSERT INTO notification_log (ref, dedupe_key, request_hash, template_key, template_version, channel,
                                     recipient, subject, body, status, next_attempt_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, coalesce($10, 'PENDING'), $11)
         RETURNING ${NOTIFICATION_COLUMNS}`,
      [
        data.ref,
        data.dedupeKey,
        data.requestHash,
        data.templateKey,
        data.templateVersion,
        data.channel,
        data.to,
        data.subject ?? null,
        data.body ?? null,
        data.status ?? null,
        data.nextAttemptAt,
      ],
    );
  } catch (err) {
    if (err.code === UNIQUE_VIOLATION) return null;
    throw err;
  }
}

/**
 * Claims the next notification to send on one of `channels`: a PENDING one that is due, or a SENDING one
 * whose worker's lease ran out. Counts the claim as an attempt. Returns the claimed row or null.
 */
export async function claimNext({ channels, now, leaseUntil, claimToken }) {
  return row(
    `UPDATE notification_log
        SET status = 'SENDING', lease_until = $3, claim_token = $4, attempts = attempts + 1
      WHERE id = (
        SELECT id FROM notification_log
         WHERE channel = ANY($1) AND deleted_at IS NULL
           AND ((status = 'PENDING' AND next_attempt_at <= $2) OR (status = 'SENDING' AND lease_until <= $2))
         ORDER BY next_attempt_at, id
         FOR UPDATE SKIP LOCKED
         LIMIT 1
      )
      RETURNING ${NOTIFICATION_COLUMNS}`,
    [channels, now, leaseUntil, claimToken],
  );
}

/**
 * Applies the outcome of a send, only if this worker still holds the claim. Returns the updated row, or
 * null when the claim was lost (the lease expired and another worker took it).
 */
export async function settleClaim(ref, claimToken, set) {
  const { text, params } = assignments(set, NOTIFICATION_COLUMN_FOR, 3, 'notification');
  return row(
    `UPDATE notification_log SET ${text}, lease_until = NULL, claim_token = NULL
      WHERE ref = $1 AND status = 'SENDING' AND claim_token = $2
      RETURNING ${NOTIFICATION_COLUMNS}`,
    [ref, claimToken, ...params],
  );
}

/** Newest first; fetches `limit + 1` so the service can tell whether there is another page. */
export async function findNotifications({ status, channel, templateKey, after, limit }) {
  const cursor = cursorClause(after, 4);
  return rows(
    `SELECT ${NOTIFICATION_COLUMNS} FROM notification_log
      WHERE deleted_at IS NULL
        AND ($1::text IS NULL OR status = $1)
        AND ($2::text IS NULL OR channel = $2)
        AND ($3::text IS NULL OR template_key = $3)
        ${cursor.text}
      ORDER BY created_at DESC, ref DESC
      LIMIT $${cursor.next}`,
    [status ?? null, channel ?? null, templateKey ?? null, ...cursor.params, limit + 1],
  );
}
