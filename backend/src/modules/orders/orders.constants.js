/**
 * Orders constants — sources, statuses and the transition table.
 *
 * No order lifecycle is documented in docs/backend (modules.md §3.7 lists collections and endpoints only), so this
 * is the minimum the docs imply: an order waits for payment, then is paid, cancelled or expires. PAID is reachable
 * only through a verified gateway payment, which is blocked until the payment provider is decided (memory.md §6) —
 * nothing in this module can set it yet. Refund states arrive with refunds.
 */

/** What an order can be created from (modules.md §3.7: "POST /orders (from quote/booking)"). */
export const SOURCE_TYPES = ['quote', 'booking'];

export const ORDER_STATUSES = ['PENDING_PAYMENT', 'PAID', 'CANCELLED', 'EXPIRED'];

/** The only legal status moves (rules.md §5); anything else is 409 INVALID_STATUS_TRANSITION. */
export const ORDER_TRANSITIONS = Object.freeze({
  PENDING_PAYMENT: ['PAID', 'CANCELLED', 'EXPIRED'],
  PAID: [],
  CANCELLED: [],
  EXPIRED: [],
});

/** Statuses an order is still open in — at most one open order per quote / booking. */
export const OPEN_STATUS = 'PENDING_PAYMENT';

export const LIST_DEFAULT_LIMIT = 25;
export const LIST_MAX_LIMIT = 100;
