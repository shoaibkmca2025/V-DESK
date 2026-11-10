import { useState } from 'react';
import { Button } from '@/components/ui/index.js';
import { signInWithPassword } from '@/features/auth/staffSession.js';
import { isApiEnabled } from '@/lib/api.js';

/**
 * Staff sign-in: email and password, and that is the whole of it.
 *
 * The password is turned into a key in this browser before anything is sent (ADR-013), which takes about a
 * second — hence the wait on the button. The API never receives the password itself.
 *
 * A new staff member's password is set by the admin who creates their account and handed over out of band;
 * there is no code to redeem and nothing to enrol.
 */

function explain(err) {
  switch (err.code) {
    case 'INVALID_CREDENTIALS':
      return 'That email and password do not match.';
    case 'PASSWORD_RESET_REQUIRED':
      return 'Your password has to be set again after a security upgrade. Ask an admin to set you a new one.';
    case 'ACCOUNT_LOCKED':
      return 'Too many wrong attempts. Try again in 15 minutes, or ask an admin to unlock your account.';
    case 'AUTH_NOT_CONFIGURED':
      return 'Staff sign-in is not switched on for this server.';
    default:
      return err.message;
  }
}

export default function StaffSignIn({ onSignedIn }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') ?? '').trim();
    const password = String(form.get('password') ?? '');
    setBusy(true);
    setError(null);
    try {
      const session = await signInWithPassword(email, password);
      onSignedIn?.(session);
    } catch (err) {
      setError(explain(err));
    } finally {
      setBusy(false);
    }
  }

  if (!isApiEnabled()) {
    return (
      <div className="ui-card ui-signin">
        <h2>Staff sign-in</h2>
        <p>This build has no API connected, so there is nothing to sign in to.</p>
      </div>
    );
  }

  return (
    <div className="ui-card ui-signin">
      <h2>Staff sign-in</h2>
      <form onSubmit={submit} className="ui-signin__form">
        <p>Use your V-DESK staff account.</p>
        <div className="ui-field">
          <label htmlFor="staffEmail">Work email</label>
          <input
            id="staffEmail"
            name="email"
            type="email"
            autoComplete="username"
            required
            placeholder="you@vdesk.in"
          />
        </div>
        <div className="ui-field">
          <label htmlFor="staffPassword">Password</label>
          <input id="staffPassword" name="password" type="password" autoComplete="current-password" required />
        </div>
        {error && (
          <p className="ui-note ui-note--error" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" variant="primary" block disabled={busy}>
          {busy ? 'Checking… this takes a second' : 'Sign in'}
        </Button>
      </form>
    </div>
  );
}
