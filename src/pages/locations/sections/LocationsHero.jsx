import { handleLocInquirySubmit } from '@/features/leads/leadForms.js';
import { jumpToMetro } from '@/features/locations/locationExplorer.js';
import { openQuoteModal } from '@/features/quote/quoteModal.js';

/** HERO SECTION (OBSIDIAN-NAVY & CHAMPAGNE-GOLD SPLIT HERO) */
export default function LocationsHero() {
  return (
    <section className="section loc-hero-split" id="locHero">
      <div className="container">
        <div className="loc-hero-grid">
          <div className="hero-content-col">
            <div className="hero-badge-pill">
              <i className="ph-bold ph-globe-hemisphere-east" />
              <span>National Commercial Real Estate Footprint • 10+ Metros</span>
            </div>
            <h1 className="hero-luxury-title">
              50+ Grade-A Commercial Towers <br />
              <span className="highlight-gold">Across 10 Major Indian Metros</span>
            </h1>
            <p className="hero-luxury-desc">
              Establish a prestigious corporate presence in India's top financial, tech, and administrative capitals.
              Sovereign ownership, 100% GST and MCA approval guarantee, and same-day commercial lease issuance.
            </p>
            <div className="hero-stats-quad">
              <div className="hero-stat-box">
                <strong>50+ Towers</strong>
                <span>Prime CBD Hubs</span>
              </div>
              <div className="hero-stat-box">
                <strong>10+ Metros</strong>
                <span>Pan-India Network</span>
              </div>
              <div className="hero-stat-box">
                <strong>100%</strong>
                <span>Tax & RoC Approval</span>
              </div>
              <div className="hero-stat-box">
                <strong>{'< 24 Hrs'}</strong>
                <span>Lease Turnaround</span>
              </div>
            </div>
            <div className="hero-trust-grid">
              <div className="hero-trust-badge">
                <i className="ph-bold ph-check-circle" />
                <span>RERA & Municipal Approved Buildings</span>
              </div>
              <div className="hero-trust-badge">
                <i className="ph-bold ph-check-circle" />
                <span>Physical Corporate Signboard On-Site</span>
              </div>
              <div className="hero-trust-badge">
                <i className="ph-bold ph-check-circle" />
                <span>4K Conference Rooms in Every Centre</span>
              </div>
              <div className="hero-trust-badge">
                <i className="ph-bold ph-check-circle" />
                <span>Inter-City Roaming Access Pass</span>
              </div>
            </div>
            <div className="hero-action-buttons">
              <a href="#locLeadCard" className="btn btn--gold btn--lg">
                <i className="ph-bold ph-paper-plane-tilt" />
                Request Hub Proposal →
              </a>
              <a href="#metroGrid" className="btn btn--outline btn--lg">
                <i className="ph-bold ph-buildings" />
                Browse All Towers
              </a>
              <button
                type="button"
                className="btn btn--glass btn--lg"
                onClick={() => openQuoteModal('Custom Multi-City Expansion')}
              >
                <i className="ph-bold ph-file-text" />
                Multi-City RFP
              </button>
            </div>
            <div
              className="city-hopper-chips"
              style={{ marginTop: '22px', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}
            >
              <span style={{ fontSize: '0.8rem', color: '#DFB15B', fontWeight: '700' }}>
                <i className="ph-bold ph-map-pin" /> Jump To:
              </span>
              <button type="button" className="btn btn--glass btn--sm" onClick={() => jumpToMetro('loc_nsk')}>
                Nashik HQ
              </button>
              <button type="button" className="btn btn--glass btn--sm" onClick={() => jumpToMetro('loc_mum')}>
                Mumbai BKC
              </button>
              <button type="button" className="btn btn--glass btn--sm" onClick={() => jumpToMetro('loc_del')}>
                Delhi CP
              </button>
              <button type="button" className="btn btn--glass btn--sm" onClick={() => jumpToMetro('loc_blr')}>
                Bangalore
              </button>
              <button type="button" className="btn btn--glass btn--sm" onClick={() => jumpToMetro('loc_pne')}>
                Pune
              </button>
              <button type="button" className="btn btn--glass btn--sm" onClick={() => jumpToMetro('loc_hyd')}>
                Hyderabad
              </button>
            </div>
          </div>
          <div className="hero-form-col">
            <div className="hero-lead-card" id="locLeadCard">
              <div className="hero-card-ribbon">
                <i className="ph-bold ph-lightning" /> PAN-INDIA SLA
              </div>
              <div className="hero-card-header">
                <h3>
                  <i className="ph-bold ph-buildings" />
                  Hub Proposal & Pricing
                </h3>
                <p>Select your commercial market and get verified tower inventory details in 15 minutes</p>
              </div>
              <form id="locLeadForm" className="hero-lead-form" onSubmit={(event) => handleLocInquirySubmit(event)}>
                <div className="form-group">
                  <label htmlFor="locHeroName">Full Name *</label>
                  <input
                    type="text"
                    id="locHeroName"
                    className="form-control"
                    placeholder="e.g. Vikramaditya Roy"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="locHeroPhone">Mobile / WhatsApp *</label>
                  <input
                    type="tel"
                    id="locHeroPhone"
                    className="form-control"
                    placeholder="10-digit mobile number"
                    pattern={'[0-9]{10}'}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="locHeroCity">Target Metro / Micro-Market *</label>
                  <select id="locHeroCity" className="form-control" required>
                    <option value="Delhi - Connaught Place">Delhi — Connaught Place</option>
                    <option value="Delhi - Worldmark Aerocity">Delhi — Worldmark Aerocity</option>
                    <option value="Mumbai - BKC">Mumbai — Bandra Kurla Complex (BKC)</option>
                    <option value="Mumbai - Andheri East">Mumbai — Andheri East Business Bay</option>
                    <option value="Bangalore - Koramangala">Bangalore — Koramangala Tech Park</option>
                    <option value="Gurgaon - Cyber City">Gurgaon — DLF Cyber City</option>
                    <option value="Nashik - College Road HQ">Nashik — College Road Flagship HQ</option>
                    <option value="Pune - Baner">Pune — Baner Business Park</option>
                    <option value="Hyderabad - HITEC City">Hyderabad — HITEC City</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="locHeroService">Workspace Requirement *</label>
                  <select id="locHeroService" className="form-control" required>
                    <option value="Virtual Office (GST/MCA)">Virtual Office (GST & MCA Registration)</option>
                    <option value="Coworking Dedicated Desks">Coworking Dedicated Desks</option>
                    <option value="Private Executive Cabin">Private Executive Cabin (4-20 Seats)</option>
                    <option value="4K Boardroom Access">Hourly 4K Meeting Room Pack</option>
                    <option value="Multi-City Corporate Expansion">Multi-City Corporate Expansion</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="btn btn--gold btn--full"
                  style={{ padding: '13px', fontWeight: '700', marginTop: '6px' }}
                >
                  <i className="ph-bold ph-paper-plane-tilt" />
                  Get Verified Tower Proposal →
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
