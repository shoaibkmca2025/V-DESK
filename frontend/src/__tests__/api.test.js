import { afterEach, describe, expect, it, vi } from 'vitest';

/** Loads lib/api.js with VITE_API_URL set (or not) for that test. */
async function loadApi(baseUrl) {
  vi.resetModules();
  vi.stubEnv('VITE_API_URL', baseUrl ?? '');
  return import('@/lib/api.js');
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe('api client', () => {
  it('is disabled when no API URL is configured', async () => {
    const { isApiEnabled, apiFetch } = await loadApi('');
    expect(isApiEnabled()).toBe(false);
    await expect(apiFetch('GET', '/catalog')).rejects.toMatchObject({ code: 'API_DISABLED' });
  });

  it('returns the data payload and sends JSON headers', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: { ref: 'VD-1' } }), { status: 201, headers: { 'content-type': 'application/json' } }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const { api, isApiEnabled } = await loadApi('https://api.test/api/v1');
    expect(isApiEnabled()).toBe(true);

    const data = await api.post('/leads', { body: { name: 'Asha' }, idempotencyKey: 'web-1' });

    expect(data).toEqual({ ref: 'VD-1' });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.test/api/v1/leads');
    expect(init.method).toBe('POST');
    expect(init.headers['content-type']).toBe('application/json');
    expect(init.headers['Idempotency-Key']).toBe('web-1');
    expect(JSON.parse(init.body)).toEqual({ name: 'Asha' });
  });

  it('builds query strings and drops empty values', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: [] }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const { api } = await loadApi('https://api.test/api/v1');

    await api.get('/catalog/centres', { query: { city: 'mumbai', type: '', limit: 10, missing: undefined } });

    expect(fetchMock.mock.calls[0][0]).toBe('https://api.test/api/v1/catalog/centres?city=mumbai&limit=10');
  });

  it('turns an API error envelope into an ApiError', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ error: { code: 'VALIDATION_FAILED', message: 'Some fields are invalid', requestId: 'req-1' } }),
          { status: 400 },
        ),
      ),
    );
    const { api } = await loadApi('https://api.test/api/v1');

    await expect(api.post('/leads', { body: {} })).rejects.toMatchObject({
      code: 'VALIDATION_FAILED',
      status: 400,
      requestId: 'req-1',
    });
  });

  it('reports a transport failure rather than throwing the raw error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    const { api, ApiError } = await loadApi('https://api.test/api/v1');

    const error = await api.get('/catalog').catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.code).toBe('NETWORK_ERROR');
    expect(error.isTransport).toBe(true);
  });

  it('treats 204 as no content', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 204 })));
    const { api } = await loadApi('https://api.test/api/v1');
    await expect(api.post('/auth/logout')).resolves.toBeNull();
  });
});
