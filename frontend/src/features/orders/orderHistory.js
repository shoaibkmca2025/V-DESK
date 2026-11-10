import { isApiEnabled } from '@/lib/api.js';
import { readJson, removeKey, writeJson } from '@/lib/storage.js';

/**
 * The receipts from the simulated checkout, shown in the portal until a payment gateway is live.
 *
 * Where they are kept depends on whether there is an API. With one, the real orders belong to the
 * account on the server and what sits here is only a test-mode receipt — so it goes in sessionStorage
 * and dies when the tab closes, instead of waiting in localStorage for the next person on a shared
 * computer. The demo build has no server to hold a pipeline, so there it stays in localStorage.
 */

const KEY = 'VDESK_ORDERS';

const store = () => (isApiEnabled() ? globalThis.sessionStorage : globalThis.localStorage);

/**
 * Builds before this change wrote receipts to localStorage even with an API. Clear that copy the first
 * time anything looks, not on sign-out: someone who never signs out would otherwise keep it for good.
 */
let legacyCopyCleared = false;
function clearLegacyCopy() {
  if (legacyCopyCleared || !isApiEnabled()) return;
  removeKey(KEY, globalThis.localStorage);
  legacyCopyCleared = true;
}

export function readOrders() {
  clearLegacyCopy();
  return readJson(KEY, [], store());
}

export function addOrder(order) {
  writeJson(KEY, [order, ...readOrders()], store());
}

/** Both stores, so signing out also clears anything an older build left in localStorage. */
export function clearOrders() {
  removeKey(KEY, globalThis.localStorage);
  removeKey(KEY, globalThis.sessionStorage);
}
