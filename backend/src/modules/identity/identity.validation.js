/**
 * Identity request schemas (zod) — one per endpoint body / query / params,
 * applied with `validate({ body, query, params })` in identity.routes.js.
 */
import { z } from 'zod';
import { GOOGLE_CREDENTIAL_MAX_LENGTH, MOBILE_PATTERN, STAFF_ROLES, USER_STATUSES } from './identity.constants.js';

const email = z.string().trim().toLowerCase().max(254).email('Enter a valid email');
/**
 * Never a password (ADR-013): the 32-byte key the sign-in page derived from it with argon2id, base64url. The
 * exact shape is enforced so a client that sends a plain password by mistake is refused, not stored.
 */
const passwordKey = z
  .string()
  .regex(/^[A-Za-z0-9_-]{43}$/, 'Expected the key the sign-in page derives from the password — reload the page');

/** Sign-in: the email, and the key the page derived from the password (ADR-013). */
export const loginBody = z.object({ email, passwordKey });

export const changePasswordBody = z.object({ currentPasswordKey: passwordKey, newPasswordKey: passwordKey });

/**
 * The creating admin sets the password. As everywhere else, the API is sent the derived key and never the
 * password itself, so length and character rules can only be enforced by the page. Unknown fields —
 * including a plain `password` — are dropped.
 */
export const createUserBody = z.object({
  email,
  name: z.string().trim().min(1, 'Name is required').max(120),
  role: z.enum(STAFF_ROLES),
  passwordKey,
});

export const updateUserBody = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    role: z.enum(STAFF_ROLES).optional(),
    status: z.enum(USER_STATUSES).optional(),
    /** Forgotten password: the admin sets a new one, which also clears any lockout. */
    passwordKey: passwordKey.optional(),
    unlock: z.literal(true).optional(),
  })
  .refine((body) => Object.values(body).some((value) => value !== undefined), {
    message: 'Send at least one of name, role, status, passwordKey or unlock',
  });

export const userRefParams = z.object({
  ref: z.string().trim().toUpperCase().min(1).max(50),
});

export const listUsersQuery = z.object({
  cursor: z.string().trim().min(1).max(500).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});

// ──────────────────────────────────────────────
// Customers (Google sign-in — ADR-012)
// ──────────────────────────────────────────────

/** Forms send '' for untouched inputs; treat that the same as "not sent". */
const blankToUndefined = (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value);

/** Stored as the last 10 digits, so '+91 98765 43210' and '9876543210' are the same number. */
const mobile = z
  .string()
  .trim()
  .max(20)
  .transform((value) => value.replace(/[\s()-]/g, ''))
  .refine((value) => MOBILE_PATTERN.test(value), 'Enter a valid 10-digit Indian mobile number')
  .transform((value) => value.slice(-10));

const optional = (schema) => z.preprocess(blankToUndefined, schema.optional());
const customerName = z.string().trim().min(1, 'Name is required').max(120);

/** Body for POST /api/v1/auth/google — the `credential` the Google button returned (an ID token). */
export const googleSignInBody = z.object({
  credential: z.string().trim().min(1, 'credential is required').max(GOOGLE_CREDENTIAL_MAX_LENGTH),
});

/** Body for PATCH /api/v1/auth/customer/me — the customer's own details, never the Google account. */
export const updateCustomerBody = z
  .object({
    name: optional(customerName),
    mobile: optional(mobile),
    email: optional(email),
    company: optional(z.string().trim().max(200)),
  })
  .refine((body) => Object.values(body).some((value) => value !== undefined), {
    message: 'Send at least one of name, mobile, email or company',
  });
