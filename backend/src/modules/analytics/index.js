/** Public surface of the Analytics module. Other code imports from here, never from the files inside. */
export { analyticsRouter } from './analytics.routes.js';
export { getFunnel, getKpis, ingestEvents, listEvents } from './analytics.service.js';
