/**
 * Creates the first SUPER_ADMIN, for servers where x-admin-key is not set (staging, production).
 * The password comes from the environment so it doesn't land in shell history.
 *
 * Usage (from backend/):
 *   ADMIN_PASSWORD='a-long-temporary-password' node --env-file-if-exists=.env scripts/create-admin.js you@vdesk.in "Your Name"
 *
 * The new admin signs in, enrols an authenticator app (MFA is mandatory) and changes the password
 * with POST /api/v1/auth/password.
 */
import { connectDb, disconnectDb } from '../src/config/db.js';
import { createUser } from '../src/modules/identity/index.js';

const [email, name] = process.argv.slice(2);
const password = process.env.ADMIN_PASSWORD ?? '';

if (!email || !name || password.length < 12) {
  console.error('Usage: ADMIN_PASSWORD=<12+ chars> node scripts/create-admin.js <email> "<name>"');
  process.exit(1);
}

await connectDb();
try {
  const user = await createUser({ email: email.trim().toLowerCase(), name, role: 'SUPER_ADMIN', password }, 'script');
  console.log(`[create-admin] created ${user.ref} (${user.role})`);
} catch (err) {
  console.error(`[create-admin] ${err.code ?? 'FAILED'}: ${err.message}`);
  process.exitCode = 1;
} finally {
  await disconnectDb();
}
