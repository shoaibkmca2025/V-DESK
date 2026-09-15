import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import Breadcrumbs from '@/components/page/Breadcrumbs.jsx';
import { GST_RATE } from '@/data/constants.js';
import { trackSearchEvent } from '@/features/analytics/telemetry.js';
import { openTaxInvoiceModal } from '@/features/checkout/taxInvoice.js';
import { showToast } from '@/features/ui/toast.js';
import { rawStyle } from '@/lib/domRefs.js';
import { readJson, writeJson } from '@/lib/storage.js';

const METHODS = [
  ['upi', 'ph-qr-code', 'UPI / QR'],
  ['card', 'ph-credit-card', 'Card'],
  ['netbanking', 'ph-bank', 'Net Banking'],
];

const rupees = (n) => '₹' + Math.round(n).toLocaleString('en-IN');

/** /checkout?item=&amount=&city=&hub= — standalone checkout (PRD §48). Amount is GST-inclusive. */
export default function CheckoutPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const item = params.get('item') || 'Virtual Office for GST Registration (12-Mo Plan)';
  const amount = Number(params.get('amount')) || 21499;
  const city = params.get('city') || 'Mumbai (BKC)';
  const hub = params.get('hub') || '';
  const base = Math.round(amount / (1 + GST_RATE));
  const gst = amount - base;

  const [method, setMethod] = useState('upi');
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(null);

  function pay(label) {
    if (processing) return;
    setProcessing(true);
    showToast('Processing Payment...', `Verifying transaction via ${label}`, 'info');
    trackSearchEvent('checkout_started', { amount, item });
    setTimeout(() => {
      const invoiceNo = 'INV-2026-' + Math.floor(1000 + Math.random() * 9000);
      const orders = readJson('VDESK_ORDERS', []);
      orders.unshift({ ref: 'ORD-' + Date.now().toString(36).toUpperCase(), invoiceNo, item, city, hub, amount, method: label, status: 'SUCCESS', createdAt: new Date().toISOString() });
      writeJson('VDESK_ORDERS', orders);
      trackSearchEvent('payment_success', { method: label, amount });
      setProcessing(false);
      setDone({ invoiceNo });
      showToast('Payment Successful! ✓', 'Your GST tax invoice is ready.', 'success');
    }, 1200);
  }

  return (
    <main id="main-content" className="ui-page">
      <Breadcrumbs trail={[{ label: 'Checkout' }]} />
      <section className="ui-compact-hero" style={{ padding: '44px 0' }}>
        <div className="container">
          <div className="hero-badge-pill">
            <i className="ph-bold ph-lock-key" />
            <span>256-Bit Encrypted Gateway • PCI-DSS</span>
          </div>
          <h1 className="hero-luxury-title" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)' }}>
            Secure Checkout <span className="highlight-gold">& Instant Activation</span>
          </h1>
        </div>
      </section>

      <section className="section" style={{ padding: '56px 0', background: '#F8FAFC' }}>
        <div className="container" style={{ maxWidth: '1040px' }}>
          {done ? (
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '40px', textAlign: 'center' }}>
              <i className="ph-bold ph-check-circle" style={{ fontSize: '3rem', color: '#10B981' }} />
              <h2 style={{ color: '#081D40', margin: '12px 0 6px' }}>Payment Successful</h2>
              <p style={{ color: '#64748B', margin: '0 0 6px' }}>
                Invoice <strong>{done.invoiceNo}</strong> • {rupees(amount)} paid for {item}
              </p>
              <p style={{ color: '#64748B', maxWidth: '520px', margin: '0 auto 22px' }}>Next step: complete Digital KYC so we can issue your documents. Activation is confirmed once payment and KYC are both complete.</p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn btn--gold" onClick={() => navigate('/kyc')}>
                  Complete KYC <i className="ph-bold ph-arrow-right" />
                </button>
                <button className="btn btn--outline" onClick={() => openTaxInvoiceModal({ invoiceNo: done.invoiceNo, item, amount, city })}>
                  <i className="ph-bold ph-receipt" /> View Tax Invoice
                </button>
                <Link to="/portal" className="btn btn--ghost">
                  Go to Portal
                </Link>
              </div>
            </div>
          ) : (
            <div className="checkout-layout" style={{ display: 'grid', gridTemplateColumns: '1fr minmax(280px, 360px)', gap: '24px', alignItems: 'start' }}>
              <div className="checkout-methods" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '24px' }}>
                <div className="checkout-tabs">
                  {METHODS.map(([key, icon, label]) => (
                    <button key={key} type="button" className={method === key ? 'pay-tab active' : 'pay-tab'} onClick={() => setMethod(key)}>
                      <i className={`ph-bold ${icon}`} /> {label}
                    </button>
                  ))}
                </div>
                {method === 'upi' && (
                  <div className="pay-body">
                    <div className="upi-qr-box">
                      <div className="qr-placeholder">
                        <i className="ph-bold ph-qr-code qr-big-icon" /> <span>Scan with Google Pay, PhonePe, Paytm or BHIM</span>
                      </div>
                      <div className="upi-id-row">
                        <span>Or enter UPI VPA ID:</span>
                        <div className="upi-input-flex">
                          <input type="text" className="form-input" placeholder="username@okhdfcbank" />{' '}
                          <button type="button" className="btn btn--primary btn--sm" disabled={processing} onClick={() => pay('UPI ID')}>
                            Pay Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {method === 'card' && (
                  <div className="pay-body">
                    <div className="form-field">
                      <label className="form-label">Card Number</label>
                      <input type="text" className="form-input" placeholder="4532 •••• •••• 8921" maxLength="19" />
                    </div>
                    <div className="form-row-2">
                      <div className="form-field">
                        <label className="form-label">Expiry MM/YY</label>
                        <input type="text" className="form-input" placeholder="12/28" maxLength="5" />
                      </div>
                      <div className="form-field">
                        <label className="form-label">CVV</label>
                        <input type="password" className="form-input" placeholder="•••" maxLength="4" />
                      </div>
                    </div>
                    <div className="form-field">
                      <label className="form-label">Name on Card</label>
                      <input type="text" className="form-input" placeholder="As printed on card" />
                    </div>
                    <button type="button" className="btn btn--primary btn--full" disabled={processing} onClick={() => pay('Credit / Debit Card')}>
                      <i className="ph-bold ph-lock-key" /> Pay {rupees(amount)} Securely
                    </button>
                  </div>
                )}
                {method === 'netbanking' && (
                  <div className="pay-body">
                    <div className="form-field">
                      <label className="form-label">Select Bank</label>
                      <select className="form-select" defaultValue="HDFC Bank">
                        {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Mahindra Bank', 'Yes Bank'].map((b) => (
                          <option key={b}>{b}</option>
                        ))}
                      </select>
                    </div>
                    <button type="button" className="btn btn--primary btn--full" disabled={processing} onClick={() => pay('Net Banking')}>
                      <i className="ph-bold ph-bank" /> Proceed to Bank Login
                    </button>
                  </div>
                )}
                <p style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '16px' }}>
                  <i className="ph-bold ph-shield-check" style={{ color: '#10B981' }} /> Payments are processed by a PCI-DSS compliant gateway. V-DESK never stores card details. By paying you accept the <Link to="/legal/terms">Terms</Link> and <Link to="/legal/refund-policy">Refund Policy</Link>.
                </p>
              </div>

              <aside ref={rawStyle('background: #081D40; border-radius: 16px; padding: 24px; color: #FFF; position: sticky; top: 100px;')}>
                <strong style={{ color: '#DFB15B', fontSize: '0.78rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Order Summary</strong>
                <h3 style={{ color: '#FFF', fontSize: '1.05rem', margin: '10px 0 4px', lineHeight: '1.4' }}>{item}</h3>
                <span style={{ display: 'block', color: '#CBD5E1', fontSize: '0.84rem', margin: '0 0 18px' }}>
                  {city}
                  {hub ? ` • ${hub}` : ''}
                </span>
                <div style={{ display: 'grid', gap: '8px', fontSize: '0.9rem', borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#CBD5E1' }}>Subtotal</span>
                    <span>{rupees(base)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#CBD5E1' }}>GST (18%)</span>
                    <span>{rupees(gst)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: '800', borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: '10px', marginTop: '4px' }}>
                    <span>Total</span>
                    <span style={{ color: '#DFB15B' }}>{rupees(amount)}</span>
                  </div>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '18px 0 0', fontSize: '0.8rem', color: '#CBD5E1', lineHeight: '1.9' }}>
                  <li>✓ GST tax invoice with input credit</li>
                  <li>✓ 100% refund if application rejected due to our documents</li>
                  <li>✓ Activation after payment + KYC</li>
                </ul>
              </aside>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
