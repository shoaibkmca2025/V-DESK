/**
 * Pricing constants — products, quote states, and the default pricing rules.
 *
 * Money is integer paise and rates are basis points (1800 = 18 %), so no float ever touches an amount
 * (rules.md §13). DEFAULT_PRICING_RULES are today's frontend numbers (memory.md §4); staff can override
 * any key through PUT /pricing/rules/:key, and deleting the override brings the default back.
 * pricing.engine.test.js checks these against frontend/src/data so the two can't drift silently.
 */

export const BASIS_POINTS = 10_000;

export const PRODUCTS = ['virtual_office', 'meeting_room', 'enterprise_desks', 'bundle'];
export const RULE_KEYS = ['tax', 'virtual_office', 'meeting_room', 'enterprise_desks', 'bundle'];

export const VO_ADDONS = ['gst', 'mail', 'meetingCredits'];

export const DEFAULT_PRICING_RULES = Object.freeze({
  /** frontend/src/data/constants.js GST_RATE */
  tax: { gst_bp: 1800 },

  /** features/virtualOffice/voConfigurator.js + data/cityPricing.js (labels and `adj`; `mult` is unused there) */
  virtual_office: {
    addons_month_paise: { gst: 35000, mail: 29900, meetingCredits: 99900 },
    incorporation_once_paise: 299900,
    annual_discount_bp: 2000,
    city_adjustments: {
      Nashik: { adj_month_paise: 0, label: 'Nashik HQ' },
      Pune: { adj_month_paise: 20000, label: 'Pune Metros' },
      Mumbai: { adj_month_paise: 75000, label: 'Mumbai MMR Grade-A' },
      Delhi: { adj_month_paise: 55000, label: 'Delhi Connaught Place' },
      Bangalore: { adj_month_paise: 50000, label: 'Bangalore Koramangala' },
      Hyderabad: { adj_month_paise: 35000, label: 'Hyderabad HITEC City' },
      Gurgaon: { adj_month_paise: 65000, label: 'Gurgaon DLF Cyber City' },
      Noida: { adj_month_paise: 25000, label: 'Noida Sector 62' },
    },
  },

  /** data/meetingRooms.js rates + features/meetingRooms/roomBooking.js duration discount (≥8 h 20 %, ≥4 h 10 %) */
  meeting_room: {
    rooms: [
      { name: 'Huddle Room', capacity: '4 Pax', hour_paise: 49900 },
      { name: 'Conference Room', capacity: '8 Pax', hour_paise: 79900 },
      { name: 'Boardroom', capacity: '12 Pax', hour_paise: 119900 },
      { name: 'Training Hall', capacity: '20 Pax', hour_paise: 199900 },
    ],
    duration_discounts: [
      { min_hours: 8, discount_bp: 2000 },
      { min_hours: 4, discount_bp: 1000 },
    ],
  },

  /** features/enterprise/enterpriseSuite.js: ₹7,999/desk/month, bulk rebate 5/15/25/35 % */
  enterprise_desks: {
    desk_month_paise: 799900,
    bulk_discounts: [
      { min_desks: 200, discount_bp: 3500 },
      { min_desks: 100, discount_bp: 2500 },
      { min_desks: 50, discount_bp: 1500 },
      { min_desks: 1, discount_bp: 500 },
    ],
  },

  /** features/wizard/setupWizard.js: fixed all-inclusive prices, 15 % off from 3 services */
  bundle: {
    items: {
      'virtual-office': { label: 'Virtual Office', price_paise: 1498800 },
      'gst-registration': { label: 'GST Registration', price_paise: 199900 },
      'company-incorporation': { label: 'Company Incorporation', price_paise: 499900 },
      'trademark-registration': { label: 'Trademark Registration', price_paise: 199900 },
      'coworking-access': { label: 'Coworking Access', price_paise: 999900 },
      'meeting-room-credits': { label: 'Meeting Room Credits', price_paise: 499900 },
    },
    discount_min_items: 3,
    discount_bp: 1500,
  },
});

// ──────────────────────────────────────────────
// Quotes
// ──────────────────────────────────────────────

export const QUOTE_STATUSES = ['DRAFT', 'SENT', 'VIEWED', 'ACCEPTED', 'REJECTED', 'EXPIRED'];

/** The only legal status moves (rules.md §5); anything else is 409 INVALID_STATUS_TRANSITION. */
export const QUOTE_TRANSITIONS = Object.freeze({
  DRAFT: ['SENT'],
  SENT: ['VIEWED', 'ACCEPTED', 'REJECTED', 'EXPIRED'],
  VIEWED: ['ACCEPTED', 'REJECTED', 'EXPIRED'],
  ACCEPTED: [],
  REJECTED: [],
  EXPIRED: [],
});

/** What whoever holds the share link may do. */
export const CUSTOMER_STATUS_CHANGES = ['VIEWED', 'ACCEPTED', 'REJECTED'];
export const OPEN_STATUSES = ['DRAFT', 'SENT', 'VIEWED'];

/** "Prices valid for 14 days from issue" — pages/account/QuotePage.jsx. */
export const QUOTE_VALIDITY_DAYS = 14;

export const LIST_DEFAULT_LIMIT = 25;
export const LIST_MAX_LIMIT = 100;
