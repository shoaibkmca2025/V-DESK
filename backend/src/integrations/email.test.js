/**
 * Email adapter (integrations/email.js). Run: npx vitest run src/integrations/email.test.js
 *
 * What matters here is not that a mail goes out — it is which failures the queue is allowed to retry. Retrying
 * a permanent rejection burns the queue forever; refusing to retry a timeout loses a customer's confirmation,
 * because a timeout says nothing about whether the provider accepted it.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createEmailProvider } from './email.js';

const provider = createEmailProvider({ apiKey: 're_test', from: 'V-DESK <hello@vdesk.test>' });

const message = {
  to: 'asha@example.com',
  subject: 'We have your enquiry',
  body: 'Hi Asha, an advisor will call you.',
  idempotencyKey: 'lead.created:LEAD-1:confirmation:email',
};

const answer = (status, payload) =>
  vi
    .spyOn(globalThis, 'fetch')
    .mockResolvedValue(
      new Response(JSON.stringify(payload), { status, headers: { 'content-type': 'application/json' } }),
    );

afterEach(() => vi.restoreAllMocks());

describe('email adapter', () => {
  it('sends the message and returns the provider id', async () => {
    const fetchMock = answer(200, { id: 'ac7bd3f2' });

    expect(await provider.send(message)).toEqual({ providerMessageId: 'ac7bd3f2' });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.resend.com/emails');
    // Same key on a retry means the provider replays the first response instead of sending twice.
    expect(init.headers['idempotency-key']).toBe(message.idempotencyKey);
    expect(JSON.parse(init.body)).toMatchObject({
      from: 'V-DESK <hello@vdesk.test>',
      to: ['asha@example.com'],
      subject: 'We have your enquiry',
      text: 'Hi Asha, an advisor will call you.',
    });
  });

  it('retries a rate limit and a provider outage', async () => {
    answer(429, { name: 'rate_limit_exceeded', message: 'Too many requests' });
    await expect(provider.send(message)).rejects.toMatchObject({ code: 'RATE_LIMITED', transient: true });

    answer(503, { name: 'internal_server_error', message: 'Service unavailable' });
    await expect(provider.send(message)).rejects.toMatchObject({ transient: true });
  });

  it('never retries a rejected message or a bad key', async () => {
    answer(422, { name: 'validation_error', message: 'Invalid recipient' });
    await expect(provider.send(message)).rejects.toMatchObject({ transient: false });

    answer(403, { name: 'restricted_api_key', message: 'Key cannot send' });
    await expect(provider.send(message)).rejects.toMatchObject({ code: 'PROVIDER_AUTH', transient: false });
  });

  it('tells the two 409s apart', async () => {
    // Still in flight — the same send is safe to repeat later.
    answer(409, { name: 'concurrent_idempotent_requests', message: 'In progress' });
    await expect(provider.send(message)).rejects.toMatchObject({ transient: true });

    // Key already used for a different mail — repeating it will never work.
    answer(409, { name: 'invalid_idempotent_request', message: 'Key reused with another payload' });
    await expect(provider.send(message)).rejects.toMatchObject({ transient: false });
  });

  it('treats a timeout as retryable, because the mail may have been accepted', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new DOMException('aborted', 'TimeoutError'));

    await expect(provider.send(message)).rejects.toMatchObject({ code: 'TIMEOUT', transient: true });
  });

  it('refuses a mail with no subject without calling the provider', async () => {
    const fetchMock = answer(200, { id: 'nope' });

    await expect(provider.send({ ...message, subject: null })).rejects.toMatchObject({
      code: 'INVALID_MESSAGE',
      transient: false,
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('will not start without its two settings', () => {
    expect(() => createEmailProvider({ apiKey: '', from: 'x' })).toThrow(/RESEND_API_KEY/);
  });
});
