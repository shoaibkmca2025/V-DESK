/**
 * Google Identity Services — server-side check of the ID token ("credential") the website's
 * "Continue with Google" button hands back.
 * https://developers.google.com/identity/gsi/web/guides/verify-google-id-token
 *
 * The token is a JWT signed by Google (RS256). It is checked here against Google's published keys, its issuer,
 * its audience (our OAuth client ID) and its expiry — no call to Google per sign-in, only an occasional fetch of
 * the key set, which jose caches and refreshes when Google rotates keys.
 *
 * Interface: `verifyIdToken(idToken, { clientId }) → { sub, email, emailVerified, name } | null` — null when the
 * token is not a valid Google ID token for this client; throws when Google's keys can't be fetched (rules.md §29).
 * Tests sign their own tokens and install the matching keys with `useGoogleKeysForTests` (rules.md §6), so the
 * real verification runs in the test suite too.
 */
import { createRemoteJWKSet, jwtVerify } from 'jose';

const CERTS_URL = 'https://www.googleapis.com/oauth2/v3/certs';
const ISSUERS = ['https://accounts.google.com', 'accounts.google.com'];
const TIMEOUT_MS = 5000;

let keySet;
const googleKeys = () => (keySet ??= createRemoteJWKSet(new URL(CERTS_URL), { timeoutDuration: TIMEOUT_MS }));

/** jose error codes that mean "this token is no good", as opposed to "Google could not be reached". */
const INVALID_TOKEN = /^ERR_(JWT|JWS)_|^ERR_JWKS_(NO_MATCHING_KEY|MULTIPLE_MATCHING_KEYS)$|^ERR_JOSE_ALG_NOT_ALLOWED$/;

export async function verifyIdToken(idToken, { clientId }) {
  let payload;
  try {
    ({ payload } = await jwtVerify(idToken, googleKeys(), {
      issuer: ISSUERS,
      audience: clientId,
      algorithms: ['RS256'],
    }));
  } catch (err) {
    if (INVALID_TOKEN.test(err.code ?? '')) return null;
    throw err;
  }
  if (typeof payload.sub !== 'string' || !payload.sub || typeof payload.email !== 'string') return null;
  return {
    sub: payload.sub,
    email: payload.email.trim().toLowerCase(),
    emailVerified: payload.email_verified === true,
    name: typeof payload.name === 'string' ? payload.name.trim() : '',
  };
}

/** Test seam: replace Google's key set with a local one (jose `createLocalJWKSet`). */
export function useGoogleKeysForTests(keys) {
  keySet = keys;
}
