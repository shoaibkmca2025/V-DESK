/** 3. WHAT V-DESK GUARANTEES IN YOUR VIRTUAL OFFICE (4 CORE PILLARS) */
export default function GuaranteesSection() {
  return (
    <section className="section vo-guarantees-section" id="voGuaranteesSection">
      <div className="container">
        <div className="section__header section__header--center reveal">
          <span className="section__eyebrow" style={{ color: 'var(--vd-teal-primary)' }}>
            <i className="ph-bold ph-shield-check" />
            Unshakeable Commitments
          </span>
          <h2 className="section__title">
            WHAT V-DESK GUARANTEES
            <br />
            <span className="highlight-gold">IN YOUR VIRTUAL OFFICE</span>
          </h2>
          <p className="section__desc">
            We remove the legal risks, broker uncertainty, and delays of commercial real estate with 4 ironclad
            guarantees.
          </p>
        </div>
        <div className="vo-guarantees-grid">
          <div className="vo-guarantee-card reveal">
            <div className="vo-guarantee-icon">
              <i className="ph-bold ph-tag-chevron" />
            </div>
            <h3 className="vo-guarantee-title">Lowest Price Guarantee</h3>
            <p className="vo-guarantee-desc">
              Direct-from-operator network pricing across 250+ partner Grade-A hubs. Zero broker fees. If you find a
              verified lower quote for identical documentation, we match it and add 10% credit.
            </p>
          </div>
          <div className="vo-guarantee-card reveal">
            <div className="vo-guarantee-icon">
              <i className="ph-bold ph-shield-check" />
            </div>
            <h3 className="vo-guarantee-title">100% Approval Guarantee</h3>
            <p className="vo-guarantee-desc">
              Every lease deed, NOC, and bill is pre-vetted by our corporate legal counsel. If your registration is
              rejected due to property documentation, we provide free address replacement or a full refund.
            </p>
          </div>
          <div className="vo-guarantee-card reveal">
            <div className="vo-guarantee-icon">
              <i className="ph-bold ph-lightning" />
            </div>
            <h3 className="vo-guarantee-title">Fastest Turnaround SLA</h3>
            <p className="vo-guarantee-desc">
              Why wait 2 weeks for landlords? Our automated digital drafting pipeline ensures verified, notarized
              agreements and owner NOCs are digitally prepared and dispatched within 24 hours.
            </p>
          </div>
          <div className="vo-guarantee-card reveal">
            <div className="vo-guarantee-icon">
              <i className="ph-bold ph-fingerprint" />
            </div>
            <h3 className="vo-guarantee-title">100% Digital KYC & E-Sign</h3>
            <p className="vo-guarantee-desc">
              Zero physical branch visits required. Upload your documents via our 256-bit encrypted portal, complete
              Aadhaar OTP e-sign, and receive execution-ready dossiers instantly.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
