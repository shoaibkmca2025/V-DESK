/**
 * Notifications × CRM through the event outbox: a website lead → `lead.created` → queued confirmation and sales
 * alert → sent by the worker's sender. SALES_ALERT_EMAIL comes from vitest.config.js.
 * Run: npx vitest run src/modules/notifications/notifications.events.test.js
 */
import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../../app.js';
import '../../events.js';
import { createFakeMessagingProvider } from '../../integrations/messaging.js';
import { dispatchDueEvents } from '../../shared/events/bus.js';
import { clearTestDb, count, query, rows, startTestDb, stopTestDb } from '../../../test/db.js';
import { ADMIN_KEY } from '../../../test/staff.js';
import { processDueNotifications } from './notifications.service.js';

const app = createApp();

const TEMPLATES = {
  email: {
    key: 'lead.confirmation.email',
    channel: 'email',
    subject: 'We received your enquiry ({{ ref }})',
    body: 'Hi {{ name }}, thanks for your interest in {{ service }}. Your reference is {{ ref }}.',
    variables: ['name', 'service', 'ref'],
    transactional: true,
  },
  whatsapp: {
    key: 'lead.confirmation.whatsapp',
    channel: 'whatsapp',
    body: 'Hi {{ name }}, V-DESK here — we got your enquiry {{ ref }} and will call you shortly.',
    variables: ['name', 'ref'],
    transactional: true,
  },
  salesAlert: {
    key: 'lead.sales_alert',
    channel: 'email',
    subject: 'New lead {{ ref }} ({{ score }})',
    body: '{{ name }} — {{ mobile }} — via {{ source }}',
    variables: ['ref', 'score', 'name', 'mobile', 'source'],
    transactional: true,
  },
};

const createTemplate = (template) =>
  request(app).post('/api/v1/notifications/templates').set('x-admin-key', ADMIN_KEY).send(template);

const LEAD = {
  ref: 'VD-FLOW-0001',
  name: 'Priya Kulkarni',
  mobile: '98201 94820',
  email: 'priya@zenithd2c.com',
  service: 'Virtual Office',
  source: 'Quote Modal — Direct',
};

const postLead = (body = LEAD) => request(app).post('/api/v1/leads').send(body);
const queued = () =>
  rows(
    `SELECT template_key AS "templateKey", recipient AS "to", subject, body, status, channel
       FROM notification_log ORDER BY template_key`,
  );

beforeAll(startTestDb);
afterEach(clearTestDb);
afterAll(stopTestDb);

describe('lead.created → notifications', () => {
  it('records the event with the lead, carrying refs only', async () => {
    await postLead();
    const [event] = await rows(
      `SELECT type, status, handled, payload,
              jsonb_build_object('type', actor_type, 'id', actor_id) AS actor,
              jsonb_build_object('type', entity_type, 'ref', entity_ref) AS entity
         FROM domain_events`,
    );
    expect(event).toMatchObject({
      type: 'lead.created',
      entity: { type: 'lead', ref: 'VD-FLOW-0001' },
      actor: { type: 'public' },
      payload: { source: 'Quote Modal — Direct' },
      status: 'PENDING',
    });
    expect(JSON.stringify(event)).not.toMatch(/priya|98201/i);

    // A replayed submission is answered from the existing lead — no second event.
    expect((await postLead()).status).toBe(200);
    expect(await count('domain_events')).toBe(1);
  });

  it('queues the confirmation (email + WhatsApp) and the sales alert once templates exist', async () => {
    for (const template of Object.values(TEMPLATES)) expect((await createTemplate(template)).status).toBe(201);
    await postLead();
    expect(await dispatchDueEvents()).toMatchObject({ done: 1 });

    const messages = await queued();
    expect(messages.map((m) => [m.templateKey, m.channel, m.to, m.status])).toEqual([
      ['lead.confirmation.email', 'email', 'priya@zenithd2c.com', 'PENDING'],
      ['lead.confirmation.whatsapp', 'whatsapp', '+919820194820', 'PENDING'],
      ['lead.sales_alert', 'email', 'sales@vdesk.test', 'PENDING'],
    ]);
    expect(messages[0].body).toBe(
      'Hi Priya Kulkarni, thanks for your interest in Virtual Office. Your reference is VD-FLOW-0001.',
    );
    expect(messages[2].subject).toBe('New lead VD-FLOW-0001 (75)'); // 40 base + 20 mobile + 15 company email
  });

  it('never queues twice when the event is delivered again', async () => {
    for (const template of Object.values(TEMPLATES)) await createTemplate(template);
    await postLead();
    await dispatchDueEvents();
    // Simulate a redelivery: the worker crashed after the handlers ran but before recording them.
    await query(`UPDATE domain_events SET status = 'PENDING', handled = '{}', next_attempt_at = $1`, [new Date(0)]);
    await dispatchDueEvents();
    expect(await count('notification_log')).toBe(3);
  });

  it('skips messages whose template is missing or needs a value the lead lacks', async () => {
    await createTemplate({
      ...TEMPLATES.email,
      body: 'Hi {{ name }}, about your office in {{ city }}…',
      variables: ['name', 'city'],
    });
    await postLead(); // no city given
    expect(await dispatchDueEvents()).toMatchObject({ done: 1 });
    expect(await count('notification_log')).toBe(0);
  });

  it('is sent by the worker once a provider is configured', async () => {
    await createTemplate(TEMPLATES.whatsapp);
    await postLead({ ...LEAD, email: undefined });
    await dispatchDueEvents();

    const provider = createFakeMessagingProvider();
    expect(await processDueNotifications({ providers: { whatsapp: provider } })).toMatchObject({ accepted: 1 });
    expect(provider.sent).toMatchObject([{ channel: 'whatsapp', to: '+919820194820' }]);
    const [message] = await queued();
    expect(message).toMatchObject({ status: 'ACCEPTED', body: null });
  });
});
