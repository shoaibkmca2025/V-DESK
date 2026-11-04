-- ============================================================================
-- Staff accounts start with a one-time setup code instead of a password (ADR-012).
--
-- A super admin creates the account; the API generates a random setup code and shows it once. The staff
-- member signs in with it once and must then choose their own password; the code is cleared in the same
-- statement that stores the password, so it can never be used again. The code is random (not chosen by a
-- person), so a plain SHA-256 is safe to store — no slow password hash is needed to check it.
-- ============================================================================

ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
ALTER TABLE users ADD COLUMN setup_code_hash       text;
ALTER TABLE users ADD COLUMN setup_code_expires_at timestamptz;

-- Every account can sign in somehow: with its password, or (before the first sign-in, or after an admin
-- issued a fresh code) with its setup code.
ALTER TABLE users ADD CONSTRAINT users_has_credential
  CHECK (password_hash IS NOT NULL OR setup_code_hash IS NOT NULL);
ALTER TABLE users ADD CONSTRAINT users_setup_code_has_expiry
  CHECK ((setup_code_hash IS NULL) = (setup_code_expires_at IS NULL));
