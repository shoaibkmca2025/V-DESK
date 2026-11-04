/**
 * Identity service — staff sign-in, MFA, sessions and staff user management.
 *
 * Rules (docs/backend/rules.md §19–20, ADR-012, ADR-013):
 *  - Accounts start with a one-time setup code, never a password an admin chose. Signing in with the code
 *    leads only to "choose your password" (`setupPassword`); storing that password spends the code.
 *  - The API never receives a password. The sign-in page derives a key from it with argon2id (the slow, costly
 *    part) and sends `passwordKey`; the API stores and checks a salted SHA-256 of that key, which takes
 *    microseconds — so staff sign-in fits the Workers free plan. The password rules (length, letters and
 *    numbers) can therefore only be enforced by the page.
 *  - Password → 5-minute MFA token → TOTP code → session. No staff session is ever issued without TOTP;
 *    staff who have not enrolled are sent through /mfa/enroll first.
 *  - Wrong passwords and wrong codes share one counter; MAX_FAILED_ATTEMPTS locks the account for LOCKOUT_MS.
 *    A correct password alone does not reset it, so knowing the password doesn't buy unlimited code guesses.
 *  - Refresh tokens rotate on every use. Presenting an already-rotated token revokes that login's whole family.
 *  - Unknown email, disabled account and wrong password all answer the same 401 INVALID_CREDENTIALS.
 *  - Logs carry user refs only, never emails, passwords, codes or tokens (rules.md §21).
 */
import { randomUUID, timingSafeEqual } from 'node:crypto';
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
  SETUP_CODE_TTL_MS,
  SETUP_TOKEN_TTL_SECONDS,
} from './identity.constants.js';
import { mapUser } from './identity.mapper.js';
import * as repo from './identity.repository.js';
import {
  generateRefreshToken,
  generateSetupCode,
  hashPasswordKey,
  hashRefreshToken,
  hashSetupCode,
  isLegacyPasswordHash,
  signAccessToken,
  signMfaToken,
  signSetupToken,
  verifyAgainstDummy,
  verifyPasswordKey,
  verifySetupToken,
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

/** What follows a correct password: an MFA token, flagged with whether the user still has to enrol an app. */
async function mfaStep(user) {
  const mfaToken = await signMfaToken(user);
  const next = user.mfa.enabled ? { mfaRequired: true } : { mfaEnrollmentRequired: true };
  return { ...next, mfaToken, expiresIn: MFA_TOKEN_TTL_SECONDS };
}

const sameHash = (a, b) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

const passwordResetRequired = () =>
  unauthorized(
    'PASSWORD_RESET_REQUIRED',
    'Your password has to be set again after a security upgrade. Ask your admin for a setup code.',
  );

/**
 * Step 1: email + `passwordKey` (the key the page derived from the password), or — for an account still waiting
 * for its first password — email + `setupCode`. Never returns a session: a password leads to an MFA token, a
 * setup code to a setup token for POST /auth/password/setup. The code itself is spent only when the password
 * is stored.
 */
export async function login({ email, passwordKey, setupCode }) {
  assertConfigured();
  const now = new Date();
  const user = await repo.findUserByEmail(email);
  if (!user || user.status !== 'active') {
    verifyAgainstDummy(passwordKey);
    throw invalidCredentials();
  }
  assertNotLocked(user, now);

  if (setupCode !== undefined) {
    // A code only opens an account that has no password yet; once one is set, the code is gone.
    if (user.passwordHash || !user.setupCodeHash || !sameHash(hashSetupCode(setupCode), user.setupCodeHash)) {
      await recordFailure(user, now);
      throw invalidCredentials();
    }
    if (user.setupCodeExpiresAt <= now) {
      throw unauthorized('SETUP_CODE_EXPIRED', 'This setup code has expired. Ask your admin for a new one.');
    }
    return { passwordSetupRequired: true, setupToken: await signSetupToken(user), expiresIn: SETUP_TOKEN_TTL_SECONDS };
  }

  if (isLegacyPasswordHash(user.passwordHash)) throw passwordResetRequired();
  if (!verifyPasswordKey(user.passwordHash, passwordKey)) {
    await recordFailure(user, now);
    throw invalidCredentials();
  }
  return mfaStep(user);
}

/**
 * Step 1b (first sign-in, or after an admin issued a fresh code): the staff member chooses their password.
 * Storing it spends the setup code; then sign-in carries on exactly as after a password (MFA next).
 */
export async function setupPassword({ setupToken, newPasswordKey }) {
  assertConfigured();
  const now = new Date();
  const claim = await verifySetupToken(setupToken);
  const user = claim && (await repo.findUserByRef(claim.ref));
  if (!user || user.status !== 'active') {
    throw unauthorized('SETUP_TOKEN_INVALID', 'Please sign in with your setup code again');
  }
  const updated = await repo.completeSetup(user.ref, claim.codeHashPrefix, hashPasswordKey(newPasswordKey), now);
  if (!updated) {
    throw unauthorized('SETUP_TOKEN_INVALID', 'This setup code was already used or replaced. Sign in again.');
  }
  log.info({ event: 'auth.password_set', userRef: user.ref }, 'staff password set from setup code');
  return mfaStep(updated);
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
    throw conflict('PASSWORD_NOT_SET', 'Set your password with your setup code first (POST /auth/password/setup)');
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

/** A fresh one-time code: the plain code (shown once, never stored) and what goes into the database. */
function newSetupCode(now) {
  const setupCode = generateSetupCode();
  const setupCodeExpiresAt = new Date(now.getTime() + SETUP_CODE_TTL_MS);
  return { setupCode, setupCodeExpiresAt, stored: { setupCodeHash: hashSetupCode(setupCode), setupCodeExpiresAt } };
}

/**
 * Creates a staff account with a one-time setup code — returned here once, for the admin to hand over, and
 * never retrievable again. `passwordKey` is only for scripts/create-admin.js bootstrapping the first admin
 * (derived on that machine, as the sign-in page would). `actor` is the creating user's ref, 'admin-key', or
 * 'script'.
 */
export async function createUser({ email, name, role, passwordKey }, actor) {
  const now = new Date();
  const code = passwordKey ? null : newSetupCode(now);
  const doc = await repo.insertUser({
    ref: generateRef('USR', 6),
    email,
    name,
    role,
    ...(passwordKey ? { passwordHash: hashPasswordKey(passwordKey) } : code.stored),
    createdBy: actor,
  });
  if (!doc) throw conflict('EMAIL_TAKEN', 'A user with this email already exists');
  log.info({ event: 'user.created', userRef: doc.ref, role, actor }, 'user created');
  return code
    ? { ...mapUser(doc), setupCode: code.setupCode, setupCodeExpiresAt: code.setupCodeExpiresAt }
    : mapUser(doc);
}

/**
 * For scripts/issue-setup-code.js — a fresh setup code for the account with this email, when nobody can sign in
 * to issue one (e.g. the only super admin, whose password predates ADR-013).
 */
export async function issueSetupCodeByEmail(email, actor) {
  const user = await repo.findUserByEmail(email);
  if (!user) throw notFound('USER_NOT_FOUND', 'No staff account has that email');
  return updateUser(user.ref, { issueSetupCode: true }, actor);
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
 * Admin changes: name, role, status, a fresh setup code (forgotten password), MFA reset, unlock. Anything
 * that changes what the user can do (role, disable, new setup code, MFA reset) also ends their sessions.
 * A fresh setup code removes the old password: the staff member signs in with the code and chooses a new one.
 */
export async function updateUser(ref, changes, actor) {
  const { name, role, status, issueSetupCode, resetMfa, unlock } = changes;
  const user = await repo.findUserByRef(ref);
  if (!user) throw notFound('USER_NOT_FOUND', `No user found for ref '${ref}'`);

  const changesAccess = (role && role !== user.role) || status === 'disabled' || resetMfa || issueSetupCode;
  if (ref === actor && changesAccess) {
    throw conflict(
      'CANNOT_CHANGE_OWN_ACCESS',
      'Ask another super admin to change your own role, status, MFA or setup code (use POST /auth/password to change your password)',
    );
  }
  const losesSuperAdmin = user.role === 'SUPER_ADMIN' && ((role && role !== 'SUPER_ADMIN') || status === 'disabled');
  if (losesSuperAdmin && user.status === 'active' && (await repo.countActiveSuperAdmins()) <= 1) {
    throw conflict('LAST_SUPER_ADMIN', 'There must always be at least one active super admin');
  }

  const now = new Date();
  const code = issueSetupCode ? newSetupCode(now) : null;
  const set = {};
  if (name) set.name = name;
  if (role) set.role = role;
  if (status) set.status = status;
  if (code) Object.assign(set, { passwordHash: null, ...code.stored, failedAttempts: 0, lockedUntil: null });
  if (resetMfa) set.mfa = { enabled: false, secret: null, pendingSecret: null, lastStep: -1 };
  if (unlock) Object.assign(set, { failedAttempts: 0, lockedUntil: null });

  const updated = await repo.updateUser(ref, set);
  if (changesAccess) await repo.revokeAllForUser(ref, now);
  log.info({ event: 'user.updated', userRef: ref, fields: Object.keys(set), actor }, 'user updated');
  return code
    ? { ...mapUser(updated), setupCode: code.setupCode, setupCodeExpiresAt: code.setupCodeExpiresAt }
    : mapUser(updated);
}
