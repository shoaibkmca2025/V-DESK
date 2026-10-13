/**
 * Identity constants — roles, the single permission map (rules.md §20) and session/lockout settings.
 */

/** Staff roles (PRD §69). CUSTOMER logins arrive with phone OTP in Phase 2. */
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
  /** KYC applications and identity documents (PRD §46–47) — compliance only; every read is audited. */
  'kyc:read': ['COMPLIANCE'],
  /** Approving or rejecting KYC documents. */
  'kyc:review': ['COMPLIANCE'],
  /** Subscriptions: read (ops + finance), change (ops), activate (ops sign-off, modules.md §3.9). */
  'subscriptions:read': ['OPS_ADMIN', 'FINANCE'],
  'subscriptions:write': ['OPS_ADMIN'],
  'subscriptions:activate': ['OPS_ADMIN'],
  /** Enterprise accounts, team bookings, price books and reports (Phase 4). */
  'enterprise:read': ['OPS_ADMIN', 'SALES_MANAGER', 'FINANCE'],
  'enterprise:manage': ['OPS_ADMIN', 'SALES_MANAGER'],
  /** Organisation price books change what customers pay — finance only. */
  'enterprise:pricing': ['FINANCE'],
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
