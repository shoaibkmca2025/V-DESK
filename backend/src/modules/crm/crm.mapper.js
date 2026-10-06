/**
 * CRM mapper — shapes lead documents for API responses.
 * Rule: _id never leaves the API (rules.md §15); deletedAt and __v are internal.
 */

/** Full lead for staff endpoints. */
export function mapLead(doc) {
  const { _id, __v, deletedAt, ...rest } = doc;
  void _id;
  void __v;
  void deletedAt;
  return rest;
}

/**
 * What the public POST returns: just the reference and time. A replay of someone else's ref must not reveal
 * their contact details, so the public side never gets the stored lead back.
 */
export function mapLeadReceipt(doc) {
  return { ref: doc.ref, createdAt: doc.createdAt };
}

/** One timeline entry; empty optional fields are dropped. */
export function mapActivity(doc) {
  const { _id, __v, leadRef, updatedAt, ...rest } = doc;
  void _id;
  void __v;
  void leadRef;
  void updatedAt;
  return Object.fromEntries(Object.entries(rest).filter(([, value]) => value != null));
}
