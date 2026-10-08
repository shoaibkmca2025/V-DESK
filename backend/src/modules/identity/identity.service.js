/**
 * Identity service — staff sign-in, MFA, sessions and staff user management.
 *
 * Rules (docs/backend/rules.md §19–20):
 *  - Password → 5-minute MFA token → TOTP code → session. No staff session is ever issued without TOTP;
 *    staff who have not enrolled are sent through /mfa/enroll first.
 *  - Wrong passwords and wrong codes share one counter; MAX_FAILED_ATTEMPTS locks the account for LOCKOUT_MS.
 *    A correct password alone does not reset it, so knowing the password doesn't buy unlimited code guesses.
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
  MFA_TOKEN_TTL_SECONDS,
  REFRESH_TOKEN_TTL_MS,
} from './identity.constants.js';
import { mapUser } from './identity.mapper.js';
import * as repo from './identity.repository.js';
import {
  generateRefreshToken,
  hashPassword,
  hashRefreshToken,
  signAccessToken,
  signMfaToken,
  verifyAgainstDummy,
  verifyPassword,
  verifyToken,
} from './identity.tokens.js';
import { decryptSecret, encryptSecret, generateTotpSecret, otpauthUrl, verifyTotp } from './identity.totp.js';

const log = logger.child({ module: 'identity' });

/** Two tabs refreshing at once is normal; only a rotated token that comes back later looks like theft. */
const REUSE_GRACE_MS = 10_000;

export function isAuthConfigured() {
  return Boolean(env.JWT_SECRET && env.MFA_ENCRYPTION_KEY);
}

function assertConfigured() {
  if (!isAuthConfigured()) {
    throw new AppError(503, 'AUTH_NOT_CONFIGURED', 'Staff sign-in is not configured on this server');
  }
}

const invalidCredentials = () => unauthorized('INVALID_CREDENTIALS', 'Email or password is incorrect');
const sessionEnded = () => unauthorized('REFRESH_INVALID', 'Your session has ended. Please sign in again.');

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

/**
 * Step 1: email + password. Never returns a session — only an MFA token, flagged with whether the user
 * still has to enrol an authenticator app.
 */
export async function login({ email, password }) {
  assertConfigured();
  const now = new Date();
  const user = await repo.findUserByEmail(email);
  if (!user || user.status !== 'active') {
    await verifyAgainstDummy(password);
    throw invalidCredentials();
  }
  assertNotLocked(user, now);
  if (!(await verifyPassword(user.passwordHash, password))) {
    await recordFailure(user, now);
    throw invalidCredentials();
  }

  const mfaToken = await signMfaToken(user);
  const next = user.mfa.enabled ? { mfaRequired: true } : { mfaEnrollmentRequired: true };
  return { ...next, mfaToken, expiresIn: MFA_TOKEN_TTL_SECONDS };
}

async function userFromMfaToken(mfaToken) {
  const ref = await verifyToken(mfaToken, 'mfa');
  const user = ref && (await repo.findUserByRef(ref));
  if (!user || user.status !== 'active') throw unauthorized('MFA_TOKEN_INVALID', 'Please sign in again to continue');
  return user;
}

/** Step 2a (first sign-in only): hands out a new TOTP secret to add to an authenticator app. */
export async function enrollMfa({ mfaToken }) {
  assertConfigured();
  const user = await userFromMfaToken(mfaToken);
  if (user.mfa.enabled) {
    throw conflict('MFA_ALREADY_ENABLED', 'Two-factor authentication is already set up for this account');
  }
  const secret = generateTotpSecret();
  await repo.updateUser(user.ref, { 'mfa.pendingSecret': encryptSecret(secret, env.MFA_ENCRYPTION_KEY) });
  return { secret, otpauthUrl: otpauthUrl(secret, user.email) };
}

/** Step 2b: a TOTP code → session. The first good code from a pending secret also switches MFA on. */
export async function verifyMfa({ mfaToken, code }) {
  assertConfigured();
  const now = new Date();
  const user = await userFromMfaToken(mfaToken);
  assertNotLocked(user, now);

  const sealed = user.mfa.enabled ? user.mfa.secret : user.mfa.pendingSecret;
  if (!sealed) throw conflict('MFA_NOT_ENROLLED', 'Set up two-factor authentication first (POST /auth/mfa/enroll)');

  const secret = decryptSecret(sealed, env.MFA_ENCRYPTION_KEY);
  const step = verifyTotp(secret, code, { timeMs: now.getTime(), afterStep: user.mfa.lastStep });
  const activation = user.mfa.enabled ? {} : { 'mfa.enabled': true, 'mfa.secret': sealed, 'mfa.pendingSecret': null };
  const signedIn = step !== null && (await repo.claimTotpStep(user.ref, step, { ...activation, lastLoginAt: now }));
  if (!signedIn) {
    await recordFailure(user, now);
    throw unauthorized('MFA_CODE_INVALID', 'That code is wrong or has already been used');
  }

  if (!user.mfa.enabled) log.info({ event: 'auth.mfa_enabled', userRef: user.ref }, 'MFA enabled');
  log.info({ event: 'auth.signed_in', userRef: user.ref }, 'staff signed in');
  return startSession(signedIn, now);
}

// ──────────────────────────────────────────────
// Sessions
// ──────────────────────────────────────────────

/** Trades a refresh token for a new one plus a new access token. */
export async function refreshSession(refreshToken) {
  assertConfigured();
  if (!refreshToken) throw sessionEnded();
  const now = new Date();
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

  const user = await repo.findUserByRef(stored.userRef);
  if (!user || user.status !== 'active') throw sessionEnded();
  return startSession(user, now, stored.family);
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
export async function changePassword(ref, { currentPassword, newPassword }) {
  const now = new Date();
  const user = await repo.findUserByRef(ref);
  if (!user) throw notFound('USER_NOT_FOUND', 'User not found');
  assertNotLocked(user, now);
  if (!(await verifyPassword(user.passwordHash, currentPassword))) {
    await recordFailure(user, now);
    throw unauthorized('INVALID_CREDENTIALS', 'Current password is incorrect');
  }
  if (currentPassword === newPassword)
    throw badRequest('PASSWORD_UNCHANGED', 'Choose a password you have not used here');
  await repo.updateUser(ref, { passwordHash: await hashPassword(newPassword) });
  await repo.revokeAllForUser(ref, now);
  log.info({ event: 'auth.password_changed', userRef: ref }, 'password changed');
}

// ──────────────────────────────────────────────
// Staff user management (users:manage)
// ──────────────────────────────────────────────

/** `actor` is the creating user's ref, 'admin-key', or 'script' for the bootstrap admin. */
export async function createUser({ email, name, role, password }, actor) {
  const doc = await repo.insertUser({
    ref: generateRef('USR', 6),
    email,
    name,
    role,
    passwordHash: await hashPassword(password),
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
 * Admin changes: name, role, status, a new temporary password, MFA reset, unlock. Anything that changes what
 * the user can do (role, disable, password, MFA reset) also ends their sessions.
 */
export async function updateUser(ref, changes, actor) {
  const { name, role, status, password, resetMfa, unlock } = changes;
  const user = await repo.findUserByRef(ref);
  if (!user) throw notFound('USER_NOT_FOUND', `No user found for ref '${ref}'`);

  const changesAccess = (role && role !== user.role) || status === 'disabled' || resetMfa;
  if (ref === actor && changesAccess) {
    throw conflict('CANNOT_CHANGE_OWN_ACCESS', 'Ask another super admin to change your own role, status or MFA');
  }
  const losesSuperAdmin = user.role === 'SUPER_ADMIN' && ((role && role !== 'SUPER_ADMIN') || status === 'disabled');
  if (losesSuperAdmin && user.status === 'active' && (await repo.countActiveSuperAdmins()) <= 1) {
    throw conflict('LAST_SUPER_ADMIN', 'There must always be at least one active super admin');
  }

  const set = {};
  if (name) set.name = name;
  if (role) set.role = role;
  if (status) set.status = status;
  if (password) set.passwordHash = await hashPassword(password);
  if (resetMfa) set.mfa = { enabled: false, secret: null, pendingSecret: null, lastStep: -1 };
  if (unlock) Object.assign(set, { failedAttempts: 0, lockedUntil: null });

  const updated = await repo.updateUser(ref, set);
  if (changesAccess || password) await repo.revokeAllForUser(ref, new Date());
  log.info({ event: 'user.updated', userRef: ref, fields: Object.keys(set), actor }, 'user updated');
  return mapUser(updated);
}
