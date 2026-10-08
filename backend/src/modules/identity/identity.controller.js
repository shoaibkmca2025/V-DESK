/**
 * Identity controller — reads `req.validated`, calls identity.service.js, sends `{ data, meta? }`.
 * Also owns the refresh-token cookie, which is HTTP plumbing rather than a business rule.
 */
import { env } from '../../config/env.js';
import { REFRESH_COOKIE, REFRESH_COOKIE_PATH } from './identity.constants.js';
import * as identityService from './identity.service.js';

// ── Refresh cookie (rules.md §19: httpOnly, Secure, SameSite=Strict) ──

function readRefreshCookie(req) {
  for (const part of (req.get('cookie') ?? '').split(';')) {
    const [name, ...value] = part.trim().split('=');
    if (name === REFRESH_COOKIE) return value.join('=');
  }
  return undefined;
}

const cookieOptions = () => ({
  httpOnly: true,
  // Browsers drop Secure cookies on plain-http origins other than localhost, so local tools can't use them.
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: REFRESH_COOKIE_PATH,
});

/** Puts the refresh token in its cookie and returns the rest of the session for the JSON body. */
function sendSession(res, { refreshToken, refreshExpiresAt, ...session }) {
  res.cookie(REFRESH_COOKIE, refreshToken, { ...cookieOptions(), expires: refreshExpiresAt });
  res.json({ data: { ...session, tokenType: 'Bearer' } });
}

// ── Sign-in & sessions ────────────────────────

/** POST /api/v1/auth/login — never a session, always an MFA token (see identity.service.js). */
export async function login(req, res) {
  res.json({ data: await identityService.login(req.validated.body) });
}

/** POST /api/v1/auth/mfa/enroll — new TOTP secret + otpauth:// URL for the authenticator app. */
export async function enrollMfa(req, res) {
  res.json({ data: await identityService.enrollMfa(req.validated.body) });
}

/** POST /api/v1/auth/mfa/verify — TOTP code → access token + refresh cookie. */
export async function verifyMfa(req, res) {
  sendSession(res, await identityService.verifyMfa(req.validated.body));
}

/** POST /api/v1/auth/refresh — rotates the refresh cookie. */
export async function refresh(req, res) {
  sendSession(res, await identityService.refreshSession(readRefreshCookie(req)));
}

/** POST /api/v1/auth/logout — always 204, even without a session, so it is safe to call twice. */
export async function logout(req, res) {
  await identityService.logout(readRefreshCookie(req));
  res.clearCookie(REFRESH_COOKIE, cookieOptions());
  res.status(204).end();
}

/** GET /api/v1/auth/me */
export async function me(req, res) {
  res.json({ data: await identityService.getMe(req.user.ref) });
}

/** POST /api/v1/auth/password */
export async function changePassword(req, res) {
  await identityService.changePassword(req.user.ref, req.validated.body);
  res.clearCookie(REFRESH_COOKIE, cookieOptions());
  res.status(204).end();
}

// ── Staff users ───────────────────────────────

export async function listUsers(req, res) {
  const query = req.validated.query;
  const { users, nextCursor } = await identityService.listUsers(query);
  res.json({ data: users, meta: { limit: query.limit, nextCursor } });
}

export async function createUser(req, res) {
  res.status(201).json({ data: await identityService.createUser(req.validated.body, req.actor) });
}

export async function getUser(req, res) {
  res.json({ data: await identityService.getUser(req.validated.params.ref) });
}

export async function updateUser(req, res) {
  const data = await identityService.updateUser(req.validated.params.ref, req.validated.body, req.actor);
  res.json({ data });
}
