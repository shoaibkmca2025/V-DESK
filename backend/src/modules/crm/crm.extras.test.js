/**
 * CRM — integration tests for attribution, the per-contact limit and the CSV export.
 * The core lead endpoints are covered in crm.test.js.
 * Run: npx vitest run src/modules/crm/crm.extras.test.js
 */
import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../../app.js';
import { clearTestDb, count, query, startTestDb, stopTestDb } from '../../../test/db.js';
import { ADMIN_KEY, staffSession } from '../../../test/staff.js';
import { cleanTouch, mobileKey } from './crm.service.js';

const app = createApp();

const postLead = (body) =>
  request(app)
    .post('/api/v1/leads')
    .send({ name: 'Asha Rao', ...body });
const staffGet = (path) => request(app).get(`/api/v1/leads${path}`).set('x-admin-key', ADMIN_KEY);

/** Parses the export body into rows of cells (cells here contain no commas or quotes, except where noted). */
const csvLines = (text) =>
  text
    .replace(/^\uFEFF/, '')
    .trim()
    .split('\r\n');

/** Pretends a lead was created earlier, to test the windows the service measures from created_at. */
const backdate = (ref, createdAt) =>
  query('UPDATE leads SET created_at = $1 WHERE $2::text IS NULL OR ref = $2', [createdAt, ref ?? null]);

beforeAll(startTestDb);
afterEach(clearTestDb);
afterAll(stopTestDb);

describe('helpers', () => {
  it('matches one mobile across formats', () => {
    for (const mobile of ['+91 98765 43210', '919876543210', '98765-43210', '9876543210']) {
      expect(mobileKey(mobile)).toBe('9876543210');
    }
    expect(mobileKey(undefined)).toBeNull();
  });

  it('drops query strings from URLs and empty touches', () => {
    // Every known field is present, null where this visit didn't carry it, so a stored touch has one shape.
    expect(
      cleanTouch({
        source: 'google',
        referrer: 'https://www.google.com/search?q=rahul+9876543210',
        landingPage: '/virtual-office?utm_source=google#form',
      }),
    ).toEqual({
      source: 'google',
      medium: null,
      campaign: null,
      term: null,
      content: null,
      referrer: 'https://www.google.com/search',
      landingPage: '/virtual-office',
      gclid: null,
      fbclid: null,
      at: null,
    });
    expect(cleanTouch({})).toBeNull();
    expect(cleanTouch(undefined)).toBeNull();
  });
});

describe('attribution', () => {
  it('stores first and last touch on the lead and shows them to staff', async () => {
    const res = await postLead({
      ref: 'VD-UTM-0001',
      mobile: '9876543210',
      attribution: {
        firstTouch: {
          source: 'google',
          medium: 'cpc',
          campaign: 'vo-mumbai',
          gclid: 'abc123',
          at: '2026-10-01T09:00:00Z',
        },
        lastTouch: { source: 'newsletter', medium: 'email', landingPage: '/virtual-office?utm_source=newsletter' },
      },
    });
    expect(res.status).toBe(201);

    const lead = (await staffGet('/VD-UTM-0001')).body.data;
    expect(lead.attribution).toEqual({
      firstTouch: {
        source: 'google',
        medium: 'cpc',
        campaign: 'vo-mumbai',
        term: null,
        content: null,
        referrer: null,
        landingPage: null,
        gclid: 'abc123',
        fbclid: null,
        at: '2026-10-01T09:00:00.000Z',
      },
      lastTouch: expect.objectContaining({ source: 'newsletter', landingPage: '/virtual-office' }),
    });
    expect(lead.mobileDigits).toBeUndefined();
  });

  it('is optional and rejects a bad date', async () => {
    expect((await postLead({ ref: 'VD-UTM-0002', mobile: '9876543211' })).status).toBe(201);
    expect((await staffGet('/VD-UTM-0002')).body.data.attribution).toEqual({ firstTouch: null, lastTouch: null });
    const bad = await postLead({ mobile: '9876543212', attribution: { firstTouch: { at: 'yesterday-ish' } } });
    expect(bad.status).toBe(400);
  });
});

describe('per-contact limit', () => {
  it('allows 3 enquiries an hour per mobile, in any format', async () => {
    for (const mobile of ['9876543210', '+91 98765 43210', '98765-43210']) {
      expect((await postLead({ mobile })).status).toBe(201);
    }
    const fourth = await postLead({ mobile: '919876543210', email: 'new@acme.in' });
    expect(fourth.status).toBe(429);
    expect(fourth.body.error.code).toBe('TOO_MANY_ENQUIRIES');
    expect(await count('leads')).toBe(3);
  });

  it('counts the email too, and lets a different contact through', async () => {
    for (let i = 0; i < 3; i++) await postLead({ email: 'asha@acme.in' });
    expect((await postLead({ email: 'ASHA@acme.in' })).status).toBe(429);
    expect((await postLead({ email: 'ravi@acme.in' })).status).toBe(201);
  });

  it('still answers a replayed ref after the limit is reached', async () => {
    await postLead({ ref: 'VD-RETRY-0001', mobile: '9876543210' });
    for (let i = 0; i < 2; i++) await postLead({ mobile: '9876543210' });
    const replay = await postLead({ ref: 'VD-RETRY-0001', mobile: '9876543210' });
    expect(replay.status).toBe(200);
    expect(replay.body.data.ref).toBe('VD-RETRY-0001');
  });

  it('only looks back one hour', async () => {
    for (let i = 0; i < 3; i++) await postLead({ mobile: '9876543210' });
    await backdate(null, new Date(Date.now() - 61 * 60 * 1000));
    expect((await postLead({ mobile: '9876543210' })).status).toBe(201);
  });
});

describe('GET /api/v1/leads/export.csv', () => {
  it('needs leads:export — managers yes, sales execs no', async () => {
    expect((await request(app).get('/api/v1/leads/export.csv')).status).toBe(401);
    const manager = await staffSession(app, 'SALES_MANAGER');
    const exec = await staffSession(app, 'SALES_EXEC');
    expect((await request(app).get('/api/v1/leads/export.csv').set(manager.auth)).status).toBe(200);
    expect((await request(app).get('/api/v1/leads/export.csv').set(exec.auth)).status).toBe(403);
  });

  it('streams a CSV with a header row, newest first, safe against formulas', async () => {
    await postLead({ ref: 'VD-CSV-0001', name: 'Older Lead', mobile: '+91 98765 43210', company: 'Acme, Pvt "Ltd"' });
    await postLead({ ref: 'VD-CSV-0002', name: '=HYPERLINK("http://evil")', email: 'x@acme.in' });

    const res = await staffGet('/export.csv');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('text/csv; charset=utf-8');
    expect(res.headers['content-disposition']).toMatch(/^attachment; filename="vdesk-leads-\d{4}-\d{2}-\d{2}\.csv"$/);
    expect(res.headers['cache-control']).toBe('no-store');
    expect(res.text.startsWith('\uFEFF')).toBe(true);

    const lines = csvLines(res.text);
    expect(lines[0]).toMatch(
      /^Ref,Created at,Name,Mobile,Email,Company,City,Service,Source,Status,Score,Assigned to,Message,/,
    );
    expect(lines[0]).toMatch(/First touch source,.*,Last touch campaign$/);
    expect(lines).toHaveLength(3);
    expect(lines[1]).toMatch(/^VD-CSV-0002,.*,"'=HYPERLINK\(""http:\/\/evil""\)",/);
    expect(lines[2]).toMatch(/^VD-CSV-0001,.*,Older Lead,'\+91 98765 43210,,"Acme, Pvt ""Ltd""",/);
  });

  it('applies the list filters and a created-at window', async () => {
    await postLead({ ref: 'VD-CSV-0101', mobile: '9876543210', city: 'Pune' });
    await postLead({ ref: 'VD-CSV-0102', mobile: '9876543211', city: 'Nashik' });
    await backdate('VD-CSV-0101', new Date('2026-01-15T00:00:00Z'));

    const pune = csvLines((await staffGet('/export.csv?city=Pune')).text);
    expect(pune.slice(1).map((l) => l.split(',')[0])).toEqual(['VD-CSV-0101']);

    const january = csvLines((await staffGet('/export.csv?from=2026-01-01&to=2026-01-31')).text);
    expect(january.slice(1).map((l) => l.split(',')[0])).toEqual(['VD-CSV-0101']);

    expect((await staffGet('/export.csv?from=2026-02-01&to=2026-01-01')).status).toBe(400);
  });
});
