import { afterEach, describe, expect, it, vi } from 'vitest';
import { fakeVerify, verify } from '../src/integrations/turnstile.js';
import { requireCaptcha } from '../src/shared/middleware/requireCaptcha.js';

// vitest.config.js leaves TURNSTILE_SECRET_KEY unset (CAPTCHA off for the other tests); this file turns it on.
const env = vi.hoisted(() => ({ NODE_ENV: 'test', LOG_LEVEL: 'silent', TURNSTILE_SECRET_KEY: 'test-secret' }));
vi.mock('../src/config/env.js', () => ({ env }));

function run(req) {
  const next = vi.fn();
  const middleware = requireCaptcha({ verify: fakeVerify });
  return middleware({ ip: '203.0.113.7', body: {}, get: () => undefined, ...req }, {}, next).then(
    () => next.mock.calls[0][0],
  );
}

describe('requireCaptcha', () => {
  afterEach(() => {
    env.TURNSTILE_SECRET_KEY = 'test-secret';
    vi.unstubAllGlobals();
  });

  it('passes a valid token from the header or the body', async () => {
    expect(await run({ get: (h) => (h === 'cf-turnstile-response' ? 'pass' : undefined) })).toBeUndefined();
    expect(await run({ body: { captchaToken: 'pass' } })).toBeUndefined();
  });

  it('refuses a missing, oversized or rejected token', async () => {
    expect(await run({})).toMatchObject({ status: 400, code: 'CAPTCHA_REQUIRED' });
    expect(await run({ body: { captchaToken: 'x'.repeat(3000) } })).toMatchObject({ code: 'CAPTCHA_REQUIRED' });
    expect(await run({ body: { captchaToken: 'bot' } })).toMatchObject({ status: 400, code: 'CAPTCHA_FAILED' });
  });

  it('fails closed with 503 when Cloudflare is unreachable', async () => {
    expect(await run({ body: { captchaToken: 'unreachable' } })).toMatchObject({
      status: 503,
      code: 'CAPTCHA_UNAVAILABLE',
    });
  });

  it('is skipped while no secret is configured', async () => {
    env.TURNSTILE_SECRET_KEY = undefined;
    expect(await run({})).toBeUndefined();
  });
});

describe('turnstile.verify', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('posts the secret, token and IP as a form and reads the verdict', async () => {
    const fetch = vi.fn(async () => Response.json({ success: false, 'error-codes': ['timeout-or-duplicate'] }));
    vi.stubGlobal('fetch', fetch);
    const result = await verify({ secret: 's3cret', token: 'tok', remoteIp: '203.0.113.7' });
    expect(result).toEqual({ success: false, errorCodes: ['timeout-or-duplicate'] });

    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe('https://challenges.cloudflare.com/turnstile/v0/siteverify');
    expect(Object.fromEntries(init.body)).toEqual({ secret: 's3cret', response: 'tok', remoteip: '203.0.113.7' });
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it('throws on an HTTP error so the middleware can fail closed', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('down', { status: 502 })),
    );
    await expect(verify({ secret: 's', token: 't' })).rejects.toThrow('HTTP 502');
  });
});
