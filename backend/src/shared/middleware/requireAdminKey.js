import { createHash, timingSafeEqual } from 'node:crypto';
import { env } from '../../config/env.js';
import { AppError, unauthorized } from '../errors/AppError.js';

// Hashing first gives equal-length buffers, so timingSafeEqual never throws and the key length isn't leaked.
const digest = (value) => createHash('sha256').update(value).digest();

/**
 * Temporary staff guard: requires the `x-admin-key` header to match ADMIN_API_KEY (docs/backend/memory.md §3).
 * Replaced by JWT + RBAC middleware once the identity module ships.
 */
export function requireAdminKey(req, _res, next) {
  if (!env.ADMIN_API_KEY) {
    return next(new AppError(503, 'ADMIN_AUTH_NOT_CONFIGURED', 'Staff access is not configured on this server'));
  }
  const supplied = req.get('x-admin-key');
  if (!supplied || !timingSafeEqual(digest(supplied), digest(env.ADMIN_API_KEY))) {
    return next(unauthorized('ADMIN_KEY_INVALID', 'A valid x-admin-key header is required'));
  }
  req.actor = 'admin-key';
  next();
}
