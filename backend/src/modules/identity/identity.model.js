/**
 * Identity Mongoose schemas. Collections: users, refresh_tokens.
 * (organizations arrive with the enterprise module; MFA secrets live encrypted on the user, not in a
 * separate mfa_secrets collection, so enabling MFA is a single-document write.)
 */
import mongoose from 'mongoose';
import { STAFF_ROLES, USER_STATUSES } from './identity.constants.js';

const { Schema } = mongoose;

// ──────────────────────────────────────────────
// User
// ──────────────────────────────────────────────
const userSchema = new Schema(
  {
    ref: { type: String, required: true, unique: true }, // e.g. USR-MU8Q2K1Z4F
    email: { type: String, required: true, unique: true }, // stored lower-case
    name: { type: String, required: true },
    role: { type: String, enum: STAFF_ROLES, required: true },
    status: { type: String, enum: USER_STATUSES, default: 'active' },
    /** argon2id hash (rules.md §19). Never leaves the repository layer's callers in the service. */
    passwordHash: { type: String, required: true },
    mfa: {
      enabled: { type: Boolean, default: false },
      /** AES-256-GCM sealed base32 secret, see identity.totp.js. */
      secret: { type: String, default: null },
      /** Secret handed out by /mfa/enroll, promoted to `secret` once a code from it is verified. */
      pendingSecret: { type: String, default: null },
      /** Last accepted TOTP time step — a code is accepted at most once. */
      lastStep: { type: Number, default: -1 },
    },
    failedAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },
    createdBy: { type: String, default: null }, // user ref, or 'script' for the bootstrap admin
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

userSchema.index({ deletedAt: 1, createdAt: -1 });

// ──────────────────────────────────────────────
// Refresh token (rotating; only the SHA-256 of the token is stored)
// ──────────────────────────────────────────────
const refreshTokenSchema = new Schema(
  {
    tokenHash: { type: String, required: true, unique: true },
    userRef: { type: String, required: true },
    /** Every rotation of one login shares a family; reuse of a rotated token revokes the whole family. */
    family: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

refreshTokenSchema.index({ userRef: 1, revokedAt: 1 });
refreshTokenSchema.index({ family: 1 });
// Expired tokens are useless; let MongoDB delete them.
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const User = mongoose.model('User', userSchema, 'users');
export const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema, 'refresh_tokens');
