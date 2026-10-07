/**
 * Search constants — tables copied from frontend/src/features/search/parseSearchIntent.js and searchEngine.js so
 * the server reproduces the client's search exactly (rules.md §42). Change them together with the client.
 */

/** Cities the intent parser recognises, in match order (first hit wins). */
export const INTENT_CITIES = [
  'mumbai',
  'delhi',
  'bangalore',
  'nashik',
  'pune',
  'hyderabad',
  'gurgaon',
  'noida',
  'chennai',
  'kolkata',
];

/** Locality keyword → display name, in match order (first hit wins). */
export const INTENT_LOCALITIES = [
  ['bkc', 'Bandra Kurla Complex (BKC)'],
  ['andheri', 'Andheri East'],
  ['lower parel', 'Lower Parel'],
  ['connaught place', 'Connaught Place'],
  ['cp', 'Connaught Place'],
  ['koramangala', 'Koramangala'],
  ['hsr', 'HSR Layout'],
  ['college road', 'College Road'],
  ['gangapur road', 'Gangapur Road'],
  ['baner', 'Baner'],
  ['viman nagar', 'Viman Nagar'],
  ['cyber city', 'DLF Cyber City'],
  ['hitec', 'HITEC City'],
];

/** Workspace types as stored by catalog and used by the explorer's type filter. */
export const WORKSPACE_TYPES = ['Virtual Office', 'Coworking', 'Private Office', 'Meeting Rooms'];

/** Intents that map straight onto an explorer type filter. "Meeting Room" (intent) → "Meeting Rooms" (type). */
export const INTENT_TO_TYPE = Object.freeze({
  'Virtual Office': 'Virtual Office',
  Coworking: 'Coworking',
  'Private Office': 'Private Office',
  'Meeting Room': 'Meeting Rooms',
});

/** Intent → product slug for /locations/:city/:product landing pages (routeForQuery). */
export const PRODUCT_SLUGS = Object.freeze({
  'Virtual Office': 'virtual-office',
  Coworking: 'coworking',
  'Meeting Room': 'meeting-rooms',
  'Private Office': 'private-office',
});

/** Business-service intent → landing page. */
export const SERVICE_ROUTES = Object.freeze({
  'GST Registration': '/services/gst-registration',
  'Company Registration': '/services/company-registration',
});

export const CAPACITY_BUCKETS = ['all', '1', '2-5', '6-10', '11-25', '25+'];
export const SORTS = ['recommended', 'price-asc', 'price-desc', 'capacity'];

/** The client gives every virtual-office centre this capacity in search; catalog has no centre capacity. */
export const CENTRE_SEARCH_CAPACITY = 10;

/** Zero results: drop filters one at a time in this order until something matches (cumulative). */
export const RELAX_ORDER = ['capacity', 'type', 'city'];

/** Zero-result suggestion chips, as on the client's /search page. */
export const SIMILAR_CITY_COUNT = 5;
export const FALLBACK_SERVICE_SUGGESTIONS = ['GST Registration', 'Company Registration'];

/** Keys allowed in search_config, with what each value holds. */
export const CONFIG_KEYS = ['promotedCentres', 'popularSearches'];

export const SUGGEST_LIMIT = 8;
export const POPULAR_MAX = 20;
export const PROMOTED_MAX = 50;

/** Redirect / synonym refs: prefix + upper-case letters and digits. */
export const REDIRECT_REF_PATTERN = /^RDR-[A-Z0-9]{4,40}$/;
