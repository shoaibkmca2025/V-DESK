import { handleMrReserveCardSubmit } from '@/features/leads/leadForms.js';
import { openMeetingBookingModal } from '@/features/meetingRooms/roomBooking.js';

/** HERO SECTION (OBSIDIAN-NAVY & CHAMPAGNE-GOLD SPLIT HERO) */
export default function MeetingRoomsHero() {
  return (
    <section className="section mr-hero-split" id="mrHero">
      <div className="container">
        <div className="mr-hero-grid">
          <div className="hero-content-col">
            <div className="hero-badge-pill">
              <i className="ph-bold ph-presentation" />
              <span>On-Demand Hourly & Daily Suites • 15-Min Instant Hold</span>
            </div>
            <h1 className="hero-luxury-title">
              Reserve 4K Meeting Rooms <br />
              <span className="highlight-gold">& Executive Boardrooms</span>
            </h1>
            <p className="hero-luxury-desc">
              Host mission-critical client pitches, shareholder reviews, and executive strategy sessions in soundproof,
              acoustic double-glazed suites equipped with Cisco/Poly 4K video conferencing, dual presentation displays,
              and gourmet barista catering.
            </p>
            <div className="hero-stats-quad">
              <div className="hero-stat-box">
                <strong>8+ Layouts</strong>
                <span>4 to 24 Pax Suites</span>
              </div>
              <div className="hero-stat-box">
                <strong>Cisco & Poly</strong>
                <span>4K Ultra-HD AV</span>
              </div>
              <div className="hero-stat-box">
                <strong>15-Min Hold</strong>
                <span>Instant Availability</span>
              </div>
              <div className="hero-stat-box">
                <strong>Barista Cafe</strong>
                <span>Concierge Catering</span>
              </div>
            </div>
            <div className="hero-trust-grid">
              <div className="hero-trust-badge">
                <i className="ph-bold ph-check-circle" />
                <span>Acoustic STC 50+ Double-Glazing</span>
              </div>
              <div className="hero-trust-badge">
                <i className="ph-bold ph-check-circle" />
                <span>Wireless Apple AirPlay & Miracast</span>
              </div>
              <div className="hero-trust-badge">
                <i className="ph-bold ph-check-circle" />
                <span>Dedicated On-Site IT Engineering</span>
              </div>
              <div className="hero-trust-badge">
                <i className="ph-bold ph-check-circle" />
                <span>Redundant 500 Mbps Dual-Loop Wi-Fi</span>
              </div>
            </div>
            <div className="hero-action-buttons">
              <a href="#mrReserveCard" className="btn btn--gold btn--lg">
                <i className="ph-bold ph-calendar-check" />
                Reserve a Suite →
              </a>
              <a href="#scheduler" className="btn btn--outline btn--lg">
                <i className="ph-bold ph-clock" />
                Live Rate Calculator
              </a>
              <button type="button" className="btn btn--glass btn--lg" onClick={() => openMeetingBookingModal()}>
                <i className="ph-bold ph-ticket" />
                Instant Booking Pass
              </button>
            </div>
          </div>
          <div className="hero-form-col">
            <div className="hero-lead-card" id="mrReserveCard">
              <div className="hero-card-ribbon">
                <i className="ph-bold ph-lightning" /> 15-MIN HOLD
              </div>
              <div className="hero-card-header">
                <h3>
                  <i className="ph-bold ph-presentation" />
                  Instant Room Hold
                </h3>
                <p>Select your hub, calibre, and duration for immediate reservation confirmation</p>
              </div>
              <form
                id="mrReserveForm"
                className="hero-lead-form"
                onSubmit={(event) => handleMrReserveCardSubmit(event)}
              >
                <div className="form-group">
                  <label htmlFor="mrHeroName">Your Name *</label>
                  <input
                    type="text"
                    id="mrHeroName"
                    className="form-control"
                    placeholder="e.g. Vikramaditya Roy"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="mrHeroPhone">Mobile / WhatsApp *</label>
                  <input
                    type="tel"
                    id="mrHeroPhone"
                    className="form-control"
                    placeholder="10-digit mobile number"
                    pattern={'[0-9]{10}'}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="mrHeroCity">Select City / Commercial Hub *</label>
                  <select id="mrHeroCity" className="form-control" required>
                    <option value="Delhi - Connaught Place">Delhi — Connaught Place (Regal Tower)</option>
                    <option value="Delhi - Aerocity">Delhi — Worldmark Aerocity</option>
                    <option value="Mumbai - BKC">Mumbai — Bandra Kurla Complex (One BKC)</option>
                    <option value="Bangalore - Koramangala">Bangalore — Koramangala Tech Hub</option>
                    <option value="Gurgaon - Cyber City">Gurgaon — DLF Cyber City Building 10</option>
                    <option value="Nashik - College Road HQ">Nashik — College Road Flagship HQ</option>
                    <option value="Pune - Baner">Pune — Baner Business Park</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="mrHeroType">Room Category & Calibre *</label>
                  <select id="mrHeroType" className="form-control" required defaultValue="Conference Room (8 Pax)">
                    <option value="Huddle Room (4 Pax)">Huddle Room (4 Pax) — ₹499/hr</option>
                    <option value="Conference Room (8 Pax)">Conference Room (8 Pax) — ₹799/hr</option>
                    <option value="Executive Boardroom (12 Pax)">Executive Boardroom (12 Pax) — ₹1,199/hr</option>
                    <option value="VIP Training Hall (24 Pax)">VIP Training Hall (24 Pax) — ₹1,999/hr</option>
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label htmlFor="mrHeroDate">Date *</label>
                    <input type="date" id="mrHeroDate" className="form-control" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="mrHeroDuration">Duration *</label>
                    <select id="mrHeroDuration" className="form-control" required defaultValue="2 Hours">
                      <option value="1 Hour">1 Hour</option>
                      <option value="2 Hours">2 Hours (Standard)</option>
                      <option value="4 Hours">4 Hours (Half Day)</option>
                      <option value="8 Hours">8 Hours (Full Day)</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn btn--gold btn--full"
                  style={{ padding: '13px', fontWeight: '700', marginTop: '6px' }}
                >
                  <i className="ph-bold ph-ticket" />
                  Hold Room Slot (15-Min Guarantee) →
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
