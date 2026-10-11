/**
 * CRM constants — pipeline, transition table and scoring rules.
 * Values mirror frontend/src/data/constants.js and frontend/src/features/crm/leadStore.js so scores and
 * statuses stay identical after the switch-over (rules.md §42).
 */

/** Pipeline order (PRD §42). WON and LOST are terminal. */
export const LEAD_STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'];

/**
 * The only legal status moves (rules.md §5): one step forward, or LOST from any open stage.
 * Anything else is rejected with 409 INVALID_STATUS_TRANSITION.
 */
export const LEAD_TRANSITIONS = Object.freeze({
  NEW: ['CONTACTED', 'LOST'],
  CONTACTED: ['QUALIFIED', 'LOST'],
  QUALIFIED: ['PROPOSAL', 'LOST'],
  PROPOSAL: ['NEGOTIATION', 'LOST'],
  NEGOTIATION: ['WON', 'LOST'],
  WON: [],
  LOST: [],
});

/** Lead score rules (PRD §44, docs/backend/memory.md §4). Same numbers as the client's calculateLeadScore. */
export const LEAD_SCORE_RULES = Object.freeze({
  base: 40,
  mobile: 20,
  corporateEmail: 15,
  company: 10,
  qualified: 15,
  max: 100,
});

/** An email whose address contains one of these is not "corporate" (matches the client heuristic). */
export const FREE_EMAIL_PROVIDERS = ['gmail', 'yahoo'];

/** Lead refs: `VD-` + upper-case letters/digits/dashes, e.g. VD-MU2E5O7Y (server) or VD-MUM-8921 (client). */
export const LEAD_REF_PATTERN = /^VD-[A-Z0-9-]{4,40}$/;

/** Indian mobile, after removing spaces, dashes and brackets: optional +91/91, then 10 digits starting 6–9. */
export const MOBILE_PATTERN = /^(\+?91)?[6-9]\d{9}$/;

export const ACTIVITY_TYPES = ['created', 'status_changed', 'assigned', 'note'];

export const LIST_DEFAULT_LIMIT = 25;
export const LIST_MAX_LIMIT = 100;

/**
 * Per-contact limit on new enquiries (rules.md §11): the same mobile or email at most CONTACT_LIMIT times per
 * window. Stops form spam — and, once notifications send confirmations, flooding a stranger's WhatsApp.
 */
export const CONTACT_LIMIT = 3;
export const CONTACT_WINDOW_MS = 60 * 60 * 1000;

/** Marketing touch fields (PRD §60): UTM values, click ids, and where the visit came from / landed. */
export const TOUCH_FIELDS = [
  'source',
  'medium',
  'campaign',
  'term',
  'content',
  'referrer',
  'landingPage',
  'gclid',
  'fbclid',
];
