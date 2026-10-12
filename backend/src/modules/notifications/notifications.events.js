/**
 * Notifications — reactions to other modules' domain events (rules.md §4: cross-module side effects go through
 * events, never direct calls). Registered from src/events.js and run by the worker.
 *
 * Every handler is idempotent: the dedupeKey is derived from the event's entity, so a redelivered event finds the
 * notification it already queued instead of queuing a second one.
 *
 * Templates the handlers use (staff create them with POST /api/v1/notifications/templates; until a template exists
 * and is active, that message is simply not queued):
 *
 *   lead.confirmation.email      to the visitor's email       variables from: name, ref, service, city, company
 *   lead.confirmation.whatsapp   to the visitor's mobile      (same)
 *   lead.sales_alert             to SALES_ALERT_EMAIL         (same, plus source, score, mobile, email)
 *
 * `name` and `ref` are always available; the others only when the visitor gave them — a template that uses a value
 * a lead doesn't have is skipped for that lead.
 */
import { env } from '../../config/env.js';
import { subscribe } from '../../shared/events/bus.js';
import { logger } from '../../shared/lib/logger.js';
import { getLead } from '../crm/index.js';
import { notifyIfConfigured } from './notifications.service.js';

const log = logger.child({ module: 'notifications' });

/**
 * Queues one message. Problems that a retry can't fix — the lead is gone, the recipient is invalid, the template's
 * variables don't fit — are logged and dropped (4xx AppErrors); anything else is thrown so the event is retried.
 */
async function queue(eventRef, request) {
  try {
    const result = await notifyIfConfigured(request);
    if (result.skipped) {
      log.info({ event: 'notification.skipped', eventRef, templateKey: request.templateKey, ...result }, 'not queued');
    }
  } catch (err) {
    if (err?.name !== 'AppError' || err.status >= 500) throw err;
    log.warn(
      { event: 'notification.not_queued', eventRef, templateKey: request.templateKey, errorCode: err.code },
      'event could not be turned into a notification',
    );
  }
}

/** The lead's current details, or null if it no longer exists. */
async function leadFor(event) {
  try {
    return await getLead(event.entity.ref);
  } catch (err) {
    if (err?.code === 'LEAD_NOT_FOUND') return null;
    throw err;
  }
}

const leadVariables = (lead) => ({
  name: lead.name,
  ref: lead.ref,
  service: lead.service,
  city: lead.city,
  company: lead.company,
});

subscribe('lead.created', 'notifications.lead_confirmation', async (event) => {
  const lead = await leadFor(event);
  if (!lead) return;
  const available = leadVariables(lead);
  if (lead.email) {
    await queue(event.ref, {
      templateKey: 'lead.confirmation.email',
      to: lead.email,
      available,
      dedupeKey: `lead.created:${lead.ref}:confirmation:email`,
    });
  }
  if (lead.mobile) {
    await queue(event.ref, {
      templateKey: 'lead.confirmation.whatsapp',
      to: lead.mobile,
      available,
      dedupeKey: `lead.created:${lead.ref}:confirmation:whatsapp`,
    });
  }
});

subscribe('lead.created', 'notifications.lead_sales_alert', async (event) => {
  if (!env.SALES_ALERT_EMAIL) return;
  const lead = await leadFor(event);
  if (!lead) return;
  await queue(event.ref, {
    templateKey: 'lead.sales_alert',
    to: env.SALES_ALERT_EMAIL,
    available: {
      ...leadVariables(lead),
      source: lead.source,
      score: lead.score,
      mobile: lead.mobile,
      email: lead.email,
    },
    dedupeKey: `lead.created:${lead.ref}:sales_alert`,
  });
});
