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
export const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const REFRESH_COOKIE = 'vd_rt';
export const REFRESH_COOKIE_PATH = '/api/v1/auth';

/** The password is the only barrier to the console, so guessing is made expensive. */
export const MAX_FAILED_ATTEMPTS = 5;
export const LOCKOUT_MS = 15 * 60 * 1000;

/**
 * The password rule (ADR-012). The API never sees a password (ADR-013) — only the key derived from it — so the
 * sign-in page enforces this (frontend features/auth/staffSession.js `passwordProblem`); kept here as the record.
 */
export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 128;

export const JWT_ISSUER = 'vdesk-api';
export const JWT_AUDIENCE = 'vdesk';

// ──────────────────────────────────────────────
// Customers (Google sign-in at checkout — ADR-012)
// ──────────────────────────────────────────────

export const CUSTOMER_STATUSES = ['active', 'disabled'];

/** An Indian mobile, with or without +91 — the same shape booking and crm accept. Contact data, not identity. */
export const MOBILE_PATTERN = /^(\+?91)?[6-9]\d{9}$/;

/** Customers stay signed in far longer than staff do. */
export const CUSTOMER_ACCESS_TOKEN_TTL_SECONDS = 60 * 60;
export const CUSTOMER_REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;
/** Its own cookie, so a staff member using the portal in the same browser keeps both sessions. */
export const CUSTOMER_REFRESH_COOKIE = 'vd_crt';
export const CUSTOMER_REFRESH_COOKIE_PATH = '/api/v1/auth/customer';

/** Google ID tokens are around 1 KB; anything far larger is not one. */
export const GOOGLE_CREDENTIAL_MAX_LENGTH = 4096;
