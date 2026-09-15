import { prefillCwTour } from '@/features/coworking/coworking.js';

/** STRATEGIC LOCATION & CONNECTIVITY MATRIX (AEROCITY ADVANTAGE) */
export default function LocationSection() {
  return (
    <section className="section cw-location-section" id="cwLocationSection">
      <div className="container">
        <div className="section__header section__header--center">
          <span className="section__eyebrow">
            <i className="ph-bold ph-navigation-arrow" />
            The Aerocity Advantage
          </span>
          <h2 className="section__title">
            STRATEGIC CONNECTIVITY &<br />
            <span className="highlight-gold">PREMIER ACCESSIBILITY</span>
          </h2>
          <p className="section__desc">
            Located at the nexus of South Delhi and Gurugram's Fortune 500 corridor. Seamless connectivity for local
            commuting and international business travel.
          </p>
        </div>
        <div className="cw-location-grid">
          <div className="cw-transit-card">
            <h3 className="cw-transit-title">
              <i className="ph-bold ph-clock" />
              Unmatched Transit Proximity
            </h3>
            <div className="cw-transit-items">
              <div className="cw-transit-item">
                <div className="cw-transit-icon">
                  <i className="ph-bold ph-airplane" />
                </div>
                <div className="cw-transit-info">
                  <strong>Indira Gandhi International Airport (IGI)</strong>
                  <span>5 Minutes Drive • Direct access to Terminal 3 (International) & Terminal 1</span>
                </div>
                <span className="cw-transit-badge">5 Mins</span>
              </div>
              <div className="cw-transit-item">
                <div className="cw-transit-icon">
                  <i className="ph-bold ph-train" />
                </div>
                <div className="cw-transit-info">
                  <strong>Delhi Aerocity Metro Station</strong>
                  <span>Airport Express Orange Line • 7-10 Mins Covered Walkway from Worldmark</span>
                </div>
                <span className="cw-transit-badge">7 Mins Walk</span>
              </div>
              <div className="cw-transit-item">
                <div className="cw-transit-icon">
                  <i className="ph-bold ph-buildings" />
                </div>
                <div className="cw-transit-info">
                  <strong>Connaught Place / Central Business District</strong>
                  <span>15 Minutes via Airport Express Metro • 30 Minutes Highway Drive</span>
                </div>
                <span className="cw-transit-badge">15 Mins Metro</span>
              </div>
              <div className="cw-transit-item">
                <div className="cw-transit-icon">
                  <i className="ph-bold ph-car" />
                </div>
                <div className="cw-transit-info">
                  <strong>DLF Cyber City & Golf Course Road, Gurugram</strong>
                  <span>20–25 Minutes Drive via NH-48 Express Corridor</span>
                </div>
                <span className="cw-transit-badge">20 Mins Drive</span>
              </div>
              <div className="cw-transit-item">
                <div className="cw-transit-icon">
                  <i className="ph-bold ph-fork-knife" />
                </div>
                <div className="cw-transit-info">
                  <strong>Aerocity Luxury Hospitality Cluster</strong>
                  <span>Pullman, Novotel, JW Marriott, Roseate House, Worldmark Gourmet Food Capital</span>
                </div>
                <span className="cw-transit-badge">Immediate Walk</span>
              </div>
            </div>
          </div>
          <div className="cw-centre-details-card">
            <div className="cw-centre-badge">
              <i className="ph-bold ph-shield-check" />
              V-DESK FLAGSHIP CENTRE
            </div>
            <h3 className="cw-centre-name">Worldmark Aerocity</h3>
            <p className="cw-centre-address">
              <i className="ph-bold ph-map-pin" />
              Level 7, Worldmark 4 and Level 7, Worldmark 6, Gateway District, Delhi Aerocity, New Delhi, Delhi 110037,
              India
            </p>
            <div className="cw-centre-meta-list">
              <div className="cw-meta-row">
                <span className="cw-meta-label">
                  <i className="ph-bold ph-calendar" />
                  Operating Hours:
                </span>
                <span className="cw-meta-val">
                  Mon – Fri: 08:30 – 18:00 | Sat: 08:30 – 13:00
                  <br />
                  <small style={{ color: '#DFB15B' }}>24/7 Access for Dedicated Desk & Private Cabin Members</small>
                </span>
              </div>
              <div className="cw-meta-row">
                <span className="cw-meta-label">
                  <i className="ph-bold ph-phone-call" />
                  Centre Telephone:
                </span>
                <span className="cw-meta-val">
                  <a href="tel:+911161289000">+91 11 6128 9000</a>
                </span>
              </div>
              <div className="cw-meta-row">
                <span className="cw-meta-label">
                  <i className="ph-bold ph-envelope" />
                  Concierge Desk:
                </span>
                <span className="cw-meta-val">
                  <a href="mailto:aerocity@vdeskworkspace.com">aerocity@vdeskworkspace.com</a>
                </span>
              </div>
            </div>
            <div className="cw-centre-actions">
              <button className="btn btn--gold btn--full" onClick={() => prefillCwTour('Private Serviced Office')}>
                <i className="ph-bold ph-calendar-check" />
                Schedule Centre Walkthrough
              </button>
              <a
                href="https://maps.google.com/?q=Worldmark+Aerocity+New+Delhi"
                target="_blank"
                rel="noopener"
                className="btn btn--outline btn--full"
              >
                <i className="ph-bold ph-arrow-square-out" />
                Open in Google Maps
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
