import { openCheckoutModal } from '@/features/checkout/checkout.js';
import { handleCwTourSubmit } from '@/features/leads/leadForms.js';

/** FLAGSHIP CENTRE HERO & TOUR INQUIRY ENGINE (TEC REFERENCE) */
export default function CoworkingHero() {
  return (
    <section className="section cw-tec-hero" id="cwHero">
      <div className="container">
        <div className="cw-hero-grid">
          <div className="cw-hero-content">
            <div className="cw-badge-pill">
              <i className="ph-bold ph-airplane-tilt" />
              <span>Flagship Executive Centre • Worldmark Aerocity</span>
            </div>
            <h1 className="cw-hero-title">
              Flexible Workspaces at <span className="highlight-gold">Worldmark Aerocity</span> & Across India's Prime
              CBDs
            </h1>
            <p className="cw-hero-desc">
              New Delhi's premier business hub for global enterprises, fast-scaling unicorns, and discerning
              professionals. Engineered with Herman Miller ergonomic furnishings, dual-loop redundant fiber IT
              infrastructure, dedicated on-site IT engineering, and seamless international airport transit.
            </p>
            <div className="cw-hero-stats-grid">
              <div className="cw-stat-card">
                <strong className="cw-stat-num">Level 7</strong>
                <span className="cw-stat-label">Worldmark 4 & 6</span>
              </div>
              <div className="cw-stat-card">
                <strong className="cw-stat-num">5 Mins</strong>
                <span className="cw-stat-label">To IGI Airport T3</span>
              </div>
              <div className="cw-stat-card">
                <strong className="cw-stat-num">8 Rooms</strong>
                <span className="cw-stat-label">4K AV Boardrooms</span>
              </div>
              <div className="cw-stat-card">
                <strong className="cw-stat-num">24/7</strong>
                <span className="cw-stat-label">Biometric Keyless Access</span>
              </div>
            </div>
            <div className="cw-trust-highlights">
              <div className="cw-trust-pill">
                <i className="ph-bold ph-check-circle" />
                Herman Miller Ergonomics
              </div>
              <div className="cw-trust-pill">
                <i className="ph-bold ph-check-circle" />
                Serviced Artisan Barista Cafe
              </div>
              <div className="cw-trust-pill">
                <i className="ph-bold ph-check-circle" />
                Dedicated On-Site IT Engineering
              </div>
              <div className="cw-trust-pill">
                <i className="ph-bold ph-check-circle" />
                100% Zero Security Deposit Terms
              </div>
            </div>
            <div className="cw-hero-cta-group">
              <a href="#cwTourCard" className="btn btn--gold btn--lg">
                <i className="ph-bold ph-calendar-check" />
                Schedule a Private Tour
              </a>
              <button
                className="btn btn--outline btn--lg"
                onClick={() =>
                  openCheckoutModal({ item: 'Instant Drop-in Day Pass', amount: 299, city: 'Delhi Aerocity' })
                }
              >
                <i className="ph-bold ph-ticket" />
                Instant Day Pass ₹299
              </button>
            </div>
          </div>
          <div className="cw-hero-form-col">
            <div className="cw-tour-card" id="cwTourCard">
              <div className="cw-card-ribbon">
                <i className="ph-bold ph-sparkle" /> 15-MIN CONCIERGE SLA
              </div>
              <div className="cw-card-header">
                <h3 className="cw-card-title">
                  <i className="ph-bold ph-calendar-star" />
                  Schedule a Private Tour
                </h3>
                <p className="cw-card-sub">
                  Experience Worldmark Aerocity in person. Receive an immediate customized team quotation.
                </p>
              </div>
              <form id="cwTourForm" onSubmit={(event) => handleCwTourSubmit(event)}>
                <div className="cw-form-group">
                  <label htmlFor="cwName" className="cw-form-label">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="cwName"
                    className="cw-form-control"
                    placeholder="e.g. Vikramaditya Roy"
                    required
                  />
                </div>
                <div className="cw-form-group">
                  <label htmlFor="cwPhone" className="cw-form-label">
                    Mobile / WhatsApp Number *
                  </label>
                  <div className="cw-phone-input-wrap">
                    <span className="cw-phone-prefix">+91</span>
                    <input
                      type="tel"
                      id="cwPhone"
                      className="cw-form-control"
                      placeholder="10-digit mobile number"
                      pattern={'[6-9][0-9]{9}'}
                      required
                    />
                  </div>
                </div>
                <div className="cw-form-group">
                  <label htmlFor="cwEmail" className="cw-form-label">
                    Official Work Email *
                  </label>
                  <input
                    type="email"
                    id="cwEmail"
                    className="cw-form-control"
                    placeholder="name@company.com"
                    required
                  />
                </div>
                <div className="cw-form-row">
                  <div className="cw-form-group" style={{ flex: '1' }}>
                    <label htmlFor="cwSolution" className="cw-form-label">
                      Workspace Solution *
                    </label>
                    <select id="cwSolution" className="cw-form-control" required>
                      <option value="Private Serviced Office">Private Serviced Office</option>
                      <option value="Dedicated Workstation">Dedicated Workstation</option>
                      <option value="Hot Desk / Flexi Day Pass">Hot Desk / Flexi Day Pass</option>
                      <option value="Enterprise Custom Suite">Enterprise Custom Suite (20+ Pax)</option>
                      <option value="Executive Boardroom">Executive Boardroom (Hourly)</option>
                    </select>
                  </div>
                  <div className="cw-form-group" style={{ flex: '1' }}>
                    <label htmlFor="cwTeamSize" className="cw-form-label">
                      Team Size *
                    </label>
                    <select id="cwTeamSize" className="cw-form-control" required>
                      <option value="1 Person (Solo / Flexi)">1 Person (Solo / Flexi)</option>
                      <option value="2-5 Members (Startup Team)">2-5 Members (Startup Team)</option>
                      <option value="6-15 Members (Growth Team)">6-15 Members (Growth Team)</option>
                      <option value="16-50 Members (Enterprise Wing)">16-50 Members (Enterprise Wing)</option>
                      <option value="50+ Members (Dedicated Floor)">50+ Members (Dedicated Floor)</option>
                    </select>
                  </div>
                </div>
                <div className="cw-form-group">
                  <label htmlFor="cwDate" className="cw-form-label">
                    Preferred Tour Date *
                  </label>
                  <input type="date" id="cwDate" className="cw-form-control" required />
                </div>
                <button type="submit" className="btn btn--gold btn--full cw-submit-btn">
                  <i className="ph-bold ph-check-circle" />
                  Confirm Tour & Fast-Track Quote
                </button>
                <div className="cw-form-footer">
                  <i className="ph-bold ph-headset" /> Direct Concierge Desk:{' '}
                  <a href="tel:+911161289000">+91 11 6128 9000</a> • Mon–Sat 08:30–18:00
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
