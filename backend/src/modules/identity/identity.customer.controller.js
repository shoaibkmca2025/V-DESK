/**
 * Customer controller — reads `req.validated`, calls identity.customer.service.js, sends `{ data }`.
 * The refresh cookie is HTTP plumbing and comes from identity.cookies.js.
 */
import { CUSTOMER_REFRESH_COOKIE, CUSTOMER_REFRESH_COOKIE_PATH } from './identity.constants.js';
import { cookieOptions, readCookie } from './identity.cookies.js';
import * as customerService from './identity.customer.service.js';
import { logout as revokeSession } from './identity.service.js';

const options = () => cookieOptions(CUSTOMER_REFRESH_COOKIE_PATH);

/** Puts the refresh token in its cookie and returns the rest of the session for the JSON body. */
function sendSession(res, { refreshToken, refreshExpiresAt, ...session }) {
  res.cookie(CUSTOMER_REFRESH_COOKIE, refreshToken, { ...options(), expires: refreshExpiresAt });
  res.json({ data: { ...session, tokenType: 'Bearer' } });
}

/** POST /api/v1/auth/otp/request — sends a code; says whether this number is new here. */
export async function requestOtp(req, res) {
  res.json({ data: await customerService.requestOtp(req.validated.body) });
}

/** POST /api/v1/auth/otp/verify — code → portal session (and the account itself, the first time). */
export async function verifyOtp(req, res) {
  sendSession(res, await customerService.verifyOtp(req.validated.body));
}

/** POST /api/v1/auth/customer/refresh — rotates the customer refresh cookie. */
export async function refreshCustomer(req, res) {
  sendSession(res, await customerService.refreshCustomerSession(readCookie(req, CUSTOMER_REFRESH_COOKIE)));
}

/** POST /api/v1/auth/customer/logout — always 204, even without a session, so it is safe to call twice. */
export async function logoutCustomer(req, res) {
  await revokeSession(readCookie(req, CUSTOMER_REFRESH_COOKIE));
  res.clearCookie(CUSTOMER_REFRESH_COOKIE, options());
  res.status(204).end();
}

/** GET /api/v1/auth/customer/me — the guard already loaded the account. */
export function customerMe(req, res) {
  res.json({ data: req.customer });
}

/** PATCH /api/v1/auth/customer/me */
export async function updateCustomerMe(req, res) {
  res.json({ data: await customerService.updateCustomerProfile(req.customer.ref, req.validated.body) });
}
