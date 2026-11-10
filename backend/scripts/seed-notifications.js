/**
 * Seed script — notification templates
 *
 * Without these, `notifyIfConfigured()` answers TEMPLATE_NOT_CONFIGURED and every enquiry passes in
 * silence: no confirmation to the customer, no alert to the sales desk. The keys and variables below are
 * exactly the ones the handlers in notifications.events.js send.
 *
 * Only variables a lead ALWAYS has are declared. A template that asks for `{{ city }}` or `{{ company }}`
 * is skipped whole for any lead that left them blank (VARIABLE_UNAVAILABLE), which is most of them — so
 * those stay out of the text on purpose.
 *
 * The wording is a starting point, not a brief: edit it in the admin console, or here before first run.
 *
 * Usage (from backend/, after `npm run migrate`):
 *   node --env-file-if-exists=.env scripts/seed-notifications.js
 *
 * Safe to re-run: a key that already exists is left exactly as staff last edited it.
 *
 * Queuing is not sending. Messages sit PENDING until a provider is registered in
 * `messagingProviders()` (src/jobs.js) — that still needs a vendor and its credentials.
 */
import { connectDb, disconnectDb } from '../src/config/db.js';
import { createTemplate, listTemplates } from '../src/modules/notifications/notifications.service.js';

const TEMPLATES = [
  {
    key: 'lead.confirmation.email',
    channel: 'email',
    subject: 'We have your enquiry, {{ name }} — V-DESK',
    body: [
      'Hi {{ name }},',
      '',
      'Thanks for your enquiry about {{ service }}. One of our advisors will call you within one working day.',
      '',
      'Your reference is {{ ref }} — quote it if you get in touch before we reach you.',
      '',
      '— V-DESK Workspace & Consulting LLP',
    ].join('\n'),
    variables: ['name', 'service', 'ref'],
    transactional: true,
  },
  {
    key: 'lead.confirmation.whatsapp',
    channel: 'whatsapp',
    subject: null,
    body: 'Hi {{ name }}, V-DESK here. We have your enquiry about {{ service }} (ref {{ ref }}) and an advisor will call you within one working day.',
    variables: ['name', 'service', 'ref'],
    transactional: true,
  },
  {
    key: 'lead.sales_alert',
    channel: 'email',
    subject: 'New enquiry {{ ref }} — {{ service }}',
    body: [
      'New enquiry from the website.',
      '',
      'Reference : {{ ref }}',
      'Name      : {{ name }}',
      'Wants     : {{ service }}',
      'Came from : {{ source }}',
      '',
      'Open it in the staff console to see their contact details and claim it.',
    ].join('\n'),
    variables: ['ref', 'name', 'service', 'source'],
    transactional: true,
  },
];

await connectDb();
try {
  const existing = new Set((await listTemplates()).map((template) => template.key));
  let created = 0;
  for (const template of TEMPLATES) {
    if (existing.has(template.key)) {
      console.log(`[seed-notifications] kept ${template.key} (already configured)`);
      continue;
    }
    await createTemplate(template, 'script');
    created += 1;
    console.log(`[seed-notifications] created ${template.key} (${template.channel})`);
  }
  console.log(`[seed-notifications] ${created} created, ${TEMPLATES.length - created} already there`);
  if (created > 0) {
    console.log('[seed-notifications] messages will now queue. They stay PENDING until a provider is');
    console.log('[seed-notifications] registered in messagingProviders() — src/jobs.js.');
  }
} catch (err) {
  console.error(`[seed-notifications] ${err.code ?? 'FAILED'}: ${err.message}`);
  process.exitCode = 1;
} finally {
  await disconnectDb();
}
