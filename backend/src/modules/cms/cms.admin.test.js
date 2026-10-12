/**
 * CMS — staff editing: draft → publish, versions, revisions, sanitising, trust-claim approval and access.
 * Run: npx vitest run src/modules/cms/cms.admin.test.js
 */
import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../../app.js';
import { clearTestDb, startTestDb, stopTestDb } from '../../../test/db.js';
import { ADMIN_KEY, staffSession } from '../../../test/staff.js';

const app = createApp();
const pub = (path) => request(app).get(`/api/v1/content${path}`);
const admin = (method, path, auth = { 'x-admin-key': ADMIN_KEY }) =>
  request(app)[method](`/api/v1/content/admin${path}`).set(auth);

const FAQ = {
  title: 'GST Registration',
  icon: 'ph-receipt',
  items: [['Which documents do I need?', 'PAN, Aadhaar, photographs, bank proof and address proof.']],
};

beforeAll(startTestDb);
afterEach(clearTestDb);
afterAll(stopTestDb);

describe('draft → publish', () => {
  it('keeps the site on the published copy until a new version is published', async () => {
    const created = await admin('put', '/faqs/gst').send({ data: FAQ, order: 2 });
    expect(created.status).toBe(201);
    expect(created.body.data).toMatchObject({ key: 'gst', version: 1, published: null, hasUnpublishedChanges: true });
    expect((await pub('/faqs/gst')).status).toBe(404);

    const published = await admin('post', '/faqs/gst/publish').send({ version: 1 });
    expect(published.body.data).toMatchObject({
      publishedVersion: 1,
      publishedBy: 'admin-key',
      hasUnpublishedChanges: false,
    });
    expect((await pub('/faqs/gst')).body.data).toEqual({ id: 'gst', ...FAQ });

    const edited = await admin('put', '/faqs/gst').send({
      data: { ...FAQ, title: 'GST — the essentials' },
      version: 1,
    });
    expect(edited.status).toBe(200);
    expect(edited.body.data).toMatchObject({ version: 2, publishedVersion: 1, hasUnpublishedChanges: true });
    expect((await pub('/faqs/gst')).body.data.title).toBe('GST Registration');

    await admin('post', '/faqs/gst/publish').send({ version: 2 });
    expect((await pub('/faqs/gst')).body.data.title).toBe('GST — the essentials');

    const revisions = (await admin('get', '/faqs/gst/revisions')).body.data;
    expect(revisions.map((r) => [r.version, r.data.title])).toEqual([
      [2, 'GST — the essentials'],
      [1, 'GST Registration'],
    ]);
  });

  it('refuses stale versions and duplicate keys', async () => {
    await admin('put', '/faqs/gst').send({ data: FAQ });
    await admin('put', '/faqs/gst').send({ data: FAQ, version: 1 }); // now version 2

    const stale = await admin('put', '/faqs/gst').send({ data: FAQ, version: 1 });
    expect(stale.status).toBe(409);
    expect(stale.body.error).toMatchObject({ code: 'CONTENT_CHANGED', details: { version: 2 } });
    expect((await admin('post', '/faqs/gst/publish').send({ version: 1 })).body.error.code).toBe('CONTENT_CHANGED');
    expect((await admin('put', '/faqs/gst').send({ data: FAQ })).body.error.code).toBe('CONTENT_EXISTS');
  });

  it('validates the content shape per type', async () => {
    const tupleWrong = await admin('put', '/faqs/gst').send({ data: { ...FAQ, items: [['Only a question']] } });
    expect(tupleWrong.status).toBe(400);
    expect(tupleWrong.body.error.details[0].path).toMatch(/^data\.items\.0/);
    expect((await admin('put', '/faqs/gst').send({ data: { ...FAQ, extra: 1 } })).status).toBe(400);
    expect((await admin('put', '/faqs/Not_A_Slug').send({ data: FAQ })).status).toBe(400);
    expect((await admin('put', '/guides/g').send({ data: { title: 'x' } })).status).toBe(400);
  });

  it('unpublishes, deletes, and lets a deleted key be created again', async () => {
    await admin('put', '/faqs/gst').send({ data: FAQ });
    await admin('post', '/faqs/gst/publish').send({ version: 1 });
    await admin('post', '/faqs/gst/unpublish');
    expect((await pub('/faqs/gst')).status).toBe(404);
    expect((await admin('get', '/faqs/gst')).body.data.draft).toEqual(FAQ);

    expect((await admin('delete', '/faqs/gst')).status).toBe(204);
    expect((await admin('get', '/faqs/gst')).status).toBe(404);
    expect((await admin('put', '/faqs/gst').send({ data: FAQ })).status).toBe(201);
  });
});

describe('legal HTML', () => {
  it('is sanitised on save: no scripts, handlers or javascript: links', async () => {
    const res = await admin('put', '/legal/privacy').send({
      data: {
        title: 'Privacy Policy',
        content:
          '<h4>1. Data</h4><script>alert(1)</script><p onclick="steal()">We protect <a href="javascript:alert(1)">it</a>' +
          ' — <a href="https://vdesk.in/contact">contact us</a>.</p><img src=x onerror="alert(1)"><iframe src="https://evil"></iframe>',
      },
    });
    expect(res.body.data.draft.content).toBe(
      '<h4>1. Data</h4><p>We protect <a>it</a> — <a href="https://vdesk.in/contact">contact us</a>.</p>',
    );
    const empty = await admin('put', '/legal/terms').send({
      data: { title: 'Terms', content: '<script>alert(1)</script>' },
    });
    expect(empty.body.error.code).toBe('CONTENT_EMPTY');
  });
});

describe('trust claims', () => {
  const CLAIM = { value: '10,000+', label: 'Businesses served' };

  it('need a super admin and evidence to go live, and never show the evidence', async () => {
    const content = await staffSession(app, 'CONTENT');
    const superAdmin = await staffSession(app, 'SUPER_ADMIN');

    expect((await admin('put', '/trust-claims/businesses-served', content.auth).send({ data: CLAIM })).status).toBe(
      201,
    );
    const byContent = await admin('post', '/trust-claims/businesses-served/publish', content.auth).send({ version: 1 });
    expect(byContent.status).toBe(403);
    expect(byContent.body.error.code).toBe('APPROVAL_REQUIRED');

    const noEvidence = await admin('post', '/trust-claims/businesses-served/publish', superAdmin.auth).send({
      version: 1,
    });
    expect(noEvidence.body.error.code).toBe('EVIDENCE_REQUIRED');

    await admin('put', '/trust-claims/businesses-served', content.auth).send({
      data: { ...CLAIM, evidence: 'CRM export 2026-10-01: 10,214 active + past customers' },
      version: 1,
    });
    const approved = await admin('post', '/trust-claims/businesses-served/publish', superAdmin.auth).send({
      version: 2,
    });
    expect(approved.status).toBe(200);
    expect(approved.body.data.publishedBy).toBe(superAdmin.ref);
    expect((await pub('/trust-claims')).body.data).toEqual([
      { key: 'businesses-served', value: '10,000+', label: 'Businesses served' },
    ]);

    // Content staff can change the draft, but the site keeps the approved figure until it is approved again.
    await admin('put', '/trust-claims/businesses-served', content.auth).send({
      data: { ...CLAIM, value: '50,000+', evidence: 'trust me' },
      version: 2,
    });
    expect((await pub('/trust-claims/businesses-served')).body.data.value).toBe('10,000+');
  });
});

describe('access', () => {
  it('needs content:manage', async () => {
    expect((await request(app).get('/api/v1/content/admin/faqs')).status).toBe(401);
    const exec = await staffSession(app, 'SALES_EXEC');
    const ops = await staffSession(app, 'OPS_ADMIN');
    expect((await admin('get', '/faqs', exec.auth)).status).toBe(403);
    expect((await admin('get', '/faqs', ops.auth)).status).toBe(200);
  });
});
