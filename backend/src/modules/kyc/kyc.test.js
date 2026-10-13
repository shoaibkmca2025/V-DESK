/**
 * KYC — applications, signed uploads, submission, compliance review, events, audit and privacy.
 * Customer sign-in does not exist yet (identity.customer.js fails closed), so this file stands in a test principal taken
 * from an `x-test-customer` header; kyc.unconfigured.test.js covers the real, fail-closed behaviour.
 * Run: npx vitest run src/modules/kyc/kyc.test.js
 */
import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { createApp } from '../../app.js';
import { DomainEvent } from '../../shared/events/events.model.js';
import { clearTestDb, startTestDb, stopTestDb } from '../../../test/db.js';
import { ADMIN_KEY, staffSession } from '../../../test/staff.js';
import { AuditEntry } from '../../shared/audit/audit.model.js';
import { KycApplication, KycDocument } from './kyc.model.js';
import { getKycStorage } from './kyc.service.js';

vi.mock('../identity/identity.customer.js', () => import('../../../test/customer.js'));

const app = createApp();
const storage = getKycStorage();
const ALICE = { 'x-test-customer': 'CUS-ALICE' };
const BOB = { 'x-test-customer': 'CUS-BOB' };
const ADMIN_KEY_HEADER = { 'x-admin-key': ADMIN_KEY };

/** One signed-in COMPLIANCE user per test (the database is cleared after each test). */
let complianceSession = null;
async function compliance() {
  complianceSession ??= await staffSession(app, 'COMPLIANCE');
  return complianceSession;
}

const FILES = {
  'application/pdf': Buffer.concat([Buffer.from('%PDF-1.7\n'), Buffer.alloc(200, 0x20)]),
  'image/jpeg': Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(200)]),
  'image/png': Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(200)]),
};
const REQUIRED = ['pan', 'aadhaar', 'bank', 'photo'];

const create = (who = ALICE) => request(app).post('/api/v1/kyc').set(who).send({});
const get = (ref, who = ALICE) => request(app).get(`/api/v1/kyc/${ref}`).set(who);
const askUpload = (ref, body, who = ALICE) =>
  request(app).post(`/api/v1/kyc/${ref}/documents/upload-url`).set(who).send(body);
const submit = (ref, who = ALICE, body = { consent: true }) =>
  request(app).post(`/api/v1/kyc/${ref}/submit`).set(who).send(body);
const review = async (ref, id, body, auth) =>
  request(app)
    .patch(`/api/v1/kyc/${ref}/documents/${id}/review`)
    .set(auth ?? (await compliance()).auth)
    .send(body);
const downloadUrl = async (ref, id, auth) =>
  request(app)
    .post(`/api/v1/kyc/${ref}/documents/${id}/download-url`)
    .set(auth ?? (await compliance()).auth);

/** Requests an upload URL and uploads through it, like the browser would. Returns the document id. */
async function upload(ref, type, contentType = 'application/pdf', who = ALICE) {
  const body = FILES[contentType];
  const res = await askUpload(ref, { type, contentType, sizeBytes: body.length }, who);
  expect(res.status).toBe(201);
  storage.completeUpload(res.body.data.upload.url, { body, contentType });
  return res.body.data.document.id;
}

async function submittedApplication(types = REQUIRED) {
  const { ref } = (await create()).body.data;
  const ids = {};
  for (const type of types) ids[type] = await upload(ref, type);
  expect((await submit(ref)).status).toBe(200);
  return { ref, ids };
}

const events = async (type) => DomainEvent.find(type ? { type } : {}).lean();

beforeAll(startTestDb);
afterEach(async () => {
  complianceSession = null;
  vi.restoreAllMocks();
  storage.reset();
  await clearTestDb();
});
afterAll(stopTestDb);

// ── Creating ──────────────────────────────────

describe('POST /kyc', () => {
  it('opens a DRAFT application owned by the signed-in customer', async () => {
    const res = await create();
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({
      status: 'DRAFT',
      documents: [],
      requiredDocumentTypes: REQUIRED,
      missingDocumentTypes: REQUIRED,
    });
    expect(res.body.data.ref).toMatch(/^KYC-[A-Z0-9]{18,}$/);
    expect(res.body.data).not.toHaveProperty('customerId');
    expect((await KycApplication.findOne().lean()).customerId).toBe('CUS-ALICE');
  });

  it('allows one open application per customer', async () => {
    const first = await create();
    const second = await create();
    expect(second.status).toBe(409);
    expect(second.body.error).toMatchObject({ code: 'KYC_APPLICATION_EXISTS', details: { ref: first.body.data.ref } });
    expect((await create(BOB)).status).toBe(201);
  });

  it('refuses unknown fields, so the owner or status cannot be chosen by the client', async () => {
    const res = await request(app).post('/api/v1/kyc').set(ALICE).send({ customerId: 'CUS-BOB', status: 'APPROVED' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_FAILED');
  });

  it('needs a signed-in customer', async () => {
    expect((await request(app).post('/api/v1/kyc').send({})).status).toBe(401);
  });
});

// ── Upload URLs ───────────────────────────────

describe('POST /kyc/:ref/documents/upload-url', () => {
  it('records metadata and returns a short-lived signed PUT URL that is never stored', async () => {
    const { ref } = (await create()).body.data;
    const res = await askUpload(ref, { type: 'pan', contentType: 'application/pdf', sizeBytes: 1234 });
    expect(res.status).toBe(201);
    expect(res.headers['cache-control']).toBe('no-store');
    const { document, upload: signed } = res.body.data;
    expect(document).toMatchObject({ type: 'pan', status: 'UPLOAD_PENDING', contentType: 'application/pdf' });
    expect(document.id).toMatch(/^DOC-/);
    expect(signed).toMatchObject({
      method: 'PUT',
      headers: { 'Content-Type': 'application/pdf', 'Content-Length': '1234' },
    });
    expect(signed.url).toMatch(/^memory-storage:\/\/upload\//);
    const ttl = new Date(signed.expiresAt).getTime() - Date.now();
    expect(ttl).toBeGreaterThan(0);
    expect(ttl).toBeLessThanOrEqual(15 * 60 * 1000);

    const stored = await KycDocument.findOne().lean();
    expect(stored.storageKey).toMatch(new RegExp(`^kyc/${ref.toLowerCase()}/doc-[a-z0-9]+-[0-9a-f-]{36}\\.pdf$`));
    expect(JSON.stringify(stored)).not.toContain('memory-storage');
  });

  it.each([
    ['an unknown document type', { type: 'voter-id', contentType: 'application/pdf', sizeBytes: 10 }],
    ['a disallowed content type', { type: 'pan', contentType: 'text/html', sizeBytes: 10 }],
    ['an executable', { type: 'pan', contentType: 'application/x-msdownload', sizeBytes: 10 }],
    ['a file over 5 MB', { type: 'pan', contentType: 'application/pdf', sizeBytes: 5 * 1024 * 1024 + 1 }],
    ['an empty file', { type: 'pan', contentType: 'application/pdf', sizeBytes: 0 }],
    ['a fractional size', { type: 'pan', contentType: 'application/pdf', sizeBytes: 10.5 }],
    ['a size sent as text', { type: 'pan', contentType: 'application/pdf', sizeBytes: '10' }],
    ['a client storage key', { type: 'pan', contentType: 'application/pdf', sizeBytes: 10, key: '../../etc' }],
    ['a client file name', { type: 'pan', contentType: 'application/pdf', sizeBytes: 10, fileName: 'pan.pdf' }],
  ])('rejects %s', async (_label, body) => {
    const { ref } = (await create()).body.data;
    const res = await askUpload(ref, body);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_FAILED');
    expect(await KycDocument.countDocuments()).toBe(0);
  });

  it('accepts exactly 5 MB and the three allowed formats', async () => {
    const { ref } = (await create()).body.data;
    const max = { type: 'pan', contentType: 'application/pdf', sizeBytes: 5 * 1024 * 1024 };
    expect((await askUpload(ref, max)).status).toBe(201);
    expect((await askUpload(ref, { type: 'photo', contentType: 'image/jpeg', sizeBytes: 10 })).status).toBe(201);
    expect((await askUpload(ref, { type: 'signature', contentType: 'image/png', sizeBytes: 10 })).status).toBe(201);
  });

  it('rejects malformed refs before touching the database', async () => {
    const body = { type: 'pan', contentType: 'application/pdf', sizeBytes: 10 };
    for (const ref of ['not-a-ref', 'KYC-$where', 'BK-ABCDEFGHIJKL']) {
      const res = await askUpload(ref, body);
      expect(res.status).toBe(400);
    }
  });

  it("hides another customer's application", async () => {
    const { ref } = (await create()).body.data;
    const res = await askUpload(ref, { type: 'pan', contentType: 'application/pdf', sizeBytes: 10 }, BOB);
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('KYC_APPLICATION_NOT_FOUND');
  });

  it('replaces a pending document of the same type, keeping the old one soft-deleted', async () => {
    const { ref } = (await create()).body.data;
    const first = await upload(ref, 'pan');
    const second = await upload(ref, 'pan', 'image/png');
    const view = (await get(ref)).body.data;
    expect(view.documents.map((d) => d.id)).toEqual([second]);
    const old = await KycDocument.findOne({ ref: first }).lean();
    expect(old.deletedAt).toBeInstanceOf(Date);
  });

  it('handles parallel uploads of different types without losing any', async () => {
    const { ref } = (await create()).body.data;
    const results = await Promise.all(
      REQUIRED.map((type) => askUpload(ref, { type, contentType: 'application/pdf', sizeBytes: 10 })),
    );
    expect(results.map((r) => r.status)).toEqual([201, 201, 201, 201]);
    expect((await get(ref)).body.data.missingDocumentTypes).toEqual([]);
  });

  it('locks documents while the application is under review', async () => {
    const { ref } = await submittedApplication();
    const res = await askUpload(ref, { type: 'signature', contentType: 'image/png', sizeBytes: 10 });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('KYC_APPLICATION_LOCKED');
  });
});

// ── Submitting ────────────────────────────────

describe('POST /kyc/:ref/submit', () => {
  it('verifies the uploads, moves to UNDER_REVIEW and publishes kyc.submitted atomically', async () => {
    const { ref } = (await create()).body.data;
    for (const type of REQUIRED) await upload(ref, type);
    const res = await submit(ref);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('UNDER_REVIEW');
    expect(res.body.data.documents.every((d) => d.status === 'UPLOADED')).toBe(true);

    const [event] = await events('kyc.submitted');
    expect(event).toMatchObject({
      entity: { type: 'kyc_application', ref },
      actor: { type: 'customer', id: 'CUS-ALICE' },
      payload: { submission: 1 },
    });
  });

  it('requires consent', async () => {
    const { ref } = (await create()).body.data;
    for (const body of [{}, { consent: false }, { consent: 'yes' }]) {
      expect((await submit(ref, ALICE, body)).status).toBe(400);
    }
  });

  it('lists missing required documents', async () => {
    const { ref } = (await create()).body.data;
    await upload(ref, 'pan');
    const res = await submit(ref);
    expect(res.status).toBe(409);
    expect(res.body.error).toMatchObject({
      code: 'DOCUMENTS_MISSING',
      details: { missing: ['aadhaar', 'bank', 'photo'] },
    });
  });

  it('refuses a document whose file never arrived', async () => {
    const { ref } = (await create()).body.data;
    for (const type of REQUIRED.slice(1)) await upload(ref, type);
    await askUpload(ref, { type: 'pan', contentType: 'application/pdf', sizeBytes: 10 });
    const res = await submit(ref);
    expect(res.status).toBe(409);
    expect(res.body.error).toMatchObject({ code: 'DOCUMENT_NOT_UPLOADED', details: { type: 'pan' } });
    expect((await KycApplication.findOne().lean()).status).toBe('DRAFT');
  });

  it.each([
    [
      'content that is not a PDF',
      { body: Buffer.from('<html><script>…</script></html>'), contentType: 'application/pdf' },
    ],
    ['a different content type', { body: FILES['image/png'], contentType: 'image/png' }],
    [
      'a different size',
      { body: Buffer.concat([FILES['application/pdf'], Buffer.alloc(5)]), contentType: 'application/pdf' },
    ],
  ])('refuses an upload with %s than declared', async (_label, object) => {
    const { ref } = (await create()).body.data;
    for (const type of REQUIRED.slice(1)) await upload(ref, type);
    const pdf = FILES['application/pdf'];
    await askUpload(ref, { type: 'pan', contentType: 'application/pdf', sizeBytes: pdf.length });
    const { storageKey } = await KycDocument.findOne({ type: 'pan' }).lean();
    storage.putObject(storageKey, object);
    const res = await submit(ref);
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('DOCUMENT_UPLOAD_INVALID');
  });

  it('saves nothing — no status change, no event, no audit — when the transaction fails', async () => {
    const { ref } = (await create()).body.data;
    for (const type of REQUIRED) await upload(ref, type);
    vi.spyOn(DomainEvent, 'create').mockRejectedValueOnce(new Error('outbox down'));
    expect((await submit(ref)).status).toBe(500);

    expect((await KycApplication.findOne().lean()).status).toBe('DRAFT');
    expect(await KycDocument.countDocuments({ status: 'UPLOADED' })).toBe(0);
    expect(await AuditEntry.countDocuments({ action: 'kyc.application.submitted' })).toBe(0);
    expect(await events()).toHaveLength(0);
  });

  it('cannot submit twice', async () => {
    const { ref } = await submittedApplication();
    const res = await submit(ref);
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('INVALID_STATUS_TRANSITION');
    expect(await events('kyc.submitted')).toHaveLength(1);
  });
});

// ── Review ────────────────────────────────────

describe('PATCH /kyc/:ref/documents/:id/review', () => {
  it('approves the application once every document is approved, publishing kyc.approved once', async () => {
    const { ref, ids } = await submittedApplication();
    for (const type of REQUIRED.slice(0, -1)) {
      const res = await review(ref, ids[type], { decision: 'APPROVE' });
      expect(res.status).toBe(200);
      expect(res.body.data.application.status).toBe('UNDER_REVIEW');
    }
    const last = await review(ref, ids.photo, { decision: 'APPROVE' });
    expect(last.body.data.application.status).toBe('APPROVED');
    expect(last.body.data.document).toMatchObject({ status: 'APPROVED', reviewedBy: (await compliance()).ref });
    expect(await events('kyc.approved')).toHaveLength(1);

    // The customer may open a new application once this one is approved.
    expect((await create()).status).toBe(201);
  });

  it('approves exactly once when the last two documents are approved at the same time', async () => {
    const { ref, ids } = await submittedApplication();
    await review(ref, ids.pan, { decision: 'APPROVE' });
    await review(ref, ids.aadhaar, { decision: 'APPROVE' });
    const results = await Promise.all([
      review(ref, ids.bank, { decision: 'APPROVE' }),
      review(ref, ids.photo, { decision: 'APPROVE' }),
    ]);
    expect(results.map((r) => r.status)).toEqual([200, 200]);
    expect((await KycApplication.findOne().lean()).status).toBe('APPROVED');
    expect(await events('kyc.approved')).toHaveLength(1);
  });

  it('requires a reason to reject', async () => {
    const { ref, ids } = await submittedApplication();
    for (const body of [
      { decision: 'REJECT' },
      { decision: 'REJECT', reason: '   ' },
      { decision: 'REJECT', reason: 'no' },
    ]) {
      const res = await review(ref, ids.pan, body);
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_FAILED');
    }
    expect((await review(ref, ids.pan, { decision: 'MAYBE' })).status).toBe(400);
    expect((await review(ref, ids.pan, { decision: 'APPROVE', reason: 'x'.repeat(10) })).status).toBe(400);
    expect((await KycDocument.findOne({ ref: ids.pan }).lean()).status).toBe('UPLOADED');
  });

  it('rejection → ACTION_REQUIRED + kyc.rejected; the customer replaces the file and resubmits', async () => {
    const { ref, ids } = await submittedApplication();
    const reason = 'The PAN scan is blurred; please upload a clear colour scan.';
    const rejected = await review(ref, ids.pan, { decision: 'REJECT', reason });
    expect(rejected.status).toBe(200);
    expect(rejected.body.data.application.status).toBe('ACTION_REQUIRED');

    const [event] = await events('kyc.rejected');
    expect(event.payload).toEqual({ documentRef: ids.pan, documentType: 'pan' });
    expect(JSON.stringify(event)).not.toContain('blurred');

    // The customer sees the reason, cannot resubmit until the file is replaced, and cannot touch approved files.
    const view = (await get(ref)).body.data;
    expect(view.documents.find((d) => d.id === ids.pan)).toMatchObject({ status: 'REJECTED', rejectionReason: reason });
    expect((await submit(ref)).body.error.code).toBe('DOCUMENT_REJECTED');
    const awaiting = await askUpload(ref, { type: 'bank', contentType: 'application/pdf', sizeBytes: 10 });
    expect(awaiting.body.error.code).toBe('DOCUMENT_AWAITING_REVIEW');

    // Staff can still review the other documents while the customer fixes the rejected one.
    for (const type of ['aadhaar', 'bank', 'photo']) await review(ref, ids[type], { decision: 'APPROVE' });
    const approvedAgain = await askUpload(ref, { type: 'bank', contentType: 'application/pdf', sizeBytes: 10 });
    expect(approvedAgain.body.error.code).toBe('DOCUMENT_ALREADY_APPROVED');

    const newPan = await upload(ref, 'pan');
    const resubmitted = await submit(ref);
    expect(resubmitted.body.data.status).toBe('UNDER_REVIEW');
    expect((await events('kyc.submitted')).map((e) => e.payload.submission)).toEqual([1, 2]);

    const done = await review(ref, newPan, { decision: 'APPROVE' });
    expect(done.body.data.application.status).toBe('APPROVED');
  });

  it('is idempotent for a repeated decision and refuses a conflicting one', async () => {
    const { ref, ids } = await submittedApplication();
    const reason = 'Bank proof does not show the account holder name.';
    await review(ref, ids.bank, { decision: 'REJECT', reason });
    const replay = await review(ref, ids.bank, { decision: 'REJECT', reason });
    expect(replay.status).toBe(200);
    expect(await events('kyc.rejected')).toHaveLength(1);

    const flip = await review(ref, ids.bank, { decision: 'APPROVE' });
    expect(flip.status).toBe(409);
    expect(flip.body.error).toMatchObject({ code: 'DOCUMENT_ALREADY_REVIEWED', details: { status: 'REJECTED' } });
  });

  it('cannot review a document that was not submitted, or one from another application', async () => {
    const { ref } = (await create()).body.data;
    const pending = await upload(ref, 'pan');
    const res = await review(ref, pending, { decision: 'APPROVE' });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('DOCUMENT_NOT_SUBMITTED');

    const other = (await create(BOB)).body.data.ref;
    expect((await review(other, pending, { decision: 'APPROVE' })).body.error.code).toBe('DOCUMENT_NOT_FOUND');
  });

  it('saves neither the decision nor the event when the transaction fails', async () => {
    const { ref, ids } = await submittedApplication();
    vi.spyOn(DomainEvent, 'create').mockRejectedValueOnce(new Error('outbox down'));
    const res = await review(ref, ids.pan, { decision: 'REJECT', reason: 'Expired document provided.' });
    expect(res.status).toBe(500);
    expect((await KycDocument.findOne({ ref: ids.pan }).lean()).status).toBe('UPLOADED');
    expect((await KycApplication.findOne().lean()).status).toBe('UNDER_REVIEW');
    expect(await events('kyc.rejected')).toHaveLength(0);
  });

  it('is compliance-only', async () => {
    const { ref, ids } = await submittedApplication();
    const sales = await staffSession(app, 'SALES_MANAGER');
    const ops = await staffSession(app, 'OPS_ADMIN');
    for (const auth of [sales.auth, ops.auth]) {
      expect((await review(ref, ids.pan, { decision: 'APPROVE' }, auth)).status).toBe(403);
    }
    // A customer cannot review, even their own documents.
    expect((await review(ref, ids.pan, { decision: 'APPROVE' }, ALICE)).status).toBe(401);
    expect((await review(ref, ids.pan, { decision: 'APPROVE' }, {})).status).toBe(401);

    const compliance = await staffSession(app, 'COMPLIANCE');
    const res = await review(ref, ids.pan, { decision: 'APPROVE' }, compliance.auth);
    expect(res.status).toBe(200);
    expect(res.body.data.document.reviewedBy).toBe(compliance.ref);
  });
});

describe('service guards (defence in depth behind validation)', () => {
  it('refuses a submission without consent and a rejection without a reason', async () => {
    const { submitApplication, reviewDocument } = await import('./kyc.service.js');
    const customer = { type: 'customer', id: 'CUS-ALICE' };
    const staff = { type: 'staff', id: 'USR-1', role: 'COMPLIANCE' };
    await expect(submitApplication('KYC-ABCDEFGHIJ', { consent: false }, customer, {})).rejects.toMatchObject({
      code: 'CONSENT_REQUIRED',
    });
    await expect(
      reviewDocument('KYC-ABCDEFGHIJ', 'DOC-ABCDEFGH', { decision: 'REJECT', reason: ' ' }, staff, {}),
    ).rejects.toMatchObject({ code: 'REASON_REQUIRED' });
    await expect(
      reviewDocument(
        'KYC-ABCDEFGHIJ',
        'DOC-ABCDEFGH',
        { decision: 'APPROVE' },
        { ...staff, id: 'USR-1', role: 'SALES_EXEC' },
        {},
      ),
    ).rejects.toMatchObject({ status: 403 });
  });
});

// ── Reading ───────────────────────────────────

describe('GET /kyc/:ref', () => {
  it('shows the owner safe metadata only', async () => {
    const { ref } = await submittedApplication();
    const res = await get(ref);
    expect(res.status).toBe(200);
    expect(res.headers['cache-control']).toBe('no-store');
    const text = JSON.stringify(res.body);
    for (const secret of ['_id', 'storageKey', 'kyc/', 'memory-storage', 'url', 'customerId', 'reviewedBy', '__v']) {
      expect(text).not.toContain(secret);
    }
    expect(res.body.data.documents[0]).toEqual({
      id: expect.stringMatching(/^DOC-/),
      type: 'pan',
      status: 'UPLOADED',
      contentType: 'application/pdf',
      sizeBytes: FILES['application/pdf'].length,
      uploadedAt: expect.any(String),
      reviewedAt: null,
      rejectionReason: null,
      createdAt: expect.any(String),
    });
  });

  it("is 404 for another customer's application and for unknown refs", async () => {
    const { ref } = (await create()).body.data;
    expect((await get(ref, BOB)).body.error.code).toBe('KYC_APPLICATION_NOT_FOUND');
    expect((await get('KYC-ZZZZZZZZZZZZZZZZZZ')).status).toBe(404);
  });

  it('lets compliance read any application, with the owner, and refuses other staff', async () => {
    const { ref } = (await create()).body.data;
    const compliance = await staffSession(app, 'COMPLIANCE');
    const res = await get(ref, compliance.auth);
    expect(res.status).toBe(200);
    expect(res.body.data.customerId).toBe('CUS-ALICE');
    expect(JSON.stringify(res.body)).not.toContain('storageKey');

    const sales = await staffSession(app, 'SALES_EXEC');
    expect((await get(ref, sales.auth)).status).toBe(403);
    expect((await get(ref, { Authorization: 'Bearer forged' })).status).toBe(401);
  });
});

// ── Reviewer downloads ────────────────────────

describe('POST /kyc/:ref/documents/:id/download-url', () => {
  it('gives compliance a ≤ 5-minute URL to the uploaded file, audited', async () => {
    const { ref, ids } = await submittedApplication();
    const res = await downloadUrl(ref, ids.pan);
    expect(res.status).toBe(200);
    expect(res.headers['cache-control']).toBe('no-store');
    expect(new Date(res.body.data.expiresAt).getTime() - Date.now()).toBeLessThanOrEqual(5 * 60 * 1000);
    expect(storage.readDownload(res.body.data.url).equals(FILES['application/pdf'])).toBe(true);
    expect(await AuditEntry.countDocuments({ action: 'kyc.document.download_url_issued' })).toBe(1);
  });

  it('is not available to customers or other staff', async () => {
    const { ref, ids } = await submittedApplication();
    const path = `/api/v1/kyc/${ref}/documents/${ids.pan}/download-url`;
    expect((await request(app).post(path).set(ALICE)).status).toBe(401);
    const sales = await staffSession(app, 'SALES_MANAGER');
    expect((await request(app).post(path).set(sales.auth)).status).toBe(403);
  });
});

// ── Audit ─────────────────────────────────────

describe('audit log', () => {
  it('records every change and read, without reasons or file data', async () => {
    const { ref, ids } = await submittedApplication();
    await review(ref, ids.pan, { decision: 'REJECT', reason: 'Name on PAN does not match the application.' });
    await get(ref);

    const entries = await AuditEntry.find({ scopeRef: ref }).sort({ at: 1, _id: 1 }).lean();
    const actions = entries.map((e) => e.action);
    expect(actions).toEqual(
      expect.arrayContaining([
        'kyc.application.created',
        'kyc.document.upload_url_issued',
        'kyc.document.uploaded',
        'kyc.application.submitted',
        'kyc.document.rejected',
        'kyc.application.status_changed',
        'kyc.application.read',
      ]),
    );
    expect(entries.find((e) => e.action === 'kyc.document.rejected')).toMatchObject({
      actorType: 'staff',
      actorId: (await compliance()).ref,
      actorRole: 'COMPLIANCE',
      entityType: 'kyc_document',
      entityRef: ids.pan,
      before: 'UPLOADED',
      after: 'REJECTED',
    });
    expect(entries.find((e) => e.action === 'kyc.application.read')).toMatchObject({
      actorType: 'customer',
      actorId: 'CUS-ALICE',
      requestId: expect.any(String),
    });
    expect(JSON.stringify(entries)).not.toContain('does not match');
  });

  it('is append-only', async () => {
    await create();
    await expect(AuditEntry.updateOne({}, { $set: { action: 'x' } })).rejects.toThrow('append-only');
    await expect(AuditEntry.deleteMany({})).rejects.toThrow('append-only');
    await expect(AuditEntry.findOneAndDelete({})).rejects.toThrow('append-only');
    expect(await AuditEntry.countDocuments()).toBe(1);
  });
});

// ── Security regressions ──────────────────────

describe('legacy x-admin-key (regression)', () => {
  it('cannot review, read or download KYC data', async () => {
    const { ref, ids } = await submittedApplication();
    const reviewed = await review(ref, ids.pan, { decision: 'APPROVE' }, ADMIN_KEY_HEADER);
    expect(reviewed.status).toBe(401);
    expect((await get(ref, ADMIN_KEY_HEADER)).status).toBe(401);
    expect((await downloadUrl(ref, ids.pan, ADMIN_KEY_HEADER)).status).toBe(401);
    // An admin key sent alongside a customer header is still treated as a staff attempt, never as the customer.
    expect((await get(ref, { ...ALICE, ...ADMIN_KEY_HEADER })).status).toBe(401);
    expect((await KycDocument.findOne({ ref: ids.pan }).lean()).status).toBe('UPLOADED');
  });

  it('is refused by the service even if a route forgot the guard', async () => {
    const { reviewDocument } = await import('./kyc.service.js');
    const adminKey = { type: 'staff', id: 'admin-key', role: null };
    await expect(
      reviewDocument('KYC-ABCDEFGHIJ', 'DOC-ABCDEFGH', { decision: 'APPROVE' }, adminKey, {}),
    ).rejects.toMatchObject({ status: 403 });
  });
});

describe('file swapped after submit (regression)', () => {
  it('refuses a second upload through the same signed URL', async () => {
    const { ref } = (await create()).body.data;
    const body = FILES['application/pdf'];
    const res = await askUpload(ref, { type: 'pan', contentType: 'application/pdf', sizeBytes: body.length });
    storage.completeUpload(res.body.data.upload.url, { body, contentType: 'application/pdf' });
    expect(() => storage.completeUpload(res.body.data.upload.url, { body, contentType: 'application/pdf' })).toThrow(
      'already exists',
    );
  });

  it('will not approve or serve a file that changed since it was verified', async () => {
    const { ref, ids } = await submittedApplication();
    const { storageKey } = await KycDocument.findOne({ ref: ids.pan }).lean();
    const swapped = Buffer.concat([Buffer.from('%PDF-1.4\n'), Buffer.alloc(FILES['application/pdf'].length - 9, 0x41)]);
    storage.putObject(storageKey, { body: swapped, contentType: 'application/pdf' });

    const res = await review(ref, ids.pan, { decision: 'APPROVE' });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('DOCUMENT_UPLOAD_CHANGED');
    expect((await KycDocument.findOne({ ref: ids.pan }).lean()).status).toBe('UPLOADED');
    expect((await downloadUrl(ref, ids.pan)).body.error.code).toBe('DOCUMENT_UPLOAD_CHANGED');

    // Rejecting it is still possible, so the customer is asked for a fresh upload.
    const rejected = await review(ref, ids.pan, { decision: 'REJECT', reason: 'File changed after submission.' });
    expect(rejected.status).toBe(200);
  });
});
