import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { signIn } from '@/features/auth/session.js';
import { showToast } from '@/features/ui/toast.js';

const BENEFITS = [
  ['ph-files', 'Download agreements, NOC & utility bills'],
  ['ph-calendar-check', 'Book meeting rooms with saved details'],
  ['ph-receipt', 'GST invoices & renewal reminders'],
  ['ph-headset', 'Dedicated concierge on WhatsApp'],
];

/** /login and /register — client portal access (demo session until the auth API exists). */
export default function AuthPage({ mode }) {
  const isLogin = mode === 'login';
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState('form'); // form → otp
  const [pending, setPending] = useState(null);
  const redirectTo = new URLSearchParams(location.search).get('next') || '/portal';

  function submitForm(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    if (!/^\d{10}$/.test(data.mobile || '')) {
      showToast('Invalid Phone Number', 'Enter a valid 10-digit mobile number to receive the OTP.', 'warning');
      return;
    }
    setPending(data);
    setStep('otp');
    showToast('OTP Sent', `A 6-digit code was sent to +91 ${data.mobile.replace(/(\d{2})\d{6}(\d{2})/, '$1******$2')}.`, 'info');
  }

  function submitOtp(event) {
    event.preventDefault();
    const otp = new FormData(event.currentTarget).get('otp');
    if (!/^\d{6}$/.test(otp || '')) {
      showToast('Invalid OTP', 'Enter the 6-digit code.', 'warning');
      return;
    }
    const session = signIn(pending);
    showToast(isLogin ? 'Welcome back ✓' : 'Account Created ✓', `Signed in as ${session.name}.`, 'success');
    navigate(redirectTo, { replace: true });
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
              <p className="hero-luxury-desc">Manage active services, documents, bookings and renewals from one secure dashboard.</p>
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
                  <p>{step === 'form' ? 'We verify your mobile number with a one-time password.' : `Enter the 6-digit code sent to +91 ${pending?.mobile}.`}</p>
                </div>
                {step === 'form' ? (
                  <form className="hero-lead-form" onSubmit={submitForm}>
                    {!isLogin && (
                      <>
                        <div className="form-group">
                          <label htmlFor="authName">Full Name *</label>
                          <input id="authName" name="name" type="text" className="form-control" placeholder="e.g. Arjun Mehta" required />
                        </div>
                        <div className="form-group">
                          <label htmlFor="authCompany">Company / Brand</label>
                          <input id="authCompany" name="company" type="text" className="form-control" placeholder="e.g. Acme Tech Solutions" />
                        </div>
                      </>
                    )}
                    <div className="form-group">
                      <label htmlFor="authMobile">Mobile Number *</label>
                      <input id="authMobile" name="mobile" type="tel" className="form-control" placeholder="10-digit mobile" pattern="[0-9]{10}" required />
                    </div>
                    <div className="form-group">
                      <label htmlFor="authEmail">Work Email {isLogin ? '' : '*'}</label>
                      <input id="authEmail" name="email" type="email" className="form-control" placeholder="name@company.in" required={!isLogin} />
                    </div>
                    {!isLogin && (
                      <label style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '0.8rem', color: '#64748B', margin: '4px 0 10px' }}>
                        <input type="checkbox" required style={{ marginTop: '3px' }} />
                        <span>
                          I agree to the <Link to="/legal/terms">Terms of Service</Link> and <Link to="/legal/privacy">Privacy Policy</Link>.
                        </span>
                      </label>
                    )}
                    <button type="submit" className="btn btn--gold btn--full" style={{ padding: '13px', fontWeight: '700', marginTop: '6px' }}>
                      <i className="ph-bold ph-device-mobile" />
                      Send OTP →
                    </button>
                  </form>
                ) : (
                  <form className="hero-lead-form" onSubmit={submitOtp}>
                    <div className="form-group">
                      <label htmlFor="authOtp">One-Time Password *</label>
                      <input id="authOtp" name="otp" type="text" inputMode="numeric" className="form-control" placeholder="6-digit code" pattern="[0-9]{6}" maxLength="6" autoFocus required />
                    </div>
                    <button type="submit" className="btn btn--gold btn--full" style={{ padding: '13px', fontWeight: '700' }}>
                      <i className="ph-bold ph-check-circle" />
                      Verify & Continue →
                    </button>
                    <button type="button" className="btn btn--ghost btn--full btn--sm" style={{ marginTop: '8px' }} onClick={() => setStep('form')}>
                      Change number
                    </button>
                  </form>
                )}
                <p style={{ textAlign: 'center', fontSize: '0.84rem', color: '#64748B', margin: '16px 0 0' }}>
                  {isLogin ? (
                    <>
                      New to V-DESK? <Link to="/register" style={{ color: '#C59239', fontWeight: '700' }}>Create an account</Link>
                    </>
                  ) : (
                    <>
                      Already registered? <Link to="/login" style={{ color: '#C59239', fontWeight: '700' }}>Sign in</Link>
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
