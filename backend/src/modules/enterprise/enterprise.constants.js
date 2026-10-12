/**
 * Enterprise constants — organisation roles and their permissions, the RFP pipeline, limits.
 *
 * modules.md §3.13 / phases.md Phase 4 list the features (organisations, multi-user, team bookings, bulk RFP, custom
 * price books, consolidated billing, reports) but no rules. Where a rule is needed this follows the closest existing
 * convention and says so: the RFP pipeline mirrors crm's (one step forward, or LOST from any open stage; final
 * states), organisation roles mirror identity's single permission map, and the last OWNER is protected like identity's
 * last SUPER_ADMIN.
 */

/** Roles a customer can hold in an organisation. */
export const ORG_ROLES = ['OWNER', 'ADMIN', 'MEMBER'];

/** The only place that decides what an organisation member may do (like identity's PERMISSIONS). */
export const ORG_PERMISSIONS = Object.freeze({
  'org:read': ['OWNER', 'ADMIN', 'MEMBER'],
  'org:book': ['OWNER', 'ADMIN', 'MEMBER'],
  'org:members': ['OWNER', 'ADMIN'],
  'org:billing': ['OWNER', 'ADMIN'],
  /** Granting or taking away OWNER. */
  'org:owners': ['OWNER'],
});

export const RFP_STATUSES = ['SUBMITTED', 'UNDER_REVIEW', 'PROPOSAL_SENT', 'WON', 'LOST'];

export const RFP_TRANSITIONS = Object.freeze({
  SUBMITTED: ['UNDER_REVIEW', 'LOST'],
  UNDER_REVIEW: ['PROPOSAL_SENT', 'LOST'],
  PROPOSAL_SENT: ['WON', 'LOST'],
  WON: [],
  LOST: [],
});

/** What can be attributed to an organisation: room bookings (team bookings) and orders (consolidated billing). */
export const LINK_KINDS = ['booking', 'order'];

/** The frontend's enterprise estimator offers these hubs (features/enterprise/enterpriseSuite.js). */
export const MAX_RFP_CITIES = 10;
export const MAX_DESKS = 10_000;
export const MAX_MONTHS = 60;
export const MAX_DISCOUNT_TIERS = 10;

export const LIST_DEFAULT_LIMIT = 25;
export const LIST_MAX_LIMIT = 100;
