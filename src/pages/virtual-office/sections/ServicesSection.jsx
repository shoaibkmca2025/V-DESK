/** 4. ALL SERVICES INCLUDED (6-CARD ENTERPRISE SUITE) */
export default function ServicesSection() {
  return (
    <section className="section vo-services-section" id="voServicesSection">
      <div className="container">
        <div className="section__header section__header--center reveal">
          <span className="section__eyebrow" style={{ color: 'var(--vd-gold-primary)' }}>
            <i className="ph-bold ph-cube" />
            Enterprise Deliverables
          </span>
          <h2 className="section__title">
            ALL SERVICES YOU GET WITH
            <br />
            <span className="highlight-gold">V-DESK VIRTUAL OFFICE</span>
          </h2>
          <p className="section__desc">
            Everything required for regulatory compliance, brand authority, and everyday business operations across
            India.
          </p>
        </div>
        <div className="vo-services-grid">
          <div className="vo-service-card reveal">
            <div className="vo-service-icon">
              <i className="ph-bold ph-map-pin" />
            </div>
            <div className="vo-service-content">
              <h4>Grade-A Commercial Address</h4>
              <p>
                Prime landmark addresses in Central Business Districts across Delhi NCR, Mumbai, Bengaluru, and 18+
                metros suitable for MCA, GST, and banks.
              </p>
            </div>
          </div>
          <div className="vo-service-card reveal">
            <div className="vo-service-icon">
              <i className="ph-bold ph-file-text" />
            </div>
            <div className="vo-service-content">
              <h4>Notarized Rent Deed & Landlord NOC</h4>
              <p>
                Government-compliant 11-month or 2-year commercial lease deeds with owner NOC explicitly authorizing
                business and tax registration.
              </p>
            </div>
          </div>
          <div className="vo-service-card reveal">
            <div className="vo-service-icon">
              <i className="ph-bold ph-receipt" />
            </div>
            <div className="vo-service-content">
              <h4>Paid Commercial Electricity Bill</h4>
              <p>
                Crisp, high-resolution paid commercial utility bills with matching consumer details and municipal
                clearances for zero GST query risk.
              </p>
            </div>
          </div>
          <div className="vo-service-card reveal">
            <div className="vo-service-icon">
              <i className="ph-bold ph-identification-badge" />
            </div>
            <div className="vo-service-content">
              <h4>Physical Signage Board Display</h4>
              <p>
                Permanent physical company board displayed at the hub reception and entrance meeting Section 12(3) of
                Companies Act and GST Rule 18.
              </p>
            </div>
          </div>
          <div className="vo-service-card reveal">
            <div className="vo-service-icon">
              <i className="ph-bold ph-envelope-simple-open" />
            </div>
            <div className="vo-service-content">
              <h4>Mail & Courier Management</h4>
              <p>
                Daily logging of official speed posts, bank parcels, and legal notices with envelope scan alerts to your
                WhatsApp and on-demand forwarding.
              </p>
            </div>
          </div>
          <div className="vo-service-card reveal">
            <div className="vo-service-icon">
              <i className="ph-bold ph-user-check" />
            </div>
            <div className="vo-service-content">
              <h4>On-Site Physical Inspection Liaison</h4>
              <p>
                Professional on-ground centre team present during unannounced GST officer or banking field verification
                visits to verify credentials.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
