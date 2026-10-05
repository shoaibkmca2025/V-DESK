/**
 * Catalog mapper — strips internal MongoDB fields before sending to the client.
 * Rule: _id never leaves the API (rules.md §15); deletedAt and __v are also internal.
 */

/** Shape a City document for the API response. */
export function mapCity(doc) {
  const { _id, __v, deletedAt, ...rest } = doc;
  void _id; void __v; void deletedAt;
  return rest;
}

/** Shape a Centre document for the API response. */
export function mapCentre(doc) {
  const { _id, __v, deletedAt, ...rest } = doc;
  void _id; void __v; void deletedAt;
  return rest;
}

/** Shape a Workspace document for the API response. */
export function mapWorkspace(doc) {
  const { _id, __v, deletedAt, ...rest } = doc;
  void _id; void __v; void deletedAt;
  return rest;
}
