/**
 * Cloudflare Turnstile — server-side check of the token the website's CAPTCHA widget produced.
 * https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 *
 * Interface: `verify({ secret, token, remoteIp }) → { success, errorCodes }`; throws if Cloudflare can't be reached
 * in time (rules.md §29). `fakeVerify` is the test double (rules.md §6).
 */

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const TIMEOUT_MS = 5000;

export async function verify({ secret, token, remoteIp }) {
  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set('remoteip', remoteIp);
  const res = await fetch(VERIFY_URL, { method: 'POST', body, signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) throw new Error(`Turnstile answered HTTP ${res.status}`);
  const result = await res.json();
  return { success: result.success === true, errorCodes: result['error-codes'] ?? [] };
}

/** Accepts exactly the token "pass"; "unreachable" simulates Cloudflare being down. */
export async function fakeVerify({ token }) {
  if (token === 'unreachable') throw new Error('Turnstile unreachable (fake)');
  return token === 'pass'
    ? { success: true, errorCodes: [] }
    : { success: false, errorCodes: ['invalid-input-response'] };
}
