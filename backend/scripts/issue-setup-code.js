/**
 * Issues a fresh one-time setup code for an existing staff account, straight against the database — for when
 * nobody can sign in to the admin console to do it (ADR-012, ADR-013).
 *
 * The usual case: the only super admin's password was stored before ADR-013 (hashed on the server), so it can no
 * longer be checked and sign-in answers PASSWORD_RESET_REQUIRED. Run this, then sign in on the admin page with
 * "I have a setup code" and choose a password again. The authenticator app stays as it was.
 *
 * Usage (from backend/, with DATABASE_URL pointing at the database):
 *   node --env-file-if-exists=.env scripts/issue-setup-code.js you@vdesk.in
 *
 * The code is printed once and never stored; the old password stops working and the account's sessions end.
 */
import { connectDb, disconnectDb } from '../src/config/db.js';
import { issueSetupCodeByEmail } from '../src/modules/identity/index.js';

const email = process.argv[2]?.trim().toLowerCase();
if (!email) {
  console.error('Usage: node scripts/issue-setup-code.js <email>');
  process.exit(1);
}

await connectDb();
try {
  const user = await issueSetupCodeByEmail(email, 'script');
  console.log(`[issue-setup-code] ${user.ref} (${user.role})`);
  console.log(`[issue-setup-code] one-time setup code: ${user.setupCode}`);
  console.log(
    `[issue-setup-code] valid until ${user.setupCodeExpiresAt.toISOString()} — sign in with it, then choose a password`,
  );
} catch (err) {
  console.error(`[issue-setup-code] ${err.code ?? 'FAILED'}: ${err.message}`);
  process.exitCode = 1;
} finally {
  await disconnectDb();
}
