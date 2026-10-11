/**
 * Notifications service — templates, queuing (`notify`) and sending (`processDueNotifications`).
 *
 * Rules (docs/backend/rules.md):
 *  - `notify()` only renders and stores a PENDING notification; it never calls a provider (§28). Sending happens in
 *    `processDueNotifications()`, meant to run in a background worker — which needs the job queue (not built yet).
 *  - Duplicates: the caller's `dedupeKey` is unique, so asking twice stores and sends one message; reusing a key for
 *    a different message is 409. A claim is an atomic update with a lease, so two workers never send the same
 *    notification at once. If a worker dies after the provider accepted but before recording it, the lease runs
 *    out and the message is retried with the same provider idempotency key (the notification ref) — providers that
 *    honour it won't deliver twice; ones that don't may (at-least-once).
 *  - Retries: transient failures back off (RETRY_DELAYS_SECONDS) up to MAX_ATTEMPTS, then FAILED; permanent
 *    failures are FAILED at once. A channel with no provider configured is never claimed — its notifications wait.
 *  - ACCEPTED means the provider accepted the message, never "delivered".
 *  - Logs carry refs, template keys, channels, attempt numbers and error codes — never recipients, message content
 *    or provider error text (§21).
 */
import { createHash, randomUUID } from 'node:crypto';
import { badRequest, conflict, notFound } from '../../shared/errors/AppError.js';
import { logger } from '../../shared/lib/logger.js';
import { decodeCursor, toPage } from '../../shared/lib/pagination.js';
import { generateRef } from '../../shared/lib/refs.js';
import { MAX_ATTEMPTS, RETRY_DELAYS_SECONDS, SEND_LEASE_SECONDS } from './notifications.constants.js';
import { mapNotification, mapReceipt, mapTemplate } from './notifications.mapper.js';
import * as repo from './notifications.repository.js';
import { renderTemplate, templateProblems } from './notifications.template.js';
import { notifyInput } from './notifications.validation.js';

const log = logger.child({ module: 'notifications' });

// ──────────────────────────────────────────────
// Templates (staff)
// ──────────────────────────────────────────────

function assertTemplate(template) {
  const problems = templateProblems(template);
  if (problems.length > 0) throw badRequest('VALIDATION_FAILED', 'The template is invalid', problems);
}

async function findTemplateOrThrow(key) {
  const template = await repo.findTemplate(key);
  if (!template) throw notFound('TEMPLATE_NOT_FOUND', `No notification template '${key}'`);
  return template;
}

export async function listTemplates() {
  return (await repo.findTemplates()).map(mapTemplate);
}

export async function getTemplate(key) {
  return mapTemplate(await findTemplateOrThrow(key));
}

export async function createTemplate(input, actor) {
  const data = { ...input, subject: input.subject ?? null };
  assertTemplate(data);
  const doc = await repo.insertTemplate({ ...data, updatedBy: actor });
  if (!doc) throw conflict('TEMPLATE_EXISTS', `Template key '${input.key}' is already used (keys are never reused)`);
  log.info({ event: 'notification.template_created', key: doc.key, channel: doc.channel, actor }, 'template created');
  return mapTemplate(doc);
}

/** Replaces a template's content. `version` must match the stored one, so concurrent edits can't clobber. */
export async function updateTemplate(key, { version, ...input }, actor) {
  const current = await findTemplateOrThrow(key);
  const data = { ...input, subject: input.subject ?? null };
  assertTemplate({ ...data, channel: current.channel });
  const doc = await repo.updateTemplate(key, version, { ...data, updatedBy: actor });
  if (!doc) {
    throw conflict('TEMPLATE_CHANGED', 'This template was changed since you loaded it. Reload and try again.', {
      version: current.version,
    });
  }
  log.info({ event: 'notification.template_updated', key, version: doc.version, actor }, 'template updated');
  return mapTemplate(doc);
}

export async function deleteTemplate(key, actor, now = new Date()) {
  const doc = await repo.softDeleteTemplate(key, actor, now);
  if (!doc) throw notFound('TEMPLATE_NOT_FOUND', `No notification template '${key}'`);
  log.info({ event: 'notification.template_deleted', key, actor }, 'template deleted');
}

// ──────────────────────────────────────────────
// Queue (public interface for other modules)
// ──────────────────────────────────────────────

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INDIAN_MOBILE = /^(?:\+?91)?([6-9]\d{9})$/;

/** Checks the recipient for the channel; phones are normalised to +91XXXXXXXXXX. */
function normaliseRecipient(channel, to) {
  if (channel === 'email') {
    const email = to.trim().toLowerCase();
    if (EMAIL.test(email)) return email;
  } else {
    const match = INDIAN_MOBILE.exec(to.replace(/[\s()-]/g, ''));
    if (match) return `+91${match[1]}`;
  }
  throw badRequest(
    'INVALID_RECIPIENT',
    `The recipient is not a valid ${channel === 'email' ? 'email address' : 'Indian mobile number'}`,
  );
}

/** Variables are hashed with sorted keys, so the same values in another order are the same request. */
const hashRequest = ({ variables, ...rest }) => {
  const sorted = Object.fromEntries(
    Object.keys(variables)
      .sort()
      .map((name) => [name, variables[name]]),
  );
  return createHash('sha256')
    .update(JSON.stringify({ ...rest, variables: sorted }))
    .digest('hex');
};

async function findReplay(dedupeKey, requestHash) {
  const existing = await repo.findNotificationByDedupeKey(dedupeKey);
  if (existing && existing.requestHash !== requestHash) {
    throw conflict('DEDUPE_KEY_REUSED', 'This dedupeKey was already used for a different notification');
  }
  return existing;
}

/**
 * Queues one templated message. Validates and renders now (so bad input fails the caller, not a worker later),
 * stores it PENDING, and returns a receipt. Never sends.
 * @param {{ templateKey: string, to: string, variables?: object, dedupeKey: string }} request
 * @returns {Promise<{ notification: { ref, status, channel, templateKey }, created: boolean }>}
 */
export async function notify(request, now = new Date()) {
  const parsed = notifyInput.safeParse(request);
  if (!parsed.success) {
    const details = parsed.error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message }));
    throw badRequest('VALIDATION_FAILED', 'The notification request is invalid', details);
  }
  const { templateKey, to, variables, dedupeKey } = parsed.data;
  const requestHash = hashRequest({ templateKey, to, variables });
  const replay = await findReplay(dedupeKey, requestHash);
  if (replay) return { notification: mapReceipt(replay), created: false };

  const template = await findTemplateOrThrow(templateKey);
  if (!template.active) throw conflict('TEMPLATE_INACTIVE', `Template '${templateKey}' is switched off`);
  const recipient = normaliseRecipient(template.channel, to);
  const { subject, body } = renderTemplate(template, variables);

  const doc = await repo.insertNotification({
    ref: generateRef('NTF', 8),
    dedupeKey,
    requestHash,
    templateKey,
    templateVersion: template.version,
    channel: template.channel,
    to: recipient,
    subject,
    body,
    status: 'PENDING',
    nextAttemptAt: now,
  });
  if (!doc) {
    // A concurrent request with the same dedupeKey won the insert.
    const winner = await findReplay(dedupeKey, requestHash);
    if (winner) return { notification: mapReceipt(winner), created: false };
    throw conflict('NOTIFICATION_CONFLICT', 'Could not queue the notification. Please try again.');
  }
  log.info(
    { event: 'notification.queued', notificationRef: doc.ref, templateKey, channel: doc.channel },
    'notification queued',
  );
  return { notification: mapReceipt(doc), created: true };
}

// ──────────────────────────────────────────────
// Sending (background worker)
// ──────────────────────────────────────────────

const secondsAfter = (now, seconds) => new Date(now.getTime() + seconds * 1000);
/** Message content is dropped once a notification is final. */
const final = (set) => ({ ...set, subject: null, body: null });

/** Sends one claimed notification and records the outcome. Returns 'accepted' | 'retry' | 'failed' | 'lost'. */
async function sendClaimed(claimed, provider, now) {
  const { ref, claimToken, attempts } = claimed;
  const meta = { notificationRef: ref, templateKey: claimed.templateKey, channel: claimed.channel, attempt: attempts };

  if (attempts > MAX_ATTEMPTS) {
    // Reclaimed after its last attempt's worker died: don't try again.
    const set = final({
      status: 'FAILED',
      failedAt: now,
      lastError: { code: 'ATTEMPTS_EXHAUSTED', transient: false, at: now },
    });
    const settled = await repo.settleClaim(ref, claimToken, set);
    if (settled)
      log.warn({ event: 'notification.failed', ...meta, errorCode: 'ATTEMPTS_EXHAUSTED' }, 'notification failed');
    return settled ? 'failed' : 'lost';
  }

  let outcome;
  try {
    const { providerMessageId } = await provider.send({
      channel: claimed.channel,
      to: claimed.to,
      subject: claimed.subject,
      body: claimed.body,
      idempotencyKey: ref,
    });
    outcome = { status: 'ACCEPTED', set: final({ status: 'ACCEPTED', providerMessageId, acceptedAt: now }) };
  } catch (err) {
    const transient = err?.name === 'MessagingError' ? err.transient === true : true;
    const code = err?.name === 'MessagingError' ? err.code : 'PROVIDER_ERROR';
    const lastError = { code, transient, at: now };
    outcome =
      transient && attempts < MAX_ATTEMPTS
        ? {
            status: 'PENDING',
            set: { status: 'PENDING', lastError, nextAttemptAt: secondsAfter(now, RETRY_DELAYS_SECONDS[attempts - 1]) },
          }
        : { status: 'FAILED', set: final({ status: 'FAILED', lastError, failedAt: now }) };
  }

  const settled = await repo.settleClaim(ref, claimToken, outcome.set);
  if (!settled) {
    log.warn({ event: 'notification.claim_lost', ...meta }, 'lease expired before the outcome was recorded');
    return 'lost';
  }
  if (outcome.status === 'ACCEPTED') {
    log.info({ event: 'notification.accepted', ...meta }, 'notification accepted by provider');
    return 'accepted';
  }
  const errorCode = outcome.set.lastError.code;
  if (outcome.status === 'PENDING') {
    log.warn({ event: 'notification.retry_scheduled', ...meta, errorCode }, 'notification send failed; will retry');
    return 'retry';
  }
  log.warn({ event: 'notification.failed', ...meta, errorCode }, 'notification failed');
  return 'failed';
}

/**
 * Sends due notifications, one claim at a time, until none is due or `limit` is reached. Only channels with a
 * provider in `providers` are touched. Meant for a background worker (job queue not built yet).
 *
 * The clock is read again for every claim: sends take time, and a lease measured from the start of the run could
 * already have run out when a later notification is claimed, letting another worker send it too. `now` pins the
 * clock for the whole run and is meant for tests only.
 * @param {{ providers: Partial<Record<'email'|'whatsapp'|'sms', { send: Function }>>, now?: Date, limit?: number }} options
 * @returns {Promise<{ accepted: number, retry: number, failed: number, lost: number }>}
 */
export async function processDueNotifications({ providers = {}, now: pinnedNow, limit = 20 } = {}) {
  const channels = Object.keys(providers).filter((channel) => typeof providers[channel]?.send === 'function');
  const summary = { accepted: 0, retry: 0, failed: 0, lost: 0 };
  if (channels.length === 0) return summary;

  for (let i = 0; i < limit; i++) {
    const now = pinnedNow ?? new Date();
    const claimed = await repo.claimNext({
      channels,
      now,
      leaseUntil: secondsAfter(now, SEND_LEASE_SECONDS),
      claimToken: randomUUID(),
    });
    if (!claimed) break;
    summary[await sendClaimed(claimed, providers[claimed.channel], now)] += 1;
  }
  return summary;
}

// ──────────────────────────────────────────────
// Log (staff)
// ──────────────────────────────────────────────

export async function listNotifications({ status, channel, templateKey, cursor, limit }) {
  const after = cursor ? decodeCursor(cursor) : undefined;
  const { items, nextCursor } = toPage(
    await repo.findNotifications({ status, channel, templateKey, after, limit }),
    limit,
  );
  return { notifications: items.map(mapNotification), nextCursor };
}
