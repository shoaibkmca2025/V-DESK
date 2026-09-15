/** 6. 3-STEP STRESS-FREE PROCESS FLOW */
export default function ProcessSection() {
  return (
    <section className="section vo-process-section" id="voProcessSection">
      <div className="container">
        <div className="section__header section__header--center reveal">
          <span className="section__eyebrow" style={{ color: 'var(--vd-gold-primary)' }}>
            <i className="ph-bold ph-fast-forward" />
            Frictionless Experience
          </span>
          <h2 className="section__title">
            3-STEP STRESS-FREE
            <br />
            <span className="highlight-gold">ONBOARDING PROCESS</span>
          </h2>
          <p className="section__desc">
            From selecting your prime address to receiving execution-ready agreements in under 24 hours.
          </p>
        </div>
        <div className="vo-process-steps-grid">
          <div className="vo-process-step-card reveal">
            <div className="vo-step-large-num">01</div>
            <div className="vo-step-icon-badge">
              <i className="ph-bold ph-map-pin-line" />
            </div>
            <h3>1. Choose Location & Need</h3>
            <p>
              Pick your preferred metro city and commercial micro-market. Select whether you need the address for MCA
              Company Incorporation, GST Registration, or Business Mailing.
            </p>
          </div>
          <div className="vo-process-step-card reveal">
            <div className="vo-step-large-num">02</div>
            <div className="vo-step-icon-badge">
              <i className="ph-bold ph-fingerprint" />
            </div>
            <h3>2. 5-Min Digital KYC</h3>
            <p>
              Upload Director PAN, Aadhaar, and photo through our 256-bit encrypted verification portal. Our compliance
              desk vets documents and verifies ownership in under 30 minutes.
            </p>
          </div>
          <div className="vo-process-step-card reveal">
            <div className="vo-step-large-num">03</div>
            <div className="vo-step-icon-badge">
              <i className="ph-bold ph-file-arrow-down" />
            </div>
            <h3>3. Receive Compliant Kit in 24h</h3>
            <p>
              Download your complete execution dossier: Notarized 11-Month Rent Agreement, Landlord NOC, Paid Commercial
              Electricity Bill, and photo proof of installed signage board.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
