import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT } from 'jose';
import { useGoogleKeysForTests } from '../src/integrations/google.js';

/** Must match GOOGLE_CLIENT_ID in vitest.config.js. */
export const GOOGLE_CLIENT_ID = 'test-client.apps.googleusercontent.com';
const KID = 'test-google-key';

let signingKey;

/** A key pair standing in for Google's: the API is told to trust its public half (integrations/google.js). */
async function installGoogleKeys() {
  const { publicKey, privateKey } = await generateKeyPair('RS256');
  const jwk = { ...(await exportJWK(publicKey)), kid: KID, alg: 'RS256', use: 'sig' };
  useGoogleKeysForTests(createLocalJWKSet({ keys: [jwk] }));
  signingKey = privateKey;
}

/**
 * An ID token shaped like the one Google's sign-in button returns, signed with the test key. Every claim the
 * server checks can be overridden, to test each refusal. `key` signs with some other key (a forgery).
 */
export async function googleIdToken({
  sub = '100000000000000000001',
  email = 'priya@example.com',
  name = 'Priya Kulkarni',
  emailVerified = true,
  audience = GOOGLE_CLIENT_ID,
  issuer = 'https://accounts.google.com',
  expiresIn = '1h',
  key,
} = {}) {
  if (!signingKey) await installGoogleKeys();
  return new SignJWT({ email, email_verified: emailVerified, ...(name ? { name } : {}) })
    .setProtectedHeader({ alg: 'RS256', kid: KID, typ: 'JWT' })
    .setSubject(sub)
    .setIssuer(issuer)
    .setAudience(audience)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(key ?? signingKey);
}

/** A private key Google never published — for forged tokens. */
export async function strangerKey() {
  return (await generateKeyPair('RS256')).privateKey;
}
