import { openCheckoutModal } from '@/features/checkout/checkout.js';
import { openEnterpriseSuiteModal } from '@/features/enterprise/enterpriseSuite.js';
import { rawStyle } from '@/lib/domRefs.js';

/** SECTION: COMPREHENSIVE MULTI-SERVICE PRICING TABLE (PRD Sec 38-41) */
export default function PlansMatrixSection() {
  return (
    <section
      className="pricing-matrix-section dark-luxury-section"
      id="plansMatrix"
      ref={rawStyle('padding: 70px 0; background: #05132B !important;')}
    >
      <div className="container">
        <div className="section__header section__header--center">
          <span className="hero-badge-pill" style={{ marginBottom: '12px' }}>
            <i className="ph-bold ph-scales" />
            Service Calibre Comparison
          </span>
          <h2 className="section__title" ref={rawStyle('color: #FFFFFF !important;')}>
            COMMERCIAL PLANS
            <br />
            <span className="highlight-gold">BUILT FOR SCALE</span>
          </h2>
          <p className="section__desc" ref={rawStyle('color: #CBD5E1 !important;')}>
            Select annual lock-in to receive 20% discount and guaranteed government registration approval.
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
          <div className="entity-card">
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748B', fontWeight: '700' }}>
              Basic Presence
            </span>
            <h3 style={{ fontSize: '1.3rem', color: '#081D40', margin: '6px 0 10px 0' }}>Silver Business Address</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '20px' }}>
              Prime commercial mailing address for website, business cards, client invoices & correspondence.
            </p>
            <div style={{ marginBottom: '20px' }}>
              <strong
                className="plan-price-val"
                data-monthly="899"
                data-annual="9,999"
                style={{ fontSize: '1.8rem', color: '#081D40' }}
              >
                ₹9,999
              </strong>
              <span className="plan-period-label" style={{ fontSize: '0.8rem', color: '#64748B' }}>
                {' '}
                / year
              </span>
              <div className="plan-sub-label" style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: '600' }}>
                ₹9,999 billed annually
              </div>
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
                <i className="ph-bold ph-check" style={{ color: '#10B981' }} /> Prime Grade-A Postal Address
              </li>
              <li>
                <i className="ph-bold ph-check" style={{ color: '#10B981' }} /> Mail & Courier Receipt Logging
              </li>
              <li>
                <i className="ph-bold ph-check" style={{ color: '#10B981' }} /> Digital Courier Notifications
              </li>
              <li>
                <i className="ph-bold ph-x" style={{ color: '#94A3B8' }} /> No GST / MCA Registration
              </li>
            </ul>
            <button
              className="btn btn--outline btn--full"
              onClick={() =>
                openCheckoutModal({ item: 'Silver Business Address Annual', amount: 9999, city: 'National' })
              }
            >
              Select Silver
            </button>
          </div>
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
              Tax Compliant
            </span>
            <h3 style={{ fontSize: '1.3rem', color: '#081D40', margin: '6px 0 10px 0' }}>Gold GST Ready</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '20px' }}>
              Dedicated registered office for GST registration (VPOB/APOB) with 100% government approval guarantee.
            </p>
            <div style={{ marginBottom: '20px' }}>
              <strong
                className="plan-price-val"
                data-monthly="1,299"
                data-annual="14,999"
                style={{ fontSize: '1.8rem', color: '#081D40' }}
              >
                ₹14,999
              </strong>
              <span className="plan-period-label" style={{ fontSize: '0.8rem', color: '#64748B' }}>
                {' '}
                / year
              </span>
              <div className="plan-sub-label" style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: '600' }}>
                ₹14,999 billed annually
              </div>
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
                <i className="ph-bold ph-check" style={{ color: '#10B981' }} /> 12-Month Notarized Commercial Lease
              </li>
              <li>
                <i className="ph-bold ph-check" style={{ color: '#10B981' }} /> Landlord Non-Objection (NOC)
              </li>
              <li>
                <i className="ph-bold ph-check" style={{ color: '#10B981' }} /> Commercial Paid Electricity Bill
              </li>
              <li>
                <i className="ph-bold ph-check" style={{ color: '#10B981' }} /> Physical Nameplate Signage Board
              </li>
              <li>
                <i className="ph-bold ph-check" style={{ color: '#10B981' }} /> Dedicated GST Officer Inspection Support
              </li>
            </ul>
            <button
              className="btn btn--primary btn--full"
              onClick={() => openCheckoutModal({ item: 'Gold GST Ready Annual', amount: 14999, city: 'National' })}
            >
              Select Gold GST
            </button>
          </div>
          <div className="entity-card">
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748B', fontWeight: '700' }}>
              Full Corporate Suite
            </span>
            <h3 style={{ fontSize: '1.3rem', color: '#081D40', margin: '6px 0 10px 0' }}>Platinum Corporate & MCA</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '20px' }}>
              Comprehensive incorporation address for ROC SPICe+ filing with complimentary meeting room credits.
            </p>
            <div style={{ marginBottom: '20px' }}>
              <strong
                className="plan-price-val"
                data-monthly="1,599"
                data-annual="17,999"
                style={{ fontSize: '1.8rem', color: '#081D40' }}
              >
                ₹17,999
              </strong>
              <span className="plan-period-label" style={{ fontSize: '0.8rem', color: '#64748B' }}>
                {' '}
                / year
              </span>
              <div className="plan-sub-label" style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: '600' }}>
                ₹17,999 billed annually
              </div>
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
                <i className="ph-bold ph-check" style={{ color: '#10B981' }} /> Everything in Gold GST Ready
              </li>
              <li>
                <i className="ph-bold ph-check" style={{ color: '#10B981' }} /> MCA SPICe+ Registration Support
              </li>
              <li>
                <i className="ph-bold ph-check" style={{ color: '#10B981' }} /> 5 Hours Monthly 4K Meeting Room
              </li>
              <li>
                <i className="ph-bold ph-check" style={{ color: '#10B981' }} /> Dedicated Chartered Accountant Desk
              </li>
            </ul>
            <button
              className="btn btn--outline btn--full"
              onClick={() => openCheckoutModal({ item: 'Platinum Corporate Annual', amount: 17999, city: 'National' })}
            >
              Select Platinum
            </button>
          </div>
          <div className="entity-card" ref={rawStyle('background: #081D40; color: #FFFFFF; border-color: #081D40;')}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#C59239', fontWeight: '700' }}>
              Multi-State Enterprise
            </span>
            <h3 style={{ fontSize: '1.3rem', color: '#FFFFFF', margin: '6px 0 10px 0' }}>
              National Multi-City Passport
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '20px' }}>
              For Amazon/Flipkart sellers & national enterprises requiring GST registrations across 3 to 10+ states.
            </p>
            <div style={{ marginBottom: '20px' }}>
              <strong style={{ fontSize: '1.8rem', color: '#C59239' }}>From ₹999</strong>
              <span style={{ fontSize: '0.8rem', color: '#CBD5E1' }}> / state / mo</span>
              <div style={{ fontSize: '0.75rem', color: '#38BDF8', fontWeight: '600' }}>
                Up to 35% Multi-State Rebate
              </div>
            </div>
            <ul
              style={{
                listStyle: 'none',
                padding: '0',
                margin: '0 0 24px 0',
                fontSize: '0.85rem',
                color: '#E2E8F0',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <li>
                <i className="ph-bold ph-check" style={{ color: '#C59239' }} /> Unified centralized tax invoice
              </li>
              <li>
                <i className="ph-bold ph-check" style={{ color: '#C59239' }} /> Dedicated Enterprise Account Director
              </li>
              <li>
                <i className="ph-bold ph-check" style={{ color: '#C59239' }} /> Multi-state GST return filing sync
              </li>
              <li>
                <i className="ph-bold ph-check" style={{ color: '#C59239' }} /> Pan-India mail dispatch consolidation
              </li>
            </ul>
            <button
              className="btn btn--primary btn--full"
              style={{ background: '#C59239', color: '#05132B', borderColor: '#C59239' }}
              onClick={() => openEnterpriseSuiteModal()}
            >
              Open Enterprise Multi-City Suite
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
