/**
 * Customer repository — the only file that queries MongoDB for the customer surface
 * (through identity.customer.model.js). Returns plain objects (`.lean()`).
 */
import { Customer, OtpChallenge } from './identity.customer.model.js';

const DUPLICATE_KEY = 11000;

// ──────────────────────────────────────────────
// Customers
// ──────────────────────────────────────────────

export async function findCustomerByMobile(mobile) {
  return Customer.findOne({ mobile }).lean();
}

export async function findCustomerByRef(ref) {
  return Customer.findOne({ ref }).lean();
}

/** Inserts a customer, or returns null when the mobile number (or ref) is already taken. */
export async function insertCustomer(data) {
  try {
    const doc = await Customer.create(data);
    return doc.toObject();
  } catch (err) {
    if (err.code === DUPLICATE_KEY) return null;
    throw err;
  }
}

export async function updateCustomer(ref, set) {
  return Customer.findOneAndUpdate({ ref }, { $set: set }, { new: true }).lean();
}

// ──────────────────────────────────────────────
// OTP challenges
// ──────────────────────────────────────────────

export async function findOtpChallenge(mobile) {
  return OtpChallenge.findOne({ mobile }).lean();
}

/**
 * Stores the code for a number, replacing whatever was there: one live challenge per number, attempts back
 * to zero. `sends` and `windowStartedAt` are passed in because the send budget belongs to the window, not to
 * the code (see identity.customer.model.js).
 */
export async function saveOtpChallenge({ mobile, codeHash, expiresAt, sends, windowStartedAt, lastSentAt }) {
  return OtpChallenge.findOneAndUpdate(
    { mobile },
    { $set: { codeHash, expiresAt, attempts: 0, sends, windowStartedAt, lastSentAt } },
    { new: true, upsert: true },
  ).lean();
}

/** Counts one wrong code and returns the new total. */
export async function recordOtpAttempt(mobile) {
  const doc = await OtpChallenge.findOneAndUpdate({ mobile }, { $inc: { attempts: 1 } }, { new: true }).lean();
  return doc?.attempts ?? 0;
}

/**
 * Spends the code: clears it so the same code can never be used twice, while keeping the send counters for
 * the rest of the window. Returns false when another request got there first.
 */
export async function consumeOtpChallenge(mobile, codeHash) {
  const result = await OtpChallenge.updateOne(
    { mobile, codeHash },
    { $unset: { codeHash: 1 }, $set: { attempts: 0 } },
  );
  return result.modifiedCount === 1;
}
