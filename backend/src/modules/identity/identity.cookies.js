/**
 * Refresh-cookie plumbing, shared by the staff and customer controllers (rules.md §19).
 *
 * Every refresh cookie is httpOnly, SameSite=Strict, Secure in production, and scoped to the path that
 * rotates it — so a staff cookie is never sent to a portal route, or the other way round.
 */
import { env } from '../../config/env.js';

export function readCookie(req, name) {
  for (const part of (req.get('cookie') ?? '').split(';')) {
    const [key, ...value] = part.trim().split('=');
    if (key === name) return value.join('=');
  }
  return undefined;
}

export const cookieOptions = (path) => ({
  httpOnly: true,
  // Browsers drop Secure cookies on plain-http origins other than localhost, so local tools can't use them.
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict',
  path,
});
