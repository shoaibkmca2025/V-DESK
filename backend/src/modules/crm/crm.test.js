/**
 * CRM module — unit tests for the pure rules and integration tests for every /api/v1/leads endpoint.
 *
 * Uses test/db.js (real MongoDB in memory). ADMIN_API_KEY comes from vitest.config.js.
 * Run: npm test  (or: npx vitest run src/modules/crm/crm.test.js)
 */
import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../../app.js';
import { clearTestDb, startTestDb, stopTestDb } from '../../../test/db.js';
import { LEAD_REF_PATTERN } from './crm.constants.js';
import { Lead, LeadActivity } from './crm.model.js';
import { assertTransition, computeLeadScore, generateLeadRef } from './crm.service.js';

const app = createApp();
const ADMIN_KEY = 'test-admin-key-0123456789';

// ── Helpers ───────────────────────────────────────────────────────────────────

const validLead = (overrides = {}) => ({
  name: 'Priya Kulkarni',
  mobile: '9820194820',
  email: 'priya@zenithd2c.com',
  city: 'Mumbai',
  service: 'Virtual Office for GST',
  company: 'Zenith D2C Brands',
  source: 'Quote Modal — Direct',
  ...overrides,
});

const postLead = (body) => request(app).post('/api/v1/leads').send(body);
const staffGet = (path) => request(app).get(`/api/v1/leads${path}`).set('x-admin-key', ADMIN_KEY);
const staffPatch = (ref, body) => request(app).patch(`/api/v1/leads/${ref}`).set('x-admin-key', ADMIN_KEY).send(body);

async function createLead(overrides) {
  const res = await postLead(validLead(overrides));
  expect(res.status).toBe(201);
  return res.body.data.ref;
}

async function moveTo(ref, statuses) {
  for (const status of statuses) expect((await staffPatch(ref, { status })).status).toBe(200);
}

const softDelete = (ref) => Lead.updateOne({ ref }, { deletedAt: new Date() });

// ── Unit: pure rules ─────────────────────────────────────────────────────────

describe('crm rules', () => {
  it('scores like the frontend calculateLeadScore', () => {
    expect(computeLeadScore({})).toBe(40);
    expect(computeLeadScore({ email: 'a@gmail.com' })).toBe(40);
    expect(computeLeadScore({ email: 'a@yahoo.co.in' })).toBe(40);
    expect(computeLeadScore({ email: 'a@corp.com', company: 'Corp', status: 'QUALIFIED' })).toBe(80);
    expect(computeLeadScore({ mobile: '9820194820' })).toBe(60);
  });

  it('caps the score at 100', () => {
    const lead = { mobile: '9820194820', email: 'a@corp.com', company: 'Corp', status: 'QUALIFIED' };
    expect(computeLeadScore(lead)).toBe(100);
  });

  it('allows one step forward or LOST from open stages', () => {
    expect(() => assertTransition('NEW', 'CONTACTED')).not.toThrow();
    expect(() => assertTransition('NEGOTIATION', 'WON')).not.toThrow();
    expect(() => assertTransition('PROPOSAL', 'LOST')).not.toThrow();
  });

  it('rejects skips, backward moves and leaving terminal states', () => {
    for (const [from, to] of [
      ['NEW', 'QUALIFIED'],
      ['PROPOSAL', 'CONTACTED'],
      ['WON', 'LOST'],
      ['LOST', 'NEW'],
    ]) {
      expect(() => assertTransition(from, to)).toThrow(expect.objectContaining({ status: 409 }));
    }
  });

  it('generates unique refs in the documented VD- format', () => {
    const refs = new Set(Array.from({ length: 200 }, generateLeadRef));
    expect(refs.size).toBe(200);
    for (const ref of refs) expect(ref).toMatch(LEAD_REF_PATTERN);
  });
});

// ── Integration ──────────────────────────────────────────────────────────────

describe('crm module', () => {
  beforeAll(startTestDb);
  afterEach(clearTestDb);
  afterAll(stopTestDb);

  // ── POST /api/v1/leads ────────────────────────────────────────────────────

  describe('POST /api/v1/leads (public)', () => {
    it('creates a NEW lead and returns only a receipt', async () => {
      const res = await postLead(validLead());

      expect(res.status).toBe(201);
      expect(Object.keys(res.body.data).sort()).toEqual(['createdAt', 'ref']);
      expect(res.body.data.ref).toMatch(LEAD_REF_PATTERN);

      const stored = await Lead.findOne({ ref: res.body.data.ref }).lean();
      expect(stored).toMatchObject({ name: 'Priya Kulkarni', status: 'NEW', score: 85, assignedTo: null });
      expect(stored.deletedAt).toBeNull();
    });

    it('does not need an admin key', async () => {
      expect((await postLead(validLead())).status).toBe(201);
    });

    it('records a "created" activity', async () => {
      const ref = await createLead();
      const activities = await LeadActivity.find({ leadRef: ref }).lean();
      expect(activities).toHaveLength(1);
      expect(activities[0]).toMatchObject({ type: 'created', to: 'NEW', actor: 'public' });
    });

    it('ignores a status sent by the client and drops unknown fields', async () => {
      const ref = await createLead({ status: 'WON', score: 999, isAdmin: true });
      const stored = await Lead.findOne({ ref }).lean();
      expect(stored.status).toBe('NEW');
      expect(stored.score).toBe(85);
      expect(stored.isAdmin).toBeUndefined();
    });

    it('treats empty strings from untouched inputs as absent', async () => {
      const ref = await createLead({ company: '', email: '', notes: '   ' });
      const stored = await Lead.findOne({ ref }).lean();
      expect(stored).toMatchObject({ company: '', email: '', notes: '', score: 60 });
    });

    it('accepts a client ref and is idempotent on replay', async () => {
      const first = await postLead(validLead({ ref: 'VD-MUM-8921' }));
      const replay = await postLead(validLead({ ref: 'VD-MUM-8921', name: 'Someone Else' }));

      expect(first.status).toBe(201);
      expect(replay.status).toBe(200);
      expect(replay.body.data).toEqual(first.body.data);
      expect(await Lead.countDocuments({ ref: 'VD-MUM-8921' })).toBe(1);
      expect((await Lead.findOne({ ref: 'VD-MUM-8921' }).lean()).name).toBe('Priya Kulkarni');
    });

    it('does not reveal stored details when a ref is replayed', async () => {
      await createLead({ ref: 'VD-SECRET-1' });
      const res = await postLead({ ref: 'VD-SECRET-1', name: 'Probe', mobile: '9000000000' });
      expect(res.status).toBe(200);
      expect(JSON.stringify(res.body)).not.toContain('priya');
      expect(JSON.stringify(res.body)).not.toContain('9820194820');
    });

    it('treats a replayed ref of a soft-deleted lead as a replay too', async () => {
      const ref = await createLead({ ref: 'VD-GONE-0001' });
      await softDelete(ref);
      expect((await postLead(validLead({ ref }))).status).toBe(200);
      expect(await Lead.countDocuments({ ref })).toBe(1);
    });

    it('normalises a lower-case client ref', async () => {
      const res = await postLead(validLead({ ref: 'vd-abc-1234' }));
      expect(res.status).toBe(201);
      expect(res.body.data.ref).toBe('VD-ABC-1234');
    });

    it('accepts mobile numbers with +91, spaces and dashes', async () => {
      for (const mobile of ['+91 98765 43210', '919876543210', '98765-43210']) {
        expect((await postLead(validLead({ mobile }))).status).toBe(201);
      }
    });

    it('accepts email-only and mobile-only leads', async () => {
      expect((await postLead(validLead({ mobile: undefined }))).status).toBe(201);
      expect((await postLead(validLead({ email: undefined }))).status).toBe(201);
    });

    it.each([
      ['name is missing', { name: undefined }, 'name'],
      ['name is blank', { name: '   ' }, 'name'],
      ['mobile is invalid', { mobile: '12345' }, 'mobile'],
      ['mobile starts with 0–5', { mobile: '5123456789' }, 'mobile'],
      ['email is invalid', { email: 'not-an-email' }, 'email'],
      ['ref has a bad format', { ref: 'LEAD-1' }, 'ref'],
      ['there is no mobile or email', { mobile: '', email: '' }, 'mobile'],
      ['notes are too long', { notes: 'x'.repeat(2001) }, 'notes'],
    ])('returns 400 VALIDATION_FAILED when %s', async (_label, overrides, path) => {
      const res = await postLead(validLead(overrides));
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_FAILED');
      expect(res.body.error.details.map((d) => d.path)).toContain(path);
      expect(await Lead.countDocuments()).toBe(0);
    });
  });

  // ── Staff auth ────────────────────────────────────────────────────────────

  describe('staff authentication (x-admin-key)', () => {
    const staffRoutes = [
      ['get', '/api/v1/leads'],
      ['get', '/api/v1/leads/stats'],
      ['get', '/api/v1/leads/VD-ANY-0001'],
      ['patch', '/api/v1/leads/VD-ANY-0001'],
    ];

    it.each(staffRoutes)('%s %s returns 401 without a key', async (method, path) => {
      const res = await request(app)[method](path).send({ status: 'CONTACTED' });
      expect(res.status).toBe(401);
      expect(res.body.error).toMatchObject({ code: 'ADMIN_KEY_INVALID' });
      expect(res.body.error.requestId).toBeTruthy();
    });

    it.each(staffRoutes)('%s %s returns 401 with a wrong key', async (method, path) => {
      const res = await request(app)[method](path).set('x-admin-key', 'wrong-key').send({ status: 'CONTACTED' });
      expect(res.status).toBe(401);
    });
  });

  // ── GET /api/v1/leads ─────────────────────────────────────────────────────

  describe('GET /api/v1/leads', () => {
    it('returns an empty page when there are no leads', async () => {
      const res = await staffGet('');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ data: [], meta: { limit: 25, nextCursor: null } });
    });

    it('returns leads newest first with frontend field names and no internal fields', async () => {
      const older = await createLead({ name: 'Older' });
      const newer = await createLead({ name: 'Newer' });

      const res = await staffGet('');
      expect(res.body.data.map((l) => l.ref)).toEqual([newer, older]);
      const lead = res.body.data[0];
      for (const field of ['ref', 'name', 'mobile', 'email', 'city', 'service', 'company', 'notes', 'source']) {
        expect(lead).toHaveProperty(field);
      }
      expect(lead).toMatchObject({ status: 'NEW', score: 85 });
      expect(lead._id).toBeUndefined();
      expect(lead.__v).toBeUndefined();
      expect(lead.deletedAt).toBeUndefined();
    });

    it('excludes soft-deleted leads', async () => {
      const ref = await createLead();
      await createLead({ name: 'Kept' });
      await softDelete(ref);
      const res = await staffGet('');
      expect(res.body.data.map((l) => l.name)).toEqual(['Kept']);
    });

    it('filters by status, city, source and assignedTo', async () => {
      const qualified = await createLead({ city: 'Pune', source: 'Contact Form' });
      await createLead({ city: 'Nashik', source: 'Footer VIP Rate Desk' });
      await moveTo(qualified, ['CONTACTED', 'QUALIFIED']);
      await staffPatch(qualified, { assignedTo: 'sales.exec@vdesk.in' });

      const refsFor = async (query) => (await staffGet(query)).body.data.map((l) => l.ref);
      expect(await refsFor('?status=QUALIFIED')).toEqual([qualified]);
      expect(await refsFor('?city=Pune')).toEqual([qualified]);
      expect(await refsFor('?source=Contact%20Form')).toEqual([qualified]);
      expect(await refsFor('?assignedTo=sales.exec%40vdesk.in')).toEqual([qualified]);
    });

    it('searches name, mobile, email and city case-insensitively, treating regex characters literally', async () => {
      const ref = await createLead({ name: 'Rajesh Patel', mobile: '9422238491', email: 'rajesh@patel.in' });
      await createLead({ name: 'Other (Person)' });

      for (const q of ['rajesh', 'PATEL', '94222', 'patel.in']) {
        expect((await staffGet(`?q=${encodeURIComponent(q)}`)).body.data.map((l) => l.ref)).toEqual([ref]);
      }
      expect((await staffGet('?q=.*')).body.data).toHaveLength(0);
      expect((await staffGet(`?q=${encodeURIComponent('(Person)')}`)).body.data).toHaveLength(1);
    });

    it('pages through every lead exactly once with the cursor', async () => {
      const created = [];
      for (let i = 0; i < 5; i++) created.push(await createLead({ name: `Lead ${i}` }));

      const seen = [];
      let cursor;
      do {
        const res = await staffGet(`?limit=2${cursor ? `&cursor=${cursor}` : ''}`);
        expect(res.status).toBe(200);
        expect(res.body.data.length).toBeLessThanOrEqual(2);
        seen.push(...res.body.data.map((l) => l.ref));
        cursor = res.body.meta.nextCursor;
      } while (cursor);

      expect(seen).toEqual([...created].reverse());
    });

    it('breaks createdAt ties by ref so no lead is skipped', async () => {
      const at = new Date('2026-10-01T10:00:00Z');
      const refs = ['VD-TIE-0001', 'VD-TIE-0002', 'VD-TIE-0003'];
      await Lead.insertMany(refs.map((ref) => ({ ref, name: ref, score: 40, createdAt: at, updatedAt: at })));

      const page1 = await staffGet('?limit=2');
      const page2 = await staffGet(`?limit=2&cursor=${page1.body.meta.nextCursor}`);
      expect([...page1.body.data, ...page2.body.data].map((l) => l.ref)).toEqual([...refs].reverse());
      expect(page2.body.meta.nextCursor).toBeNull();
    });

    it.each([
      ['an unknown status', '?status=CONVERTED'],
      ['limit above 100', '?limit=101'],
      ['limit of 0', '?limit=0'],
    ])('returns 400 VALIDATION_FAILED for %s', async (_label, query) => {
      const res = await staffGet(query);
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_FAILED');
    });

    it('returns 400 INVALID_CURSOR for a tampered cursor', async () => {
      const res = await staffGet('?cursor=not-a-real-cursor');
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_CURSOR');
    });
  });

  // ── GET /api/v1/leads/:ref ────────────────────────────────────────────────

  describe('GET /api/v1/leads/:ref', () => {
    it('returns the lead with its activity timeline', async () => {
      const ref = await createLead();
      await staffPatch(ref, { status: 'CONTACTED', note: 'Called, interested in Mumbai VO' });

      const res = await staffGet(`/${ref}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({ ref, name: 'Priya Kulkarni', status: 'CONTACTED' });
      expect(res.body.data._id).toBeUndefined();
      expect(res.body.data.activities.map((a) => a.type)).toEqual(['created', 'status_changed', 'note']);
      for (const activity of res.body.data.activities) {
        expect(activity._id).toBeUndefined();
        expect(activity.createdAt).toBeTruthy();
      }
    });

    it('finds a lead by a lower-case ref', async () => {
      const ref = await createLead();
      expect((await staffGet(`/${ref.toLowerCase()}`)).status).toBe(200);
    });

    it('returns 404 LEAD_NOT_FOUND for an unknown ref', async () => {
      const res = await staffGet('/VD-NOPE-0000');
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('LEAD_NOT_FOUND');
    });

    it('returns 404 for a soft-deleted lead', async () => {
      const ref = await createLead();
      await softDelete(ref);
      expect((await staffGet(`/${ref}`)).status).toBe(404);
    });
  });

  // ── PATCH /api/v1/leads/:ref ──────────────────────────────────────────────

  describe('PATCH /api/v1/leads/:ref', () => {
    it('walks the full pipeline to WON and records each step', async () => {
      const ref = await createLead();
      await moveTo(ref, ['CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON']);

      const lead = (await staffGet(`/${ref}`)).body.data;
      expect(lead.status).toBe('WON');
      const moves = lead.activities.filter((a) => a.type === 'status_changed');
      expect(moves.map((a) => `${a.from}>${a.to}`)).toEqual([
        'NEW>CONTACTED',
        'CONTACTED>QUALIFIED',
        'QUALIFIED>PROPOSAL',
        'PROPOSAL>NEGOTIATION',
        'NEGOTIATION>WON',
      ]);
      expect(moves.every((a) => a.actor === 'admin-key')).toBe(true);
    });

    it('recomputes the score on status change (+15 only while QUALIFIED, as on the client)', async () => {
      const ref = await createLead({ email: 'a@gmail.com', company: '' }); // 40 + 20 mobile = 60
      await moveTo(ref, ['CONTACTED']);
      expect((await staffPatch(ref, { status: 'QUALIFIED' })).body.data.score).toBe(75);
      expect((await staffPatch(ref, { status: 'PROPOSAL' })).body.data.score).toBe(60);
    });

    it('moves any open lead to LOST', async () => {
      const ref = await createLead();
      await moveTo(ref, ['CONTACTED', 'QUALIFIED']);
      const res = await staffPatch(ref, { status: 'LOST' });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('LOST');
    });

    it('returns 409 INVALID_STATUS_TRANSITION when skipping a stage', async () => {
      const ref = await createLead();
      const res = await staffPatch(ref, { status: 'PROPOSAL' });
      expect(res.status).toBe(409);
      expect(res.body.error).toMatchObject({
        code: 'INVALID_STATUS_TRANSITION',
        details: { from: 'NEW', to: 'PROPOSAL', allowed: ['CONTACTED', 'LOST'] },
      });
      expect((await Lead.findOne({ ref }).lean()).status).toBe('NEW');
    });

    it('returns 409 when leaving a terminal status', async () => {
      const ref = await createLead();
      await moveTo(ref, ['LOST']);
      const res = await staffPatch(ref, { status: 'NEW' });
      expect(res.status).toBe(409);
      expect(res.body.error.details.allowed).toEqual([]);
    });

    it('treats setting the current status as a no-op', async () => {
      const ref = await createLead();
      const res = await staffPatch(ref, { status: 'NEW' });
      expect(res.status).toBe(200);
      expect(res.body.data.activities).toHaveLength(1);
    });

    it('assigns and unassigns a lead', async () => {
      const ref = await createLead();
      expect((await staffPatch(ref, { assignedTo: 'Anita (Sales)' })).body.data.assignedTo).toBe('Anita (Sales)');

      const res = await staffPatch(ref, { assignedTo: null });
      expect(res.body.data.assignedTo).toBeNull();
      expect(res.body.data.activities.filter((a) => a.type === 'assigned')).toHaveLength(2);
    });

    it('adds a note without touching status or the visitor message', async () => {
      const ref = await createLead({ notes: 'Need GST address in BKC' });
      const res = await staffPatch(ref, { note: 'Sent brochure on WhatsApp' });
      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({ status: 'NEW', notes: 'Need GST address in BKC' });
      expect(res.body.data.activities.at(-1)).toMatchObject({
        type: 'note',
        note: 'Sent brochure on WhatsApp',
        actor: 'admin-key',
      });
    });

    it('updates updatedAt when the lead changes', async () => {
      const ref = await createLead();
      const before = (await Lead.findOne({ ref }).lean()).updatedAt;
      await new Promise((resolve) => setTimeout(resolve, 5));
      await staffPatch(ref, { status: 'CONTACTED' });
      expect((await Lead.findOne({ ref }).lean()).updatedAt.getTime()).toBeGreaterThan(before.getTime());
    });

    it.each([
      ['an empty body', {}],
      ['an unknown status', { status: 'CONVERTED' }],
      ['a blank note', { note: '  ' }],
      ['only unknown fields', { name: 'Hacked' }],
    ])('returns 400 VALIDATION_FAILED for %s', async (_label, body) => {
      const ref = await createLead();
      const res = await staffPatch(ref, body);
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_FAILED');
    });

    it('returns 404 LEAD_NOT_FOUND for unknown and soft-deleted leads', async () => {
      expect((await staffPatch('VD-NOPE-0000', { status: 'CONTACTED' })).body.error.code).toBe('LEAD_NOT_FOUND');
      const ref = await createLead();
      await softDelete(ref);
      expect((await staffPatch(ref, { status: 'CONTACTED' })).status).toBe(404);
    });
  });

  // ── GET /api/v1/leads/stats ───────────────────────────────────────────────

  describe('GET /api/v1/leads/stats', () => {
    it('returns zeros for every status when there are no leads', async () => {
      const res = await staffGet('/stats');
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual({
        total: 0,
        byStatus: { NEW: 0, CONTACTED: 0, QUALIFIED: 0, PROPOSAL: 0, NEGOTIATION: 0, WON: 0, LOST: 0 },
        bySource: {},
      });
    });

    it('counts leads by status and source, excluding soft-deleted leads', async () => {
      await createLead({ source: 'Contact Form' });
      const contacted = await createLead({ source: 'Contact Form' });
      await createLead({ source: '' });
      const deleted = await createLead({ source: 'Quote Modal — Direct' });
      await moveTo(contacted, ['CONTACTED']);
      await softDelete(deleted);

      const { data } = (await staffGet('/stats')).body;
      expect(data.total).toBe(3);
      expect(data.byStatus).toMatchObject({ NEW: 2, CONTACTED: 1, WON: 0 });
      expect(data.bySource).toEqual({ 'Contact Form': 2, Unknown: 1 });
    });
  });
});
