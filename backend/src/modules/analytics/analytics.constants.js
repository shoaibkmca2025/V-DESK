/**
 * Analytics constants — event limits, privacy rules, KPI ranges and the conversion funnel.
 * Event type names are the ones features/analytics/telemetry.js already sends (trackSearchEvent).
 */

/** `snake_case`, like every type the client sends (search_submitted, quote_started, …). */
export const EVENT_TYPE_PATTERN = /^[a-z][a-z0-9_]{1,62}$/;
export const DEVICES = ['Mobile', 'Desktop', 'Unknown'];

export const MAX_BATCH = 50;
/** Serialised size cap per event's `data`, after PII is removed. Bigger payloads are replaced, not stored. */
export const MAX_DATA_BYTES = 2048;
export const MAX_STRING_LENGTH = 200;
export const MAX_ARRAY_ITEMS = 20;
export const MAX_DEPTH = 3;

/**
 * Keys dropped from `data` wherever they appear (rules.md §21: no PII in analytics events). Compared
 * case-insensitively. `fileName` is here because KYC uploads send it and file names often carry names.
 */
export const PII_KEYS = ['name', 'email', 'mobile', 'phone', 'filename', 'pan', 'aadhaar', 'address', 'gstin'];

/** Client timestamps outside this window (bad clocks, replays) are replaced by the time we received them. */
export const MAX_CLOCK_SKEW_MS = 5 * 60 * 1000;
export const MAX_EVENT_AGE_MS = 7 * 24 * 60 * 60 * 1000;

/** Hot retention 13 months (logs.md §1); a TTL index deletes older events. */
export const RETENTION_SECONDS = 395 * 24 * 60 * 60;

export const RANGES = { '24h': 1, '7d': 7, '30d': 30, '90d': 90 };
export const DEFAULT_RANGE = '7d';
export const TOP_N = 10;

export const SEARCH_TYPES = ['search_submitted', 'hero_search'];
export const NO_RESULT_TYPE = 'search_no_results';

/**
 * Discover → Search → Quote → Checkout → KYC → Pay (memory.md §1). Counted in events, not visitors —
 * the client sends no session id yet, so step-to-step rates are indicative.
 */
export const FUNNEL_STEPS = [
  { key: 'search', label: 'Searched', types: SEARCH_TYPES },
  { key: 'result_click', label: 'Opened a result', types: ['search_result_clicked', 'search_suggestion_selected'] },
  { key: 'quote', label: 'Started a quote', types: ['quote_started'] },
  { key: 'checkout', label: 'Started checkout', types: ['checkout_started'] },
  { key: 'kyc', label: 'Submitted KYC', types: ['kyc_submitted'] },
  { key: 'payment', label: 'Paid', types: ['payment_success'] },
];

export const LIST_DEFAULT_LIMIT = 50;
export const LIST_MAX_LIMIT = 200;
