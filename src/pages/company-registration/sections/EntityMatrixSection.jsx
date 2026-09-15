import { openCheckoutModal } from '@/features/checkout/checkout.js';
import { openQuoteModal } from '@/features/quote/quoteModal.js';
import { rawStyle } from '@/lib/domRefs.js';

/** SECTION: ENTITY SELECTION & COMPARISON MATRIX (PRD Sec 36) */
export default function EntityMatrixSection() {
  return (
    <section
      className="section dark-luxury-section"
      id="entityMatrix"
      ref={rawStyle('padding: 70px 0; background: #05132B !important;')}
    >
      <div className="container">
        <div className="section__header section__header--center">
          <span className="hero-badge-pill" style={{ marginBottom: '12px' }}>
            <i className="ph-bold ph-buildings" />
            Corporate Frameworks
          </span>
          <h2 className="section__title" ref={rawStyle('color: #FFFFFF !important;')}>
            SELECT THE RIGHT CORPORATE
            <br />
            <span className="highlight-gold">STRUCTURE FOR YOUR BUSINESS</span>
          </h2>
          <p className="section__desc" ref={rawStyle('color: #CBD5E1 !important;')}>
            Each legal structure offers distinct governance, liability protection, and tax implications under the Indian
            Companies Act 2013.
          </p>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px',
            marginTop: '40px',
          }}
        >
          <div className="entity-card" style={{ border: '2px solid #C59239', position: 'relative' }}>
            <span
              style={{
                position: 'absolute',
                top: '-12px',
                right: '20px',
                background: '#C59239',
                color: '#05132B',
                fontSize: '0.72rem',
                fontWeight: '800',
                padding: '3px 12px',
                borderRadius: '20px',
                textTransform: 'uppercase',
              }}
            >
              Most Popular
            </span>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#C59239', fontWeight: '700' }}>
              Fundable Startups
            </span>
            <h3 style={{ fontSize: '1.3rem', color: '#081D40', margin: '6px 0 10px 0' }}>Private Limited (Pvt Ltd)</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '20px' }}>
              Separate legal entity preferred by venture capitalists and angel investors. Enables ESOPs and limited
              liability.
            </p>
            <div style={{ marginBottom: '20px' }}>
              <strong style={{ fontSize: '1.8rem', color: '#081D40' }}>₹6,999</strong>
              <span style={{ fontSize: '0.8rem', color: '#64748B' }}> + Govt Stamp Duty</span>
            </div>
            <ul
              style={{
                listStyle: 'none',
                padding: '0',
                margin: '0 0 24px 0',
                fontSize: '0.85rem',
                color: '#334155',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <li>
                <i className="ph-bold ph-check" style={{ color: '#10B981' }} /> 2 Directors & 2 Shareholders min.
              </li>
              <li>
                <i className="ph-bold ph-check" style={{ color: '#10B981' }} /> Foreign Direct Investment (FDI) allowed
              </li>
              <li>
                <i className="ph-bold ph-check" style={{ color: '#10B981' }} /> Unlimited capital scalability
              </li>
              <li>
                <i className="ph-bold ph-check" style={{ color: '#10B981' }} /> 2 Class-3 DSCs + 2 DINs included
              </li>
            </ul>
            <button
              className="btn btn--primary btn--full"
              onClick={() =>
                openCheckoutModal({ item: 'Pvt Ltd Incorporation Package', amount: 6999, city: 'National' })
              }
            >
              Incorporate Pvt Ltd
            </button>
          </div>
          <div className="entity-card">
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748B', fontWeight: '700' }}>
              Consultancies & Agencies
            </span>
            <h3 style={{ fontSize: '1.3rem', color: '#081D40', margin: '6px 0 10px 0' }}>Limited Liability (LLP)</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '20px' }}>
              Combines flexibility of a traditional partnership with corporate limited liability. Lower statutory
              compliance burden.
            </p>
            <div style={{ marginBottom: '20px' }}>
              <strong style={{ fontSize: '1.8rem', color: '#081D40' }}>₹5,499</strong>
              <span style={{ fontSize: '0.8rem', color: '#64748B' }}> + Govt Fees</span>
            </div>
            <ul
              style={{
                listStyle: 'none',
                padding: '0',
                margin: '0 0 24px 0',
                fontSize: '0.85rem',
                color: '#334155',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <li>
                <i className="ph-bold ph-check" style={{ color: '#10B981' }} /> 2 Designated Partners min.
              </li>
              <li>
                <i className="ph-bold ph-check" style={{ color: '#10B981' }} />{' '}
                {'No statutory audit if turnover < ₹40L'}
              </li>
              <li>
                <i className="ph-bold ph-check" style={{ color: '#10B981' }} /> Partnership deed flexibility
              </li>
              <li>
                <i className="ph-bold ph-check" style={{ color: '#10B981' }} /> Lower annual ROC filing costs
              </li>
            </ul>
            <button
              className="btn btn--outline btn--full"
              onClick={() => openCheckoutModal({ item: 'LLP Incorporation Package', amount: 5499, city: 'National' })}
            >
              Incorporate LLP
            </button>
          </div>
          <div className="entity-card">
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748B', fontWeight: '700' }}>
              Solo Founders
            </span>
            <h3 style={{ fontSize: '1.3rem', color: '#081D40', margin: '6px 0 10px 0' }}>One Person Company (OPC)</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '20px' }}>
              Full corporate status for solo entrepreneurs without sharing equity. Complete single-member limited
              liability.
            </p>
            <div style={{ marginBottom: '20px' }}>
              <strong style={{ fontSize: '1.8rem', color: '#081D40' }}>₹5,999</strong>
              <span style={{ fontSize: '0.8rem', color: '#64748B' }}> + Govt Fees</span>
            </div>
            <ul
              style={{
                listStyle: 'none',
                padding: '0',
                margin: '0 0 24px 0',
                fontSize: '0.85rem',
                color: '#334155',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <li>
                <i className="ph-bold ph-check" style={{ color: '#10B981' }} /> 1 Director & 1 Nominee min.
              </li>
              <li>
                <i className="ph-bold ph-check" style={{ color: '#10B981' }} /> 100% Equity retained by founder
              </li>
              <li>
                <i className="ph-bold ph-check" style={{ color: '#10B981' }} /> Corporate bank account credibility
              </li>
              <li>
                <i className="ph-bold ph-check" style={{ color: '#10B981' }} /> Easily converts to Pvt Ltd later
              </li>
            </ul>
            <button
              className="btn btn--outline btn--full"
              onClick={() => openCheckoutModal({ item: 'OPC Incorporation Package', amount: 5999, city: 'National' })}
            >
              Incorporate OPC
            </button>
          </div>
          <div className="entity-card">
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748B', fontWeight: '700' }}>
              Non-Profit & Trusts
            </span>
            <h3 style={{ fontSize: '1.3rem', color: '#081D40', margin: '6px 0 10px 0' }}>Section 8 Company (NGO)</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '20px' }}>
              Non-profit entity established for promoting commerce, art, science, education, charity, or environmental
              protection.
            </p>
            <div style={{ marginBottom: '20px' }}>
              <strong style={{ fontSize: '1.8rem', color: '#081D40' }}>₹11,999</strong>
              <span style={{ fontSize: '0.8rem', color: '#64748B' }}> + Govt Fees</span>
            </div>
            <ul
              style={{
                listStyle: 'none',
                padding: '0',
                margin: '0 0 24px 0',
                fontSize: '0.85rem',
                color: '#334155',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <li>
                <i className="ph-bold ph-check" style={{ color: '#10B981' }} /> Central Govt MCA License granted
              </li>
              <li>
                <i className="ph-bold ph-check" style={{ color: '#10B981' }} /> Eligible for 12A & 80G Tax Exemptions
              </li>
              <li>
                <i className="ph-bold ph-check" style={{ color: '#10B981' }} /> Higher credibility than Society/Trust
              </li>
              <li>
                <i className="ph-bold ph-check" style={{ color: '#10B981' }} /> FCRA & CSR funding eligible
              </li>
            </ul>
            <button
              className="btn btn--outline btn--full"
              onClick={() => openQuoteModal('Section 8 Non-Profit Advisory')}
            >
              Consult Section 8
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
