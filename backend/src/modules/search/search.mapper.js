/**
 * Search mapper — shapes documents for API responses.
 * Rule: _id never leaves the API (rules.md §15); deletedAt and __v are internal.
 */

function stripInternal(doc) {
  const { _id, __v, deletedAt, ...rest } = doc;
  void _id;
  void __v;
  void deletedAt;
  return rest;
}

/** What a search result needs to render a service card on the client (slug, name, icon, price, unit). */
export function mapServiceSummary(doc) {
  return {
    slug: doc.slug,
    name: doc.name,
    icon: doc.icon,
    starting_price_paise: doc.starting_price_paise,
    priceUnit: doc.priceUnit,
  };
}

export const mapSynonym = stripInternal;
export const mapRedirect = stripInternal;
export const mapConfigEntry = stripInternal;
