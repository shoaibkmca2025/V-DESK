/**
 * Identity service — staff sign-in, sessions and staff user management.
 *
 * Rules (docs/backend/rules.md §19–20, ADR-012, ADR-013):
 *  - An admin sets a staff member's password when creating the account, and hands it over out of band.
 *  - The API never receives a password. The sign-in page derives a key from it with argon2id (the slow, costly
 *    part) and sends `passwordKey`; the API stores and checks a salted SHA-256 of that key, which takes
 *    microseconds — so staff sign-in fits the Workers free plan. The password rules (length, letters and
 *    numbers) can therefore only be enforced by the page.
 *  - A correct password is a session. There is no second factor: the only barrier to the staff console is
 *    the password, so MAX_FAILED_ATTEMPTS locks the account for LOCKOUT_MS to make guessing expensive.
 *  - Refresh tokens rotate on every use. Presenting an already-rotated token revokes that login's whole family.
 *  - Unknown email, disabled account and wrong password all answer the same 401 INVALID_CREDENTIALS.
 *  - Logs carry user refs only, never emails, passwords, codes or tokens (rules.md §21).
 */
import { randomUUID } from 'node:crypto';
import { env } from '../../config/env.js';
import { AppError, badRequest, conflict, notFound, unauthorized } from '../../shared/errors/AppError.js';
import { logger } from '../../shared/lib/logger.js';
import { decodeCursor, toPage } from '../../shared/lib/pagination.js';
import { generateRef } from '../../shared/lib/refs.js';
import {
  ACCESS_TOKEN_TTL_SECONDS,
  LOCKOUT_MS,
  MAX_FAILED_ATTEMPTS,
  REFRESH_TOKEN_TTL_MS,
} from './identity.constants.js';
import { mapUser } from './identity.mapper.js';
import * as repo from './identity.repository.js';
import {
  generateRefreshToken,
  hashPasswordKey,
  hashRefreshToken,
  isLegacyPasswordHash,
  signAccessToken,
  verifyAgainstDummy,
  verifyPasswordKey,
  verifyToken,
} from './identity.tokens.js';

const log = logger.child({ module: 'identity' });

/** Two tabs refreshing at once is normal; only a rotated token that comes back later looks like theft. */
const REUSE_GRACE_MS = 10_000;

export function isAuthConfigured() {
  return Boolean(env.JWT_SECRET);
}

function assertConfigured() {
  if (!isAuthConfigured()) {
    throw new AppError(503, 'AUTH_NOT_CONFIGURED', 'Staff sign-in is not configured on this server');
  }
}

const invalidCredentials = () => unauthorized('INVALID_CREDENTIALS', 'Email or password is incorrect');
/** Shared with the customer surface, so a dead session reads the same whoever is signing in. */
export const sessionEnded = () => unauthorized('REFRESH_INVALID', 'Your session has ended. Please sign in again.');

function assertNotLocked(user, now) {
  if (user.lockedUntil && user.lockedUntil > now) {
    const retryAfterSeconds = Math.ceil((user.lockedUntil - now) / 1000);
    throw new AppError(429, 'ACCOUNT_LOCKED', 'Too many failed attempts. Please try again later.', {
      retryAfterSeconds,
    });
  }
}

async function recordFailure(user, now) {
  const lockUntil = new Date(now.getTime() + LOCKOUT_MS);
  const attempts = await repo.recordFailedAttempt(user.ref, { max: MAX_FAILED_ATTEMPTS, lockUntil });
  log.warn({ event: 'auth.attempt_failed', userRef: user.ref, attempts }, 'failed sign-in attempt');
}

/** Creates a refresh token (new family on sign-in, same family on rotation) and an access token. */
async function startSession(user, now, family = randomUUID()) {
  const refreshToken = generateRefreshToken();
  const refreshExpiresAt = new Date(now.getTime() + REFRESH_TOKEN_TTL_MS);
  await repo.insertRefreshToken({
    tokenHash: hashRefreshToken(refreshToken),
    userRef: user.ref,
    family,
    expiresAt: refreshExpiresAt,
  });
  return {
    accessToken: await signAccessToken(user),
    expiresIn: ACCESS_TOKEN_TTL_SECONDS,
    refreshToken,
    refreshExpiresAt,
    user: mapUser(user),
  };
}

// ──────────────────────────────────────────────
// Sign-in
// ──────────────────────────────────────────────

const passwordResetRequired = () =>
  unauthorized(
    'PASSWORD_RESET_REQUIRED',
    'Your password has to be set again after a security upgrade. Ask an admin to set you a new one.',
  );

/** Email + `passwordKey` (the key the page derived from the password) → a session. */
export async function login({ email, passwordKey }) {
  assertConfigured();
  const now = new Date();
  const user = await repo.findUserByEmail(email);
  if (!user || user.status !== 'active') {
    verifyAgainstDummy(passwordKey);
    throw invalidCredentials();
  }
  assertNotLocked(user, now);

  if (isLegacyPasswordHash(user.passwordHash)) throw passwordResetRequired();
  if (!verifyPasswordKey(user.passwordHash, passwordKey)) {
    await recordFailure(user, now);
    throw invalidCredentials();
  }
  await repo.updateUser(user.ref, { lastLoginAt: now, failedAttempts: 0, lockedUntil: null });
  log.info({ event: 'auth.signed_in', userRef: user.ref }, 'staff signed in');
  return startSession(user, now);
}

// ──────────────────────────────────────────────
// Sessions
// ──────────────────────────────────────────────

/**
 * Checks a presented refresh token and spends it, returning the sign-in it belonged to. Exported because the
 * customer surface rotates tokens exactly the same way (identity.customer.service.js) — one rotation rule, one
 * reuse-detection rule, one collection.
 * @returns {Promise<{ subjectRef: string, family: string }>}
 */
export async function consumeRefreshToken(refreshToken, now) {
  if (!refreshToken) throw sessionEnded();
  const tokenHash = hashRefreshToken(refreshToken);
  const stored = await repo.findRefreshToken(tokenHash);
  if (!stored || stored.expiresAt <= now) throw sessionEnded();

  if (stored.revokedAt) {
    if (now - stored.revokedAt > REUSE_GRACE_MS) {
      await repo.revokeFamily(stored.family, now);
      log.warn({ event: 'auth.refresh_reused', userRef: stored.userRef }, 'rotated refresh token reused');
    }
    throw sessionEnded();
  }
  // Only one of several parallel refreshes with the same token wins the rotation.
  if (!(await repo.revokeRefreshToken(tokenHash, now))) throw sessionEnded();
  return { subjectRef: stored.userRef, family: stored.family };
}

/** Trades a refresh token for a new one plus a new access token. */
export async function refreshSession(refreshToken) {
  assertConfigured();
  const now = new Date();
  const { subjectRef, family } = await consumeRefreshToken(refreshToken, now);
  const user = await repo.findUserByRef(subjectRef);
  if (!user || user.status !== 'active') throw sessionEnded();
  return startSession(user, now, family);
}

export async function logout(refreshToken) {
  if (refreshToken) await repo.revokeRefreshToken(hashRefreshToken(refreshToken), new Date());
}

/** Bearer access token → the signed-in user. Reloads the user so disabling or demoting takes effect at once. */
export async function authenticateAccessToken(token) {
  assertConfigured();
  const ref = await verifyToken(token, 'access');
  const user = ref && (await repo.findUserByRef(ref));
  if (!user || user.status !== 'active')
    throw unauthorized('TOKEN_INVALID', 'Your session has expired. Please sign in again.');
  return mapUser(user);
}

export async function getMe(ref) {
  const user = await repo.findUserByRef(ref);
  if (!user) throw notFound('USER_NOT_FOUND', 'User not found');
  return mapUser(user);
}

/** Changing your password signs out every other device. */
export async function changePassword(ref, { currentPasswordKey, newPasswordKey }) {
  const now = new Date();
  const user = await repo.findUserByRef(ref);
  if (!user) throw notFound('USER_NOT_FOUND', 'User not found');
  assertNotLocked(user, now);
  if (!user.passwordHash) {
    throw conflict('PASSWORD_NOT_SET', 'This account has no password yet. Ask an admin to set one.');
  }
  if (isLegacyPasswordHash(user.passwordHash)) throw passwordResetRequired();
  if (!verifyPasswordKey(user.passwordHash, currentPasswordKey)) {
    await recordFailure(user, now);
    throw unauthorized('INVALID_CREDENTIALS', 'Current password is incorrect');
  }
  if (currentPasswordKey === newPasswordKey)
    throw badRequest('PASSWORD_UNCHANGED', 'Choose a password you have not used here');
  await repo.updateUser(ref, { passwordHash: hashPasswordKey(newPasswordKey) });
  await repo.revokeAllForUser(ref, now);
  log.info({ event: 'auth.password_changed', userRef: ref }, 'password changed');
}

// ──────────────────────────────────────────────
// Staff user management (users:manage)
// ──────────────────────────────────────────────

/**
 * Creates a staff account with the password the creating admin chose. The API never sees that password: the
 * admin's page derives `passwordKey` from it the same way the sign-in page does (ADR-013), and the admin
 * hands the password over out of band. `actor` is the creating user's ref, 'admin-key', or 'script'.
 */
export async function createUser({ email, name, role, passwordKey }, actor) {
  const doc = await repo.insertUser({
    ref: generateRef('USR', 6),
    email,
    name,
    role,
    passwordHash: hashPasswordKey(passwordKey),
    createdBy: actor,
  });
  if (!doc) throw conflict('EMAIL_TAKEN', 'A user with this email already exists');
  log.info({ event: 'user.created', userRef: doc.ref, role, actor }, 'user created');
  return mapUser(doc);
}

export async function listUsers({ cursor, limit }) {
  const after = cursor ? decodeCursor(cursor) : undefined;
  const { items, nextCursor } = toPage(await repo.findUsers({ after, limit }), limit);
  return { users: items.map(mapUser), nextCursor };
}

export async function getUser(ref) {
  const user = await repo.findUserByRef(ref);
  if (!user) throw notFound('USER_NOT_FOUND', `No user found for ref '${ref}'`);
  return mapUser(user);
}

/**
 * Admin changes: name, role, status, a new password (forgotten one), unlock. Anything that changes what the
 * user can do (role, disable, new password) also ends their sessions, so a reset password closes the old
 * logins rather than leaving them open beside the new one.
 */
export async function updateUser(ref, changes, actor) {
  const { name, role, status, passwordKey, unlock } = changes;
  const user = await repo.findUserByRef(ref);
  if (!user) throw notFound('USER_NOT_FOUND', `No user found for ref '${ref}'`);

  const changesAccess = (role && role !== user.role) || status === 'disabled' || Boolean(passwordKey);
  if (ref === actor && changesAccess) {
    throw conflict(
      'CANNOT_CHANGE_OWN_ACCESS',
      'Ask another super admin to change your own role, status or password (use POST /auth/password to change your own)',
    );
  }
  const losesSuperAdmin = user.role === 'SUPER_ADMIN' && ((role && role !== 'SUPER_ADMIN') || status === 'disabled');
  if (losesSuperAdmin && user.status === 'active' && (await repo.countActiveSuperAdmins()) <= 1) {
    throw conflict('LAST_SUPER_ADMIN', 'There must always be at least one active super admin');
  }

  const now = new Date();
  const set = {};
  if (name) set.name = name;
  if (role) set.role = role;
  if (status) set.status = status;
  // A reset password also clears a lockout: the point of the reset is to get the person back in.
  if (passwordKey)
    Object.assign(set, { passwordHash: hashPasswordKey(passwordKey), failedAttempts: 0, lockedUntil: null });
  if (unlock) Object.assign(set, { failedAttempts: 0, lockedUntil: null });

  const updated = await repo.updateUser(ref, set);
  if (changesAccess) await repo.revokeAllForUser(ref, now);
  log.info({ event: 'user.updated', userRef: ref, fields: Object.keys(set), actor }, 'user updated');
  return mapUser(updated);
}
