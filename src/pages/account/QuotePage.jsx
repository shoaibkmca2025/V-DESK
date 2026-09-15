import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import Breadcrumbs from '@/components/page/Breadcrumbs.jsx';
import { GST_RATE } from '@/data/constants.js';
import { getQuote, setQuoteStatus } from '@/features/quote/quoteStore.js';
import { copyToClipboard } from '@/features/ui/clipboard.js';
import { showToast } from '@/features/ui/toast.js';
import SiteLayout from '@/layouts/SiteLayout.jsx';

const rupees = (n) => '₹' + Math.round(n).toLocaleString('en-IN');

/** Quotes can be shared as links; unknown refs fall back to a representative proposal. */
function fallbackQuote(ref) {
  return { ref, status: 'SENT', product: 'Mumbai Virtual Office Platform', purpose: 'GST Registration', tenure: '12 Months', rateMonth: 2499, name: 'Valued Client', company: '', createdAt: new Date().toISOString(), fallback: true };
}

/** /quote/:ref — digital proposal page (PRD §41): line items, validity, accept → checkout. */
export default function QuotePage() {
  const { ref } = useParams();
  const navigate = useNavigate();
  const [quote, setQuote] = useState(() => getQuote(ref) || fallbackQuote(ref));
  const months = parseInt(quote.tenure, 10) || 1;
  const isAnnual = months >= 12;
  const subtotal = quote.rateMonth * months;
  const discount = isAnnual ? Math.round(subtotal * 0.2) : 0;
  const taxable = subtotal - discount;
  const gst = Math.round(taxable * GST_RATE);
  const total = taxable + gst;
  const created = new Date(quote.createdAt);
  const validUntil = new Date(created.getTime() + 14 * 24 * 3600 * 1000);

  function accept() {
    const updated = setQuoteStatus(quote.ref, 'ACCEPTED') || { ...quote, status: 'ACCEPTED' };
    setQuote(updated);
    showToast('Quote Accepted ✓', 'Proceeding to secure checkout.', 'success');
    navigate(`/checkout?item=${encodeURIComponent(quote.product)}&amount=${total}&city=${encodeURIComponent(quote.product.split(' ')[0])}`);
  }

  const meta = { title: `Quote ${quote.ref} — ${quote.product} | V-DESK`, description: `Digital proposal for ${quote.product}, valid until ${validUntil.toLocaleDateString('en-IN')}.` };

  return (
    <SiteLayout page="quote" meta={meta}>
      <main id="main-content" className="ui-page">
        <Breadcrumbs trail={[{ label: 'Quotes' }, { label: quote.ref }]} />
        <section className="ui-compact-hero" style={{ padding: '44px 0' }}>
          <div className="container">
            <div className="hero-badge-pill">
              <i className="ph-bold ph-file-text" />
              <span>Digital Proposal • {quote.status}</span>
            </div>
            <h1 className="hero-luxury-title" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)' }}>
              Quote <span className="highlight-gold">{quote.ref}</span>
            </h1>
            <p className="hero-luxury-desc" style={{ marginBottom: 0 }}>
              Prepared for {quote.name}
              {quote.company ? `, ${quote.company}` : ''} on {created.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} • Valid until {validUntil.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </section>

        <section className="section" style={{ padding: '56px 0', background: '#F8FAFC' }}>
          <div className="container" style={{ maxWidth: '960px' }}>
            {quote.fallback && (
              <div style={{ background: '#FFF7E6', border: '1px solid #F5D9A6', borderRadius: '10px', padding: '12px 16px', marginBottom: '18px', fontSize: '0.86rem', color: '#7C5A12' }}>
                <i className="ph-bold ph-info" /> This quote reference was not generated in this browser; a representative proposal is shown. Ask your advisor to resend the link if figures differ.
              </div>
            )}
            <div className="proposal-document" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '32px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '16px', borderBottom: '1px solid #E2E8F0', paddingBottom: '18px', marginBottom: '22px' }}>
                <div>
                  <strong style={{ color: '#081D40', fontSize: '1.2rem' }}>V-DESK Workspace & Consulting LLP</strong>
                  <div style={{ color: '#64748B', fontSize: '0.84rem' }}>LLPIN AAY-9842 • College Road, Nashik 422005 • GSTIN 27AAYCZ8921P1Z8</div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.86rem', color: '#64748B' }}>
                  <div>
                    Quote No. <strong style={{ color: '#081D40' }}>{quote.ref}</strong>
                  </div>
                  <div>Sales Rep: Adv. Rahul Deshmukh</div>
                </div>
              </div>
              <table className="proposal-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Tenure</th>
                    <th>Rate</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong>{quote.product}</strong>
                      <br />
                      <span style={{ color: '#64748B', fontSize: '0.82rem' }}>Purpose: {quote.purpose} • Includes rent agreement, landlord NOC & utility bill</span>
                    </td>
                    <td>{quote.tenure}</td>
                    <td>{rupees(quote.rateMonth)}/mo</td>
                    <td style={{ textAlign: 'right' }}>{rupees(subtotal)}</td>
                  </tr>
                  {discount > 0 && (
                    <tr>
                      <td colSpan="3">Annual commitment discount (20%)</td>
                      <td style={{ textAlign: 'right', color: '#10B981' }}>−{rupees(discount)}</td>
                    </tr>
                  )}
                  <tr>
                    <td colSpan="3">GST @ 18%</td>
                    <td style={{ textAlign: 'right' }}>{rupees(gst)}</td>
                  </tr>
                  <tr>
                    <td colSpan="3">
                      <strong>Total Payable</strong>
                    </td>
                    <td style={{ textAlign: 'right', fontSize: '1.2rem', fontWeight: '800', color: '#081D40' }}>{rupees(total)}</td>
                  </tr>
                </tbody>
              </table>
              <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '18px', lineHeight: '1.7' }}>
                <strong style={{ color: '#081D40' }}>Terms:</strong> Documents issued within 24 working hours of KYC approval. 100% refund if a GST/MCA application is rejected solely due to a V-DESK document defect. Prices valid for 14 days from issue. See <Link to="/legal/terms">Terms of Service</Link> and <Link to="/legal/refund-policy">Refund Policy</Link>.
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '24px' }}>
                {quote.status !== 'ACCEPTED' ? (
                  <button className="btn btn--gold" onClick={accept}>
                    <i className="ph-bold ph-check-circle" /> Accept & Pay {rupees(total)}
                  </button>
                ) : (
                  <button className="btn btn--gold" onClick={() => navigate(`/checkout?item=${encodeURIComponent(quote.product)}&amount=${total}`)}>
                    <i className="ph-bold ph-credit-card" /> Proceed to Payment
                  </button>
                )}
                <button className="btn btn--outline" onClick={() => copyToClipboard(window.location.href, 'Quote link')}>
                  <i className="ph-bold ph-link" /> Copy Share Link
                </button>
                <button className="btn btn--outline" onClick={() => window.print()}>
                  <i className="ph-bold ph-printer" /> Print / PDF
                </button>
                <a href={`https://wa.me/919876543210?text=${encodeURIComponent(`Hi V-DESK, I have a question about quote ${quote.ref}`)}`} target="_blank" rel="noopener" className="btn btn--ghost">
                  <i className="ph-bold ph-whatsapp-logo" /> Discuss on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </SiteLayout>
  );
}
