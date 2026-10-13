import { describe, expect, it } from 'vitest';
import { assertSafeKey, createMemoryStorage, selectStorage } from '../src/integrations/storage.js';

describe('selectStorage', () => {
  it('uses the memory adapter only when asked, and never in production', () => {
    expect(selectStorage({ driver: 'memory', nodeEnv: 'test' })?.name).toBe('memory');
    expect(selectStorage({ driver: 'memory', nodeEnv: 'development' })?.name).toBe('memory');
    expect(selectStorage({ driver: undefined, nodeEnv: 'development' })).toBeNull();
    expect(selectStorage({ driver: 'memory', nodeEnv: 'production' })).toBeNull();
  });
});

describe('assertSafeKey', () => {
  it.each(['../etc/passwd', '/abs/key', 'kyc//x', 'kyc/x/', 'kyc/x?y', 'kyc/ x', 'kyc/x\\y', '', 'a'.repeat(513)])(
    'rejects %j',
    (key) => expect(() => assertSafeKey(key)).toThrow('Unsafe storage key'),
  );

  it('accepts generated keys', () => {
    expect(() => assertSafeKey('kyc/kyc-abc123/doc-xyz-0b6f8a4e-1c2d-4e5f-8a9b-0c1d2e3f4a5b.pdf')).not.toThrow();
  });
});

describe('memory storage', () => {
  const key = 'kyc/app/doc.pdf';
  const body = Buffer.from('%PDF-1.7 hello');

  it('signs single-purpose URLs that cannot be mistaken for real ones', async () => {
    const storage = createMemoryStorage();
    const upload = await storage.createUploadUrl({
      key,
      contentType: 'application/pdf',
      contentLength: body.length,
      expiresInSeconds: 600,
    });
    expect(upload.url).toMatch(/^memory-storage:\/\/upload\//);
    expect(upload.url).not.toContain(key);
    expect(() => storage.readDownload(upload.url)).toThrow();
  });

  it('enforces the signed content type, length and expiry on upload', async () => {
    let now = new Date('2026-10-12T10:00:00Z');
    const storage = createMemoryStorage({ now: () => now });
    const { url } = await storage.createUploadUrl({
      key,
      contentType: 'application/pdf',
      contentLength: body.length,
      expiresInSeconds: 600,
    });
    expect(() => storage.completeUpload(url, { body, contentType: 'image/png' })).toThrow('Content-Type');
    expect(() => storage.completeUpload(url, { body: Buffer.alloc(3), contentType: 'application/pdf' })).toThrow(
      'Content-Length',
    );
    now = new Date('2026-10-12T10:10:01Z');
    expect(() => storage.completeUpload(url, { body, contentType: 'application/pdf' })).toThrow('expired');
    expect(await storage.inspect(key)).toBeNull();
  });

  it('reports what was stored', async () => {
    const storage = createMemoryStorage();
    const { url } = await storage.createUploadUrl({
      key,
      contentType: 'application/pdf',
      contentLength: body.length,
      expiresInSeconds: 60,
    });
    storage.completeUpload(url, { body, contentType: 'application/pdf' });
    const found = await storage.inspect(key, { prefixBytes: 5 });
    expect(found).toMatchObject({ contentLength: body.length, contentType: 'application/pdf' });
    expect(found.prefix.toString()).toBe('%PDF-');
  });

  it('refuses URL lifetimes beyond rules.md §22', async () => {
    const storage = createMemoryStorage();
    const upload = { key, contentType: 'application/pdf', contentLength: 1 };
    await expect(storage.createUploadUrl({ ...upload, expiresInSeconds: 15 * 60 + 1 })).rejects.toThrow();
    await expect(storage.createDownloadUrl({ key, expiresInSeconds: 5 * 60 + 1 })).rejects.toThrow();
    await expect(storage.createUploadUrl({ ...upload, key: '../x', expiresInSeconds: 60 })).rejects.toThrow();
  });
});
