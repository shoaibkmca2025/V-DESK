import { handleVoHeroLeadSubmit } from '@/features/leads/leadForms.js';

/** 1. HIGH-CONVERSION SPLIT HERO (myHQ Reference Standard) */
export default function VirtualOfficeHero() {
  return (
    <section className="section vo-hero-split">
      <div className="container">
        <div className="vo-hero-grid">
          <div className="vo-hero-info">
            <div className="vo-hero-badge">
              <i className="ph-bold ph-shield-check" />
              #1 Virtual Office Network • 100% Approval Guarantee
            </div>
            <h1 className="vo-hero-title">
              Bring Your Business to Delhi & Pan-India with a{' '}
              <span className="highlight-gold">Premier Virtual Office</span>
            </h1>
            <p className="vo-hero-desc">
              Secure prestigious Grade-A commercial addresses in Connaught Place, South Delhi, Aerocity, Gurugram, and
              18+ metros. Get notarized rent agreement, owner NOC, and electricity bill within 24 hours for GST, MCA,
              and RoC registrations.
            </p>
            <div className="vo-hero-stats-row">
              <div className="vo-stat-box">
                <div className="vo-stat-num">10,000+</div>
                <div className="vo-stat-label">Clients Served</div>
              </div>
              <div className="vo-stat-box">
                <div className="vo-stat-num">{'< 24 Hrs'}</div>
                <div className="vo-stat-label">Doc Turnaround</div>
              </div>
              <div className="vo-stat-box">
                <div className="vo-stat-num">100%</div>
                <div className="vo-stat-label">Approval Guarantee</div>
              </div>
            </div>
            <div className="vo-hero-trust-list">
              <div className="vo-trust-item">
                <i className="ph-bold ph-check-circle" />
                <span>Zero Physical Inspection Rejections</span>
              </div>
              <div className="vo-trust-item">
                <i className="ph-bold ph-check-circle" />
                <span>Physical Name Board Included</span>
              </div>
              <div className="vo-trust-item">
                <i className="ph-bold ph-check-circle" />
                <span>Dedicated Mail & WhatsApp Alerts</span>
              </div>
              <div className="vo-trust-item">
                <i className="ph-bold ph-check-circle" />
                <span>Free Address Replacement Policy</span>
              </div>
            </div>
            <div className="vo-hero-btn-group">
              <a href="#voLeadCard" className="btn btn--primary btn--lg">
                <i className="ph-bold ph-lightning" />
                Get Instant Quote →
              </a>
              <a href="#voNeedsSection" className="btn btn--outline btn--lg">
                <i className="ph-bold ph-compass" />
                Explore Use Cases
              </a>
              <a href="#voConfigurator" className="btn btn--secondary btn--lg">
                <i className="ph-bold ph-sliders" />
                Modular Configurator
              </a>
            </div>
          </div>
          <div className="vo-hero-card" id="voLeadCard">
            <div className="vo-card-ribbon">Fast-Track SLA</div>
            <div className="vo-card-header">
              <h2 className="vo-card-title">
                <i className="ph-bold ph-file-text" />
                Instant Quote & Consultation
              </h2>
              <p className="vo-card-sub">Connect with an authorized Virtual Office specialist in 15 minutes</p>
            </div>
            <form id="voHeroLeadForm" onSubmit={(event) => handleVoHeroLeadSubmit(event)}>
              <div className="vo-form-group">
                <label className="vo-form-label" htmlFor="voHeroName">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="voHeroName"
                  className="vo-form-control"
                  placeholder="e.g. Vikramaditya Roy"
                  required
                />
              </div>
              <div className="vo-form-group">
                <label className="vo-form-label" htmlFor="voHeroPhone">
                  Mobile / WhatsApp Number *
                </label>
                <div className="vo-phone-input-wrap">
                  <span className="vo-phone-prefix">+91</span>
                  <input
                    type="tel"
                    id="voHeroPhone"
                    className="vo-form-control"
                    placeholder="10-digit mobile number"
                    pattern={'[0-9]{10}'}
                    required
                  />
                </div>
              </div>
              <div className="vo-form-group">
                <label className="vo-form-label" htmlFor="voHeroEmail">
                  Official Email *
                </label>
                <input
                  type="email"
                  id="voHeroEmail"
                  className="vo-form-control"
                  placeholder="name@company.com"
                  required
                />
              </div>
              <div className="vo-form-group">
                <label className="vo-form-label" htmlFor="voHeroPurpose">
                  Purpose of Virtual Office *
                </label>
                <select id="voHeroPurpose" className="vo-form-control" required>
                  <option value="GST Registration">GST Registration (PPOB / APOB)</option>
                  <option value="Company Incorporation">Company Incorporation (MCA / RoC / SPICe+)</option>
                  <option value="Business Address & Mailing">Business Address & Mailing Presence</option>
                  <option value="Multi-City Enterprise Pack">Multi-City Enterprise Pack (APOB Expansion)</option>
                </select>
              </div>
              <div className="vo-form-group">
                <label className="vo-form-label" htmlFor="voHeroCity">
                  Select Target City / Micro-Market *
                </label>
                <select id="voHeroCity" className="vo-form-control" required>
                  <option value="Delhi NCR">Delhi NCR (Connaught Place, South Delhi, Aerocity)</option>
                  <option value="Gurugram">Gurugram (Cyber City, Golf Course Road)</option>
                  <option value="Noida">Noida (Sector 62, Expressway)</option>
                  <option value="Mumbai">Mumbai (BKC, Andheri, Lower Parel)</option>
                  <option value="Bengaluru">Bengaluru (Koramangala, Indiranagar, Whitefield)</option>
                  <option value="Hyderabad">Hyderabad (HITEC City, Madhapur)</option>
                  <option value="Pune">Pune (Baner, Kharadi, Viman Nagar)</option>
                  <option value="Chennai">Chennai (OMR, Guindy, Anna Nagar)</option>
                  <option value="Kolkata">Kolkata (Salt Lake Sector V, Park Street)</option>
                  <option value="Other">Other Metro / Tier-2 City</option>
                </select>
              </div>
              <button type="submit" className="vo-form-submit-btn">
                <i className="ph-bold ph-paper-plane-tilt" />
                Get Guaranteed Best Quote Now →
              </button>
              <div className="vo-form-footer">
                <i className="ph-bold ph-lock-key" />
                100% Confidential • No Spam • Zero Brokerage Guarantee
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
