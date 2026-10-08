/**
 * Pricing mapper — shapes quotes and rules for API responses.
 * Internal fields (_id, idempotency data, the raw request item) never leave the API.
 */
import { OPEN_STATUSES } from './pricing.constants.js';

/** A quote past its validity that nobody accepted or rejected reads as EXPIRED (no expiry job yet). */
export function effectiveStatus(doc, now = new Date()) {
  return OPEN_STATUSES.includes(doc.status) && doc.validUntil <= now ? 'EXPIRED' : doc.status;
}

/** What anyone with the share link sees. */
export function mapQuote(doc, now = new Date()) {
  return {
    ref: doc.ref,
    status: effectiveStatus(doc, now),
    productType: doc.productType,
    product: doc.product,
    purpose: doc.purpose,
    tenure: doc.tenure,
    rate_month_paise: doc.rate_month_paise,
    name: doc.name,
    company: doc.company,
    pricing: doc.pricing,
    validUntil: doc.validUntil,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

/** Staff view adds the status timeline. */
export function mapQuoteForStaff(doc, now = new Date()) {
  return { ...mapQuote(doc, now), history: doc.history };
}

export function mapRule(key, value, override) {
  return {
    key,
    value,
    source: override ? 'custom' : 'default',
    updatedBy: override?.updatedBy ?? null,
    updatedAt: override?.updatedAt ?? null,
  };
}
