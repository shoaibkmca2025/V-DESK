/**
 * Pure search rules ported from the client (frontend/src/features/search/parseSearchIntent.js and searchEngine.js).
 * Behaviour is kept identical, quirks included, so results do not change when the client switches to the API
 * (rules.md §42). No I/O here; search.service.js feeds it data.
 */
import {
  CENTRE_SEARCH_CAPACITY,
  INTENT_CITIES,
  INTENT_LOCALITIES,
  INTENT_TO_TYPE,
  PRODUCT_SLUGS,
  SERVICE_ROUTES,
} from './search.constants.js';

/** Lower-case, trim and collapse whitespace — the form redirects and synonyms are stored and matched in. */
export function normalizeQuery(query) {
  return (query || '').toLowerCase().trim().replace(/\s+/g, ' ');
}

/**
 * Natural-language intent (PRD §10): "Office for 8 people in Gurgaon" →
 * { intent: 'Private Office', location: 'Gurgaon', capacity: 8, … }. Returns null for a blank query.
 */
export function parseSearchIntent(query) {
  if (!query || !query.trim()) return null;
  const q = query.toLowerCase().trim();

  const city = INTENT_CITIES.find((c) => q.includes(c));
  const location = city ? city.charAt(0).toUpperCase() + city.slice(1) : null;
  const locality = INTENT_LOCALITIES.find(([key]) => q.includes(key))?.[1] ?? null;
  const capacity = parseCapacity(q);
  const { intent, service } = classifyIntent(q, capacity, location);

  return {
    rawQuery: query,
    intent,
    location,
    locality,
    capacity,
    service,
    summary: `${intent}${location ? ' • ' + location : ''}${locality ? ' (' + locality + ')' : ''}${capacity ? ' • ' + capacity + ' Pax' : ''}${service ? ' • ' + service : ''}`,
  };
}

/** "for 8 people", "10 pax", "room for 4" → number; only counted when a people-ish word is present (≤ 200). */
function parseCapacity(q) {
  const match = q.match(/(?:for|seats|capacity of)?\s*(\d+)\s*(?:people|pax|seats|persons|members)?/);
  if (!match || parseInt(match[1], 10) <= 0) return null;
  const num = parseInt(match[1], 10);
  const peopleWord = ['people', 'pax', 'seats', 'office for', 'room for'].some((word) => q.includes(word));
  return num <= 200 && peopleWord ? num : null;
}

function classifyIntent(q, capacity, location) {
  const has = (...words) => words.some((word) => q.includes(word));
  if (has('virtual office', 'business address', 'mailing address', 'apob', 'ppob')) {
    return { intent: 'Virtual Office', service: null };
  }
  if (has('meeting room', 'boardroom', 'conference', 'huddle')) return { intent: 'Meeting Room', service: null };
  if (has('private office', 'cabin') || (capacity && capacity >= 4) || has('team office')) {
    return { intent: 'Private Office', service: null };
  }
  if (has('coworking', 'desk', 'shared office')) return { intent: 'Coworking', service: null };
  if (has('gst', 'tax')) return { intent: 'Business Service', service: 'GST Registration' };
  if (has('company', 'incorporation', 'pvt ltd', 'llp', 'opc')) {
    return { intent: 'Business Service', service: 'Company Registration' };
  }
  return { intent: location ? 'Location Hub Explorer' : 'General Discovery', service: null };
}

/** Landing page for a well-formed query (PRD §14): "virtual office mumbai" → /locations/mumbai/virtual-office. */
export function routeForIntent(parsed) {
  if (!parsed) return null;
  const city = parsed.location?.toLowerCase();
  const productSlug = PRODUCT_SLUGS[parsed.intent];
  if (city && productSlug) return `/locations/${city}/${productSlug}`;
  if (parsed.intent === 'Business Service' && SERVICE_ROUTES[parsed.service]) return SERVICE_ROUTES[parsed.service];
  if (city && parsed.intent === 'Location Hub Explorer') return `/locations/${city}`;
  return null;
}

export function capacityBucket(capacity) {
  if (capacity <= 1) return '1';
  if (capacity <= 5) return '2-5';
  if (capacity <= 10) return '6-10';
  if (capacity <= 25) return '11-25';
  return '25+';
}

/** Overlays the filters a query implies (city / type / capacity) on `base`, like the client's filtersFromIntent. */
export function filtersFromIntent(parsed, base) {
  const filters = { ...base };
  if (!parsed) return filters;
  filters.city = parsed.location || 'all';
  filters.type = INTENT_TO_TYPE[parsed.intent] ?? 'all';
  if (parsed.capacity) filters.capacity = capacityBucket(parsed.capacity);
  return filters;
}

export function matchesCapacity(capacityFilter, capacity) {
  switch (capacityFilter) {
    case '1':
      return capacity === 1;
    case '2-5':
      return capacity >= 2 && capacity <= 5;
    case '6-10':
      return capacity >= 6 && capacity <= 10;
    case '11-25':
      return capacity >= 11 && capacity <= 25;
    case '25+':
      return capacity >= 25;
    default:
      return true;
  }
}

/**
 * Centres (as virtual offices) + workspaces as one searchable list, in the client's item shape. Money stays in
 * paise (rules.md §13). Centres have no capacity or reviews in catalog: capacity is the client's fixed 10, and
 * rating/reviews are null rather than invented numbers (decision 2026-10-07, docs/backend/memory.md).
 */
export function buildInventory(centres, workspaces) {
  const addressByCentre = new Map(centres.map((c) => [c.ref, c.address]));
  const centreItems = centres.map((c) => ({
    ref: c.ref,
    name: c.fullName,
    type: 'Virtual Office',
    city: c.city,
    locality: c.areaName,
    address: c.address,
    capacity: CENTRE_SEARCH_CAPACITY,
    price_month_paise: c.vo_price_paise,
    status: c.status,
    rating: null,
    reviews: null,
  }));
  const workspaceItems = workspaces.map((w) => ({
    ref: w.ref,
    name: w.name,
    type: w.type,
    city: w.city,
    locality: w.locality,
    address: addressByCentre.get(w.centreRef) ?? '',
    capacity: w.capacity,
    price_month_paise: w.price_month_paise,
    status: w.status,
    rating: w.rating,
    reviews: w.reviews,
  }));
  return [...centreItems, ...workspaceItems];
}

/**
 * Applies explorer filters (city / type / capacity / max price in rupees) — same rules as the client's
 * filterInventory. A missing maxPrice means no price cap.
 */
export function filterItems(items, filters) {
  const maxPaise = filters.maxPrice == null ? null : filters.maxPrice * 100;
  return items.filter((item) => {
    if (filters.city !== 'all' && item.city.toLowerCase() !== filters.city.toLowerCase()) return false;
    if (filters.type !== 'all' && item.type.toLowerCase() !== filters.type.toLowerCase()) return false;
    if (!matchesCapacity(filters.capacity, item.capacity)) return false;
    return maxPaise == null || (item.price_month_paise != null && item.price_month_paise <= maxPaise);
  });
}

/**
 * Orders results. `recommended` keeps inventory order but lifts promoted centres to the top, in the order the
 * admin listed them (modules.md §3.3); explicit sorts are the visitor's choice and ignore promotion.
 */
export function sortItems(items, sort, promotedRefs = []) {
  const sorted = [...items];
  if (sort === 'price-asc') return sorted.sort((a, b) => a.price_month_paise - b.price_month_paise);
  if (sort === 'price-desc') return sorted.sort((a, b) => b.price_month_paise - a.price_month_paise);
  if (sort === 'capacity') return sorted.sort((a, b) => b.capacity - a.capacity);
  const rank = new Map(promotedRefs.map((ref, index) => [ref, index]));
  const unpromoted = rank.size;
  const promotedRank = (item) =>
    item.type === 'Virtual Office' && rank.has(item.ref) ? rank.get(item.ref) : unpromoted;
  return sorted.sort((a, b) => promotedRank(a) - promotedRank(b));
}

/** Business services matching the query (name / slug / suitability keywords) — the client's matchServices. */
export function matchServices(query, services) {
  const q = (query || '').toLowerCase();
  if (!q.trim()) return [];
  const words = q.split(/\s+/).filter((word) => word.length > 3);
  return services.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      q.includes(s.slug.replace('-', ' ')) ||
      q.includes(s.slug.split('-')[0]) ||
      s.suitability.some((item) => words.some((word) => item.toLowerCase().includes(word))),
  );
}
