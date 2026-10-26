import { api, idempotencyKey, isApiEnabled } from '@/lib/api.js';

/**
 * Orders against /api/v1/orders. An order is always created from something that already exists on
 * the server — an accepted quote or a confirmed booking — so the amount comes from the server,
 * never from the browser.
 */

export async function createOrder({ type, ref }) {
  if (!isApiEnabled() || !ref) return null;
  return api.post('/orders', { idempotencyKey: idempotencyKey('order'), body: { source: { type, ref } } });
}

export async function fetchOrder(ref) {
  if (!isApiEnabled() || !ref) return null;
  try {
    return await api.get(`/orders/${ref}`);
  } catch {
    return null;
  }
}

export async function cancelOrder(ref) {
  if (!isApiEnabled() || !ref) return null;
  try {
    return await api.post(`/orders/${ref}/cancel`);
  } catch (error) {
    console.warn('[V-DESK] order not cancelled on the API:', error.code);
    return null;
  }
}
