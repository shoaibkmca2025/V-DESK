/**
 * Notifications mapper — shapes templates and notifications for API responses.
 * Internal fields (_id, claim data, request hash) never leave the API. Recipients are masked and message content is
 * never returned: staff can see what was sent to whom-ish and how it went, not read people's messages.
 */

/** `priya@zenith.in` → `p***@zenith.in`; `+919876543210` → `*********3210`. */
export function maskRecipient(to) {
  const at = to.indexOf('@');
  if (at > 0) return `${to[0]}***${to.slice(at)}`;
  return `${'*'.repeat(Math.max(0, to.length - 4))}${to.slice(-4)}`;
}

export function mapTemplate(doc) {
  return {
    key: doc.key,
    channel: doc.channel,
    subject: doc.subject,
    body: doc.body,
    variables: doc.variables,
    transactional: doc.transactional,
    active: doc.active,
    version: doc.version,
    updatedBy: doc.updatedBy,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

/** What `notify()` callers get back: enough to correlate, nothing personal. */
export function mapReceipt(doc) {
  return { ref: doc.ref, status: doc.status, channel: doc.channel, templateKey: doc.templateKey };
}

/** Staff log view. */
export function mapNotification(doc) {
  return {
    ref: doc.ref,
    status: doc.status,
    channel: doc.channel,
    templateKey: doc.templateKey,
    templateVersion: doc.templateVersion,
    to: maskRecipient(doc.to),
    attempts: doc.attempts,
    nextAttemptAt: doc.status === 'PENDING' ? doc.nextAttemptAt : null,
    lastError: doc.lastError?.code ? { code: doc.lastError.code, transient: doc.lastError.transient } : null,
    acceptedAt: doc.acceptedAt,
    failedAt: doc.failedAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}
