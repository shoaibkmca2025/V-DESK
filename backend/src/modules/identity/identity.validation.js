/**
 * Identity request schemas (zod) — one per endpoint body / query / params,
 * applied with `validate({ body, query, params })` in identity.routes.js.
 */
import { z } from 'zod';
import {
  GOOGLE_CREDENTIAL_MAX_LENGTH,
  MOBILE_PATTERN,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  STAFF_ROLES,
  USER_STATUSES,
} from './identity.constants.js';

const email = z.string().trim().toLowerCase().max(254).email('Enter a valid email');
/** Never trimmed: leading/trailing spaces are part of a password. Letters and numbers both required (ADR-012). */
const newPassword = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Use at least ${PASSWORD_MIN_LENGTH} characters`)
  .max(PASSWORD_MAX_LENGTH)
  .regex(/[A-Za-z]/, 'Include at least one letter')
  .regex(/\d/, 'Include at least one number');
const mfaToken = z.string().min(1, 'mfaToken is required').max(2000);

/** `password` is the account's password — or, before the first sign-in, its one-time setup code. */
export const loginBody = z.object({
  email,
  password: z.string().min(1, 'Password is required').max(PASSWORD_MAX_LENGTH),
});

/** Body for POST /auth/password/setup — the token from signing in with the setup code, and the new password. */
export const setupPasswordBody = z.object({
  setupToken: z.string().min(1, 'setupToken is required').max(2000),
  newPassword,
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

export const changePasswordBody = z.object({
  currentPassword: z.string().min(1, 'Current password is required').max(PASSWORD_MAX_LENGTH),
  newPassword,
});

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
