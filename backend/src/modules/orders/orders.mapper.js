/**
 * Orders mapper — shapes orders for API responses.
 * Internal fields (_id, idempotency data) never leave the API. Orders hold no customer details at all.
 */

/** An open order past `expiresAt` reads as EXPIRED even before anything persists it. */
export function effectiveStatus(doc, now = new Date()) {
  return doc.status === 'PENDING_PAYMENT' && doc.expiresAt <= now ? 'EXPIRED' : doc.status;
}

/** What anyone with the order ref sees. */
export function mapOrder(doc, now = new Date()) {
  return {
    ref: doc.ref,
    status: effectiveStatus(doc, now),
    source: { type: doc.source.type, ref: doc.source.ref },
    description: doc.description,
    tenure: doc.tenure,
    currency: doc.currency,
    total_paise: doc.total_paise,
    pricing: doc.pricing,
    expiresAt: doc.expiresAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

/** Staff view adds the status timeline. */
export function mapOrderForStaff(doc, now = new Date()) {
  return { ...mapOrder(doc, now), history: doc.history };
}
