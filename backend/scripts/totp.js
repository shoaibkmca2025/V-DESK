/**
 * Prints the current 6-digit code for a TOTP secret — an authenticator app for manual API testing
 * (Thunder Client), so local sign-in doesn't need a phone. Use only with test accounts' secrets.
 *
 * Usage (from backend/): npm run totp -- <base32 secret from POST /auth/mfa/enroll>
 */
import { hotp, totpStep } from '../src/modules/identity/identity.totp.js';

const secret = process.argv[2];
if (!secret) {
  console.error('Usage: npm run totp -- <base32 secret>');
  process.exit(1);
}

const secondsLeft = 30 - (Math.floor(Date.now() / 1000) % 30);
console.log(`${hotp(secret, totpStep())}  (valid for ${secondsLeft}s more)`);
