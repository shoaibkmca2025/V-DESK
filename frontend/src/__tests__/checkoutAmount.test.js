import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { parseAmount } from '@/pages/account/CheckoutPage.jsx';

/** Loads the order history with VITE_API_URL set (or not) for that test. */
async function loadOrders(baseUrl) {
  vi.resetModules();
  vi.stubEnv('VITE_API_URL', baseUrl ?? '');
  return import('@/features/orders/orderHistory.js');
}

/*
 * Two things guard money on the checkout page: the amount a link carries is never invented, and nothing
 * is payable without one. The page used to default to ₹21,499 when a link had no amount, which billed a
 * made-up price for whatever item the link named.
 */
describe('checkout amount', () => {
  it('is zero — never a default — when the link carries nothing usable', () => {
    expect(parseAmount(null)).toBe(0);
    expect(parseAmount('')).toBe(0);
    expect(parseAmount('abc')).toBe(0);
    expect(parseAmount('-5')).toBe(0);
  });

  it('is whole rupees', () => {
    expect(parseAmount('21499.6')).toBe(21500);
    expect(parseAmount('1249')).toBe(1249);
  });
});

describe('simulated order receipts', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  afterEach(() => vi.unstubAllEnvs());

  it('keeps them out of localStorage when there is an API', async () => {
    const { addOrder, readOrders } = await loadOrders('https://api.test/api/v1');

    addOrder({ invoiceNo: 'INV-1', amount: 21499 });

    expect(readOrders()).toHaveLength(1);
    // Dies with the tab, so the next person on a shared computer cannot read it.
    expect(localStorage.getItem('VDESK_ORDERS')).toBeNull();
    expect(sessionStorage.getItem('VDESK_ORDERS')).toContain('INV-1');
  });

  it('clears what an older build left in localStorage', async () => {
    localStorage.setItem('VDESK_ORDERS', JSON.stringify([{ invoiceNo: 'INV-OLD' }]));
    const { readOrders } = await loadOrders('https://api.test/api/v1');

    expect(readOrders()).toEqual([]);
    expect(localStorage.getItem('VDESK_ORDERS')).toBeNull();
  });

  it('still uses localStorage on the demo build, which has no server to hold them', async () => {
    const { addOrder, readOrders } = await loadOrders('');

    addOrder({ invoiceNo: 'INV-2' });

    expect(readOrders()).toHaveLength(1);
    expect(localStorage.getItem('VDESK_ORDERS')).toContain('INV-2');
  });

  it('is cleared from both stores on sign-out', async () => {
    localStorage.setItem('VDESK_ORDERS', JSON.stringify([{ invoiceNo: 'INV-A' }]));
    sessionStorage.setItem('VDESK_ORDERS', JSON.stringify([{ invoiceNo: 'INV-B' }]));
    const { clearOrders } = await loadOrders('https://api.test/api/v1');

    clearOrders();

    expect(localStorage.getItem('VDESK_ORDERS')).toBeNull();
    expect(sessionStorage.getItem('VDESK_ORDERS')).toBeNull();
  });
});
