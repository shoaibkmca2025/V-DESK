import { useState } from 'react';
import { Button } from '@/components/ui/index.js';
import { enrolAuthenticator, signInWithPassword, verifyCode } from '@/features/auth/staffSession.js';
import { isApiEnabled } from '@/lib/api.js';

/**
 * Staff sign-in: password, then a code from an authenticator app (the API requires it, and a first
 * sign-in enrols the app before it can ask for a code).
 *
 * Each step's form carries its own `key` so React replaces it rather than reusing the same inputs —
 * without that, what was typed in the email box stays behind in the code box.
 */
export default function StaffSignIn({ onSignedIn }) {
  const [step, setStep] = useState('password');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [mfaToken, setMfaToken] = useState(null);
  const [secret, setSecret] = useState(null);

  async function submitPassword(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError(null);
    try {
      const { mfaToken: token, enrolmentRequired } = await signInWithPassword(form.get('email'), form.get('password'));
      setMfaToken(token);
      if (enrolmentRequired) {
        const { secret: newSecret } = await enrolAuthenticator(token);
        setSecret(newSecret);
      }
      setStep('code');
    } catch (err) {
      setError(err.code === 'INVALID_CREDENTIALS' ? 'That email and password do not match.' : err.message);
    } finally {
      setBusy(false);
    }
  }

  async function submitCode(event) {
    event.preventDefault();
    const code = new FormData(event.currentTarget).get('code');
    setBusy(true);
    setError(null);
    try {
      await verifyCode(mfaToken, code);
      onSignedIn?.();
    } catch (err) {
      setError(err.code === 'MFA_CODE_INVALID' ? 'That code is not right — try the current one.' : err.message);
    } finally {
      setBusy(false);
    }
  }

  if (!isApiEnabled()) {
    return (
      <div className="ui-card ui-signin">
        <h2>The console is not connected to an API</h2>
        <p>
          This build has no <code>VITE_API_URL</code>, so it is showing the data stored in this browser. Point the build
          at the API to sign in and work with live leads.
        </p>
      </div>
    );
  }

  return (
    <div className="ui-card ui-signin">
      <h2>Staff sign-in</h2>
      {step === 'password' ? (
        <form key="password" onSubmit={submitPassword} className="ui-signin__form">
          <p>Use your V-DESK staff account.</p>
          <div className="ui-field">
            <label htmlFor="staffEmail">Work email</label>
            <input id="staffEmail" name="email" type="email" autoComplete="username" required placeholder="you@vdesk.in" />
          </div>
          <div className="ui-field">
            <label htmlFor="staffPassword">Password</label>
            <input id="staffPassword" name="password" type="password" autoComplete="current-password" required />
          </div>
          {error && (
            <p className="ui-field__error" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" variant="primary" block disabled={busy}>
            {busy ? 'Checking…' : 'Continue'}
          </Button>
        </form>
      ) : (
        <form key="code" onSubmit={submitCode} className="ui-signin__form">
          {secret ? (
            <>
              <p>Add this account to your authenticator app, then enter the code it shows.</p>
              <code className="ui-signin__secret">{secret}</code>
            </>
          ) : (
            <p>Enter the six-digit code from your authenticator app.</p>
          )}
          <div className="ui-field">
            <label htmlFor="staffCode">Authentication code</label>
            <input
              id="staffCode"
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              placeholder="123456"
              autoFocus
            />
          </div>
          {error && (
            <p className="ui-field__error" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" variant="primary" block disabled={busy}>
            {busy ? 'Verifying…' : 'Sign in'}
          </Button>
          <button type="button" className="ui-btn ui-btn--ghost ui-btn--sm" onClick={() => setStep('password')}>
            Use a different account
          </button>
        </form>
      )}
    </div>
  );
}
