/**
 * The background jobs the worker runs (src/worker.js) — like src/routes.js, the one place to see them all.
 * PostgreSQL-backed, no Redis (ADR-008, ADR-010): every job is safe to run in several worker processes at
 * once, because each claims one row at a time with SELECT ... FOR UPDATE SKIP LOCKED and a lease.
 */
import './events.js';
import { env } from './config/env.js';
import { createEmailProvider } from './integrations/email.js';
import { processDueNotifications } from './modules/notifications/index.js';
import { dispatchDueEvents } from './shared/events/bus.js';
import { purgeExpiredRows } from './shared/jobs/purge.js';

/**
 * Messaging adapters by channel (integrations/messaging.js contract).
 *
 * Email is live once RESEND_API_KEY and MAIL_FROM are both set; without them no provider is registered and
 * notifications stay PENDING, which is what a deployment with no vendor does. WhatsApp and SMS have no
 * provider chosen yet (memory.md §6), so messages on those channels still queue and wait.
 */
export function messagingProviders() {
  const providers = {};
  if (env.RESEND_API_KEY && env.MAIL_FROM) providers.email = createEmailProvider();
  return providers;
}

export function buildJobs({ providers = messagingProviders() } = {}) {
  const jobs = [
    // Delivers outbox events to their handlers (shared/events/bus.js). `everyMs` is the Node worker's
    // interval; on Cloudflare there is no loop, so the minute cron runs this once a minute instead.
    { name: 'events.dispatch', everyMs: 1_000, run: () => dispatchDueEvents({ limit: 50 }) },
    // Deletes rows MongoDB used to expire with TTL indexes (shared/jobs/purge.js). Hourly is plenty: none
    // of them is still honoured once it is past its time, so this is housekeeping, not a rule.
    { name: 'rows.purge', everyMs: 60 * 60_000, run: () => purgeExpiredRows() },
  ];
  if (Object.keys(providers).length > 0) {
    // Sends queued notifications through the configured providers (notifications.service.js).
    jobs.push({
      name: 'notifications.send',
      everyMs: 5_000,
      run: () => processDueNotifications({ providers, limit: 20 }),
    });
  }
  return jobs;
}
