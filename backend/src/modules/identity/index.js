/** Public surface of the Identity module. Other code imports from here, never from the files inside. */
export { identityRouter } from './identity.routes.js';
export {
  authenticate,
  optionalCustomer,
  requireCustomer,
  requirePermission,
  requireStaff,
} from './identity.middleware.js';
export { hasPermission, mapCustomer, permissionsFor } from './identity.mapper.js';
export { createUser, getUser, isAuthConfigured, listUsers } from './identity.service.js';
export { derivePasswordKey } from './identity.passwordKey.js';
export { PERMISSIONS, STAFF_ROLES } from './identity.constants.js';
