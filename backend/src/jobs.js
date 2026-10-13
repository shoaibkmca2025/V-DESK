/**
 * The background jobs the worker runs (src/worker.js) — like src/routes.js, the one place to see them all.
 * MongoDB-backed, no Redis (ADR-008): every job is safe to run in several worker processes at once.
 */
import './events.js';
import { expireLapsedHolds } from './modules/booking/index.js';
import { processDueNotifications } from './modules/notifications/index.js';
import { expireLapsedQuotes } from './modules/pricing/index.js';
import { processSubscriptionLifecycle } from './modules/subscriptions/index.js';
import { dispatchDueEvents } from './shared/events/bus.js';

/**
 * Messaging adapters by channel (integrations/messaging.js contract). None exist yet — the vendors are undecided
 * (memory.md §6) — so notifications stay PENDING until one is added here, e.g. `{ email: createEmailProvider(env) }`.
 */
export function messagingProviders() {
  return {};
}

export function buildJobs({ providers = messagingProviders() } = {}) {
  const jobs = [
    // Delivers outbox events to their handlers (shared/events/bus.js).
    { name: 'events.dispatch', everyMs: 1_000, run: () => dispatchDueEvents({ limit: 50 }) },
    // Saves lapsed meeting-room holds as EXPIRED and publishes booking.hold_expired (booking.service.js).
    { name: 'booking.expire_holds', everyMs: 30_000, run: () => expireLapsedHolds({ limit: 100 }) },
    // Saves open quotes past validUntil as EXPIRED and publishes quote.expired (pricing.service.js).
    { name: 'pricing.expire_quotes', everyMs: 60_000, run: () => expireLapsedQuotes({ limit: 100 }) },
    // Renewal reminders (T-30/7/1), grace periods and suspensions (subscriptions.renewal.service.js).
    { name: 'subscriptions.lifecycle', everyMs: 60_000, run: () => processSubscriptionLifecycle() },
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
