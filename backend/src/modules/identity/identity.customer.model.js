/**
 * Customer Mongoose schemas. Collections: `customers`, `otp_challenges`.
 *
 * Customers are not staff users: they hold no role and no password, their identity is a verified mobile
 * number, and they live in their own collection so no portal sign-in can ever reach a staff permission
 * (ADR-009). Codes are stored as a peppered hash only, never in the clear (rules.md §19, §21).
 */
import mongoose from 'mongoose';
import { CUSTOMER_STATUSES, OTP_SEND_WINDOW_MS } from './identity.constants.js';

const { Schema } = mongoose;

// ──────────────────────────────────────────────
// Customer
// ──────────────────────────────────────────────
const customerSchema = new Schema(
  {
    /** CUS- + time + 6 random characters. */
    ref: { type: String, required: true, unique: true },
    /** The account: 10 digits, normalised. One account per number. */
    mobile: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, default: '' },
    company: { type: String, default: '' },
    status: { type: String, enum: CUSTOMER_STATUSES, default: 'active' },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true },
);
customerSchema.index({ createdAt: -1, ref: -1 });

// ──────────────────────────────────────────────
// OTP challenge
// ──────────────────────────────────────────────
const otpChallengeSchema = new Schema(
  {
    /** One live challenge per number; a new request replaces the code on this document. */
    mobile: { type: String, required: true, unique: true },
    codeHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    /** Wrong codes for the current challenge. */
    attempts: { type: Number, default: 0 },
    /** Sends inside the current window, and when that window opened. */
    sends: { type: Number, default: 1 },
    windowStartedAt: { type: Date, required: true },
    lastSentAt: { type: Date, required: true },
  },
  { timestamps: true },
);
/*
 * The document outlives its code on purpose: the code is dead after `expiresAt` (checked in the service), but
 * the send counters have to survive that long or "resend" would hand out a fresh budget every five minutes.
 * MongoDB deletes the document once the window has closed.
 */
otpChallengeSchema.index({ lastSentAt: 1 }, { expireAfterSeconds: OTP_SEND_WINDOW_MS / 1000 });

export const Customer = mongoose.model('Customer', customerSchema, 'customers');
export const OtpChallenge = mongoose.model('OtpChallenge', otpChallengeSchema, 'otp_challenges');
