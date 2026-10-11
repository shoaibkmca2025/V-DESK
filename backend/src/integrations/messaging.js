/**
 * Messaging providers — the contract every email / WhatsApp / SMS adapter implements, and a deterministic fake
 * (rules.md §6). No real provider exists yet: email is "Resend / SES" (undecided), WhatsApp has no provider chosen,
 * SMS is planned on MSG91, and none has credentials (docs/backend/memory.md §5–6). Real adapters go in
 * `email.js` / `whatsapp.js` / `sms.js` and must implement exactly this interface.
 *
 * Interface — `provider.send(message) → Promise<{ providerMessageId: string }>`:
 *   message = { channel: 'email' | 'whatsapp' | 'sms', to, subject?, body, idempotencyKey }
 *   - Resolving means the provider ACCEPTED the message, not that it was delivered.
 *   - `idempotencyKey` is stable per notification; adapters must pass it to providers that support one, so a send
 *     retried after a crash is not delivered twice.
 *   - Failures throw `MessagingError`; `transient: true` (timeouts, 429, 5xx) may be retried, `false` (bad number,
 *     rejected template, 4xx) must not. Anything else thrown is treated as transient.
 *   - Outbound calls time out within 5 s (rules.md §29).
 */

export class MessagingError extends Error {
  /** @param {string} code stable provider-neutral code, e.g. 'TIMEOUT', 'INVALID_RECIPIENT' */
  constructor(code, message, { transient }) {
    super(message);
    this.name = 'MessagingError';
    this.code = code;
    this.transient = transient;
  }
}

/**
 * In-memory fake: records every accepted message in `sent` and never contacts anyone. `failNext(n, error)` makes
 * the next n sends throw `error` (default: a transient timeout), so tests can drive retries and permanent failures.
 */
export function createFakeMessagingProvider() {
  const sent = [];
  const failures = [];
  let counter = 0;
  return {
    sent,
    failNext(times = 1, error = new MessagingError('TIMEOUT', 'Fake provider timed out', { transient: true })) {
      for (let i = 0; i < times; i++) failures.push(error);
    },
    async send(message) {
      const failure = failures.shift();
      if (failure) throw failure;
      sent.push({ ...message });
      counter += 1;
      return { providerMessageId: `fake-${counter}` };
    },
  };
}
