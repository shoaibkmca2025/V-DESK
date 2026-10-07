/** Public surface of the Search module. Other code imports from here, never from the files inside. */
export { searchRouter } from './search.routes.js';
export { getPopularSearches, search, suggest } from './search.service.js';
export { parseSearchIntent } from './search.intent.js';
