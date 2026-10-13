/** Public surface of the KYC module. Other code imports from here, never from the files inside. */
export { kycRouter } from './kyc.routes.js';
/** Status and owner of an application, for modules that depend on KYC approval (subscriptions). */
export { getApplicationSummary } from './kyc.service.js';
