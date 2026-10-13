/**
 * The verified customer behind a request — the principal every customer-facing route (KYC, subscriptions,
 * enterprise) needs.
 *
 * BLOCKED: customer sign-in (phone OTP) is Phase 2 and still an open question (memory.md §6), so there is no verified
 * customer yet. This fails closed with 503 CUSTOMER_AUTH_NOT_AVAILABLE; modules must not fall back to anything weaker
 * (an unguessable ref, a phone number in the body). When customer sign-in ships, this returns `{ id }` — the
 * customer's stable `CUS-…` ref — from the verified customer session, and every module's ownership checks work as is.
 * @param {import('express').Request} _req
 * @returns {Promise<{ id: string }>}
 */
import { AppError } from '../../shared/errors/AppError.js';

export async function resolveCustomer(_req) {
  throw new AppError(503, 'CUSTOMER_AUTH_NOT_AVAILABLE', 'Customer sign-in is not available yet');
}
