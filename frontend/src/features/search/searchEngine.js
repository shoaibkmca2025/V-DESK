import { catalog } from '@/features/catalog/catalogStore.js';
import { SERVICES } from '@/data/services.js';
import { parseSearchIntent } from './parseSearchIntent.js';

/* Pure search helpers shared by the results modal and the /search page (PRD §14–16). */

export const DEFAULT_MAX_PRICE = 15000;

export function createExplorerFilters() {
  return {
    city: 'all',
    type: 'all',
    capacity: 'all',
    maxPrice: DEFAULT_MAX_PRICE,
    sort: 'recommended',
    amenities: { gst: true, wifi: false, parking: false, meeting: false, access247: false },
  };
}

export function capacityBucket(capacity) {
  if (capacity <= 1) return '1';
  if (capacity <= 5) return '2-5';
  if (capacity <= 10) return '6-10';
  if (capacity <= 25) return '11-25';
  return '25+';
}

/** Virtual office centres + marketplace workspaces as one searchable inventory. */
export function searchableInventory() {
  const centres = catalog.locations.map((loc) => ({
    id: loc.id,
    name: loc.fullName,
    type: 'Virtual Office',
    city: loc.city,
    locality: loc.areaName,
    address: loc.address,
    capacity: 10,
    priceMonth: loc.vo_price,
    status: loc.status,
    rating: 4.9,
    reviews: 160 + (loc.vo_price % 70),
  }));

  const workspaces = catalog.workspaces.map((ws) => ({
    id: ws.id,
    name: ws.name,
    type: ws.type,
    city: ws.city,
    locality: ws.locality,
    address: ws.address,
    capacity: ws.capacity,
    priceMonth: ws.priceMonth,
    status: ws.status,
    rating: ws.rating,
    reviews: ws.reviews,
  }));

  return [...centres, ...workspaces];
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

/** Applies explorer filters + sort to the inventory. */
export function filterInventory(filters, items = searchableInventory()) {
  const filtered = items.filter((item) => {
    if (filters.city !== 'all' && item.city.toLowerCase() !== filters.city.toLowerCase()) return false;
    if (filters.type !== 'all' && item.type.toLowerCase() !== filters.type.toLowerCase()) return false;
    if (!matchesCapacity(filters.capacity, item.capacity)) return false;
    return item.priceMonth <= filters.maxPrice;
  });

  if (filters.sort === 'price-asc') filtered.sort((a, b) => a.priceMonth - b.priceMonth);
  else if (filters.sort === 'price-desc') filtered.sort((a, b) => b.priceMonth - a.priceMonth);
  else if (filters.sort === 'capacity') filtered.sort((a, b) => b.capacity - a.capacity);
  return filtered;
}

/** Filters derived from a natural-language query (city / workspace type / capacity). */
export function filtersFromIntent(parsed, base = createExplorerFilters()) {
  const filters = { ...base };
  if (!parsed) return filters;
  filters.city = parsed.location || 'all';
  const explorerTypes = ['Virtual Office', 'Coworking', 'Private Office', 'Meeting Room'];
  filters.type = explorerTypes.includes(parsed.intent) ? (parsed.intent === 'Meeting Room' ? 'Meeting Rooms' : parsed.intent) : 'all';
  if (parsed.capacity) filters.capacity = capacityBucket(parsed.capacity);
  return filters;
}

/** Business services matching the query (name / slug / suitability keywords). */
export function matchServices(query) {
  const q = (query || '').toLowerCase();
  if (!q.trim()) return [];
  return SERVICES.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      q.includes(s.slug.replace('-', ' ')) ||
      q.includes(s.slug.split('-')[0]) ||
      s.suitability.some((item) => q.split(/\s+/).some((word) => word.length > 3 && item.toLowerCase().includes(word))),
  );
}

/** Direct routing for well-formed queries (PRD §14): "virtual office mumbai" → /locations/mumbai/virtual-office. */
export function routeForQuery(query) {
  const parsed = parseSearchIntent(query);
  if (!parsed) return null;
  const city = parsed.location?.toLowerCase();
  const productSlug = { 'Virtual Office': 'virtual-office', Coworking: 'coworking', 'Meeting Room': 'meeting-rooms', 'Private Office': 'private-office' }[parsed.intent];
  if (city && productSlug) return `/locations/${city}/${productSlug}`;
  if (parsed.intent === 'Business Service' && parsed.service === 'GST Registration') return '/services/gst-registration';
  if (parsed.intent === 'Business Service' && parsed.service === 'Company Registration') return '/services/company-registration';
  if (city && parsed.intent === 'Location Hub Explorer') return `/locations/${city}`;
  return null;
}
