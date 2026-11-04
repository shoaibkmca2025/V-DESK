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

  it('posts the enquiry, then forgets the visitor’s details in this browser', async () => {
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
    // Once the API has it, no copy stays behind — on a shared computer the next person could read it.
    expect(getLeads()).toEqual([]);
    expect(localStorage.getItem('VDESK_LEADS')).not.toContain('Asha');
  });

  it('clears out enquiries already sent and the demo pipeline from browsers that kept them', async () => {
    localStorage.setItem(
      'VDESK_LEADS',
      JSON.stringify([
        { id: 'VD-MUM-8921', name: 'Priya Kulkarni', status: 'QUALIFIED' },
        { id: 'VD-OLD-SENT', name: 'Shoaib', status: 'NEW', synced: true },
        { id: 'VD-PENDING1', name: 'Ravi', status: 'NEW' },
      ]),
    );
    const { getLeads } = await loadStore('https://api.test/api/v1');
    expect(getLeads().map((lead) => lead.id)).toEqual(['VD-PENDING1']);
    expect(localStorage.getItem('VDESK_LEADS')).not.toContain('Priya');
    expect(localStorage.getItem('VDESK_LEADS')).not.toContain('Shoaib');
  });

  it('still keeps a local pipeline, with demo data, on a build with no API', async () => {
    const { getLeads } = await loadStore('');
    expect(getLeads().length).toBeGreaterThan(0);
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
