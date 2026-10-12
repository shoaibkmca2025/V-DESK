/**
 * Principal guards for modules that serve both customers and staff (KYC, subscriptions, enterprise). Each sets
 * `req.principal` — `{ type: 'customer' | 'staff', id, role }` — which those modules' services check again
 * (rules.md §20), and `req.auditContext` — `{ ip, requestId }` — for the audit trail.
 *
 *   requireCustomer              the verified customer (identity.customer.js — fails closed until customer sign-in)
 *   requireStaffPrincipal(p)     a signed-in staff user holding p — never the legacy x-admin-key
 *   requireCustomerOrStaff(p)    staff when staff credentials are sent, otherwise the customer
 *
 * The legacy x-admin-key is not a named person and holds every permission, so these modules refuse it: a request
 * carrying it (with or without a customer credential) is treated as a staff attempt and fails with 401.
 * Note for the customer sign-in work: if customer tokens also arrive as `Authorization: Bearer`,
 * requireCustomerOrStaff must tell them apart by the token's principal.
 */
import { resolveCustomer } from './identity.customer.js';
import { requireStaffUser } from './identity.middleware.js';

const auditContext = (req) => ({ ip: req.ip ?? null, requestId: req.id ?? null });

export async function requireCustomer(req, _res, next) {
  const customer = await resolveCustomer(req);
  req.principal = { type: 'customer', id: customer.id, role: null };
  req.auditContext = auditContext(req);
  next();
}

export function requireStaffPrincipal(permission) {
  const guard = requireStaffUser(permission);
  return (req, res, next) =>
    guard(req, res, (err) => {
      if (err) return next(err);
      req.principal = { type: 'staff', id: req.user.ref, role: req.user.role };
      req.auditContext = auditContext(req);
      next();
    });
}

export function requireCustomerOrStaff(permission) {
  const staff = requireStaffPrincipal(permission);
  return (req, res, next) =>
    req.get('authorization') || req.get('x-admin-key') ? staff(req, res, next) : requireCustomer(req, res, next);
}
