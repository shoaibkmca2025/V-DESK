import { CITY_IMAGES, CITY_PRICING_MULTIPLIERS, DISCOVERY_SPACES, LOCATIONS, TESTIMONIALS, WORKSPACES } from '@/data/index.js';
import { api, isApiEnabled } from '@/lib/api.js';

/**
 * Live catalog (centres, workspaces, cities) from GET /api/v1/catalog.
 *
 * The bundled data in `src/data/` stays the fallback: it is what the site ships with, what it
 * shows while the request is in flight, and what it falls back to if the API is unreachable —
 * so prices and centres are never blank. Money is stored in paise by the API and shown in rupees.
 */

const paiseToRupees = (value) => (typeof value === 'number' ? Math.round(value) / 100 : undefined);

/** API centre → the shape the pages and widgets already use. */
export function mapCentre(centre) {
  return {
    id: centre.ref,
    ref: centre.ref,
    city: centre.city,
    cityRef: centre.cityRef,
    areaName: centre.areaName,
    fullName: centre.fullName,
    address: centre.address,
    services: centre.services ?? [],
    vo_price: paiseToRupees(centre.vo_price_paise),
    cw_price: paiseToRupees(centre.cw_price_paise),
    meetingCapacity: centre.meetingCapacity,
    status: centre.status,
    flagship: Boolean(centre.flagship),
  };
}

export function mapWorkspace(workspace) {
  return {
    id: workspace.ref,
    ref: workspace.ref,
    centreId: workspace.centreRef,
    name: workspace.name,
    type: workspace.type,
    city: workspace.city,
    locality: workspace.locality,
    address: workspace.address,
    capacity: workspace.capacity,
    priceMonth: paiseToRupees(workspace.price_month_paise),
    priceHour: paiseToRupees(workspace.price_hour_paise),
    status: workspace.status,
    amenities: workspace.amenities ?? [],
    image: workspace.image,
    rating: workspace.rating,
    reviews: workspace.reviews,
  };
}

export function mapCity(city) {
  return {
    slug: city.slug,
    name: city.name,
    state: city.state,
    tier: city.tier,
    tagline: city.tagline,
    localities: city.localities ?? [],
  };
}

/** What the site falls back to: the data it was built with. */
export function bundledCatalog() {
  return {
    locations: LOCATIONS,
    workspaces: WORKSPACES,
    cities: null,
    discoverySpaces: DISCOVERY_SPACES,
    testimonials: TESTIMONIALS,
    cityImages: CITY_IMAGES,
    cityPricing: CITY_PRICING_MULTIPLIERS,
    source: 'bundled',
  };
}

let inFlight = null;

/**
 * Loads the catalog once per page load. Always resolves — on any failure it resolves with the
 * bundled data and `source: 'bundled'`, so callers never have to handle an error path.
 */
export function loadCatalog({ force = false } = {}) {
  if (!isApiEnabled()) return Promise.resolve(bundledCatalog());
  if (inFlight && !force) return inFlight;

  inFlight = api
    .get('/catalog')
    .then((data) => {
      const centres = Array.isArray(data?.centres) ? data.centres.map(mapCentre) : [];
      const workspaces = Array.isArray(data?.workspaces) ? data.workspaces.map(mapWorkspace) : [];
      const cities = Array.isArray(data?.cities) ? data.cities.map(mapCity) : [];
      // An API that answers with nothing is not an improvement on the bundled catalog.
      if (centres.length === 0) return bundledCatalog();
      return {
        ...bundledCatalog(),
        locations: centres,
        workspaces: workspaces.length ? workspaces : WORKSPACES,
        cities: cities.length ? cities : null,
        source: 'api',
      };
    })
    .catch((error) => {
      console.warn('[V-DESK] catalog came from the bundled data:', error.code ?? error.message);
      return bundledCatalog();
    });

  return inFlight;
}

export function resetCatalogCache() {
  inFlight = null;
}

/**
 * The live ref for a centre the page knows by its bundled id (the scheduler's options still carry
 * `NSK-001`-style ids). Matched on city + area, which is what both sets of data agree on.
 * Returns undefined when the catalog is still the bundled one.
 */
export function liveCentreRef(bundledId, catalogState) {
  if (!catalogState || catalogState.source !== 'api') return undefined;
  const bundled = LOCATIONS.find((centre) => centre.id === bundledId);
  if (!bundled) return undefined;
  const key = `${bundled.city}|${bundled.areaName}`.toLowerCase();
  return catalogState.locations.find((centre) => `${centre.city}|${centre.areaName}`.toLowerCase() === key)?.ref;
}
