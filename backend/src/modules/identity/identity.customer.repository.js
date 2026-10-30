/**
 * Customer repository — the only file that queries the database for the customer surface.
 *
 * Codes live in `otp_challenges`, one row per mobile number, holding both the current code (hashed) and
 * the send counters for the window. The row outlives its code on purpose: spending a code clears
 * `code_hash` but keeps the counters, so "resend" cannot hand out a fresh budget every five minutes.
 */
import { exec, row, UNIQUE_VIOLATION } from '../../shared/lib/sql.js';

const CUSTOMER_COLUMNS = `
  ref, mobile, name, email, company, status,
  last_login_at AS "lastLoginAt",
  created_at AS "createdAt",
  updated_at AS "updatedAt"`;

const CHALLENGE_COLUMNS = `
  mobile,
  code_hash AS "codeHash",
  expires_at AS "expiresAt",
  attempts, sends,
  window_started_at AS "windowStartedAt",
  last_sent_at AS "lastSentAt",
  created_at AS "createdAt",
  updated_at AS "updatedAt"`;

const COLUMN_FOR = {
  name: 'name',
  email: 'email',
  company: 'company',
  status: 'status',
  lastLoginAt: 'last_login_at',
};

// ──────────────────────────────────────────────
// Customers
// ──────────────────────────────────────────────

export async function findCustomerByMobile(mobile) {
  return row(`SELECT ${CUSTOMER_COLUMNS} FROM customers WHERE mobile = $1`, [mobile]);
}

export async function findCustomerByRef(ref) {
  return row(`SELECT ${CUSTOMER_COLUMNS} FROM customers WHERE ref = $1`, [ref]);
}

/** Inserts a customer, or returns null when the mobile number (or ref) is already taken. */
export async function insertCustomer(data) {
  try {
    return await row(
      `INSERT INTO customers (ref, mobile, name, email, company, last_login_at)
            VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING ${CUSTOMER_COLUMNS}`,
      [data.ref, data.mobile, data.name, data.email ?? '', data.company ?? '', data.lastLoginAt ?? null],
    );
  } catch (err) {
    if (err.code === UNIQUE_VIOLATION) return null;
    throw err;
  }
}

export async function updateCustomer(ref, set) {
  const fields = Object.keys(set);
  const columns = fields.map((field) => {
    const column = COLUMN_FOR[field];
    if (!column) throw new Error(`identity.customer.repository: no column for customer field '${field}'`);
    return column;
  });
  return row(
    `UPDATE customers SET ${columns.map((column, i) => `${column} = $${i + 2}`).join(', ')}
      WHERE ref = $1 RETURNING ${CUSTOMER_COLUMNS}`,
    [ref, ...fields.map((field) => set[field])],
  );
}

// ──────────────────────────────────────────────
// OTP challenges
// ──────────────────────────────────────────────

export async function findOtpChallenge(mobile) {
  return row(`SELECT ${CHALLENGE_COLUMNS} FROM otp_challenges WHERE mobile = $1`, [mobile]);
}

/**
 * Stores the code for a number, replacing whatever was there: one live challenge per number, attempts back
 * to zero. `sends` and `window_started_at` are passed in because the send budget belongs to the window,
 * not to the code.
 */
export async function saveOtpChallenge({ mobile, codeHash, expiresAt, sends, windowStartedAt, lastSentAt }) {
  return row(
    `INSERT INTO otp_challenges (mobile, code_hash, expires_at, attempts, sends, window_started_at, last_sent_at)
          VALUES ($1, $2, $3, 0, $4, $5, $6)
     ON CONFLICT (mobile) DO UPDATE
         SET code_hash = EXCLUDED.code_hash,
             expires_at = EXCLUDED.expires_at,
             attempts = 0,
             sends = EXCLUDED.sends,
             window_started_at = EXCLUDED.window_started_at,
             last_sent_at = EXCLUDED.last_sent_at
       RETURNING ${CHALLENGE_COLUMNS}`,
    [mobile, codeHash, expiresAt, sends, windowStartedAt, lastSentAt],
  );
}

/** Counts one wrong code and returns the new total. */
export async function recordOtpAttempt(mobile) {
  const challenge = await row(
    `UPDATE otp_challenges SET attempts = attempts + 1 WHERE mobile = $1 RETURNING attempts`,
    [mobile],
  );
  return challenge?.attempts ?? 0;
}

/**
 * Spends the code: clears it so the same code can never be used twice, while keeping the send counters for
 * the rest of the window. Returns false when another request got there first.
 */
export async function consumeOtpChallenge(mobile, codeHash) {
  const changed = await exec(
    `UPDATE otp_challenges SET code_hash = NULL, attempts = 0 WHERE mobile = $1 AND code_hash = $2`,
    [mobile, codeHash],
  );
  return changed === 1;
}
