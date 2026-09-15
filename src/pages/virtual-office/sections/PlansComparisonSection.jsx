import { openQuoteModal } from '@/features/quote/quoteModal.js';

export default function PlansComparisonSection() {
  return (
    <section className="section vo-plans-comparison" id="plans">
      <div className="container">
        <div className="section__header section__header--center">
          <span className="section__eyebrow" style={{ color: 'var(--vd-teal-primary)' }}>
            <i className="ph-bold ph-table" />
            Plan Architecture
          </span>
          <h2 className="section__title">
            TRANSPARENT VIRTUAL OFFICE
            <br />
            <span className="highlight-gold">SUBSCRIPTION TIERS</span>
          </h2>
          <p className="section__desc">
            Choose the exact level of commercial representation required for your current corporate lifecycle.
          </p>
        </div>
        <div
          className="pricing__grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
            marginTop: '30px',
          }}
        >
          <div className="pricing-card">
            <div className="pricing-card__header">
              <span className="pricing-card__pill">Basic Identity</span>
              <h3 className="pricing-card__name">Mailing Address</h3>
              <p className="pricing-card__desc">
                For freelancers and remote teams requiring a prime mailing address and courier management.
              </p>
              <div className="pricing-card__price">
                <span className="currency">₹</span>
                <span className="amount">849</span>
                <span className="period">/mo</span>
              </div>
            </div>
            <ul className="pricing-card__features">
              <li>
                <i className="ph-bold ph-check" /> Prestigious Commercial Hub Address
              </li>
              <li>
                <i className="ph-bold ph-check" /> Official Mail & Courier Receiving
              </li>
              <li>
                <i className="ph-bold ph-check" /> WhatsApp Courier Photo Notifications
              </li>
              <li className="disabled">
                <i className="ph-bold ph-x" /> GST Registration NOC
              </li>
              <li className="disabled">
                <i className="ph-bold ph-x" /> Physical Name Board
              </li>
            </ul>
            <button
              className="btn btn--outline btn--block"
              onClick={() => openQuoteModal('Virtual Office - Mailing Plan')}
            >
              Select Plan
            </button>
          </div>
          <div
            className="pricing-card pricing-card--featured"
            style={{ border: '2px solid #C59239', position: 'relative' }}
          >
            <div
              className="badge-popular"
              style={{
                position: 'absolute',
                top: '-12px',
                right: '24px',
                background: '#C59239',
                color: '#fff',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: '700',
              }}
            >
              MOST POPULAR
            </div>
            <div className="pricing-card__header">
              <span className="pricing-card__pill">Tax Compliant</span>
              <h3 className="pricing-card__name">GST Registration Ready</h3>
              <p className="pricing-card__desc">
                100% compliant documentation for PPOB or APOB state GST registrations and officer visits.
              </p>
              <div className="pricing-card__price">
                <span className="currency">₹</span>
                <span className="amount">1,249</span>
                <span className="period">/mo</span>
              </div>
            </div>
            <ul className="pricing-card__features">
              <li>
                <i className="ph-bold ph-check" /> Notarized Commercial Rent Agreement
              </li>
              <li>
                <i className="ph-bold ph-check" /> Landlord NOC & Commercial Electricity Bill
              </li>
              <li>
                <i className="ph-bold ph-check" /> Prominent Physical Company Name Board
              </li>
              <li>
                <i className="ph-bold ph-check" /> Dedicated Desk Officer Physical Inspection Support
              </li>
              <li>
                <i className="ph-bold ph-check" /> 100% Rejection Protection Guarantee
              </li>
            </ul>
            <button className="btn btn--primary btn--block" onClick={() => openQuoteModal('Virtual Office - GST Plan')}>
              Choose GST Plan
            </button>
          </div>
          <div className="pricing-card">
            <div className="pricing-card__header">
              <span className="pricing-card__pill">Full Corporation</span>
              <h3 className="pricing-card__name">Enterprise All-Inclusive</h3>
              <p className="pricing-card__desc">
                Complete solution for multi-director Pvt Ltd companies, incorporating free meeting credits.
              </p>
              <div className="pricing-card__price">
                <span className="currency">₹</span>
                <span className="amount">1,999</span>
                <span className="period">/mo</span>
              </div>
            </div>
            <ul className="pricing-card__features">
              <li>
                <i className="ph-bold ph-check" /> Everything in GST Plan
              </li>
              <li>
                <i className="ph-bold ph-check" /> MCA SPICe+ Compliant CIN Filing Proofs
              </li>
              <li>
                <i className="ph-bold ph-check" /> 10 Free Hours/Month 4K Boardroom Credits
              </li>
              <li>
                <i className="ph-bold ph-check" /> Dedicated Concierge & Priority Dispatch
              </li>
              <li>
                <i className="ph-bold ph-check" /> Bank Account Verification Desk
              </li>
            </ul>
            <button
              className="btn btn--outline btn--block"
              onClick={() => openQuoteModal('Virtual Office - Enterprise Plan')}
            >
              Get Enterprise
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
