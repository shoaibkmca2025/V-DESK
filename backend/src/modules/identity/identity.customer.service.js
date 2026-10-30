/**
 * Customer identity — portal sign-in with a phone OTP (ADR-009).
 *
 * Rules:
 *  - The verified mobile number *is* the account. One request → verify pair both registers and signs in, so
 *    there is no second registration endpoint that could drift out of step with sign-in. A first verify needs
 *    a name; after that the number is enough.
 *  - Codes are 6 digits, live 5 minutes, work once, and are stored only as a peppered hash (rules.md §19).
 *    Five wrong codes end the challenge; the customer has to ask for a new one.
 *  - Sends are capped per number as well as per IP: one every 30 s, 5 per 30-minute window, so "resend" can
 *    never be used as a free SMS button.
 *  - A customer token carries no role and no permission (`typ: 'customer'`), so it cannot open a staff route —
 *    just as a staff token cannot open a portal route.
 *  - Logs carry customer refs only: never a mobile number, a code or a token (rules.md §21).
 */
import { randomUUID } from 'node:crypto';
import { env } from '../../config/env.js';
import { AppError, badRequest, forbidden, unauthorized } from '../../shared/errors/AppError.js';
import { logger } from '../../shared/lib/logger.js';
import { generateRef } from '../../shared/lib/refs.js';
import {
  CUSTOMER_ACCESS_TOKEN_TTL_SECONDS,
  CUSTOMER_REFRESH_TOKEN_TTL_MS,
  OTP_MAX_ATTEMPTS,
  OTP_MAX_SENDS_PER_WINDOW,
  OTP_RESEND_MS,
  OTP_SEND_WINDOW_MS,
  OTP_TEMPLATE_KEY,
  OTP_TTL_MS,
} from './identity.constants.js';
import * as customerRepo from './identity.customer.repository.js';
import { mapCustomer } from './identity.mapper.js';
// Refresh tokens are one collection for both surfaces, so a customer session reuses the staff plumbing.
import * as repo from './identity.repository.js';
import { consumeRefreshToken, sessionEnded } from './identity.service.js';
import {
  generateOtpCode,
  generateRefreshToken,
  hashOtp,
  hashRefreshToken,
  signCustomerToken,
  verifyToken,
} from './identity.tokens.js';

const log = logger.child({ module: 'identity.customer' });

/** Customer sign-in needs no MFA key — only the signing secret. */
function assertConfigured() {
  if (!env.JWT_SECRET) {
    throw new AppError(503, 'AUTH_NOT_CONFIGURED', 'Sign-in is not configured on this server');
  }
}

const seconds = (ms) => Math.max(1, Math.ceil(ms / 1000));

async function startCustomerSession(customer, now, family = randomUUID()) {
  const refreshToken = generateRefreshToken();
  const refreshExpiresAt = new Date(now.getTime() + CUSTOMER_REFRESH_TOKEN_TTL_MS);
  await repo.insertRefreshToken({
    tokenHash: hashRefreshToken(refreshToken),
    userRef: customer.ref,
    family,
    expiresAt: refreshExpiresAt,
  });
  return {
    accessToken: await signCustomerToken(customer),
    expiresIn: CUSTOMER_ACCESS_TOKEN_TTL_SECONDS,
    refreshToken,
    refreshExpiresAt,
    customer: mapCustomer(customer),
  };
}

/**
 * Hands the code to the notifications module, which sends it once staff have written and switched on the
 * `customer.otp` template — the wording of a customer-facing SMS is theirs, not ours. Imported inside the
 * function rather than at the top of the file because notifications' own routes import this module's staff
 * guard, and a lazy import keeps that from becoming a load-time cycle.
 */
async function deliverCode(mobile, code, customer, now) {
  const { notifyIfConfigured } = await import('../notifications/index.js');
  const result = await notifyIfConfigured(
    {
      templateKey: OTP_TEMPLATE_KEY,
      to: mobile,
      available: { code, minutes: OTP_TTL_MS / 60_000, name: customer?.name },
      dedupeKey: `otp:${mobile}:${now.getTime()}`,
    },
    now,
  );
  return result.skipped ? 'not-configured' : 'queued';
}

// ──────────────────────────────────────────────
// Sign-in
// ──────────────────────────────────────────────

/**
 * Step 1: send a code to a mobile number. The answer says whether this number is new here, so the client knows
 * to ask for a name before verifying.
 */
export async function requestOtp({ mobile }, now = new Date()) {
  assertConfigured();
  const existing = await customerRepo.findOtpChallenge(mobile);

  if (existing) {
    const since = now - existing.lastSentAt;
    if (since < OTP_RESEND_MS) {
      throw new AppError(429, 'OTP_RESEND_TOO_SOON', 'A code was just sent. Please wait before asking for another.', {
        retryAfterSeconds: seconds(OTP_RESEND_MS - since),
      });
    }
    const windowAge = now - existing.windowStartedAt;
    if (windowAge < OTP_SEND_WINDOW_MS && existing.sends >= OTP_MAX_SENDS_PER_WINDOW) {
      throw new AppError(429, 'OTP_SEND_LIMIT', 'Too many codes were sent to this number. Please try again later.', {
        retryAfterSeconds: seconds(OTP_SEND_WINDOW_MS - windowAge),
      });
    }
  }

  const sameWindow = Boolean(existing) && now - existing.windowStartedAt < OTP_SEND_WINDOW_MS;
  const customer = await customerRepo.findCustomerByMobile(mobile);
  if (customer && customer.status !== 'active') {
    throw forbidden('ACCOUNT_DISABLED', 'This account is not active. Please contact us to reopen it.');
  }

  const code = generateOtpCode();
  await customerRepo.saveOtpChallenge({
    mobile,
    codeHash: hashOtp(mobile, code),
    expiresAt: new Date(now.getTime() + OTP_TTL_MS),
    sends: sameWindow ? existing.sends + 1 : 1,
    windowStartedAt: sameWindow ? existing.windowStartedAt : now,
    lastSentAt: now,
  });
  const delivery = await deliverCode(mobile, code, customer, now);
  log.info({ event: 'auth.otp_requested', customerRef: customer?.ref ?? null, delivery }, 'sign-in code requested');

  return {
    /** The client shows the name field when the number has no account yet. */
    isNewAccount: !customer,
    name: customer?.name ?? null,
    expiresIn: seconds(OTP_TTL_MS),
    resendAfter: seconds(OTP_RESEND_MS),
    delivery,
    // Outside production there is no SMS provider, so the code comes back here instead of to a phone.
    ...(env.NODE_ENV === 'production' ? {} : { devCode: code }),
  };
}

/** Step 2: the code → a portal session. A number with no account yet gets one, which is the registration. */
export async function verifyOtp({ mobile, code, name, email, company }, now = new Date()) {
  assertConfigured();
  const challenge = await customerRepo.findOtpChallenge(mobile);
  if (!challenge) throw unauthorized('OTP_NOT_REQUESTED', 'Ask for a code before signing in');
  if (!challenge.codeHash || challenge.expiresAt <= now) {
    throw unauthorized('OTP_EXPIRED', 'That code has expired. Please ask for a new one.');
  }
  if (challenge.attempts >= OTP_MAX_ATTEMPTS) {
    throw new AppError(429, 'OTP_ATTEMPTS_EXCEEDED', 'Too many wrong codes. Please ask for a new one.');
  }
  if (hashOtp(mobile, code) !== challenge.codeHash) {
    const attempts = await customerRepo.recordOtpAttempt(mobile);
    log.warn({ event: 'auth.otp_failed', attempts }, 'wrong sign-in code');
    throw new AppError(401, 'OTP_INVALID', 'That code is not right. Please check and try again.', {
      attemptsLeft: Math.max(0, OTP_MAX_ATTEMPTS - attempts),
    });
  }
  const existing = await customerRepo.findCustomerByMobile(mobile);
  // Asked before the code is spent, so someone who typed the right code is not sent back to a dead one.
  if (!existing && !name) throw badRequest('NAME_REQUIRED', 'Tell us your name to finish setting up your account');
  if (existing && existing.status !== 'active') {
    throw forbidden('ACCOUNT_DISABLED', 'This account is not active. Please contact us to reopen it.');
  }

  // One code, one session: whoever spends it first wins, so a replayed request cannot sign in again.
  if (!(await customerRepo.consumeOtpChallenge(mobile, challenge.codeHash))) {
    throw unauthorized('OTP_EXPIRED', 'That code has already been used. Please ask for a new one.');
  }

  if (!existing) {
    // A parallel first verify may have won the insert; either way the account now exists.
    const created =
      (await customerRepo.insertCustomer({
        ref: generateRef('CUS', 6),
        mobile,
        name,
        email: email ?? '',
        company: company ?? '',
        lastLoginAt: now,
      })) ?? (await customerRepo.findCustomerByMobile(mobile));
    log.info({ event: 'customer.registered', customerRef: created.ref }, 'customer account created');
    return startCustomerSession(created, now);
  }

  // Signing in fills in details the account is missing; it never overwrites what the customer already has.
  const fill = { lastLoginAt: now };
  if (email && !existing.email) fill.email = email;
  if (company && !existing.company) fill.company = company;
  const customer = await customerRepo.updateCustomer(existing.ref, fill);
  log.info({ event: 'auth.customer_signed_in', customerRef: customer.ref }, 'customer signed in');
  return startCustomerSession(customer, now);
}

// ──────────────────────────────────────────────
// Session & profile
// ──────────────────────────────────────────────

export async function refreshCustomerSession(refreshToken) {
  assertConfigured();
  const now = new Date();
  const { subjectRef, family } = await consumeRefreshToken(refreshToken, now);
  const customer = await customerRepo.findCustomerByRef(subjectRef);
  if (!customer || customer.status !== 'active') throw sessionEnded();
  return startCustomerSession(customer, now, family);
}

/** Bearer token → the signed-in customer. Reloads the account, so closing it takes effect at once. */
export async function authenticateCustomerToken(token) {
  assertConfigured();
  const ref = await verifyToken(token, 'customer');
  const customer = ref && (await customerRepo.findCustomerByRef(ref));
  if (!customer || customer.status !== 'active') {
    throw unauthorized('TOKEN_INVALID', 'Your session has expired. Please sign in again.');
  }
  return mapCustomer(customer);
}

/** The customer's own details. The mobile number is not self-service — it is the account. */
export async function updateCustomerProfile(ref, { name, email, company }) {
  const set = {};
  if (name !== undefined) set.name = name;
  if (email !== undefined) set.email = email;
  if (company !== undefined) set.company = company;
  const customer = await customerRepo.updateCustomer(ref, set);
  if (!customer) throw unauthorized('TOKEN_INVALID', 'Your session has expired. Please sign in again.');
  log.info({ event: 'customer.updated', customerRef: ref, fields: Object.keys(set) }, 'customer updated');
  return mapCustomer(customer);
}
