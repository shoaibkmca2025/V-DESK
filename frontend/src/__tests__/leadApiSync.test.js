import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/** addLead() must always keep the enquiry locally; the API call is a mirror, never a dependency. */
async function loadStore(baseUrl) {
  vi.resetModules();
  vi.stubEnv('VITE_API_URL', baseUrl ?? '');
  return import('@/features/crm/leadStore.js');
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.resetModules();
});

describe('lead → API sync', () => {
  it('does not call the API when none is configured', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const { addLead } = await loadStore('');

    const lead = addLead({ name: 'Asha', mobile: '9876543210', source: 'Test' });

    expect(lead.id).toMatch(/^VD-/);
    await flush();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('posts the enquiry and marks it synced', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ data: { ref: 'VD-API' } }), { status: 201 }));
    vi.stubGlobal('fetch', fetchMock);
    const { addLead, getLeads } = await loadStore('https://api.test/api/v1');

    const lead = addLead({ name: 'Asha', mobile: '9876543210', email: 'asha@acme.in', source: 'Test' });
    await flush();
    await flush();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.test/api/v1/leads');
    const body = JSON.parse(init.body);
    expect(body.ref).toBe(lead.id); // client ref makes the POST idempotent
    expect(body.name).toBe('Asha');
    expect(getLeads()[0].synced).toBe(true);
  });

  it('keeps the enquiry when the API is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { addLead, getLeads } = await loadStore('https://api.test/api/v1');

    const lead = addLead({ name: 'Ravi', mobile: '9876500000', source: 'Test' });
    await flush();
    await flush();

    const stored = getLeads().find((l) => l.id === lead.id);
    expect(stored).toBeTruthy();
    expect(stored.synced).toBeUndefined(); // still pending, nothing lost
  });
});
