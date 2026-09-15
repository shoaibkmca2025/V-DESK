import { openCheckoutModal } from '@/features/checkout/checkout.js';
import { calculateIncorpFees } from '@/features/companyRegistration/companyRegistration.js';

/** SECTION: 5-STEP INTERACTIVE INCORPORATION WIZARD (PRD Sec 36) */
export default function IncorporationWizardSection() {
  return (
    <section className="section" id="incorpWizard" style={{ padding: '70px 0', background: '#FFFFFF' }}>
      <div className="container">
        <div className="section__header section__header--center">
          <span className="section__eyebrow" style={{ color: '#C59239' }}>
            <i className="ph-bold ph-sliders" />
            Cost & Timeline Estimator
          </span>
          <h2 className="section__title">
            5-STEP INTERACTIVE
            <br />
            <span className="highlight-gold">INCORPORATION WIZARD</span>
          </h2>
          <p className="section__desc">
            Calculate government MCA filing fees, state stamp duties, professional CA fees, and virtual office bundle
            discounts.
          </p>
        </div>
        <div
          style={{
            maxWidth: '860px',
            margin: '35px auto 0 auto',
            background: '#FAF8F3',
            border: '1px solid #E8E2D8',
            borderRadius: '16px',
            padding: '36px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
              marginBottom: '24px',
            }}
          >
            <div className="form-field">
              <label className="form-label" htmlFor="wizEntityType" style={{ fontWeight: '700', color: '#081D40' }}>
                <i className="ph-bold ph-buildings" /> 1. Legal Entity Structure
              </label>
              <select
                id="wizEntityType"
                className="form-select"
                onChange={() => calculateIncorpFees()}
                defaultValue="pvt"
              >
                <option value="pvt" data-base="6999">
                  Private Limited Company (Pvt Ltd)
                </option>
                <option value="llp" data-base="5499">
                  Limited Liability Partnership (LLP)
                </option>
                <option value="opc" data-base="5999">
                  One Person Company (OPC)
                </option>
                <option value="sec8" data-base="11999">
                  Section 8 Non-Profit Company
                </option>
              </select>
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="wizState" style={{ fontWeight: '700', color: '#081D40' }}>
                <i className="ph-bold ph-map-pin" /> 2. Registered Office State
              </label>
              <select
                id="wizState"
                className="form-select"
                onChange={() => calculateIncorpFees()}
                defaultValue="Maharashtra"
              >
                <option value="Maharashtra" data-stamp="1000">
                  Maharashtra (Mumbai / Pune / Nashik) — ₹1,000 Stamp
                </option>
                <option value="Delhi" data-stamp="360">
                  Delhi NCR — ₹360 Stamp
                </option>
                <option value="Karnataka" data-stamp="1500">
                  Karnataka (Bangalore) — ₹1,500 Stamp
                </option>
                <option value="Telangana" data-stamp="1200">
                  Telangana (Hyderabad) — ₹1,200 Stamp
                </option>
                <option value="Gujarat" data-stamp="800">
                  Gujarat (Ahmedabad) — ₹800 Stamp
                </option>
              </select>
            </div>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
              marginBottom: '24px',
            }}
          >
            <div className="form-field">
              <label className="form-label" htmlFor="wizDirectors" style={{ fontWeight: '700', color: '#081D40' }}>
                <i className="ph-bold ph-users" /> 3. Number of Directors (DSCs Required)
              </label>
              <select id="wizDirectors" className="form-select" onChange={() => calculateIncorpFees()} defaultValue="2">
                <option value="2">2 Directors (Standard)</option>
                <option value="3">3 Directors</option>
                <option value="4">4 Directors</option>
              </select>
            </div>
            <div className="form-field">
              <label className="form-label" style={{ fontWeight: '700', color: '#081D40' }}>
                <i className="ph-bold ph-house-line" /> 4. V-DESK Registered Office Address
              </label>
              <div
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  padding: '12px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <input
                  type="checkbox"
                  id="wizBundleVo"
                  defaultChecked
                  onChange={() => calculateIncorpFees()}
                  style={{ accentColor: '#C59239', width: '18px', height: '18px' }}
                />
                <label htmlFor="wizBundleVo" style={{ fontSize: '0.85rem', color: '#081D40', cursor: 'pointer' }}>
                  <strong>Bundle 1-Yr Virtual Office Address</strong>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: '#10B981' }}>
                    Save 20% on Address + Guaranteed MCA Approval
                  </span>
                </label>
              </div>
            </div>
          </div>
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                borderBottom: '1px solid #F1F5F9',
                paddingBottom: '12px',
              }}
            >
              <h4 style={{ margin: '0', color: '#081D40', fontSize: '1.1rem' }}>Incorporation Fee Breakdown</h4>
              <span className="kyc-status-badge verified" style={{ fontSize: '0.75rem' }}>
                100% SPICe+ Compliant
              </span>
            </div>
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem', color: '#334155' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Professional Drafting & CA/CS Filing Retainer:</span>
                <strong id="wizBaseFee">₹6,999</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>State Stamp Duty & MCA SPICe+ Fees:</span>
                <strong id="wizStampFee">₹1,000</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Digital Signature Tokens (Class 3 DSC):</span>
                <strong id="wizDscFee">Included</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }} id="wizVoRow">
                <span>1-Year V-DESK Virtual Office Address (Bundled):</span>
                <strong style={{ color: '#10B981' }} id="wizVoFee">
                  ₹11,999 <small style={{ color: '#64748B', textDecoration: 'line-through' }}>₹14,999</small>
                </strong>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '2px dashed #E2E8F0',
                  paddingTop: '10px',
                  marginTop: '6px',
                  fontSize: '1.15rem',
                  color: '#081D40',
                }}
              >
                <strong>Estimated Total Investment:</strong>
                <strong style={{ color: '#C59239' }} id="wizTotalFee">
                  ₹19,998
                </strong>
              </div>
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <span style={{ fontSize: '0.85rem', color: '#64748B' }}>
              <i className="ph-bold ph-shield-check" style={{ color: '#10B981' }} /> Guaranteed incorporation in 5-7
              working days or full fee refund.
            </span>
            <button
              className="btn btn--gold btn--lg"
              onClick={() =>
                openCheckoutModal({
                  item: 'Complete Company Incorporation + 1-Yr VO Address',
                  amount: 19998,
                  city: 'National',
                })
              }
            >
              <i className="ph-bold ph-paper-plane-tilt" />
              Proceed to File Incorporation →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
