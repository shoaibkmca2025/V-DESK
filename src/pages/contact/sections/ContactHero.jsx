import { handleContactAdvisorySubmit } from '@/features/leads/leadForms.js';

/** HERO SECTION (OBSIDIAN-NAVY & CHAMPAGNE-GOLD SPLIT HERO) */
export default function ContactHero() {
  return (
    <section className="section contact-hero-split" id="contactHero">
      <div className="container">
        <div className="contact-hero-grid">
          <div className="hero-content-col">
            <div className="hero-badge-pill">
              <i className="ph-bold ph-headset" />
              <span>Dedicated Enterprise Concierge • Senior CA On Duty</span>
            </div>
            <h1 className="hero-luxury-title">
              Let's Build Your <br />
              <span className="highlight-gold">Commercial Infrastructure</span>
            </h1>
            <p className="hero-luxury-desc">
              Connect directly with our commercial strategists and corporate chartered accountants. Same-day agreement
              issuance, verified landlord NOCs, and seamless Pan-India expansion for fast-scaling startups and
              enterprises.
            </p>
            <div className="hero-stats-quad">
              <div className="hero-stat-box">
                <strong>15-Min SLA</strong>
                <span>Direct Callback</span>
              </div>
              <div className="hero-stat-box">
                <strong>Senior CA</strong>
                <span>On-Duty Desk</span>
              </div>
              <div className="hero-stat-box">
                <strong>10+ Metros</strong>
                <span>National Support</span>
              </div>
              <div className="hero-stat-box">
                <strong>100% Tax</strong>
                <span>Direct GST Credits</span>
              </div>
            </div>
            <div className="hero-trust-grid">
              <div className="hero-trust-badge">
                <i className="ph-bold ph-check-circle" />
                <span>Direct Hotline: +91 98765 43210</span>
              </div>
              <div className="hero-trust-badge">
                <i className="ph-bold ph-check-circle" />
                <span>24/7 Verified WhatsApp Concierge</span>
              </div>
              <div className="hero-trust-badge">
                <i className="ph-bold ph-check-circle" />
                <span>Flagship Campus: College Road, Nashik</span>
              </div>
              <div className="hero-trust-badge">
                <i className="ph-bold ph-check-circle" />
                <span>Dedicated Account Director</span>
              </div>
            </div>
            <div className="hero-action-buttons">
              <a href="#contactAdvisoryCard" className="btn btn--gold btn--lg">
                <i className="ph-bold ph-paper-plane-tilt" />
                Request Advisory Proposal →
              </a>
              <a
                href="https://wa.me/919876543210?text=Hi%20V-DESK%20Advisory"
                target="_blank"
                rel="noopener"
                className="btn btn--outline btn--lg"
              >
                <i className="ph-bold ph-whatsapp-logo" />
                WhatsApp Concierge
              </a>
            </div>
          </div>
          <div className="hero-form-col">
            <div className="hero-lead-card" id="contactAdvisoryCard">
              <div className="hero-card-ribbon">
                <i className="ph-bold ph-lightning" /> VIP CONCIERGE
              </div>
              <div className="hero-card-header">
                <h3>
                  <i className="ph-bold ph-headset" />
                  Request Business Advisory
                </h3>
                <p>Submit your requirements for an immediate customized workspace proposal</p>
              </div>
              <form
                id="contactAdvisoryForm"
                className="hero-lead-form"
                onSubmit={(event) => handleContactAdvisorySubmit(event)}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label htmlFor="ctAdvName">Full Name *</label>
                    <input type="text" id="ctAdvName" className="form-control" placeholder="Arjun Mehta" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="ctAdvPhone">Mobile / WhatsApp *</label>
                    <input
                      type="tel"
                      id="ctAdvPhone"
                      className="form-control"
                      placeholder="10-digit number"
                      pattern={'[0-9]{10}'}
                      required
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label htmlFor="ctAdvEmail">Corporate Email *</label>
                    <input
                      type="email"
                      id="ctAdvEmail"
                      className="form-control"
                      placeholder="arjun@company.in"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="ctAdvCompany">Company Name</label>
                    <input type="text" id="ctAdvCompany" className="form-control" placeholder="Apex Dynamics LLP" />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label htmlFor="ctAdvService">Service Required *</label>
                    <select id="ctAdvService" className="form-control" required>
                      <option value="Virtual Office for GST">Virtual Office for GST</option>
                      <option value="Virtual Office for MCA">Virtual Office for MCA</option>
                      <option value="Coworking Dedicated Desks">Coworking Dedicated Desks</option>
                      <option value="Private Executive Cabin">Private Executive Cabin</option>
                      <option value="Meeting Room Reservation">Meeting Room Reservation</option>
                      <option value="Multi-City Enterprise">Multi-City Enterprise Pack</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="ctAdvCity">Target Metro *</label>
                    <select id="ctAdvCity" className="form-control" required>
                      <option value="Delhi NCR">Delhi NCR (Aerocity/CP)</option>
                      <option value="Mumbai">Mumbai (BKC/Andheri)</option>
                      <option value="Bengaluru">Bengaluru (Koramangala)</option>
                      <option value="Gurugram">Gurugram (Cyber City)</option>
                      <option value="Nashik HQ">Nashik (Flagship HQ)</option>
                      <option value="Pune">Pune (Baner)</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="ctAdvMessage">Notes / Requirements</label>
                  <input
                    type="text"
                    id="ctAdvMessage"
                    className="form-control"
                    placeholder="Timeline, team size, or custom needs..."
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn--gold btn--full"
                  style={{ padding: '13px', fontWeight: '700', marginTop: '6px' }}
                >
                  <i className="ph-bold ph-paper-plane-tilt" />
                  Dispatch Advisory Request →
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
