import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { requestSignInCode, restoreSession, verifySignInCode } from '@/features/auth/session.js';
import { showToast } from '@/features/ui/toast.js';
import { isApiEnabled } from '@/lib/api.js';

/**
 * /login and /register — the customer's way in.
 *
 * There is one flow behind both: a code to the mobile number. A number with no account yet gets one when the
 * code checks out, which is why registering and signing in are the same two steps; /register only asks for the
 * name and company up front. `?next=` is where the visitor was heading before they were asked to sign in.
 */

const BENEFITS = [
  ['ph-files', 'Download agreements, NOC & utility bills'],
  ['ph-calendar-check', 'Book meeting rooms with saved details'],
  ['ph-receipt', 'GST invoices & renewal reminders'],
  ['ph-headset', 'Dedicated concierge on WhatsApp'],
];

/** '9876543210' → '98******10', so the code step can confirm the number without printing it in full. */
const maskMobile = (mobile) => (mobile.length === 10 ? `${mobile.slice(0, 2)}******${mobile.slice(-2)}` : mobile);

/** What to say about an API error, in the visitor's terms. */
function explain(error) {
  switch (error.code) {
    case 'OTP_INVALID': {
      const left = error.details?.attemptsLeft;
      return left ? `That code is not right — ${left} ${left === 1 ? 'try' : 'tries'} left.` : 'That code is not right.';
    }
    case 'OTP_EXPIRED':
    case 'OTP_NOT_REQUESTED':
      return 'That code has expired. Ask for a new one.';
    case 'OTP_ATTEMPTS_EXCEEDED':
      return 'Too many wrong codes. Ask for a new one.';
    case 'OTP_RESEND_TOO_SOON':
    case 'OTP_SEND_LIMIT':
    case 'RATE_LIMITED':
      return error.message;
    case 'NAME_REQUIRED':
      return 'Tell us your name to finish setting up your account.';
    case 'ACCOUNT_DISABLED':
      return 'This account is closed. Call us on +91 98765 43210 and we will reopen it.';
    case 'VALIDATION_FAILED':
      return 'Please check the details and try again.';
    case 'API_DISABLED':
    case 'NETWORK_ERROR':
    case 'TIMEOUT':
      return 'We could not reach the server. Please try again in a moment.';
    default:
      return error.message;
  }
}

export default function AuthPage({ mode }) {
  const isLogin = mode === 'login';
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = new URLSearchParams(location.search).get('next') || '/portal';

  const [step, setStep] = useState('form'); // form → code
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [account, setAccount] = useState({ mobile: '', name: '', company: '', email: '' });
  const [challenge, setChallenge] = useState(null);
  const [wait, setWait] = useState(0);

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

  // Counts down to when another code may be asked for.
  useEffect(() => {
    if (wait <= 0) return undefined;
    const timer = setInterval(() => setWait((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => clearInterval(timer);
  }, [wait]);

  async function sendCode(mobile, fields = account) {
    setBusy(true);
    setError(null);
    try {
      const sent = await requestSignInCode(mobile);
      setAccount({ ...fields, mobile });
      setChallenge(sent ?? {});
      setWait(sent?.resendAfter ?? 30);
      setStep('code');
      showToast(
        'Code sent',
        sent?.devCode
          ? `No SMS provider is connected yet, so your code is ${sent.devCode}.`
          : `A 6-digit code is on its way to +91 ${maskMobile(mobile)}.`,
        'info',
      );
      return true;
    } catch (err) {
      setError(explain(err));
      if (err.details?.retryAfterSeconds) setWait(err.details.retryAfterSeconds);
      return false;
    } finally {
      setBusy(false);
    }
  }

  function submitForm(event) {
    event.preventDefault();
    const form = Object.fromEntries(new FormData(event.currentTarget).entries());
    const mobile = (form.mobile ?? '').replace(/\D/g, '');
    if (mobile.length !== 10) {
      setError('Enter your 10-digit mobile number.');
      return;
    }
    sendCode(mobile, { mobile, name: form.name ?? '', company: form.company ?? '', email: form.email ?? '' });
  }

  async function submitCode(event) {
    event.preventDefault();
    const form = Object.fromEntries(new FormData(event.currentTarget).entries());
    setBusy(true);
    setError(null);
    try {
      const customer = await verifySignInCode({
        mobile: account.mobile,
        code: form.code,
        name: form.name || account.name,
        email: account.email,
        company: account.company,
      });
      showToast(
        challenge?.isNewAccount ? 'Account created ✓' : 'Welcome back ✓',
        `Signed in as ${customer?.name ?? 'your account'}.`,
        'success',
      );
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(explain(err));
      if (err.code === 'OTP_EXPIRED' || err.code === 'OTP_NOT_REQUESTED' || err.code === 'OTP_ATTEMPTS_EXCEEDED') {
        setStep('form');
      }
    } finally {
      setBusy(false);
    }
  }

  /** A number the API has never seen needs a name before the account can be created. */
  const needsName = Boolean(challenge?.isNewAccount) && !account.name;

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
                  <i className="ph-bold ph-shield-check" /> OTP VERIFIED
                </div>
                <div className="hero-card-header">
                  <h3>
                    <i className={`ph-bold ${isLogin ? 'ph-sign-in' : 'ph-user-plus'}`} />
                    {isLogin ? 'Sign In' : 'Register'}
                  </h3>
                  <p>
                    {step === 'form'
                      ? 'We verify your mobile number with a one-time password.'
                      : `Enter the 6-digit code sent to +91 ${maskMobile(account.mobile)}.`}
                  </p>
                </div>

                {step === 'form' ? (
                  <form key="form" className="hero-lead-form" onSubmit={submitForm}>
                    {!isLogin && (
                      <>
                        <div className="form-group">
                          <label htmlFor="authName">Full Name *</label>
                          <input
                            id="authName"
                            name="name"
                            type="text"
                            className="form-control"
                            autoComplete="name"
                            placeholder="e.g. Arjun Mehta"
                            defaultValue={account.name}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="authCompany">Company / Brand</label>
                          <input
                            id="authCompany"
                            name="company"
                            type="text"
                            className="form-control"
                            autoComplete="organization"
                            placeholder="e.g. Acme Tech Solutions"
                            defaultValue={account.company}
                          />
                        </div>
                      </>
                    )}
                    <div className="form-group">
                      <label htmlFor="authMobile">Mobile Number *</label>
                      <input
                        id="authMobile"
                        name="mobile"
                        type="tel"
                        className="form-control"
                        autoComplete="tel"
                        inputMode="numeric"
                        placeholder="10-digit mobile"
                        pattern="[0-9]{10}"
                        defaultValue={account.mobile}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="authEmail">Work Email {isLogin ? '(optional)' : '*'}</label>
                      <input
                        id="authEmail"
                        name="email"
                        type="email"
                        className="form-control"
                        autoComplete="email"
                        placeholder="name@company.in"
                        defaultValue={account.email}
                        required={!isLogin}
                      />
                    </div>
                    {!isLogin && (
                      <label
                        className="on-dark-note"
                        style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '0.85rem', margin: '4px 0 10px' }}
                      >
                        <input type="checkbox" required style={{ marginTop: '3px' }} />
                        <span>
                          I agree to the <Link to="/legal/terms">Terms of Service</Link> and{' '}
                          <Link to="/legal/privacy">Privacy Policy</Link>.
                        </span>
                      </label>
                    )}
                    {error && (
                      <p className="ui-field__error" role="alert">
                        {error}
                      </p>
                    )}
                    <button
                      type="submit"
                      className="btn btn--gold btn--full"
                      style={{ padding: '13px', fontWeight: '700', marginTop: '6px' }}
                      disabled={busy}
                    >
                      <i className="ph-bold ph-device-mobile" />
                      {busy ? 'Sending…' : 'Send OTP →'}
                    </button>
                  </form>
                ) : (
                  <form key="code" className="hero-lead-form" onSubmit={submitCode}>
                    {challenge?.devCode && (
                      <p className="on-dark-note" style={{ margin: '0 0 12px' }}>
                        No SMS provider is connected to this environment yet, so here is your code:{' '}
                        <strong>{challenge.devCode}</strong>
                      </p>
                    )}
                    {needsName && (
                      <div className="form-group">
                        <label htmlFor="authNewName">Full Name *</label>
                        <input
                          id="authNewName"
                          name="name"
                          type="text"
                          className="form-control"
                          autoComplete="name"
                          placeholder="e.g. Arjun Mehta"
                          required
                        />
                        <small className="on-dark-note">This number is new here — we will set up your account.</small>
                      </div>
                    )}
                    <div className="form-group">
                      <label htmlFor="authOtp">One-Time Password *</label>
                      <input
                        id="authOtp"
                        name="code"
                        type="text"
                        inputMode="numeric"
                        className="form-control"
                        autoComplete="one-time-code"
                        placeholder="6-digit code"
                        pattern="[0-9]{6}"
                        maxLength="6"
                        autoFocus
                        required
                      />
                    </div>
                    {error && (
                      <p className="ui-field__error" role="alert">
                        {error}
                      </p>
                    )}
                    <button
                      type="submit"
                      className="btn btn--gold btn--full"
                      style={{ padding: '13px', fontWeight: '700' }}
                      disabled={busy}
                    >
                      <i className="ph-bold ph-check-circle" />
                      {busy ? 'Verifying…' : 'Verify & Continue →'}
                    </button>
                    <button
                      type="button"
                      className="btn btn--ghost btn--full btn--sm"
                      style={{ marginTop: '8px' }}
                      onClick={() => sendCode(account.mobile)}
                      disabled={busy || wait > 0}
                    >
                      {wait > 0 ? `Resend code in ${wait}s` : 'Resend code'}
                    </button>
                    <button
                      type="button"
                      className="btn btn--ghost btn--full btn--sm"
                      style={{ marginTop: '4px' }}
                      onClick={() => {
                        setStep('form');
                        setError(null);
                      }}
                    >
                      Change number
                    </button>
                  </form>
                )}

                <p className="on-dark-note" style={{ textAlign: 'center', fontSize: '0.88rem', margin: '16px 0 0' }}>
                  {isLogin ? (
                    <>
                      New to V-DESK?{' '}
                      <Link to="/register" style={{ color: '#DFB15B', fontWeight: '700' }}>
                        Create an account
                      </Link>
                    </>
                  ) : (
                    <>
                      Already registered?{' '}
                      <Link to="/login" style={{ color: '#DFB15B', fontWeight: '700' }}>
                        Sign in
                      </Link>
                    </>
                  )}
                </p>
                {!isApiEnabled() && (
                  <p className="on-dark-note" style={{ textAlign: 'center', fontSize: '0.8rem', margin: '10px 0 0' }}>
                    This build has no API connected, so any 6-digit code will sign you in to the demo portal.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
