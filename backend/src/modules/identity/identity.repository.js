/**
 * Identity repository — the only file that queries the database for this module's staff surface.
 * Returns plain objects shaped like the API's own fields (`createdAt`); soft-deleted
 * users are invisible.
 */
import { cursorClause } from '../../shared/lib/pagination.js';
import { exec, row, rows, UNIQUE_VIOLATION } from '../../shared/lib/sql.js';

/**
 * Every column the service and mapper read, named as they expect it.
 */
const USER_COLUMNS = `
  ref, email, name, role, status,
  password_hash AS "passwordHash",
  failed_attempts AS "failedAttempts",
  locked_until AS "lockedUntil",
  last_login_at AS "lastLoginAt",
  created_by AS "createdBy",
  deleted_at AS "deletedAt",
  created_at AS "createdAt",
  updated_at AS "updatedAt"`;

/**
 * The field names the service updates → their columns.
 */
const COLUMN_FOR = {
  name: 'name',
  role: 'role',
  status: 'status',
  email: 'email',
  passwordHash: 'password_hash',
  failedAttempts: 'failed_attempts',
  lockedUntil: 'locked_until',
  lastLoginAt: 'last_login_at',
};

/** `{ name: 'A' }` → `{ name: 'A' }`, by the map above. Throws on an unknown field. */
function columnsFor(set) {
  const columns = {};
  for (const [field, value] of Object.entries(set)) {
    const column = COLUMN_FOR[field];
    if (!column) throw new Error(`identity.repository: no column for user field '${field}'`);
    columns[column] = value;
  }
  return columns;
}

/** `{ a: 1, b: 2 }` → `a = $2, b = $3` plus its values, with $1 left for the ref. */
function assignments(columns, from = 2) {
  const names = Object.keys(columns);
  return {
    text: names.map((name, i) => `${name} = $${from + i}`).join(', '),
    values: names.map((name) => columns[name]),
  };
}

// ──────────────────────────────────────────────
// Users
// ──────────────────────────────────────────────

export async function findUserByEmail(email) {
  return row(`SELECT ${USER_COLUMNS} FROM users WHERE email = $1 AND deleted_at IS NULL`, [email]);
}

export async function findUserByRef(ref) {
  return row(`SELECT ${USER_COLUMNS} FROM users WHERE ref = $1 AND deleted_at IS NULL`, [ref]);
}

/** Inserts a user, or returns null when the email (or ref) is already taken. */
export async function insertUser(data) {
  try {
    return await row(
      `INSERT INTO users (ref, email, name, role, password_hash, created_by)
            VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING ${USER_COLUMNS}`,
      [data.ref, data.email, data.name, data.role, data.passwordHash, data.createdBy ?? null],
    );
  } catch (err) {
    if (err.code === UNIQUE_VIOLATION) return null;
    throw err;
  }
}

/** Newest first, cursor = (createdAt, ref) of the last item seen. Fetches `limit + 1` to detect another page. */
export async function findUsers({ after, limit }) {
  const cursor = cursorClause(after, 1);
  return rows(
    `SELECT ${USER_COLUMNS} FROM users
      WHERE deleted_at IS NULL ${cursor.text}
      ORDER BY created_at DESC, ref DESC
      LIMIT $${cursor.next}`,
    [...cursor.params, limit + 1],
  );
}

export async function updateUser(ref, set) {
  const { text, values } = assignments(columnsFor(set));
  return row(`UPDATE users SET ${text} WHERE ref = $1 AND deleted_at IS NULL RETURNING ${USER_COLUMNS}`, [
    ref,
    ...values,
  ]);
}

/**
 * Counts a failed sign-in and locks the account once `max` is reached. Returns the number of
 * attempts this one made, which is what the log records — the counter itself goes back to zero with the
 * lock, so the next unlock starts clean.
 */
export async function recordFailedAttempt(ref, { max, lockUntil }) {
  const user = await row(
    `UPDATE users SET failed_attempts = failed_attempts + 1 WHERE ref = $1 RETURNING failed_attempts AS attempts`,
    [ref],
  );
  if (user && user.attempts >= max) {
    await exec(`UPDATE users SET failed_attempts = 0, locked_until = $2 WHERE ref = $1`, [ref, lockUntil]);
  }
  return user?.attempts ?? 0;
}

export async function countActiveSuperAdmins() {
  const result = await row(
    `SELECT count(*)::int AS n FROM users WHERE role = 'SUPER_ADMIN' AND status = 'active' AND deleted_at IS NULL`,
  );
  return result.n;
}

// ──────────────────────────────────────────────
// Refresh tokens
// ──────────────────────────────────────────────

export async function insertRefreshToken(data, tx) {
  await exec(
    `INSERT INTO refresh_tokens (token_hash, user_ref, family, expires_at) VALUES ($1, $2, $3, $4)`,
    [data.tokenHash, data.userRef, data.family, data.expiresAt],
    tx,
  );
}

export async function findRefreshToken(tokenHash) {
  return row(
    `SELECT token_hash AS "tokenHash", user_ref AS "userRef", family,
            expires_at AS "expiresAt", revoked_at AS "revokedAt",
            created_at AS "createdAt", updated_at AS "updatedAt"
       FROM refresh_tokens WHERE token_hash = $1`,
    [tokenHash],
  );
}

/** Revokes one token if it is still live. Returns true when this call revoked it (rotation winner). */
export async function revokeRefreshToken(tokenHash, now) {
  const changed = await exec(`UPDATE refresh_tokens SET revoked_at = $2 WHERE token_hash = $1 AND revoked_at IS NULL`, [
    tokenHash,
    now,
  ]);
  return changed === 1;
}

export async function revokeFamily(family, now) {
  await exec(`UPDATE refresh_tokens SET revoked_at = $2 WHERE family = $1 AND revoked_at IS NULL`, [family, now]);
}

export async function revokeAllForUser(userRef, now) {
  await exec(`UPDATE refresh_tokens SET revoked_at = $2 WHERE user_ref = $1 AND revoked_at IS NULL`, [userRef, now]);
}
