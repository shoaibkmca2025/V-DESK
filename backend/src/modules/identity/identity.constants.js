/**
 * Identity constants — roles, the single permission map (rules.md §20) and session/lockout settings.
 */

/** Staff roles (PRD §69). Customers are not a role: they live in their own collection, see CUSTOMER_* below. */
export const STAFF_ROLES = [
  'SUPER_ADMIN',
  'OPS_ADMIN',
  'SALES_MANAGER',
  'SALES_EXEC',
  'FINANCE',
  'COMPLIANCE',
  'CONTENT',
];

export const USER_STATUSES = ['active', 'disabled'];

/**
 * The only place that decides who may do what. Routes ask for a permission, never a role.
 * SUPER_ADMIN holds every permission implicitly.
 */
export const PERMISSIONS = Object.freeze({
  'users:manage': [],
  'leads:read': ['OPS_ADMIN', 'SALES_MANAGER', 'SALES_EXEC'],
  'leads:write': ['SALES_MANAGER', 'SALES_EXEC'],
  /** Bulk download of contact details — managers only. */
  'leads:export': ['SALES_MANAGER'],
  'search:manage': ['OPS_ADMIN', 'CONTENT'],
  'catalog:manage': ['OPS_ADMIN'],
  'analytics:read': ['OPS_ADMIN', 'SALES_MANAGER', 'FINANCE'],
  'pricing:manage': ['FINANCE'],
  'quotes:read': ['OPS_ADMIN', 'SALES_MANAGER', 'SALES_EXEC', 'FINANCE'],
  'bookings:read': ['OPS_ADMIN', 'SALES_MANAGER'],
  'bookings:write': ['OPS_ADMIN'],
  'orders:read': ['OPS_ADMIN', 'SALES_MANAGER', 'FINANCE'],
  /** Message templates (content); the delivery log shows masked recipients only. */
  'notifications:manage': ['OPS_ADMIN', 'CONTENT'],
  'notifications:read': ['OPS_ADMIN'],
  'content:manage': ['OPS_ADMIN', 'CONTENT'],
  /** Publishing trust claims ("10,000+ businesses") needs evidence and a super admin (memory.md §5, PRD §22). */
  'content:approve': [],
});

/** Short-lived access token (rules.md §19). */
export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
/** Issued after a correct password; trades for a session once the TOTP code checks out. */
export const MFA_TOKEN_TTL_SECONDS = 5 * 60;
export const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const REFRESH_COOKIE = 'vd_rt';
export const REFRESH_COOKIE_PATH = '/api/v1/auth';

/** Wrong passwords and wrong TOTP codes both count; the account locks for a while after too many. */
export const MAX_FAILED_ATTEMPTS = 5;
export const LOCKOUT_MS = 15 * 60 * 1000;

export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 128;

export const TOTP_ISSUER = 'V-DESK';
export const TOTP_DIGITS = 6;
export const TOTP_PERIOD_SECONDS = 30;
/** Accept the previous and next 30-second step too, for clock drift. */
export const TOTP_WINDOW = 1;

export const JWT_ISSUER = 'vdesk-api';
export const JWT_AUDIENCE = 'vdesk';

// ──────────────────────────────────────────────
// Customers (phone OTP — ADR-009)
// ──────────────────────────────────────────────

export const CUSTOMER_STATUSES = ['active', 'disabled'];

/** An Indian mobile, with or without +91 — the same shape booking and crm accept. */
export const MOBILE_PATTERN = /^(\+?91)?[6-9]\d{9}$/;

/** Customers sign in on their phone and stay signed in far longer than staff do. */
export const CUSTOMER_ACCESS_TOKEN_TTL_SECONDS = 60 * 60;
export const CUSTOMER_REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;
/** Its own cookie, so a staff member using the portal in the same browser keeps both sessions. */
export const CUSTOMER_REFRESH_COOKIE = 'vd_crt';
export const CUSTOMER_REFRESH_COOKIE_PATH = '/api/v1/auth/customer';

export const OTP_LENGTH = 6;
export const OTP_TTL_MS = 5 * 60 * 1000;
/** Wrong codes for one challenge; the next request starts a fresh one. */
export const OTP_MAX_ATTEMPTS = 5;
/** Stops "resend" being a free SMS button: a gap between sends, and a ceiling per window. */
export const OTP_RESEND_MS = 30 * 1000;
export const OTP_SEND_WINDOW_MS = 30 * 60 * 1000;
export const OTP_MAX_SENDS_PER_WINDOW = 5;
/** Staff write the wording; no template → nothing is queued (notifications.notifyIfConfigured). */
export const OTP_TEMPLATE_KEY = 'customer.otp';
