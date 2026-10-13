/** Public surface of the Identity module. Other code imports from here, never from the files inside. */
export { identityRouter } from './identity.routes.js';
export { authenticate, requirePermission, requireStaff, requireStaffUser } from './identity.middleware.js';
export { resolveCustomer } from './identity.customer.js';
export { requireCustomer, requireCustomerOrStaff, requireStaffPrincipal } from './identity.principal.js';
export { hasPermission, permissionsFor } from './identity.mapper.js';
export { createUser, getUser, isAuthConfigured, listUsers } from './identity.service.js';
export { PERMISSIONS, STAFF_ROLES } from './identity.constants.js';
