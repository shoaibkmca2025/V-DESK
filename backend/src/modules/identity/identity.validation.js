/**
 * Identity request schemas (zod) — one per endpoint body / query / params,
 * applied with `validate({ body, query, params })` in identity.routes.js.
 */
import { z } from 'zod';
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH, STAFF_ROLES, USER_STATUSES } from './identity.constants.js';

const email = z.string().trim().toLowerCase().max(254).email('Enter a valid email');
/** Never trimmed: leading/trailing spaces are part of a password. */
const newPassword = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Use at least ${PASSWORD_MIN_LENGTH} characters`)
  .max(PASSWORD_MAX_LENGTH);
const mfaToken = z.string().min(1, 'mfaToken is required').max(2000);

export const loginBody = z.object({
  email,
  password: z.string().min(1, 'Password is required').max(PASSWORD_MAX_LENGTH),
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

export const createUserBody = z.object({
  email,
  name: z.string().trim().min(1, 'Name is required').max(120),
  role: z.enum(STAFF_ROLES),
  /** Temporary password the admin passes on; the user changes it with POST /auth/password. */
  password: newPassword,
});

export const updateUserBody = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    role: z.enum(STAFF_ROLES).optional(),
    status: z.enum(USER_STATUSES).optional(),
    password: newPassword.optional(),
    resetMfa: z.literal(true).optional(),
    unlock: z.literal(true).optional(),
  })
  .refine((body) => Object.values(body).some((value) => value !== undefined), {
    message: 'Send at least one of name, role, status, password, resetMfa or unlock',
  });

export const userRefParams = z.object({
  ref: z.string().trim().toUpperCase().min(1).max(50),
});

export const listUsersQuery = z.object({
  cursor: z.string().trim().min(1).max(500).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});
