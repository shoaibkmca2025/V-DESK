import { useEffect, useRef, useState } from 'react';
import { googleSignInMessage, isGoogleSignInAvailable, mountGoogleSignIn } from '@/features/auth/googleSignIn.js';

/**
 * Google's own "Continue with Google" button, plus the states around it: loading, signing in, a refusal, and
 * the honest "not set up yet" when this build has no Google client ID.
 */
export default function GoogleSignInButton({ onSignedIn, text = 'continue_with' }) {
  const box = useRef(null);
  const available = isGoogleSignInAvailable();
  const [state, setState] = useState(available ? 'loading' : 'unavailable');
  const [error, setError] = useState(null);
  const signedIn = useRef(onSignedIn);
  signedIn.current = onSignedIn;

  useEffect(() => {
    if (!available || !box.current) return undefined;
    let live = true;
    mountGoogleSignIn(box.current, {
      text,
      onBusy: (busy) => live && setState(busy ? 'busy' : 'ready'),
      onSignedIn: (customer) => {
        if (!live) return;
        setError(null);
        signedIn.current?.(customer);
      },
      onError: (err) => live && setError(googleSignInMessage(err)),
    })
      .then(() => live && setState('ready'))
      .catch((err) => {
        if (!live) return;
        setState('failed');
        setError(err.message);
      });
    return () => {
      live = false;
    };
  }, [available, text]);

  if (!available) {
    return (
      <p className="ui-field__error" role="status">
        Google sign-in is not switched on for this site yet, so payment is not available online. Please call or
        WhatsApp us to complete your booking.
      </p>
    );
  }

  return (
    <div className="ui-google-signin" aria-busy={state === 'loading' || state === 'busy'}>
      <div ref={box} className="ui-google-signin__button" />
      {state === 'loading' && <p className="ui-note">Loading Google sign-in…</p>}
      {state === 'busy' && <p className="ui-note">Signing you in…</p>}
      {error && (
        <p className="ui-field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
