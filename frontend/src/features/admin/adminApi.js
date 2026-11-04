import { staffHeaders } from '@/features/auth/staffSession.js';
import { api, apiBaseUrl, isApiEnabled } from '@/lib/api.js';

/**
 * Staff reads for the admin console. Every call carries the signed-in staff member's token, so the
 * API decides what they may see — the console never holds a shared key.
 */

export async function fetchLeads({ status, limit = 50 } = {}) {
  if (!isApiEnabled()) return null;
  try {
    return await api.get('/leads', { query: { status, limit }, headers: staffHeaders() });
  } catch (error) {
    if (error.status !== 401 && error.status !== 403) console.warn('[V-DESK] leads unavailable:', error.code);
    return null;
  }
}

export async function fetchLeadStats() {
  if (!isApiEnabled()) return null;
  try {
    return await api.get('/leads/stats', { headers: staffHeaders() });
  } catch {
    return null;
  }
}

export async function updateLeadStatus(ref, status) {
  if (!isApiEnabled()) return null;
  return api.patch(`/leads/${ref}`, { body: { status }, headers: staffHeaders() });
}

export async function fetchBookingsForStaff({ limit = 25 } = {}) {
  if (!isApiEnabled()) return null;
  try {
    return await api.get('/bookings', { query: { limit }, headers: staffHeaders() });
  } catch {
    return null;
  }
}

export async function fetchQuotesForStaff({ limit = 25 } = {}) {
  if (!isApiEnabled()) return null;
  try {
    return await api.get('/pricing/quotes', { query: { limit }, headers: staffHeaders() });
  } catch {
    return null;
  }
}

/** Range is the API's own window, e.g. '7d' or '30d'. */
export async function fetchKpis(range) {
  if (!isApiEnabled()) return null;
  try {
    return await api.get('/analytics/kpis', { query: { range }, headers: staffHeaders() });
  } catch {
    return null;
  }
}

/**
 * Downloads the live pipeline as CSV from the API, so a signed-in staff member exports what the
 * console is showing rather than whatever this browser happens to hold.
 */
export async function downloadLeadsCsv() {
  const url = `${apiBaseUrl()}/leads/export.csv`;
  const response = await fetch(url, { headers: staffHeaders(), credentials: 'include' });
  if (!response.ok) throw new Error(`Export failed (${response.status})`);
  const blob = await response.blob();
  const href = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = href;
  link.download = `vdesk-leads-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(href);
}

// ── Staff accounts (users:manage — super admins) ──
// A new account, or a forgotten password, gets a one-time setup code instead of a password (ADR-012). The API
// returns the code once, in the reply to the call that made it; the console shows it and never stores it.

export async function fetchStaffUsers({ limit = 100 } = {}) {
  if (!isApiEnabled()) return null;
  try {
    return await api.get('/auth/users', { query: { limit }, headers: staffHeaders() });
  } catch {
    return null;
  }
}

/** `{ email, name, role }` → the new user, with `setupCode` and `setupCodeExpiresAt`. Throws the API's answer. */
export async function createStaffUser({ email, name, role }) {
  return api.post('/auth/users', { body: { email, name, role }, headers: staffHeaders() });
}

/** A fresh setup code: the old password and code stop working, and the person's sessions end. */
export async function issueStaffSetupCode(ref) {
  return api.patch(`/auth/users/${ref}`, { body: { issueSetupCode: true }, headers: staffHeaders() });
}

export async function setStaffStatus(ref, status) {
  return api.patch(`/auth/users/${ref}`, { body: { status }, headers: staffHeaders() });
}
