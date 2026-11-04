-- ADR-012: customers sign in with Google, and only when they pay. Browsing, asking for a quote and holding a
-- room need no account, so phone-OTP sign-in (ADR-009) is retired.

-- ── Customers ────────────────────────────────
-- A Google account is the identity now (its stable `sub`, never the email, which can change). The mobile number
-- becomes ordinary contact data: optional, and no longer unique, since it no longer decides whose account it is.
ALTER TABLE customers ALTER COLUMN mobile DROP NOT NULL;
ALTER TABLE customers DROP CONSTRAINT customers_mobile_key;
ALTER TABLE customers ADD COLUMN google_sub text;
ALTER TABLE customers ADD CONSTRAINT customers_google_sub_key UNIQUE (google_sub);
-- Accounts from the phone-OTP days have a mobile and no Google account; every new account has a Google account.
ALTER TABLE customers ADD CONSTRAINT customers_has_identity CHECK (google_sub IS NOT NULL OR mobile IS NOT NULL);

DROP TABLE otp_challenges;

-- ── Bookings ─────────────────────────────────
-- A room is held before anyone signs in. The customer who pays for it claims it at checkout, which is when
-- customer_ref is filled in; until then the booking carries only the contact details typed into the form.
ALTER TABLE bookings ALTER COLUMN customer_ref DROP NOT NULL;
