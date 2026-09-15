import { openCommandPalette } from '@/features/commandPalette/commandPalette.js';
import { handleHomeHeroConsultSubmit } from '@/features/leads/leadForms.js';

/** SECTION 01 — HIGH-CONVERSION SPLIT HERO & LEAD CAPTURE ENGINE Obsidian-Navy & Champagne-Gold Theme */
export default function HeroSection() {
  return (
    <section className="section home-hero-split" id="home">
      <div className="container">
        <div className="home-hero-grid">
          <div className="hero-content-col">
            <div className="hero-badge-pill">
              <i className="ph-bold ph-shield-check" />
              <span>#1 Business Infrastructure Network • 100% Tax & MCA Approval</span>
            </div>
            <h1 className="hero-luxury-title">
              Your Business Deserves a <br />
              <span className="highlight-gold">Prestigious Commercial Address</span>
            </h1>
            <p className="hero-luxury-desc">
              Scale seamlessly across India with prime Grade-A Virtual Offices, executive Coworking Cabins, 4K
              Boardrooms, and Corporate Registration Advisory. Guaranteed documentation within 24 hours for GST, RoC,
              and bank compliance.
            </p>
            <div className="hero-stats-quad">
              <div className="hero-stat-box">
                <strong>10,000+</strong>
                <span>Clients Served</span>
              </div>
              <div className="hero-stat-box">
                <strong>50+</strong>
                <span>Grade-A Towers</span>
              </div>
              <div className="hero-stat-box">
                <strong>10+</strong>
                <span>Prime Metros</span>
              </div>
              <div className="hero-stat-box">
                <strong>100%</strong>
                <span>Approval Guarantee</span>
              </div>
            </div>
            <div className="hero-trust-grid">
              <div className="hero-trust-badge">
                <i className="ph-bold ph-check-circle" />
                <span>Zero Physical Inspection Rejections</span>
              </div>
              <div className="hero-trust-badge">
                <i className="ph-bold ph-check-circle" />
                <span>Physical Corporate Signboard Included</span>
              </div>
              <div className="hero-trust-badge">
                <i className="ph-bold ph-check-circle" />
                <span>Sub-24h Document Turnaround</span>
              </div>
              <div className="hero-trust-badge">
                <i className="ph-bold ph-check-circle" />
                <span>Zero Brokerage & No Hidden Fees</span>
              </div>
            </div>
            <div className="hero-action-buttons">
              <a href="#heroConsultCard" className="btn btn--gold btn--lg">
                <i className="ph-bold ph-paper-plane-tilt" />
                Get Instant Quote →
              </a>
              <a href="#pillarsSection" className="btn btn--outline btn--lg">
                <i className="ph-bold ph-squares-four" />
                Explore 4 Pillars
              </a>
              <button className="btn btn--glass btn--lg" onClick={() => openCommandPalette()}>
                <i className="ph-bold ph-magnifying-glass" />
                Search Cities
                <kbd
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    marginLeft: '4px',
                  }}
                >
                  Ctrl+K
                </kbd>
              </button>
            </div>
          </div>
          <div className="hero-form-col">
            <div className="hero-lead-card" id="heroConsultCard">
              <div className="hero-card-ribbon">
                <i className="ph-bold ph-lightning" /> 15-MIN SLA
              </div>
              <div className="hero-card-header">
                <h3>
                  <i className="ph-bold ph-file-text" />
                  Fast-Track Consultation
                </h3>
                <p>Receive an authorized commercial proposal and pricing quote in 15 minutes</p>
              </div>
              <form
                id="homeHeroConsultForm"
                className="hero-lead-form"
                onSubmit={(event) => handleHomeHeroConsultSubmit(event)}
              >
                <div className="form-group">
                  <label htmlFor="homeHeroName">Full Name *</label>
                  <input
                    type="text"
                    id="homeHeroName"
                    className="form-control"
                    placeholder="e.g. Vikramaditya Roy"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="homeHeroPhone">Mobile / WhatsApp Number *</label>
                  <input
                    type="tel"
                    id="homeHeroPhone"
                    className="form-control"
                    placeholder="10-digit mobile number"
                    pattern={'[0-9]{10}'}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="homeHeroEmail">Corporate Email *</label>
                  <input
                    type="email"
                    id="homeHeroEmail"
                    className="form-control"
                    placeholder="name@company.in"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="homeHeroService">Required Workspace Solution *</label>
                  <select id="homeHeroService" className="form-control" required>
                    <option value="Virtual Office Platform">Virtual Office for GST & MCA (PPOB / APOB)</option>
                    <option value="Coworking Spaces & Desks">Coworking Dedicated Desks & Cabins</option>
                    <option value="4K Meeting Rooms">4K Meeting Rooms & Boardrooms</option>
                    <option value="Company Registration Advisory">Company Incorporation (Pvt Ltd / LLP)</option>
                    <option value="Multi-City Enterprise Pack">Multi-City Enterprise Expansion</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="homeHeroCity">Target City / Micro-Market *</label>
                  <select id="homeHeroCity" className="form-control" required>
                    <option value="Delhi NCR">Delhi NCR (Aerocity, CP, South Delhi)</option>
                    <option value="Mumbai">Mumbai (BKC, Andheri, Lower Parel)</option>
                    <option value="Gurugram">Gurugram (DLF Cyber City, Golf Course Rd)</option>
                    <option value="Bengaluru">Bengaluru (Koramangala, Indiranagar, Whitefield)</option>
                    <option value="Nashik HQ">Nashik (College Road Flagship HQ)</option>
                    <option value="Pune">Pune (Baner, Kharadi, Viman Nagar)</option>
                    <option value="Hyderabad">Hyderabad (HITEC City, Madhapur)</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="btn btn--gold btn--full"
                  style={{ padding: '13px', fontWeight: '700', marginTop: '6px' }}
                >
                  <i className="ph-bold ph-paper-plane-tilt" />
                  Get Instant Workspace Quote →
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
