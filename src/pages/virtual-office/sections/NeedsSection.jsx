import { selectVoNeed } from '@/features/virtualOffice/voPage.js';

/** 2. CHOOSE A VIRTUAL OFFICE BASED ON YOUR NEEDS (3-TIER USE CASES) */
export default function NeedsSection() {
  return (
    <section className="section vo-needs-section" id="voNeedsSection">
      <div className="container">
        <div className="section__header section__header--center reveal">
          <span className="section__eyebrow" style={{ color: 'var(--vd-gold-primary)' }}>
            <i className="ph-bold ph-squares-four" />
            Tailored Solutions
          </span>
          <h2 className="section__title">
            CHOOSE A VIRTUAL OFFICE
            <br />
            <span className="highlight-gold">BASED ON YOUR BUSINESS NEEDS</span>
          </h2>
          <p className="section__desc">
            Select the compliance or corporate service that best serves your business stage. Everything else is handled
            by our in-house legal desk.
          </p>
        </div>
        <div className="vo-needs-grid">
          <div className="vo-need-card reveal">
            <span className="vo-need-badge">Best for Startups</span>
            <div className="vo-need-icon">
              <i className="ph-bold ph-rocket-launch" />
            </div>
            <h3 className="vo-need-title">Virtual Office for New Business Setup</h3>
            <p className="vo-need-desc">
              Set up your Private Limited, LLP, or OPC at prestigious commercial addresses without paying heavy
              commercial deposits or long leases.
            </p>
            <ul className="vo-need-features">
              <li>
                <i className="ph-bold ph-check" />
                11-Month Notarized Lease Agreement in Director/Co Name
              </li>
              <li>
                <i className="ph-bold ph-check" />
                Landlord NOC on Stamp Paper with Authorized Signatures
              </li>
              <li>
                <i className="ph-bold ph-check" />
                Latest Paid Commercial Electricity Bill (Utility Proof)
              </li>
              <li>
                <i className="ph-bold ph-check" />
                Ministry of Corporate Affairs (MCA SPICe+) Compliance
              </li>
              <li>
                <i className="ph-bold ph-check" />
                Physical Company Signage Board Installed at Entrance
              </li>
            </ul>
            <div className="vo-need-pricing">
              <span className="vo-price-label">Annual Subscription:</span>
              <div className="vo-price-value">
                ₹1,499 <span>/ month</span>
              </div>
            </div>
            <button type="button" className="btn btn--outline btn--full" onClick={() => selectVoNeed('incorporation')}>
              Select for Company Setup →
            </button>
          </div>
          <div className="vo-need-card featured reveal">
            <span className="vo-need-badge">Most Popular • 100% GST Approved</span>
            <div className="vo-need-icon">
              <i className="ph-bold ph-chart-line-up" />
            </div>
            <h3 className="vo-need-title">Virtual Office for Business Expansion</h3>
            <p className="vo-need-desc">
              Expand into new states seamlessly. Unlock local state GST registration (PPOB & APOB) for Amazon/Flipkart
              FBA, warehousing, and enterprise tenders.
            </p>
            <ul className="vo-need-features">
              <li>
                <i className="ph-bold ph-check" />
                Principal Place of Business (PPOB) & APOB Documentation
              </li>
              <li>
                <i className="ph-bold ph-check" />
                Prominent Physical Signage Board Display as per GST Rule 18
              </li>
              <li>
                <i className="ph-bold ph-check" />
                Dedicated Liaison for Tax Officer Unannounced Site Visits
              </li>
              <li>
                <i className="ph-bold ph-check" />
                Rapid Clarification & Notice Assistance by In-House CAs
              </li>
              <li>
                <i className="ph-bold ph-check" />
                100% Money-Back Guarantee on Document Approval
              </li>
            </ul>
            <div className="vo-need-pricing">
              <span className="vo-price-label">Annual Subscription:</span>
              <div className="vo-price-value" style={{ color: '#DFB15B' }}>
                ₹999 <span>/ month</span>
              </div>
            </div>
            <button type="button" className="btn btn--primary btn--full" onClick={() => selectVoNeed('gst')}>
              Select for GST Registration →
            </button>
          </div>
          <div className="vo-need-card reveal">
            <span className="vo-need-badge">Prestigious CBD Address</span>
            <div className="vo-need-icon">
              <i className="ph-bold ph-buildings" />
            </div>
            <h3 className="vo-need-title">Virtual Office for Business Address & Mailing</h3>
            <p className="vo-need-desc">
              Establish an elite commercial presence in India's premier business districts. Use Grade-A landmark
              addresses on website, letterheads, and invoices.
            </p>
            <ul className="vo-need-features">
              <li>
                <i className="ph-bold ph-check" />
                Prestigious Commercial Address in Central Business Districts
              </li>
              <li>
                <i className="ph-bold ph-check" />
                Professional Front-Desk & Reception Greeting Service
              </li>
              <li>
                <i className="ph-bold ph-check" />
                Inward Courier & Speed Post Handling with WhatsApp Alerts
              </li>
              <li>
                <i className="ph-bold ph-check" />
                4K Meeting Room & Boardroom Credits Included
              </li>
              <li>
                <i className="ph-bold ph-check" />
                Zero Maintenance, Zero Electricity, Zero CAPEX
              </li>
            </ul>
            <div className="vo-need-pricing">
              <span className="vo-price-label">Annual Subscription:</span>
              <div className="vo-price-value">
                ₹899 <span>/ month</span>
              </div>
            </div>
            <button type="button" className="btn btn--outline btn--full" onClick={() => selectVoNeed('mailing')}>
              Select for Business Mailing →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
