import { api, apiBaseUrl, isApiEnabled } from '@/lib/api.js';
import { readJson, writeJson } from '@/lib/storage.js';

/** Search & conversion telemetry (PRD §17, §59), kept in localStorage for the admin telemetry stream. */

const TELEMETRY_KEY = 'VDESK_TELEMETRY_LOG';
const MAX_EVENTS = 200;

export function getTelemetryEvents() {
  return readJson(TELEMETRY_KEY, []);
}

export function trackSearchEvent(eventType, payload = {}) {
  const events = getTelemetryEvents();
  const event = {
    id: 'EVT-' + Date.now().toString(36),
    type: eventType,
    data: payload,
    device: window.innerWidth < 768 ? 'Mobile' : 'Desktop',
    timestamp: new Date().toISOString(),
  };
  events.unshift(event);
  if (events.length > MAX_EVENTS) events.pop();
  writeJson(TELEMETRY_KEY, events);
  queueForApi(event);
}

/**
 * Best-effort mirror to POST /api/v1/analytics/events. Events are batched on a short timer so a
 * burst of interactions costs one request, and a failed send is dropped rather than retried —
 * the localStorage log above stays the source of truth for the admin telemetry stream.
 */
const pending = [];
let flushTimer = null;
const FLUSH_DELAY_MS = 2000;
const MAX_BATCH = 50;

function queueForApi(event) {
  if (!isApiEnabled()) return;
  pending.push({ id: event.id, type: event.type, data: event.data, device: event.device, timestamp: event.timestamp });
  if (pending.length >= MAX_BATCH) return flushEvents();
  if (flushTimer) return;
  flushTimer = setTimeout(flushEvents, FLUSH_DELAY_MS);
}

export function flushEvents({ unloading = false } = {}) {
  clearTimeout(flushTimer);
  flushTimer = null;
  if (!isApiEnabled() || pending.length === 0) return;
  const batch = pending.splice(0, MAX_BATCH);
  const body = JSON.stringify({ events: batch });

  /*
   * A page being closed cannot wait for a response: sendBeacon hands the batch to the browser,
   * which delivers it after the page is gone. A normal flush uses the API client so it shares the
   * same base URL, headers and error handling.
   */
  if (unloading && navigator.sendBeacon?.(`${apiBaseUrl()}/analytics/events`, new Blob([body], { type: 'application/json' }))) {
    return;
  }
  api.post('/analytics/events', { body: { events: batch } }).catch(() => {
    /* telemetry is never worth interrupting the visitor for */
  });
}

// Don't lose the last events when the visitor leaves the page.
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushEvents({ unloading: true });
  });
}
