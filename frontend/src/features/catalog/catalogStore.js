import {
  CITY_IMAGES,
  CITY_PRICING_MULTIPLIERS,
  DISCOVERY_SPACES,
  LOCATIONS,
  TESTIMONIALS,
  WORKSPACES,
} from '@/data/index.js';
import { loadCatalog } from './catalogApi.js';

/**
 * Catalog used by the widgets (locations, workspaces, discovery spaces, testimonials, pricing rules).
 *
 * It starts as the data the site was built with, so the first paint never waits for a request, and
 * is replaced in place by the live catalog once `hydrateCatalog()` resolves. Widgets that render
 * from it listen for `vdesk:catalog` to redraw.
 */
export const catalog = {
  locations: LOCATIONS,
  workspaces: WORKSPACES,
  discoverySpaces: DISCOVERY_SPACES,
  testimonials: TESTIMONIALS,
  cityImages: CITY_IMAGES,
  cityPricing: CITY_PRICING_MULTIPLIERS,
  /** 'bundled' until the API answers, then 'api'. */
  source: 'bundled',
};

export const CATALOG_EVENT = 'vdesk:catalog';

let hydrated = null;

/** Fetches the live catalog once per page load and swaps it into `catalog`. Always resolves. */
export function hydrateCatalog() {
  hydrated ??= loadCatalog().then((live) => {
    if (live.source !== 'api') return catalog;
    catalog.locations = live.locations;
    catalog.workspaces = live.workspaces;
    catalog.source = 'api';
    if (typeof document !== 'undefined') {
      document.dispatchEvent(new CustomEvent(CATALOG_EVENT, { detail: { source: 'api' } }));
    }
    return catalog;
  });
  return hydrated;
}
