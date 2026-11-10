/**
 * Rupee amounts as the interface shows them.
 *
 * Everything here is whole rupees. The paise-exact arithmetic is the API's job
 * (backend/src/shared/lib/money.js); the client only formats what it is given, and never invents a
 * figure when one is missing — a plausible-looking wrong price is worse than an obvious zero.
 */

/** `₹1,24,999` — Indian digit grouping. */
export const rupees = (n) => '₹' + Math.round(Number(n) || 0).toLocaleString('en-IN');

/** An amount from a link or a stored record, in whole rupees. 0 when there is none we could charge. */
export const parseAmount = (raw) => Math.max(0, Math.round(Number(raw) || 0));
