/** Public surface of the Catalog module. Other code imports from here, never from the files inside. */
export { catalogRouter } from './catalog.routes.js';
export {
  getCatalogBundle,
  getCentre,
  getCity,
  getWorkspace,
  listCentres,
  listCities,
  listWorkspaces,
} from './catalog.service.js';
