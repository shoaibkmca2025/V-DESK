/**
 * Customer repository — the only file that queries the database for the customer surface.
 *
 * A customer account is keyed by its Google account's `sub` (ADR-012). Accounts from the phone-OTP days
 * (ADR-009) have a mobile and no `google_sub`; they stay readable, but nothing signs in to them any more.
 */
import { row, UNIQUE_VIOLATION } from '../../shared/lib/sql.js';

const CUSTOMER_COLUMNS = `
  ref, mobile, name, email, company, status,
  google_sub AS "googleSub",
  last_login_at AS "lastLoginAt",
  created_at AS "createdAt",
  updated_at AS "updatedAt"`;

const COLUMN_FOR = {
  name: 'name',
  mobile: 'mobile',
  email: 'email',
  company: 'company',
  status: 'status',
  lastLoginAt: 'last_login_at',
};

export async function findCustomerByGoogleSub(googleSub) {
  return row(`SELECT ${CUSTOMER_COLUMNS} FROM customers WHERE google_sub = $1`, [googleSub]);
}

export async function findCustomerByRef(ref) {
  return row(`SELECT ${CUSTOMER_COLUMNS} FROM customers WHERE ref = $1`, [ref]);
}

/** Inserts a customer, or returns null when the Google account (or ref) already has one. */
export async function insertCustomer(data) {
  try {
    return await row(
      `INSERT INTO customers (ref, google_sub, mobile, name, email, company, last_login_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING ${CUSTOMER_COLUMNS}`,
      [
        data.ref,
        data.googleSub,
        data.mobile ?? null,
        data.name,
        data.email ?? '',
        data.company ?? '',
        data.lastLoginAt ?? null,
      ],
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
