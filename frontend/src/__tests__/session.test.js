import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/** Loads the customer session with VITE_API_URL set (or not) for that test. */
async function loadSession(baseUrl) {
  vi.resetModules();
  vi.stubEnv('VITE_API_URL', baseUrl ?? '');
  return import('@/features/auth/session.js');
}

const json = (data, status = 200) =>
  new Response(JSON.stringify({ data }), { status, headers: { 'content-type': 'application/json' } });

const apiError = (code, message, status) =>
  new Response(JSON.stringify({ error: { code, message } }), {
    status,
    headers: { 'content-type': 'application/json' },
  });

const SESSION = {
  accessToken: 'token-abc',
  expiresIn: 3600,
  customer: { ref: 'CUS-1', name: 'Priya Kulkarni', mobile: '9876543210', email: '', company: '' },
};

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.resetModules();
});

describe('customer session', () => {
  it('signs in with a code and keeps the token for this tab only', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(json({ isNewAccount: true, resendAfter: 30, devCode: '123456' }))
      .mockResolvedValueOnce(json(SESSION));
    vi.stubGlobal('fetch', fetchMock);
    const { requestSignInCode, verifySignInCode, customerHeaders, getCustomer, isSignedIn } =
      await loadSession('https://api.test/api/v1');

    const sent = await requestSignInCode('9876543210');
    expect(sent).toMatchObject({ isNewAccount: true, devCode: '123456' });

    const customer = await verifySignInCode({ mobile: '9876543210', code: '123456', name: 'Priya Kulkarni' });
    expect(customer).toMatchObject({ ref: 'CUS-1', name: 'Priya Kulkarni' });
    expect(isSignedIn()).toBe(true);
    expect(customerHeaders()).toEqual({ authorization: 'Bearer token-abc' });
    expect(getCustomer().mobile).toBe('9876543210');

    // The token lives in sessionStorage; localStorage only learns that a session exists.
    expect(sessionStorage.getItem('VDESK_SESSION')).toContain('token-abc');
    expect(localStorage.getItem('VDESK_SESSION')).toBeNull();
    expect(JSON.stringify(localStorage)).not.toContain('token-abc');
  });

  it('asks the API for a code and sends the account details on verify', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(json({ isNewAccount: false })).mockResolvedValueOnce(json(SESSION));
    vi.stubGlobal('fetch', fetchMock);
    const { requestSignInCode, verifySignInCode } = await loadSession('https://api.test/api/v1');

    await requestSignInCode('9876543210');
    await verifySignInCode({ mobile: '9876543210', code: '123456', name: 'Priya', company: 'Zenith D2C' });

    const [requestUrl, requestInit] = fetchMock.mock.calls[0];
    expect(requestUrl).toBe('https://api.test/api/v1/auth/otp/request');
    expect(JSON.parse(requestInit.body)).toEqual({ mobile: '9876543210' });

    const [verifyUrl, verifyInit] = fetchMock.mock.calls[1];
    expect(verifyUrl).toBe('https://api.test/api/v1/auth/otp/verify');
    expect(JSON.parse(verifyInit.body)).toMatchObject({ code: '123456', company: 'Zenith D2C' });
    // The refresh cookie has to ride along or the session cannot be restored later.
    expect(verifyInit.credentials).toBe('include');
  });

  it('lets a wrong code through to the caller to explain', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(apiError('OTP_INVALID', 'That code is not right.', 401)));
    const { verifySignInCode, isSignedIn } = await loadSession('https://api.test/api/v1');

    await expect(verifySignInCode({ mobile: '9876543210', code: '000000' })).rejects.toMatchObject({
      code: 'OTP_INVALID',
    });
    expect(isSignedIn()).toBe(false);
  });

  it('does not ask to restore a session this browser has never had', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const { restoreSession } = await loadSession('https://api.test/api/v1');

    expect(await restoreSession()).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('restores a session in a new tab from the refresh cookie, and stops asking once it is refused', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(json(SESSION));
    vi.stubGlobal('fetch', fetchMock);
    let api = await loadSession('https://api.test/api/v1');
    await api.verifySignInCode({ mobile: '9876543210', code: '123456', name: 'Priya Kulkarni' });

    // A new tab: the same localStorage hint, but no token in sessionStorage.
    sessionStorage.clear();
    fetchMock.mockResolvedValueOnce(json(SESSION));
    api = await loadSession('https://api.test/api/v1');
    expect(await api.restoreSession()).toMatchObject({ ref: 'CUS-1' });
    expect(fetchMock.mock.calls.at(-1)[0]).toBe('https://api.test/api/v1/auth/customer/refresh');

    // A cookie the API no longer accepts clears the hint, so the next tab does not try again.
    sessionStorage.clear();
    fetchMock.mockResolvedValueOnce(apiError('REFRESH_INVALID', 'Your session has ended.', 401));
    api = await loadSession('https://api.test/api/v1');
    expect(await api.restoreSession()).toBeNull();

    sessionStorage.clear();
    const callsSoFar = fetchMock.mock.calls.length;
    api = await loadSession('https://api.test/api/v1');
    expect(await api.restoreSession()).toBeNull();
    expect(fetchMock.mock.calls.length).toBe(callsSoFar);
  });

  it('signs out through the API and forgets the session either way', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(json(SESSION)).mockResolvedValueOnce(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);
    const { verifySignInCode, signOut, isSignedIn } = await loadSession('https://api.test/api/v1');
    await verifySignInCode({ mobile: '9876543210', code: '123456', name: 'Priya Kulkarni' });

    await signOut();
    expect(fetchMock.mock.calls.at(-1)[0]).toBe('https://api.test/api/v1/auth/customer/logout');
    expect(isSignedIn()).toBe(false);
    expect(localStorage.getItem('VDESK_SESSION_HINT')).toBeNull();
  });

  it('falls back to a local session on a build with no API', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const { requestSignInCode, verifySignInCode, isSignedIn } = await loadSession('');

    expect(await requestSignInCode('9876543210')).toMatchObject({ local: true });
    const customer = await verifySignInCode({ mobile: '9876543210', code: '123456', name: 'Priya Kulkarni' });
    expect(customer).toMatchObject({ name: 'Priya Kulkarni', mobile: '9876543210', local: true });
    expect(isSignedIn()).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('points someone who has to sign in back at the page they wanted', async () => {
    const { signInPath } = await loadSession('https://api.test/api/v1');
    expect(signInPath('/meeting-rooms')).toBe('/login?next=%2Fmeeting-rooms');
  });
});
