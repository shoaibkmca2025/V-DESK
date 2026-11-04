/**
 * Creates the first SUPER_ADMIN, for servers where x-admin-key is not set (staging, production).
 *
 * Usage (from backend/):
 *   node --env-file-if-exists=.env scripts/create-admin.js you@vdesk.in "Your Name"
 *
 * Prints a one-time setup code (ADR-012), shown only here. The new admin signs in on the admin page with their
 * email and that code, chooses their own password, then enrols an authenticator app (MFA is mandatory).
 *
 * Setting ADMIN_PASSWORD instead skips the setup code and stores that password directly — only for automated
 * environments; it comes from the environment so it doesn't land in shell history.
 */
import { connectDb, disconnectDb } from '../src/config/db.js';
import { createUser } from '../src/modules/identity/index.js';

const [email, name] = process.argv.slice(2);
const password = process.env.ADMIN_PASSWORD || undefined;

if (!email || !name || (password !== undefined && password.length < 12)) {
  console.error('Usage: node scripts/create-admin.js <email> "<name>"   (optional: ADMIN_PASSWORD=<12+ chars>)');
  process.exit(1);
}

await connectDb();
try {
  const user = await createUser({ email: email.trim().toLowerCase(), name, role: 'SUPER_ADMIN', password }, 'script');
  console.log(`[create-admin] created ${user.ref} (${user.role})`);
  if (user.setupCode) {
    console.log(`[create-admin] one-time setup code: ${user.setupCode}`);
    console.log(
      `[create-admin] valid until ${user.setupCodeExpiresAt.toISOString()} — sign in with it, then choose a password`,
    );
  }
} catch (err) {
  console.error(`[create-admin] ${err.code ?? 'FAILED'}: ${err.message}`);
  process.exitCode = 1;
} finally {
  await disconnectDb();
}
