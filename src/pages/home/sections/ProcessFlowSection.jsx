/** SECTION: 5-STEP PROCESS FLOW OF VIRTUAL OFFICE SERVICES (ECHOSPACES REFERENCE) */
export default function ProcessFlowSection() {
  return (
    <section className="process-flow-section" id="processFlow">
      <div className="container">
        <div className="section__header section__header--center reveal">
          <span className="section__eyebrow" style={{ color: 'var(--vd-teal-primary)' }}>
            <i className="ph-bold ph-lightning" />
            Effortless Turnaround
          </span>
          <h2 className="section__title">
            THE PROCESS-FLOW OF
            <br />
            <span className="highlight-gold">VIRTUAL OFFICE SERVICES</span>
          </h2>
          <p className="section__desc">
            From selecting your prime commercial address to obtaining 100% compliant MCA and GST documentation — simple,
            transparent, and completely digital.
          </p>
        </div>
        <div className="process-grid reveal-stagger">
          <div className="process-card">
            <div className="process-card__number">01</div>
            <h3 className="process-card__title">
              Choose a <span>Location</span>
            </h3>
            <p className="process-card__desc">
              Access prime Grade-A commercial addresses across Delhi NCR, Mumbai, Bengaluru, Pune, Hyderabad, and all 28
              States.
            </p>
          </div>
          <div className="process-card">
            <div className="process-card__number">02</div>
            <h3 className="process-card__title">
              Select your <span>Plan</span>
            </h3>
            <p className="process-card__desc">
              Choose between GST Registration (PPOB/APOB), Company Incorporation (MCA SPICe+), Mailing, or Dedicated
              Desks.
            </p>
          </div>
          <div className="process-card">
            <div className="process-card__number">03</div>
            <h3 className="process-card__title">
              Instant Online <span>Payment</span>
            </h3>
            <p className="process-card__desc">
              100% transparent pricing with zero hidden charges. Flexible monthly, annual, and multi-year tenure
              discounts.
            </p>
          </div>
          <div className="process-card">
            <div className="process-card__number">04</div>
            <h3 className="process-card__title">
              Digital KYC <span>Verification</span>
            </h3>
            <p className="process-card__desc">
              Quick paperless upload of basic documents (PAN, Aadhaar, Photo). Fully verified by our compliance team in
              hours.
            </p>
          </div>
          <div className="process-card">
            <div className="process-card__number">05</div>
            <h3 className="process-card__title">
              Ready to Use in <span>24-48 Hrs</span>
            </h3>
            <p className="process-card__desc">
              Receive your notarized commercial rent agreement, owner NOC, and recent electricity bill ready for filing.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
