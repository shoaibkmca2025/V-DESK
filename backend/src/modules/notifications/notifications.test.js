/**
 * Notifications module — template CRUD (staff), queuing through `notify()`, sending through
 * `processDueNotifications()` with the fake provider: acceptance, retries, permanent failures, leases, duplicates,
 * authorization and privacy. Template parsing/rendering is covered in notifications.template.test.js.
 * Run: npx vitest run src/modules/notifications/notifications.test.js
 */
import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { createApp } from '../../app.js';
import { clearTestDb, startTestDb, stopTestDb } from '../../../test/db.js';
import { ADMIN_KEY, staffSession } from '../../../test/staff.js';
import { MessagingError, createFakeMessagingProvider } from '../../integrations/messaging.js';
import { MAX_ATTEMPTS, RETRY_DELAYS_SECONDS, SEND_LEASE_SECONDS } from './notifications.constants.js';
import { notify, processDueNotifications } from './index.js';
import { Notification } from './notifications.model.js';

const app = createApp();
const adminKey = { 'x-admin-key': ADMIN_KEY };
const NOW = new Date('2026-10-11T06:00:00.000Z');
const later = (seconds) => new Date(NOW.getTime() + seconds * 1000);

const TEMPLATES = {
  email: {
    key: 'lead.confirmation',
    channel: 'email',
    subject: 'We received your enquiry, {{ name }}',
    body: 'Hi {{name}}, thanks for asking about {{service}}.',
    variables: ['name', 'service'],
    transactional: true,
  },
  whatsapp: {
    key: 'lead.confirmation_whatsapp',
    channel: 'whatsapp',
    body: 'Hi {{name}}, thanks for your enquiry.',
    variables: ['name'],
    transactional: true,
  },
};

const createTemplate = (template, auth = adminKey) =>
  request(app).post('/api/v1/notifications/templates').set(auth).send(template);

let seq = 0;
const emailRequest = (overrides = {}) => ({
  templateKey: 'lead.confirmation',
  to: 'Priya@Zenith.in',
  variables: { name: 'Priya', service: 'Virtual Office' },
  dedupeKey: `lead.created:VD-${++seq}:confirmation`,
  ...overrides,
});

/** A fake provider that also counts every attempt, failed ones included. */
function countingProvider() {
  const fake = createFakeMessagingProvider();
  const counted = { ...fake, calls: 0, send: (message) => ((counted.calls += 1), fake.send(message)) };
  return counted;
}

beforeAll(startTestDb);
afterEach(clearTestDb);
afterAll(stopTestDb);

// ── Templates (staff) ────────────────────────

describe('template endpoints', () => {
  it('create, read, update with a version check, and soft delete', async () => {
    const created = await createTemplate(TEMPLATES.email);
    expect(created.status).toBe(201);
    expect(created.body.data).toMatchObject({
      key: 'lead.confirmation',
      version: 1,
      active: true,
      updatedBy: 'admin-key',
    });
    expect(created.body.data._id).toBeUndefined();

    const path = '/api/v1/notifications/templates/lead.confirmation';
    const updated = await request(app)
      .patch(path)
      .set(adminKey)
      .send({
        ...TEMPLATES.email,
        key: undefined,
        channel: undefined,
        version: 1,
        body: 'Hello {{name}} — {{service}}',
      });
    expect(updated.status).toBe(200);
    expect(updated.body.data).toMatchObject({ version: 2, body: 'Hello {{name}} — {{service}}' });

    const stale = await request(app)
      .patch(path)
      .set(adminKey)
      .send({ ...TEMPLATES.email, key: undefined, channel: undefined, version: 1 });
    expect(stale.status).toBe(409);
    expect(stale.body.error).toMatchObject({ code: 'TEMPLATE_CHANGED', details: { version: 2 } });

    expect((await request(app).get('/api/v1/notifications/templates').set(adminKey)).body.data).toHaveLength(1);
    expect((await request(app).delete(path).set(adminKey)).status).toBe(204);
    expect((await request(app).get(path).set(adminKey)).body.error.code).toBe('TEMPLATE_NOT_FOUND');
    // Keys are never reused, so old log entries keep meaning one template.
    expect((await createTemplate(TEMPLATES.email)).body.error.code).toBe('TEMPLATE_EXISTS');
  });

  it('validates template content', async () => {
    const undeclared = await createTemplate({ ...TEMPLATES.email, variables: ['name'] });
    expect(undeclared.status).toBe(400);
    expect(undeclared.body.error.code).toBe('VALIDATION_FAILED');
    expect(undeclared.body.error.details[0].message).toBe('Placeholder {{service}} is not declared');
    const marketingSms = await createTemplate({
      key: 'promo.sms',
      channel: 'sms',
      body: 'Sale!',
      transactional: false,
    });
    expect(marketingSms.body.error.details[0].message).toBe('SMS templates must be transactional');
    expect((await createTemplate({ ...TEMPLATES.email, key: 'Bad Key' })).status).toBe(400);
    expect((await createTemplate({ ...TEMPLATES.email, channel: 'pigeon' })).status).toBe(400);
  });

  it('is limited to notifications:manage (OPS_ADMIN, CONTENT)', async () => {
    expect((await request(app).get('/api/v1/notifications/templates')).status).toBe(401);
    const exec = await staffSession(app, 'SALES_EXEC');
    expect((await createTemplate(TEMPLATES.email, exec.auth)).status).toBe(403);
    const content = await staffSession(app, 'CONTENT');
    const created = await createTemplate(TEMPLATES.email, content.auth);
    expect(created.status).toBe(201);
    expect(created.body.data.updatedBy).toBe(content.ref);
  });
});

// ── notify() ─────────────────────────────────

describe('notify()', () => {
  it('renders and queues a PENDING notification without sending, returning only a receipt', async () => {
    await createTemplate(TEMPLATES.email);
    const { notification, created } = await notify(emailRequest(), NOW);
    expect(created).toBe(true);
    expect(notification).toEqual({
      ref: expect.stringMatching(/^NTF-[A-Z0-9]{16,}$/),
      status: 'PENDING',
      channel: 'email',
      templateKey: 'lead.confirmation',
    });
    const stored = await Notification.findOne({ ref: notification.ref }).lean();
    expect(stored).toMatchObject({
      to: 'priya@zenith.in',
      subject: 'We received your enquiry, Priya',
      body: 'Hi Priya, thanks for asking about Virtual Office.',
      templateVersion: 1,
      attempts: 0,
    });
  });

  it('normalises Indian mobiles for WhatsApp / SMS and rejects bad recipients', async () => {
    await createTemplate(TEMPLATES.whatsapp);
    const base = { templateKey: 'lead.confirmation_whatsapp', variables: { name: 'Priya' } };
    const { notification } = await notify({ ...base, to: '98765 43210', dedupeKey: 'a' }, NOW);
    expect((await Notification.findOne({ ref: notification.ref }).lean()).to).toBe('+919876543210');
    for (const to of ['12345', 'priya@zenith.in', '+1 415 555 0100']) {
      await expect(notify({ ...base, to, dedupeKey: `bad-${to}` }, NOW)).rejects.toMatchObject({
        status: 400,
        code: 'INVALID_RECIPIENT',
      });
    }
    await createTemplate(TEMPLATES.email);
    await expect(notify(emailRequest({ to: 'not-an-email' }), NOW)).rejects.toMatchObject({
      code: 'INVALID_RECIPIENT',
    });
  });

  it('fails the caller on bad input, unknown or inactive templates and bad variables', async () => {
    await expect(notify({ templateKey: 'lead.confirmation', to: 'a@b.in' }, NOW)).rejects.toMatchObject({
      code: 'VALIDATION_FAILED',
    });
    await expect(notify(emailRequest(), NOW)).rejects.toMatchObject({ status: 404, code: 'TEMPLATE_NOT_FOUND' });
    await createTemplate(TEMPLATES.email);
    await expect(notify(emailRequest({ variables: { name: 'Priya' } }), NOW)).rejects.toMatchObject({
      code: 'INVALID_TEMPLATE_VARIABLES',
    });
    await request(app)
      .patch('/api/v1/notifications/templates/lead.confirmation')
      .set(adminKey)
      .send({ ...TEMPLATES.email, key: undefined, channel: undefined, version: 1, active: false });
    await expect(notify(emailRequest(), NOW)).rejects.toMatchObject({ status: 409, code: 'TEMPLATE_INACTIVE' });
    expect(await Notification.countDocuments()).toBe(0);
  });

  it('is idempotent on dedupeKey, including in parallel, and refuses a reused key', async () => {
    await createTemplate(TEMPLATES.email);
    const req = emailRequest({ dedupeKey: 'lead.created:VD-1:confirmation' });
    const results = await Promise.all([1, 2, 3, 4].map(() => notify(req, NOW)));
    expect(new Set(results.map((r) => r.notification.ref)).size).toBe(1);
    expect(results.filter((r) => r.created)).toHaveLength(1);
    expect(await Notification.countDocuments()).toBe(1);

    await expect(notify({ ...req, to: 'someone@else.in' }, NOW)).rejects.toMatchObject({ code: 'DEDUPE_KEY_REUSED' });
    // Same values in another key order are the same request, not a reuse.
    const reordered = { ...req, variables: { service: req.variables.service, name: req.variables.name } };
    expect((await notify(reordered, NOW)).notification.ref).toBe(results[0].notification.ref);
  });
});

// ── processDueNotifications() ────────────────

describe('processDueNotifications()', () => {
  async function queued(count = 1) {
    await createTemplate(TEMPLATES.email);
    const refs = [];
    for (let i = 0; i < count; i++) refs.push((await notify(emailRequest(), NOW)).notification.ref);
    return refs;
  }
  const stored = (ref) => Notification.findOne({ ref }).lean();

  it('sends through the provider, records ACCEPTED (not delivered) and drops the content', async () => {
    const [ref] = await queued();
    const provider = countingProvider();
    expect(await processDueNotifications({ providers: { email: provider }, now: NOW })).toEqual({
      accepted: 1,
      retry: 0,
      failed: 0,
      lost: 0,
    });
    expect(provider.sent).toEqual([
      {
        channel: 'email',
        to: 'priya@zenith.in',
        subject: 'We received your enquiry, Priya',
        body: 'Hi Priya, thanks for asking about Virtual Office.',
        idempotencyKey: ref,
      },
    ]);
    expect(await stored(ref)).toMatchObject({
      status: 'ACCEPTED',
      providerMessageId: 'fake-1',
      attempts: 1,
      subject: null,
      body: null,
      acceptedAt: NOW,
      claimToken: null,
    });
    // Nothing left to do: a second run sends nothing.
    await processDueNotifications({ providers: { email: provider }, now: later(3600) });
    expect(provider.calls).toBe(1);
  });

  it('leaves channels without a provider waiting', async () => {
    const [ref] = await queued();
    expect(await processDueNotifications({ now: NOW })).toEqual({ accepted: 0, retry: 0, failed: 0, lost: 0 });
    await processDueNotifications({ providers: { sms: countingProvider() }, now: NOW });
    expect(await stored(ref)).toMatchObject({ status: 'PENDING', attempts: 0 });
  });

  it('backs off on transient failures and succeeds on a later attempt', async () => {
    const [ref] = await queued();
    const provider = countingProvider();
    provider.failNext(1);
    expect((await processDueNotifications({ providers: { email: provider }, now: NOW })).retry).toBe(1);
    expect(await stored(ref)).toMatchObject({
      status: 'PENDING',
      attempts: 1,
      lastError: { code: 'TIMEOUT', transient: true },
      nextAttemptAt: later(RETRY_DELAYS_SECONDS[0]),
    });
    expect(await stored(ref)).toHaveProperty('body', 'Hi Priya, thanks for asking about Virtual Office.');

    // Not due yet → not retried.
    await processDueNotifications({ providers: { email: provider }, now: later(RETRY_DELAYS_SECONDS[0] - 1) });
    expect(provider.calls).toBe(1);
    await processDueNotifications({ providers: { email: provider }, now: later(RETRY_DELAYS_SECONDS[0]) });
    expect(await stored(ref)).toMatchObject({ status: 'ACCEPTED', attempts: 2 });
    expect(provider.calls).toBe(2);
  });

  it('gives up after MAX_ATTEMPTS transient failures — no infinite retries', async () => {
    const [ref] = await queued();
    const provider = countingProvider();
    provider.failNext(10);
    let at = NOW;
    for (let i = 0; i < 10; i++) {
      await processDueNotifications({ providers: { email: provider }, now: at });
      at = new Date(at.getTime() + 3600 * 1000);
    }
    expect(provider.calls).toBe(MAX_ATTEMPTS);
    expect(await stored(ref)).toMatchObject({
      status: 'FAILED',
      attempts: MAX_ATTEMPTS,
      lastError: { code: 'TIMEOUT', transient: true },
      subject: null,
      body: null,
    });
  });

  it('fails at once on a permanent error, and treats unknown errors as transient', async () => {
    const [bad, odd] = await queued(2);
    const provider = countingProvider();
    provider.failNext(1, new MessagingError('INVALID_RECIPIENT', 'no such mailbox', { transient: false }));
    provider.failNext(1, new Error('socket hang up'));
    await processDueNotifications({ providers: { email: provider }, now: NOW });
    expect(await stored(bad)).toMatchObject({
      status: 'FAILED',
      attempts: 1,
      lastError: { code: 'INVALID_RECIPIENT' },
    });
    expect(await stored(odd)).toMatchObject({
      status: 'PENDING',
      lastError: { code: 'PROVIDER_ERROR', transient: true },
    });
  });

  it('never sends one notification twice when workers run in parallel', async () => {
    await queued(6);
    const provider = countingProvider();
    const runs = await Promise.all(
      [1, 2, 3].map(() => processDueNotifications({ providers: { email: provider }, now: NOW })),
    );
    expect(runs.reduce((sum, r) => sum + r.accepted, 0)).toBe(6);
    expect(provider.calls).toBe(6);
    expect(new Set(provider.sent.map((m) => m.idempotencyKey)).size).toBe(6);
  });

  it('retries a notification whose worker died, with the same provider idempotency key', async () => {
    const [ref] = await queued();
    await Notification.updateOne(
      { ref },
      { $set: { status: 'SENDING', attempts: 1, leaseUntil: later(SEND_LEASE_SECONDS), claimToken: 'dead-worker' } },
    );
    const provider = countingProvider();
    await processDueNotifications({ providers: { email: provider }, now: later(SEND_LEASE_SECONDS - 1) });
    expect(provider.calls).toBe(0); // lease still held
    await processDueNotifications({ providers: { email: provider }, now: later(SEND_LEASE_SECONDS) });
    expect(provider.sent.map((m) => m.idempotencyKey)).toEqual([ref]);
    expect(await stored(ref)).toMatchObject({ status: 'ACCEPTED', attempts: 2 });
  });

  it('does not let a worker whose lease expired overwrite the newer outcome', async () => {
    const [ref] = await queued();
    const takeover = countingProvider();
    let nested;
    const slow = {
      async send() {
        // While this worker is "stuck", its lease runs out and another worker sends the message.
        nested = await processDueNotifications({ providers: { email: takeover }, now: later(SEND_LEASE_SECONDS) });
        throw new MessagingError('TIMEOUT', 'too slow', { transient: true });
      },
    };
    const first = await processDueNotifications({ providers: { email: slow }, now: NOW });
    expect(nested.accepted).toBe(1);
    expect(first.lost).toBe(1);
    expect(await stored(ref)).toMatchObject({ status: 'ACCEPTED', attempts: 2 });
  });

  it('does not let a stale worker overwrite a newer claim that is still sending', async () => {
    const [ref] = await queued();
    let release;
    let reached;
    const gate = new Promise((resolve) => (release = resolve));
    const inFlight = new Promise((resolve) => (reached = resolve));
    const takeover = countingProvider();
    const gated = { ...takeover, send: async (m) => (reached(), await gate, takeover.send(m)) };

    let second;
    const stale = {
      async send() {
        // Our lease runs out; another worker claims the message and is mid-send when we report our failure.
        second = processDueNotifications({ providers: { email: gated }, now: later(SEND_LEASE_SECONDS) });
        await inFlight;
        throw new MessagingError('TIMEOUT', 'too slow', { transient: true });
      },
    };
    expect((await processDueNotifications({ providers: { email: stale }, now: NOW })).lost).toBe(1);
    expect(await stored(ref)).toMatchObject({ status: 'SENDING', attempts: 2 });
    release();
    expect((await second).accepted).toBe(1);
    expect(await stored(ref)).toMatchObject({ status: 'ACCEPTED', attempts: 2 });
  });

  it('fails a reclaimed notification that already used its last attempt, without sending', async () => {
    const [ref] = await queued();
    await Notification.updateOne(
      { ref },
      { $set: { status: 'SENDING', attempts: MAX_ATTEMPTS, leaseUntil: NOW, claimToken: 'dead-worker' } },
    );
    const provider = countingProvider();
    expect((await processDueNotifications({ providers: { email: provider }, now: NOW })).failed).toBe(1);
    expect(provider.calls).toBe(0);
    expect(await stored(ref)).toMatchObject({
      status: 'FAILED',
      lastError: { code: 'ATTEMPTS_EXHAUSTED' },
      body: null,
    });
  });

  it('gives every claim a fresh lease when the run uses the real clock, even after slow sends', async () => {
    await queued(3);
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(later(1));
    const leaseLeft = [];
    const slow = {
      async send(message) {
        const { leaseUntil } = await Notification.findOne({ ref: message.idempotencyKey }).lean();
        leaseLeft.push(leaseUntil.getTime() - Date.now());
        vi.advanceTimersByTime(40_000); // each send takes 40 s — three exceed one 60 s lease
        return { providerMessageId: message.idempotencyKey };
      },
    };
    try {
      expect((await processDueNotifications({ providers: { email: slow } })).accepted).toBe(3);
    } finally {
      vi.useRealTimers();
    }
    expect(leaseLeft).toEqual([SEND_LEASE_SECONDS * 1000, SEND_LEASE_SECONDS * 1000, SEND_LEASE_SECONDS * 1000]);
  });

  it('stops after `limit` notifications per run', async () => {
    await queued(3);
    const provider = countingProvider();
    expect((await processDueNotifications({ providers: { email: provider }, now: NOW, limit: 2 })).accepted).toBe(2);
    expect(await Notification.countDocuments({ status: 'PENDING' })).toBe(1);
  });
});

// ── Log (staff) and privacy ──────────────────

describe('GET /api/v1/notifications', () => {
  it('lists notifications for notifications:read with masked recipients and no message content', async () => {
    await createTemplate(TEMPLATES.email);
    await createTemplate(TEMPLATES.whatsapp);
    await notify(emailRequest(), NOW);
    await notify(
      { templateKey: 'lead.confirmation_whatsapp', to: '9876543210', variables: { name: 'Priya' }, dedupeKey: 'w' },
      NOW,
    );

    const content = await staffSession(app, 'CONTENT');
    expect((await request(app).get('/api/v1/notifications').set(content.auth)).status).toBe(403);
    const ops = await staffSession(app, 'OPS_ADMIN');
    const res = await request(app).get('/api/v1/notifications').set(ops.auth);
    expect(res.status).toBe(200);
    expect(res.body.data.map((n) => n.to).sort()).toEqual(['*********3210', 'p***@zenith.in']);
    for (const n of res.body.data) {
      expect(Object.keys(n).sort()).toEqual(
        [
          'acceptedAt',
          'attempts',
          'channel',
          'createdAt',
          'failedAt',
          'lastError',
          'nextAttemptAt',
          'ref',
          'status',
          'templateKey',
          'templateVersion',
          'to',
          'updatedAt',
        ].sort(),
      );
    }
    const raw = JSON.stringify(res.body);
    for (const secret of ['Priya', 'priya@', '9876543210', 'Virtual Office', 'lead.created:']) {
      expect(raw).not.toContain(secret);
    }

    const filtered = await request(app).get('/api/v1/notifications').query({ channel: 'whatsapp' }).set(adminKey);
    expect(filtered.body.data.map((n) => n.channel)).toEqual(['whatsapp']);
    const page = await request(app).get('/api/v1/notifications').query({ limit: 1 }).set(adminKey);
    expect(page.body.meta.nextCursor).toEqual(expect.any(String));
  });

  it('offers no HTTP way to queue or send messages', async () => {
    for (const res of [
      await request(app).post('/api/v1/notifications').set(adminKey).send(emailRequest()),
      await request(app).post('/api/v1/notifications/send').set(adminKey).send({}),
      await request(app).post('/api/v1/notifications/process').set(adminKey).send({}),
    ]) {
      expect(res.status).toBe(404);
    }
  });
});
