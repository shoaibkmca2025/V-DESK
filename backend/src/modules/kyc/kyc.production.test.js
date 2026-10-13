/**
 * KYC in production without a real storage provider: even with STORAGE_DRIVER=memory set by mistake, the
 * development adapter is never used and uploads fail safe with 503 STORAGE_NOT_CONFIGURED.
 * Run: npx vitest run src/modules/kyc/kyc.production.test.js
 */
import { describe, expect, it, vi } from 'vitest';
import { getDocumentDownloadUrl, getKycStorage, requestUploadUrl, submitApplication } from './kyc.service.js';

vi.mock('../../config/env.js', () => ({
  env: { NODE_ENV: 'production', LOG_LEVEL: 'silent', STORAGE_DRIVER: 'memory' },
}));

const customer = { type: 'customer', id: 'CUS-1' };
const staff = { type: 'staff', id: 'USR-1', role: 'COMPLIANCE' };
const unavailable = { status: 503, code: 'STORAGE_NOT_CONFIGURED' };

describe('production storage misconfiguration', () => {
  it('never selects the in-memory adapter', () => {
    expect(getKycStorage()).toBeNull();
  });

  it('refuses uploads, submissions and downloads before touching the database', async () => {
    const input = { type: 'pan', contentType: 'application/pdf', sizeBytes: 10 };
    await expect(requestUploadUrl('KYC-ABCDEFGHIJ', input, customer, {})).rejects.toMatchObject(unavailable);
    await expect(submitApplication('KYC-ABCDEFGHIJ', { consent: true }, customer, {})).rejects.toMatchObject(
      unavailable,
    );
    await expect(getDocumentDownloadUrl('KYC-ABCDEFGHIJ', 'DOC-ABCDEFGH', staff, {})).rejects.toMatchObject(
      unavailable,
    );
  });
});
