/**
 * Identity repository — the only file that queries MongoDB for this module (through identity.model.js).
 * Returns plain objects (`.lean()`); soft-deleted users are invisible.
 */
import { olderThan } from '../../shared/lib/pagination.js';
import { RefreshToken, User } from './identity.model.js';

const DUPLICATE_KEY = 11000;
const notDeleted = { deletedAt: null };

// ──────────────────────────────────────────────
// Users
// ──────────────────────────────────────────────

export async function findUserByEmail(email) {
  return User.findOne({ email, ...notDeleted }).lean();
}

export async function findUserByRef(ref) {
  return User.findOne({ ref, ...notDeleted }).lean();
}

/** Inserts a user, or returns null when the email (or ref) is already taken. */
export async function insertUser(data) {
  try {
    const doc = await User.create(data);
    return doc.toObject();
  } catch (err) {
    if (err.code === DUPLICATE_KEY) return null;
    throw err;
  }
}

/** Newest first, cursor = (createdAt, ref) of the last item seen. Fetches `limit + 1` to detect another page. */
export async function findUsers({ after, limit }) {
  const filter = { ...notDeleted, ...(after && olderThan(after)) };
  return User.find(filter)
    .sort({ createdAt: -1, ref: -1 })
    .limit(limit + 1)
    .lean();
}

export async function updateUser(ref, set) {
  return User.findOneAndUpdate({ ref, ...notDeleted }, { $set: set }, { returnDocument: 'after' }).lean();
}

/** Counts a failed password/TOTP attempt and locks the account once `max` is reached. Returns the new count. */
export async function recordFailedAttempt(ref, { max, lockUntil }) {
  const user = await User.findOneAndUpdate(
    { ref },
    { $inc: { failedAttempts: 1 } },
    { returnDocument: 'after', projection: { failedAttempts: 1 } },
  ).lean();
  if (user && user.failedAttempts >= max) {
    await User.updateOne({ ref }, { $set: { failedAttempts: 0, lockedUntil: lockUntil } });
  }
  return user?.failedAttempts ?? 0;
}

/**
 * Accepts a TOTP step only if it is newer than the last one used — the conditional update makes two
 * simultaneous requests with the same code unable to both succeed. Returns the updated user, or null.
 */
export async function claimTotpStep(ref, step, extraSet = {}) {
  return User.findOneAndUpdate(
    { ref, 'mfa.lastStep': { $lt: step }, ...notDeleted },
    { $set: { 'mfa.lastStep': step, failedAttempts: 0, lockedUntil: null, ...extraSet } },
    { returnDocument: 'after' },
  ).lean();
}

export async function countActiveSuperAdmins() {
  return User.countDocuments({ role: 'SUPER_ADMIN', status: 'active', ...notDeleted });
}

// ──────────────────────────────────────────────
// Refresh tokens
// ──────────────────────────────────────────────

export async function insertRefreshToken(data) {
  await RefreshToken.create(data);
}

export async function findRefreshToken(tokenHash) {
  return RefreshToken.findOne({ tokenHash }).lean();
}

/** Revokes one token if it is still live. Returns true when this call revoked it (rotation winner). */
export async function revokeRefreshToken(tokenHash, now) {
  const res = await RefreshToken.updateOne({ tokenHash, revokedAt: null }, { $set: { revokedAt: now } });
  return res.modifiedCount === 1;
}

export async function revokeFamily(family, now) {
  await RefreshToken.updateMany({ family, revokedAt: null }, { $set: { revokedAt: now } });
}

export async function revokeAllForUser(userRef, now) {
  await RefreshToken.updateMany({ userRef, revokedAt: null }, { $set: { revokedAt: now } });
}
