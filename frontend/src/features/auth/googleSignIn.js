import { isApiEnabled } from '@/lib/api.js';
import { signInWithGoogle } from './session.js';

/**
 * "Continue with Google" — Google Identity Services' button (https://developers.google.com/identity/gsi/web).
 *
 * Google's script draws the button and, once the person picks an account, hands back an ID token. That token
 * goes straight to the API (session.signInWithGoogle), which checks it with Google's keys; nothing here trusts
 * it. The script is loaded only when a button is first shown, so pages without one never fetch it.
 *
 * Needs VITE_GOOGLE_CLIENT_ID (the OAuth client ID — public) and an API. Without either the button is not
 * offered and `isGoogleSignInAvailable()` says so, so callers can explain instead of showing a dead button.
 */

const SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

let loading = null;
let initialised = false;
/** The button shown most recently decides what happens with the next credential. */
let onCredential = null;

export function googleClientId() {
  return import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() || '';
}

export function isGoogleSignInAvailable() {
  return isApiEnabled() && Boolean(googleClientId());
}

function loadScript() {
  if (globalThis.google?.accounts?.id) return Promise.resolve(globalThis.google);
  loading ??= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () =>
      globalThis.google?.accounts?.id ? resolve(globalThis.google) : reject(new Error('Google sign-in did not load'));
    script.onerror = () => {
      loading = null;
      script.remove();
      reject(new Error('Google sign-in could not load. Check your connection and try again.'));
    };
    document.head.append(script);
  });
  return loading;
}

/**
 * Draws the Google button into `container`. When the person signs in, the API is asked for a session and
 * `onSignedIn(customer)` runs; a refusal goes to `onError(error)`. Resolves once the button is on screen and
 * rejects when Google's script cannot be loaded (blocked, offline) — say so rather than leave an empty box.
 */
export async function mountGoogleSignIn(container, { onSignedIn, onError, onBusy, text = 'continue_with' } = {}) {
  if (!isGoogleSignInAvailable()) throw new Error('Google sign-in is not set up for this site yet.');
  const google = await loadScript();

  onCredential = async (credential) => {
    onBusy?.(true);
    try {
      onSignedIn?.(await signInWithGoogle(credential));
    } catch (error) {
      onError?.(error);
    } finally {
      onBusy?.(false);
    }
  };
  if (!initialised) {
    google.accounts.id.initialize({
      client_id: googleClientId(),
      callback: (response) => onCredential?.(response.credential),
      ux_mode: 'popup',
      auto_select: false,
      cancel_on_tap_outside: true,
      context: 'signin',
    });
    initialised = true;
  }

  container.replaceChildren();
  // Google allows 200–400 px; a container that is not laid out yet (a closed dialog) reads as 0.
  const width = Math.max(200, Math.min(400, Math.round(container.clientWidth) || 320));
  google.accounts.id.renderButton(container, {
    type: 'standard',
    theme: 'outline',
    size: 'large',
    shape: 'pill',
    text,
    logo_alignment: 'left',
    width,
  });
}

/** A short, honest message for a failed sign-in. */
export function googleSignInMessage(error) {
  switch (error?.code) {
    case 'GOOGLE_EMAIL_UNVERIFIED':
      return 'Please use a Google account with a verified email address.';
    case 'ACCOUNT_DISABLED':
      return 'This account is not active. Please contact us to reopen it.';
    case 'GOOGLE_UNAVAILABLE':
    case 'AUTH_NOT_CONFIGURED':
      return 'Google sign-in is unavailable right now. Please try again in a minute.';
    default:
      return error?.message || 'Google sign-in did not go through. Please try again.';
  }
}
