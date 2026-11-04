import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton.jsx';
import { restoreSession, signInLocally } from '@/features/auth/session.js';
import { showToast } from '@/features/ui/toast.js';
import { isApiEnabled } from '@/lib/api.js';

/**
 * /login and /register — the customer's way into the portal.
 *
 * Nobody needs an account to browse or hold a room; customers sign in with Google when they pay (ADR-012), and
 * come here to see their bookings and documents later. The first Google sign-in creates the account, so /login
 * and /register are the same button. `?next=` is where the visitor was heading before they were asked to sign in.
 */

const BENEFITS = [
  ['ph-files', 'Download agreements, NOC & utility bills'],
  ['ph-calendar-check', 'See your meeting-room bookings'],
  ['ph-receipt', 'GST invoices & renewal reminders'],
  ['ph-headset', 'Dedicated concierge on WhatsApp'],
];

export default function AuthPage({ mode }) {
  const isLogin = mode === 'login';
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = new URLSearchParams(location.search).get('next') || '/portal';

  // Someone who is already signed in has no business on this page.
  useEffect(() => {
    let cancelled = false;
    restoreSession().then((customer) => {
      if (customer && !cancelled) navigate(redirectTo, { replace: true });
    });
    return () => {
      cancelled = true;
    };
  }, [navigate, redirectTo]);

  function signedIn(customer) {
    showToast('Signed in ✓', `Welcome, ${customer?.name ?? 'back'}.`, 'success');
    navigate(redirectTo, { replace: true });
  }

  /** The static build has no API to check a Google sign-in, so its demo portal takes a name instead. */
  function demoSignIn(event) {
    event.preventDefault();
    const name = new FormData(event.currentTarget).get('name');
    signedIn(signInLocally({ name }));
  }

  return (
    <main id="main-content" className="ui-page">
      <section className="ui-compact-hero" style={{ padding: '60px 0 80px', minHeight: '70vh' }}>
        <div className="container">
          <div className="site-hero-grid" style={{ alignItems: 'center' }}>
            <div className="hero-content-col">
              <div className="hero-badge-pill">
                <i className="ph-bold ph-user-circle" />
                <span>Client Portal</span>
              </div>
              <h1 className="hero-luxury-title">
                {isLogin ? 'Sign in to your' : 'Create your'}
                <br />
                <span className="highlight-gold">V-DESK Business Account</span>
              </h1>
              <p className="hero-luxury-desc">
                Manage active services, documents, bookings and renewals from one secure dashboard.
              </p>
              <div className="hero-trust-grid">
                {BENEFITS.map(([icon, text]) => (
                  <div key={text} className="hero-trust-badge">
                    <i className={`ph-bold ${icon}`} />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="hero-form-col">
              <div className="hero-lead-card">
                <div className="hero-card-ribbon">
                  <i className="ph-bold ph-shield-check" /> SECURE SIGN-IN
                </div>
                <div className="hero-card-header">
                  <h3>
                    <i className={`ph-bold ${isLogin ? 'ph-sign-in' : 'ph-user-plus'}`} />
                    {isLogin ? 'Sign In' : 'Register'}
                  </h3>
                  <p>
                    {isLogin
                      ? 'Sign in with the Google account you used at checkout.'
                      : 'Your Google account is your V-DESK account — there is no password to remember.'}
                  </p>
                </div>

                {isApiEnabled() ? (
                  <GoogleSignInButton onSignedIn={signedIn} text={isLogin ? 'signin_with' : 'signup_with'} />
                ) : (
                  <form className="hero-lead-form" onSubmit={demoSignIn}>
                    <div className="form-group">
                      <label htmlFor="authName">Your name</label>
                      <input
                        id="authName"
                        name="name"
                        type="text"
                        className="form-control"
                        autoComplete="name"
                        placeholder="e.g. Arjun Mehta"
                        required
                      />
                    </div>
                    <button type="submit" className="btn btn--gold btn--full" style={{ padding: '13px', fontWeight: '700' }}>
                      Open the demo portal →
                    </button>
                    <p className="on-dark-note" style={{ textAlign: 'center', fontSize: '0.8rem', margin: '10px 0 0' }}>
                      This build has no API connected, so it opens a demo portal stored in this browser.
                    </p>
                  </form>
                )}

                <p className="on-dark-note" style={{ textAlign: 'center', fontSize: '0.85rem', margin: '16px 0 0' }}>
                  By continuing you agree to the <Link to="/legal/terms">Terms of Service</Link> and{' '}
                  <Link to="/legal/privacy">Privacy Policy</Link>. You don’t need an account to browse or to hold a
                  room — only to pay.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
