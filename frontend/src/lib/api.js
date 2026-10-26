/**
 * Thin client for the V-DESK API (backend/src/routes.js).
 *
 * The base URL comes from `VITE_API_URL` (see .env.example). When it is unset — the static
 * Cloudflare build today — `isApiEnabled()` is false and callers keep their local behaviour,
 * so the site works with or without the API running.
 *
 * Every response is the API envelope: `{ data, meta? }` on success, `{ error: { code, message,
 * details?, requestId? } }` on failure. Failures reject with an `ApiError` carrying that code.
 */

const BASE_URL = (import.meta.env?.VITE_API_URL ?? '').replace(/\/+$/, '');
const DEFAULT_TIMEOUT_MS = 10_000;

export class ApiError extends Error {
  constructor(code, message, { status = 0, details = null, requestId = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
    this.requestId = requestId;
  }

  /** True when the request never reached the API (offline, DNS, CORS, timeout). */
  get isTransport() {
    return this.code === 'NETWORK_ERROR' || this.code === 'TIMEOUT';
  }
}

/** Is an API configured for this build? */
export function isApiEnabled() {
  return BASE_URL.length > 0;
}

export function apiBaseUrl() {
  return BASE_URL;
}

/** Random key so a retried POST is not processed twice (bookings, quotes, orders). */
export function idempotencyKey(prefix = 'web') {
  const random = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${random}`;
}

function buildUrl(path, query) {
  const url = new URL(BASE_URL + (path.startsWith('/') ? path : `/${path}`));
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value));
  }
  return url.toString();
}

/**
 * Calls the API and returns the `data` payload.
 * `options`: { query, body, headers, idempotencyKey, timeoutMs, signal }.
 */
export async function apiFetch(method, path, options = {}) {
  if (!isApiEnabled()) throw new ApiError('API_DISABLED', 'No API is configured for this build');

  const { query, body, headers = {}, idempotencyKey: key, timeoutMs = DEFAULT_TIMEOUT_MS, signal } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  if (signal) signal.addEventListener('abort', () => controller.abort(), { once: true });

  let response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      credentials: 'include', // the refresh cookie for staff sessions
      signal: controller.signal,
      headers: {
        accept: 'application/json',
        ...(body ? { 'content-type': 'application/json' } : {}),
        ...(key ? { 'Idempotency-Key': key } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    const aborted = error?.name === 'AbortError';
    throw new ApiError(aborted ? 'TIMEOUT' : 'NETWORK_ERROR', aborted ? 'The API took too long to respond' : 'Could not reach the API');
  } finally {
    clearTimeout(timer);
  }

  if (response.status === 204) return null;

  const text = await response.text();
  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const error = payload?.error ?? {};
    throw new ApiError(error.code ?? 'HTTP_ERROR', error.message ?? `Request failed (${response.status})`, {
      status: response.status,
      details: error.details ?? null,
      requestId: error.requestId ?? null,
    });
  }

  return payload?.data ?? null;
}

export const api = {
  get: (path, options) => apiFetch('GET', path, options),
  post: (path, options) => apiFetch('POST', path, options),
  patch: (path, options) => apiFetch('PATCH', path, options),
  put: (path, options) => apiFetch('PUT', path, options),
  delete: (path, options) => apiFetch('DELETE', path, options),
};
