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
const mfaToken = z.string().min(1, 'mfaToken is required').max(2000);

/** A password (as its key), or — before the first sign-in — the one-time setup code. Exactly one of the two. */
export const loginBody = z
  .object({
    email,
    passwordKey: passwordKey.optional(),
    setupCode: z.string().trim().min(1, 'Enter your setup code').max(40).optional(),
  })
  .refine((body) => (body.passwordKey === undefined) !== (body.setupCode === undefined), {
    message: 'Send either passwordKey or setupCode',
  });

/** Body for POST /auth/password/setup — the token from signing in with the setup code, and the new password's key. */
export const setupPasswordBody = z.object({
  setupToken: z.string().min(1, 'setupToken is required').max(2000),
  newPasswordKey: passwordKey,
});

export const mfaEnrollBody = z.object({ mfaToken });

export const mfaVerifyBody = z.object({
  mfaToken,
  /** Authenticator apps show "123 456"; accept it with or without the space. */
  code: z.preprocess(
    (value) => (typeof value === 'string' ? value.replace(/\s/g, '') : value),
    z.string().regex(/^\d{6}$/, 'Enter the 6-digit code from your authenticator app'),
  ),
});

export const changePasswordBody = z.object({ currentPasswordKey: passwordKey, newPasswordKey: passwordKey });

/**
 * No password here: the API generates a one-time setup code and returns it once (ADR-012), so an admin never
 * knows a staff member's password. Unknown fields — including a `password` — are dropped.
 */
export const createUserBody = z.object({
  email,
  name: z.string().trim().min(1, 'Name is required').max(120),
  role: z.enum(STAFF_ROLES),
});

export const updateUserBody = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    role: z.enum(STAFF_ROLES).optional(),
    status: z.enum(USER_STATUSES).optional(),
    /** Forgotten password: a fresh setup code replaces the old password (returned once, like on creation). */
    issueSetupCode: z.literal(true).optional(),
    resetMfa: z.literal(true).optional(),
    unlock: z.literal(true).optional(),
  })
  .refine((body) => Object.values(body).some((value) => value !== undefined), {
    message: 'Send at least one of name, role, status, issueSetupCode, resetMfa or unlock',
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
