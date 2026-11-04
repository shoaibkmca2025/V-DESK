/**
 * Customer identity — "Continue with Google" at checkout (ADR-012, replacing ADR-009's phone OTP).
 *
 * Rules:
 *  - Nobody needs an account to browse, ask for a quote or hold a room. A customer signs in only to pay, so
 *    the payment, and the booking it pays for, belong to a real, verified person.
 *  - The Google account *is* the customer account: its stable `sub` is the key, never the email (which the
 *    person can change at Google). The first sign-in creates the account; there is no separate registration.
 *  - The ID token is verified on the server against Google's keys, issuer, our client ID and expiry
 *    (integrations/google.js). An address Google has not verified is refused.
 *  - A customer token carries no role and no permission (`typ: 'customer'`), so it cannot open a staff route —
 *    just as a staff token cannot open a portal route.
 *  - Logs carry customer refs only: never an email, a mobile or a token (rules.md §21).
 */
import { randomUUID } from 'node:crypto';
import { env } from '../../config/env.js';
import * as google from '../../integrations/google.js';
import { AppError, forbidden, unauthorized } from '../../shared/errors/AppError.js';
import { logger } from '../../shared/lib/logger.js';
import { generateRef } from '../../shared/lib/refs.js';
import { CUSTOMER_ACCESS_TOKEN_TTL_SECONDS, CUSTOMER_REFRESH_TOKEN_TTL_MS } from './identity.constants.js';
import * as customerRepo from './identity.customer.repository.js';
import { mapCustomer } from './identity.mapper.js';
// Refresh tokens are one table for both surfaces, so a customer session reuses the staff plumbing.
import * as repo from './identity.repository.js';
import { consumeRefreshToken, sessionEnded } from './identity.service.js';
import { generateRefreshToken, hashRefreshToken, signCustomerToken, verifyToken } from './identity.tokens.js';

const log = logger.child({ module: 'identity.customer' });

/** Customer sessions need the signing secret; signing in also needs the Google client ID. */
function assertConfigured({ signIn = false } = {}) {
  if (!env.JWT_SECRET || (signIn && !env.GOOGLE_CLIENT_ID)) {
    throw new AppError(503, 'AUTH_NOT_CONFIGURED', 'Sign-in is not configured on this server');
  }
}

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

const assertActive = (customer) => {
  if (customer.status !== 'active') {
    throw forbidden('ACCOUNT_DISABLED', 'This account is not active. Please contact us to reopen it.');
  }
};

// ──────────────────────────────────────────────
// Sign-in
// ──────────────────────────────────────────────

/**
 * A Google ID token (the `credential` from the website's Google button) → a portal session. The first time a
 * Google account signs in, its customer account is created from the name and verified email Google gives.
 */
export async function signInWithGoogle({ credential }, now = new Date()) {
  assertConfigured({ signIn: true });

  let profile;
  try {
    profile = await google.verifyIdToken(credential, { clientId: env.GOOGLE_CLIENT_ID });
  } catch (err) {
    log.warn({ event: 'auth.google_unavailable', err: err.message }, 'could not check a Google sign-in');
    throw new AppError(503, 'GOOGLE_UNAVAILABLE', 'Google sign-in is unavailable right now. Please try again.');
  }
  if (!profile) throw unauthorized('GOOGLE_TOKEN_INVALID', 'Google sign-in did not go through. Please try again.');
  if (!profile.emailVerified) {
    throw unauthorized('GOOGLE_EMAIL_UNVERIFIED', 'Please use a Google account with a verified email address.');
  }

  const existing = await customerRepo.findCustomerByGoogleSub(profile.sub);
  if (existing) {
    assertActive(existing);
    // Signing in fills in what the account is missing; it never overwrites what the customer has set.
    const fill = { lastLoginAt: now };
    if (!existing.email) fill.email = profile.email;
    const customer = await customerRepo.updateCustomer(existing.ref, fill);
    log.info({ event: 'auth.customer_signed_in', customerRef: customer.ref }, 'customer signed in');
    return startCustomerSession(customer, now);
  }

  // A parallel first sign-in may have won the insert; either way the account now exists.
  const created =
    (await customerRepo.insertCustomer({
      ref: generateRef('CUS', 6),
      googleSub: profile.sub,
      name: profile.name || profile.email.split('@')[0],
      email: profile.email,
      lastLoginAt: now,
    })) ?? (await customerRepo.findCustomerByGoogleSub(profile.sub));
  assertActive(created);
  log.info({ event: 'customer.registered', customerRef: created.ref }, 'customer account created');
  return startCustomerSession(created, now);
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

/** The customer's own details. The Google account behind them is not self-service — it is the account. */
export async function updateCustomerProfile(ref, { name, mobile, email, company }) {
  const set = {};
  if (name !== undefined) set.name = name;
  if (mobile !== undefined) set.mobile = mobile;
  if (email !== undefined) set.email = email;
  if (company !== undefined) set.company = company;
  const customer = await customerRepo.updateCustomer(ref, set);
  if (!customer) throw unauthorized('TOKEN_INVALID', 'Your session has expired. Please sign in again.');
  log.info({ event: 'customer.updated', customerRef: ref, fields: Object.keys(set) }, 'customer updated');
  return mapCustomer(customer);
}
