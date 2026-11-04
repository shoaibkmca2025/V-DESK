import { useState } from 'react';
import { Button } from '@/components/ui/index.js';
import {
  choosePassword,
  enrolAuthenticator,
  passwordProblem,
  signInWithPassword,
  verifyCode,
} from '@/features/auth/staffSession.js';
import { isApiEnabled } from '@/lib/api.js';

/**
 * Staff sign-in: password, then a code from an authenticator app (the API requires it, and a first
 * sign-in enrols the app before it can ask for a code).
 *
 * A new staff member signs in with the one-time setup code a super admin gave them (ADR-012). The API then
 * asks them to choose their own password — the `setup` step — and carries on to the authenticator as usual.
 *
 * Each step's form carries its own `key` so React replaces it rather than reusing the same inputs —
 * without that, what was typed in the email box stays behind in the code box.
 */

function explain(err) {
  switch (err.code) {
    case 'INVALID_CREDENTIALS':
      return 'That email and password (or setup code) do not match.';
    case 'SETUP_CODE_EXPIRED':
      return 'This setup code has expired. Ask your admin for a new one.';
    case 'SETUP_TOKEN_INVALID':
      return 'That setup code was already used or replaced. Sign in again.';
    case 'ACCOUNT_LOCKED':
      return 'Too many wrong attempts. Try again in 15 minutes, or ask an admin to unlock your account.';
    case 'MFA_CODE_INVALID':
      return 'That code is not right — try the current one.';
    default:
      return err.message;
  }
}

export default function StaffSignIn({ onSignedIn }) {
  const [step, setStep] = useState('password');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [setupToken, setSetupToken] = useState(null);
  const [mfaToken, setMfaToken] = useState(null);
  const [secret, setSecret] = useState(null);

  /** Both the password step and the setup step end in an MFA token. */
  async function toMfa({ mfaToken: token, enrolmentRequired }) {
    setMfaToken(token);
    setSecret(null);
    if (enrolmentRequired) {
      const { secret: newSecret } = await enrolAuthenticator(token);
      setSecret(newSecret);
    }
    setStep('code');
  }

  async function run(action) {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(explain(err));
      if (err.code === 'SETUP_TOKEN_INVALID') setStep('password');
    } finally {
      setBusy(false);
    }
  }

  function submitPassword(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    run(async () => {
      const result = await signInWithPassword(form.get('email'), form.get('password'));
      if (result.passwordSetupRequired) {
        setSetupToken(result.setupToken);
        setStep('setup');
        return;
      }
      await toMfa(result);
    });
  }

  function submitNewPassword(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = form.get('newPassword');
    const problem = passwordProblem(password);
    if (problem) return setError(problem);
    if (password !== form.get('confirmPassword')) return setError('The two passwords do not match.');
    run(async () => toMfa(await choosePassword(setupToken, password)));
  }

  function submitCode(event) {
    event.preventDefault();
    const code = new FormData(event.currentTarget).get('code');
    run(async () => {
      await verifyCode(mfaToken, code);
      onSignedIn?.();
    });
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

  const errorLine = error && (
    <p className="ui-field__error" role="alert">
      {error}
    </p>
  );

  return (
    <div className="ui-card ui-signin">
      <h2>{step === 'setup' ? 'Choose your password' : 'Staff sign-in'}</h2>
      {step === 'password' && (
        <form key="password" onSubmit={submitPassword} className="ui-signin__form">
          <p>Use your V-DESK staff account. First time here? Use the setup code your admin gave you as the password.</p>
          <div className="ui-field">
            <label htmlFor="staffEmail">Work email</label>
            <input id="staffEmail" name="email" type="email" autoComplete="username" required placeholder="you@vdesk.in" />
          </div>
          <div className="ui-field">
            <label htmlFor="staffPassword">Password or setup code</label>
            <input id="staffPassword" name="password" type="password" autoComplete="current-password" required />
          </div>
          {errorLine}
          <Button type="submit" variant="primary" block disabled={busy}>
            {busy ? 'Checking…' : 'Continue'}
          </Button>
        </form>
      )}

      {step === 'setup' && (
        <form key="setup" onSubmit={submitNewPassword} className="ui-signin__form">
          <p>
            Your setup code worked and is now used up. Choose the password you will sign in with from now on: at least 12
            characters, with letters and numbers.
          </p>
          <div className="ui-field">
            <label htmlFor="staffNewPassword">New password</label>
            <input
              id="staffNewPassword"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              minLength={12}
              maxLength={128}
              required
              autoFocus
            />
          </div>
          <div className="ui-field">
            <label htmlFor="staffConfirmPassword">Type it again</label>
            <input
              id="staffConfirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              minLength={12}
              maxLength={128}
              required
            />
          </div>
          {errorLine}
          <Button type="submit" variant="primary" block disabled={busy}>
            {busy ? 'Saving…' : 'Save password & continue'}
          </Button>
        </form>
      )}

      {step === 'code' && (
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
          {errorLine}
          <Button type="submit" variant="primary" block disabled={busy}>
            {busy ? 'Verifying…' : 'Sign in'}
          </Button>
          <button
            type="button"
            className="ui-btn ui-btn--ghost ui-btn--sm"
            onClick={() => {
              setError(null);
              setStep('password');
            }}
          >
            Use a different account
          </button>
        </form>
      )}
    </div>
  );
}
