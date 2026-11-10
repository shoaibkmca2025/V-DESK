import { env } from '../config/env.js';
import { MessagingError } from './messaging.js';

/**
 * Email adapter for Resend (docs/backend/memory.md §6 named it first among the candidates).
 *
 * Plain `fetch` against the REST API rather than the SDK: this runs inside a Cloudflare Worker, where one
 * less dependency in the bundle is worth more than the SDK's convenience, and the call is a single POST.
 *
 * Swapping vendor means replacing this file — nothing outside it knows which provider sends the mail.
 *
 * Retry rules follow Resend's own guidance: 429 and 5xx are worth retrying, 4xx are not, and a 409 is only
 * worth retrying when it says another request with the same key is still in flight.
 */

const ENDPOINT = 'https://api.resend.com/emails';
const TIMEOUT_MS = 5_000; // rules.md §29
const MAX_IDEMPOTENCY_KEY = 256; // Resend's limit; ours are far shorter, but a long one is a 400.

const permanent = (code, message) => new MessagingError(code, message, { transient: false });
const transient = (code, message) => new MessagingError(code, message, { transient: true });

/** Resend's error `name` decides retryability for the two cases that share a 409. */
function errorFor(status, payload) {
  const name = payload?.name ?? 'unknown';
  const message = payload?.message ?? `Resend answered ${status}`;
  if (status === 429) return transient('RATE_LIMITED', message);
  if (status >= 500) return transient('PROVIDER_UNAVAILABLE', message);
  if (status === 409) {
    // The first request with this key is still running; the same send is safe to try again later.
    return name === 'concurrent_idempotent_requests'
      ? transient('IDEMPOTENCY_IN_FLIGHT', message)
      : permanent('IDEMPOTENCY_CONFLICT', message);
  }
  if (status === 401 || status === 403) return permanent('PROVIDER_AUTH', message);
  return permanent(name === 'unknown' ? 'REJECTED' : name.toUpperCase(), message);
}

export function createEmailProvider({ apiKey = env.RESEND_API_KEY, from = env.MAIL_FROM } = {}) {
  if (!apiKey || !from) throw new Error('createEmailProvider needs RESEND_API_KEY and MAIL_FROM');

  return {
    async send({ to, subject, body, idempotencyKey }) {
      if (!subject) throw permanent('INVALID_MESSAGE', 'Email needs a subject');

      let response;
      try {
        response = await fetch(ENDPOINT, {
          method: 'POST',
          headers: {
            authorization: `Bearer ${apiKey}`,
            'content-type': 'application/json',
            // Resend replays the first response for 24 h, so a send retried after a crash is not delivered twice.
            'idempotency-key': String(idempotencyKey).slice(0, MAX_IDEMPOTENCY_KEY),
          },
          body: JSON.stringify({ from, to: [to], subject, text: body }),
          signal: AbortSignal.timeout(TIMEOUT_MS),
        });
      } catch (err) {
        // A timeout or a dropped connection says nothing about whether the mail was accepted — retry on the key.
        throw transient('TIMEOUT', `Resend did not answer within ${TIMEOUT_MS} ms: ${err.message}`);
      }

      const payload = await response.json().catch(() => null);
      if (!response.ok) throw errorFor(response.status, payload);
      if (!payload?.id) throw transient('PROVIDER_UNAVAILABLE', 'Resend accepted the mail but returned no id');
      return { providerMessageId: payload.id };
    },
  };
}
