import { api, idempotencyKey, isApiEnabled } from '@/lib/api.js';

/**
 * Quotes and prices from /api/v1/pricing.
 *
 * Prices are calculated on the server from the catalog — the client never sends an amount, it
 * sends what the visitor chose. Returns `null` with no API configured so the on-page calculators
 * keep working from the bundled price list.
 */

const rupees = (paise) => (typeof paise === 'number' ? Math.round(paise) / 100 : undefined);

/** Normalises a priced quote so the UI can show rupees without knowing about paise. */
function mapQuote(quote) {
  if (!quote) return null;
  return {
    ...quote,
    subtotal: rupees(quote.subtotal_paise ?? quote.subtotalPaise),
    tax: rupees(quote.tax_paise ?? quote.taxPaise),
    total: rupees(quote.total_paise ?? quote.totalPaise),
  };
}

/** Live price for a configuration, without saving anything. */
export async function previewQuote(item) {
  if (!isApiEnabled()) return null;
  try {
    return mapQuote(await api.post('/pricing/quote-preview', { body: item }));
  } catch (error) {
    console.warn('[V-DESK] price preview unavailable:', error.code);
    return null;
  }
}

/** Saves a quote and returns its shareable ref (VDQ-…). Throws so the form can show the reason. */
export async function createQuote({ name, company, item }) {
  if (!isApiEnabled()) return null;
  return mapQuote(await api.post('/pricing/quotes', { idempotencyKey: idempotencyKey('quote'), body: { name, company, item } }));
}

export async function fetchQuote(ref) {
  if (!isApiEnabled() || !ref) return null;
  try {
    return mapQuote(await api.get(`/pricing/quotes/${ref}`));
  } catch {
    return null;
  }
}

/** What the customer can do with a quote link: VIEWED, ACCEPTED or REJECTED. */
export async function setQuoteStatus(ref, status) {
  if (!isApiEnabled() || !ref) return null;
  try {
    return mapQuote(await api.patch(`/pricing/quotes/${ref}/status`, { body: { status } }));
  } catch (error) {
    console.warn('[V-DESK] quote status not updated:', error.code);
    return null;
  }
}
