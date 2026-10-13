/**
 * CRM — domain events: `lead.status_changed` is saved with the change it announces, and only for a real move.
 * Run: npx vitest run src/modules/crm/crm.events.test.js
 */
import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { createApp } from '../../app.js';
import { clearTestDb, startTestDb, stopTestDb } from '../../../test/db.js';
import { ADMIN_KEY } from '../../../test/staff.js';
import { DomainEvent } from '../../shared/events/events.model.js';
import { Lead, LeadActivity } from './crm.model.js';

const app = createApp();

const createLead = async () => {
  const res = await request(app)
    .post('/api/v1/leads')
    .send({ name: 'Asha Rao', mobile: '9820100001', email: 'asha@corp.test', source: 'Test' });
  expect(res.status).toBe(201);
  return res.body.data.ref;
};
const patch = (ref, body) => request(app).patch(`/api/v1/leads/${ref}`).set('x-admin-key', ADMIN_KEY).send(body);
const statusEvents = () => DomainEvent.find({ type: 'lead.status_changed' }).lean();

beforeAll(startTestDb);
afterEach(async () => {
  vi.restoreAllMocks();
  await clearTestDb();
});
afterAll(stopTestDb);

describe('lead.status_changed', () => {
  it('is published once per move, with refs and statuses only', async () => {
    const ref = await createLead();
    expect((await patch(ref, { status: 'CONTACTED' })).status).toBe(200);

    const [event, ...rest] = await statusEvents();
    expect(rest).toHaveLength(0);
    expect(event).toMatchObject({
      entity: { type: 'lead', ref },
      actor: { type: 'admin-key', id: null },
      payload: { from: 'NEW', to: 'CONTACTED' },
      status: 'PENDING',
    });
    expect(JSON.stringify(event.payload)).not.toMatch(/Asha|9820100001|corp\.test/);
  });

  it('is not published for notes, assignments, repeats of the current status or illegal moves', async () => {
    const ref = await createLead();
    expect((await patch(ref, { note: 'Called back' })).status).toBe(200);
    expect((await patch(ref, { assignedTo: 'USR-SALES1' })).status).toBe(200);
    expect((await patch(ref, { status: 'NEW' })).status).toBe(200);
    expect((await patch(ref, { status: 'WON' })).status).toBe(409);
    expect(await statusEvents()).toHaveLength(0);
  });

  it('leaves the lead and its timeline unchanged when the outbox write fails', async () => {
    const ref = await createLead();
    vi.spyOn(DomainEvent, 'create').mockRejectedValueOnce(new Error('outbox down'));

    const res = await patch(ref, { status: 'CONTACTED', note: 'Interested' });
    expect(res.status).toBe(500);
    expect((await Lead.findOne({ ref }).lean()).status).toBe('NEW');
    expect(await LeadActivity.countDocuments({ leadRef: ref, type: { $ne: 'created' } })).toBe(0);
    expect(await statusEvents()).toHaveLength(0);
  });
});
