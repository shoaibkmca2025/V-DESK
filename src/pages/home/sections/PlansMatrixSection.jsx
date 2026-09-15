import { openQuoteModal } from '@/features/quote/quoteModal.js';

/** SECTION: PLANS & PRICING COMPARISON MATRIX (ECHOSPACES REFERENCE) */
export default function PlansMatrixSection() {
  return (
    <section className="pricing-matrix-section" id="plansMatrix">
      <div className="container">
        <div className="section__header section__header--center reveal">
          <span className="section__eyebrow" style={{ color: 'var(--vd-teal-primary)' }}>
            <i className="ph-bold ph-scales" />
            Transparent Value
          </span>
          <h2 className="section__title">
            VIRTUAL OFFICE <span className="highlight-gold">PLANS & PRICING</span>
          </h2>
          <p className="section__desc">
            Select the optimal infrastructure package tailored for your exact compliance and operational requirements.
          </p>
        </div>
        <div className="matrix-table-wrap reveal">
          <table className="matrix-table">
            <thead>
              <tr>
                <th>Virtual Office & Features</th>
                <th>
                  Business Plan<span className="matrix-plan-tag">New Incorporation</span>
                </th>
                <th>
                  GST Address Plan<span className="matrix-plan-tag">APOB & PPOB</span>
                </th>
                <th>
                  Mailing Address<span className="matrix-plan-tag">Brand Presence</span>
                </th>
                <th>
                  Dedicated Desk Plan<span className="matrix-plan-tag">Physical Compliance</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Register New Business Entity (MCA SPICe+)</td>
                <td>
                  <span className="matrix-check">
                    <i className="ph-bold ph-check-circle" />
                  </span>
                </td>
                <td>
                  <span className="matrix-check">
                    <i className="ph-bold ph-check-circle" />
                  </span>
                </td>
                <td>
                  <span className="matrix-cross">
                    <i className="ph-bold ph-minus-circle" />
                  </span>
                </td>
                <td>
                  <span className="matrix-check">
                    <i className="ph-bold ph-check-circle" />
                  </span>
                </td>
              </tr>
              <tr>
                <td>Update Registered Address Formally</td>
                <td>
                  <span className="matrix-check">
                    <i className="ph-bold ph-check-circle" />
                  </span>
                </td>
                <td>
                  <span className="matrix-check">
                    <i className="ph-bold ph-check-circle" />
                  </span>
                </td>
                <td>
                  <span className="matrix-cross">
                    <i className="ph-bold ph-minus-circle" />
                  </span>
                </td>
                <td>
                  <span className="matrix-check">
                    <i className="ph-bold ph-check-circle" />
                  </span>
                </td>
              </tr>
              <tr>
                <td>Commercial Rent Agreement & Landlord NOC</td>
                <td>
                  <span className="matrix-check">
                    <i className="ph-bold ph-check-circle" />
                  </span>
                </td>
                <td>
                  <span className="matrix-check">
                    <i className="ph-bold ph-check-circle" />
                  </span>
                </td>
                <td>
                  <span className="matrix-check">
                    <i className="ph-bold ph-check-circle" />
                  </span>
                </td>
                <td>
                  <span className="matrix-check">
                    <i className="ph-bold ph-check-circle" />
                  </span>
                </td>
              </tr>
              <tr>
                <td>Address for Bank Account Opening & Verification</td>
                <td>
                  <span className="matrix-check">
                    <i className="ph-bold ph-check-circle" />
                  </span>
                </td>
                <td>
                  <span className="matrix-check">
                    <i className="ph-bold ph-check-circle" />
                  </span>
                </td>
                <td>
                  <span className="matrix-cross">
                    <i className="ph-bold ph-minus-circle" />
                  </span>
                </td>
                <td>
                  <span className="matrix-check">
                    <i className="ph-bold ph-check-circle" />
                  </span>
                </td>
              </tr>
              <tr>
                <td>State GST Registration (PPOB & Multi-State APOB)</td>
                <td>
                  <span className="matrix-check">
                    <i className="ph-bold ph-check-circle" />
                  </span>
                </td>
                <td>
                  <span className="matrix-check">
                    <i className="ph-bold ph-check-circle" />
                  </span>
                </td>
                <td>
                  <span className="matrix-cross">
                    <i className="ph-bold ph-minus-circle" />
                  </span>
                </td>
                <td>
                  <span className="matrix-check">
                    <i className="ph-bold ph-check-circle" />
                  </span>
                </td>
              </tr>
              <tr>
                <td>Professional Commercial Address for Website & Cards</td>
                <td>
                  <span className="matrix-check">
                    <i className="ph-bold ph-check-circle" />
                  </span>
                </td>
                <td>
                  <span className="matrix-check">
                    <i className="ph-bold ph-check-circle" />
                  </span>
                </td>
                <td>
                  <span className="matrix-check">
                    <i className="ph-bold ph-check-circle" />
                  </span>
                </td>
                <td>
                  <span className="matrix-check">
                    <i className="ph-bold ph-check-circle" />
                  </span>
                </td>
              </tr>
              <tr>
                <td>Courier Receiving, Scanning & Forwarding Services</td>
                <td>
                  <span className="matrix-check">
                    <i className="ph-bold ph-check-circle" />
                  </span>
                </td>
                <td>
                  <span className="matrix-check">
                    <i className="ph-bold ph-check-circle" />
                  </span>
                </td>
                <td>
                  <span className="matrix-check">
                    <i className="ph-bold ph-check-circle" />
                  </span>
                </td>
                <td>
                  <span className="matrix-check">
                    <i className="ph-bold ph-check-circle" />
                  </span>
                </td>
              </tr>
              <tr>
                <td>Meeting Room Access (Monthly Complimentary Credits)</td>
                <td>
                  <span className="matrix-check">
                    <i className="ph-bold ph-check-circle" />
                  </span>
                </td>
                <td>
                  <span className="matrix-check">
                    <i className="ph-bold ph-check-circle" />
                  </span>
                </td>
                <td>
                  <span className="matrix-cross">
                    <i className="ph-bold ph-minus-circle" />
                  </span>
                </td>
                <td>
                  <span className="matrix-check">
                    <i className="ph-bold ph-check-circle" />
                  </span>
                </td>
              </tr>
              <tr>
                <td>Signage Display Support at Centre Reception</td>
                <td>
                  <span className="matrix-check">
                    <i className="ph-bold ph-check-circle" />
                  </span>
                </td>
                <td>
                  <span className="matrix-check">
                    <i className="ph-bold ph-check-circle" />
                  </span>
                </td>
                <td>
                  <span className="matrix-cross">
                    <i className="ph-bold ph-minus-circle" />
                  </span>
                </td>
                <td>
                  <span className="matrix-check">
                    <i className="ph-bold ph-check-circle" /> (Permanent)
                  </span>
                </td>
              </tr>
              <tr>
                <td>Unique Dedicated Desk Number & Physical Demarcation</td>
                <td>
                  <span className="matrix-cross">
                    <i className="ph-bold ph-minus-circle" />
                  </span>
                </td>
                <td>
                  <span className="matrix-cross">
                    <i className="ph-bold ph-minus-circle" />
                  </span>
                </td>
                <td>
                  <span className="matrix-cross">
                    <i className="ph-bold ph-minus-circle" />
                  </span>
                </td>
                <td>
                  <span className="matrix-check">
                    <i className="ph-bold ph-check-circle" />
                  </span>
                </td>
              </tr>
              <tr>
                <td>On-Site Compliance Support during GST Officer Visits</td>
                <td>
                  <span className="matrix-cross">
                    <i className="ph-bold ph-minus-circle" />
                  </span>
                </td>
                <td>
                  <span className="matrix-cross">
                    <i className="ph-bold ph-minus-circle" />
                  </span>
                </td>
                <td>
                  <span className="matrix-cross">
                    <i className="ph-bold ph-minus-circle" />
                  </span>
                </td>
                <td>
                  <span className="matrix-check">
                    <i className="ph-bold ph-check-circle" />
                  </span>
                </td>
              </tr>
              <tr>
                <td>Dedicated CRM Executive & Zero Hidden Fees</td>
                <td>
                  <span className="matrix-check">
                    <i className="ph-bold ph-check-circle" />
                  </span>
                </td>
                <td>
                  <span className="matrix-check">
                    <i className="ph-bold ph-check-circle" />
                  </span>
                </td>
                <td>
                  <span className="matrix-check">
                    <i className="ph-bold ph-check-circle" />
                  </span>
                </td>
                <td>
                  <span className="matrix-check">
                    <i className="ph-bold ph-check-circle" />
                  </span>
                </td>
              </tr>
              <tr className="matrix-price-row">
                <td>
                  <strong>Starting Pricing</strong>
                  <br /> <small style={{ color: 'var(--vd-text-muted)' }}>Billed annually • 100% Tax Deductible</small>
                </td>
                <td>
                  <div className="matrix-price">
                    ₹999 <span>/mo</span>
                  </div>
                  <button className="btn btn--teal btn--sm mt-2" onClick={() => openQuoteModal('Business Plan')}>
                    Choose Plan
                  </button>
                </td>
                <td>
                  <div className="matrix-price">
                    ₹999 <span>/mo</span>
                  </div>
                  <button className="btn btn--teal btn--sm mt-2" onClick={() => openQuoteModal('GST Plan')}>
                    Choose Plan
                  </button>
                </td>
                <td>
                  <div className="matrix-price">
                    ₹799 <span>/mo</span>
                  </div>
                  <button className="btn btn--secondary btn--sm mt-2" onClick={() => openQuoteModal('Mailing Plan')}>
                    Choose Plan
                  </button>
                </td>
                <td>
                  <div className="matrix-price">
                    ₹2,999 <span>/mo</span>
                  </div>
                  <button className="btn btn--teal btn--sm mt-2" onClick={() => openQuoteModal('Dedicated Desk Plan')}>
                    Choose Plan
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
