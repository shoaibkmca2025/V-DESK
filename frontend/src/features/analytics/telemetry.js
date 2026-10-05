import { readJson, writeJson } from '@/lib/storage.js';

/** Search & conversion telemetry (PRD §17, §59), kept in localStorage for the admin telemetry stream. */

const TELEMETRY_KEY = 'VDESK_TELEMETRY_LOG';
const MAX_EVENTS = 200;

export function getTelemetryEvents() {
  return readJson(TELEMETRY_KEY, []);
}

export function trackSearchEvent(eventType, payload = {}) {
  const events = getTelemetryEvents();
  events.unshift({
    id: 'EVT-' + Date.now().toString(36),
    type: eventType,
    data: payload,
    device: window.innerWidth < 768 ? 'Mobile' : 'Desktop',
    timestamp: new Date().toISOString(),
  });
  if (events.length > MAX_EVENTS) events.pop();
  writeJson(TELEMETRY_KEY, events);
  console.log('[V-DESK Telemetry]', eventType, payload);
}
