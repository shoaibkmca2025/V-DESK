import { api, isApiEnabled } from '@/lib/api.js';

/**
 * Search through /api/v1/search, which ranks the live catalog and applies the synonym and redirect
 * rules the staff console maintains. Returns `null` when there is no API or the request fails, and
 * the caller falls back to the in-browser search over the bundled catalog.
 */

/** API result → the shape the result cards already render (rupees, `id`). */
function mapResult(result) {
  return {
    id: result.ref,
    ref: result.ref,
    name: result.name,
    type: result.type,
    city: result.city,
    locality: result.locality,
    address: result.address,
    capacity: result.capacity,
    priceMonth: typeof result.price_month_paise === 'number' ? Math.round(result.price_month_paise) / 100 : undefined,
    priceHour: typeof result.price_hour_paise === 'number' ? Math.round(result.price_hour_paise) / 100 : undefined,
    status: result.status,
    rating: result.rating,
    reviews: result.reviews,
  };
}

/**
 * Server-ranked search. Returns `null` when there is no API or the call fails, and the page falls
 * back to searching the catalog in the browser.
 */
export async function searchApi(query, { limit } = {}) {
  if (!isApiEnabled() || !query?.trim()) return null;
  try {
    const data = await api.get('/search', { query: { q: query.trim(), limit } });
    if (!data) return null;
    return {
      query: data.query ?? query,
      intent: data.intent ?? null,
      /** Where a one-answer query should go, e.g. /locations/mumbai/coworking. */
      route: data.route ?? null,
      redirected: Boolean(data.redirected),
      filters: data.filters ?? null,
      results: Array.isArray(data.results) ? data.results.map(mapResult) : [],
      services: Array.isArray(data.services) ? data.services : [],
      recommendations: Array.isArray(data.recommendations) ? data.recommendations : [],
    };
  } catch (error) {
    console.warn('[V-DESK] search fell back to the browser index:', error.code);
    return null;
  }
}

/** Type-ahead suggestions; always safe to ignore. */
export async function suggestApi(prefix) {
  if (!isApiEnabled() || !prefix?.trim()) return null;
  try {
    const data = await api.get('/search/suggest', { query: { q: prefix.trim() } });
    return Array.isArray(data) ? data : (data?.suggestions ?? null);
  } catch {
    return null;
  }
}

/** What other visitors searched for — used for the zero-result recovery chips. */
export async function popularSearches() {
  if (!isApiEnabled()) return null;
  try {
    const data = await api.get('/search/popular');
    return Array.isArray(data) ? data : (data?.searches ?? null);
  } catch {
    return null;
  }
}
