/**
 * Notifications constants — channels, delivery statuses, the transition table and retry policy.
 *
 * Statuses describe what V-DESK knows, never more: ACCEPTED means the provider took the message, not that it
 * reached the recipient (delivery receipts need provider callbacks, which don't exist yet).
 */

export const CHANNELS = ['email', 'whatsapp', 'sms'];

export const NOTIFICATION_STATUSES = ['PENDING', 'SENDING', 'ACCEPTED', 'FAILED'];

/**
 * The only legal status moves (rules.md §5). SENDING → PENDING is a retry after a transient failure; a SENDING
 * notification whose lease ran out (the worker died) may be claimed again.
 */
export const NOTIFICATION_TRANSITIONS = Object.freeze({
  PENDING: ['SENDING'],
  SENDING: ['ACCEPTED', 'PENDING', 'FAILED', 'SENDING'],
  ACCEPTED: [],
  FAILED: [],
});

/** Attempts in total (first send included). After the last transient failure the notification is FAILED. */
export const MAX_ATTEMPTS = 4;

/** Wait before attempt 2, 3, 4 — no infinite retries, no hot loop. */
export const RETRY_DELAYS_SECONDS = [60, 5 * 60, 30 * 60];

/** How long a claimed notification belongs to one worker; past it, another worker may retry it. */
export const SEND_LEASE_SECONDS = 60;

/** Template keys look like `lead.confirmation`, `lead.sales_alert`. */
export const TEMPLATE_KEY_PATTERN = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)*$/;

/** `{{ name }}` placeholders; variable names are plain identifiers. */
export const PLACEHOLDER_PATTERN = /\{\{\s*([A-Za-z][A-Za-z0-9_]*)\s*\}\}/g;
export const MAX_VARIABLES = 20;
export const MAX_VARIABLE_LENGTH = 500;

export const LIST_DEFAULT_LIMIT = 25;
export const LIST_MAX_LIMIT = 100;
