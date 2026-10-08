/**
 * Identity middleware — the staff guards every module's routes use (exported from index.js).
 *
 *   authenticate           Bearer access token → req.user + req.actor (the user's ref)
 *   requirePermission(p)   403 unless req.user's role holds permission p (identity.constants.js PERMISSIONS)
 *   requireStaff(p)        both of the above — or, while the admin console still uses it, the legacy
 *                          x-admin-key, which keeps full access until it is retired
 */
import { forbidden, unauthorized } from '../../shared/errors/AppError.js';
import { requireAdminKey } from '../../shared/middleware/requireAdminKey.js';
import { hasPermission } from './identity.mapper.js';
import { authenticateAccessToken } from './identity.service.js';

function bearerToken(req) {
  const [scheme, token] = (req.get('authorization') ?? '').split(' ');
  return scheme === 'Bearer' && token ? token : null;
}

export async function authenticate(req, _res, next) {
  const token = bearerToken(req);
  if (!token) return next(unauthorized('AUTH_REQUIRED', 'Please sign in to continue'));
  req.user = await authenticateAccessToken(token);
  req.actor = req.user.ref;
  next();
}

export function requirePermission(permission) {
  return (req, _res, next) => {
    if (!req.user || !hasPermission(req.user.role, permission)) return next(forbidden());
    next();
  };
}

export function requireStaff(permission) {
  const checkPermission = requirePermission(permission);
  return async (req, res, next) => {
    // TODO(identity): drop the x-admin-key branch once the admin console signs in with JWT.
    if (!req.get('authorization')) return requireAdminKey(req, res, next);
    await authenticate(req, res, (err) => (err ? next(err) : checkPermission(req, res, next)));
  };
}
