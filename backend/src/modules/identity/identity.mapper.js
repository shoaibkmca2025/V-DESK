/**
 * Identity mapper — shapes user and customer documents for API responses.
 * Password hashes, MFA secrets and attempt counters never leave the API (rules.md §15, §19).
 */
import { PERMISSIONS } from './identity.constants.js';

export function hasPermission(role, permission) {
  if (role === 'SUPER_ADMIN') return Object.hasOwn(PERMISSIONS, permission);
  return PERMISSIONS[permission]?.includes(role) ?? false;
}

export function permissionsFor(role) {
  return Object.keys(PERMISSIONS).filter((permission) => hasPermission(role, permission));
}

export function mapUser(doc) {
  return {
    ref: doc.ref,
    email: doc.email,
    name: doc.name,
    role: doc.role,
    permissions: permissionsFor(doc.role),
    status: doc.status,
    mfaEnabled: Boolean(doc.mfa?.enabled),
    lockedUntil: doc.lockedUntil && doc.lockedUntil > new Date() ? doc.lockedUntil : null,
    lastLoginAt: doc.lastLoginAt ?? null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

/**
 * A customer, as the portal sees itself. There is no role and no permission list: a customer account can only
 * ever do customer things, which is the point of keeping it out of `users` (ADR-009).
 */
export function mapCustomer(doc) {
  return {
    ref: doc.ref,
    name: doc.name,
    mobile: doc.mobile,
    email: doc.email ?? '',
    company: doc.company ?? '',
    status: doc.status,
    lastLoginAt: doc.lastLoginAt ?? null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}
