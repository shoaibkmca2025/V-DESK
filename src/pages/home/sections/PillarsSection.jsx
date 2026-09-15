import { Link } from 'react-router';
import { rawStyle } from '@/lib/domRefs.js';

/** SECTION 03 — 4-PILLAR COMMERCIAL INFRASTRUCTURE ECOSYSTEM */
export default function PillarsSection() {
  return (
    <section className="home-pillars-section" id="pillarsSection">
      <div className="container">
        <div className="section__header section__header--center">
          <span className="hero-badge-pill" style={{ marginBottom: '12px' }}>
            <i className="ph-bold ph-squares-four" />
            Complete Workspace Ecosystem
          </span>
          <h2 className="section__title" ref={rawStyle('color: #FFFFFF !important;')}>
            FOUR INTEGRATED PILLARS <br />
            <span className="highlight-gold">BUILT TO SCALE YOUR BUSINESS</span>
          </h2>
          <p className="section__desc" ref={rawStyle('color: #CBD5E1 !important;')}>
            From legal incorporation and GST registration to executive day-to-day operations and high-stakes boardroom
            meetings across India's top CBDs.
          </p>
        </div>
        <div className="home-pillars-grid">
          <div className="pillar-card">
            <div className="pillar-icon-wrap">
              <i className="ph-bold ph-buildings" />
            </div>
            <span className="pillar-badge">100% Tax & MCA Compliant</span>
            <h3 className="pillar-title">Virtual Office Platform</h3>
            <p className="pillar-desc">
              Prestigious Grade-A business address for GST & MCA registration with notarized lease, landlord NOC, and
              utility bills in 24 hours.
            </p>
            <ul className="pillar-features-list">
              <li>
                <i className="ph-bold ph-check-circle" />
                GST PPOB & APOB Registration
              </li>
              <li>
                <i className="ph-bold ph-check-circle" />
                MCA SPICe+ RoC Compliance
              </li>
              <li>
                <i className="ph-bold ph-check-circle" />
                Physical Signboard Installed
              </li>
              <li>
                <i className="ph-bold ph-check-circle" />
                Daily Mail & WhatsApp Alerts
              </li>
            </ul>
            <div className="pillar-card-footer">
              <div>
                <span className="pillar-price-label">Starting From</span>
                <span className="pillar-price-value">
                  ₹999 <small style={{ fontSize: '0.72rem', color: '#94A3B8' }}>/ mo</small>
                </span>
              </div>
              <Link to="/virtual-office" className="btn btn--gold btn--sm">
                Explore →
              </Link>
            </div>
          </div>
          <div className="pillar-card">
            <div className="pillar-icon-wrap">
              <i className="ph-bold ph-laptop" />
            </div>
            <span className="pillar-badge">Flexible Workspaces</span>
            <h3 className="pillar-title">Coworking & Cabins</h3>
            <p className="pillar-desc">
              Executive workspaces engineered with Herman Miller ergonomics, 500 Mbps redundant fiber mesh, and 24/7
              keyless access in prime hubs.
            </p>
            <ul className="pillar-features-list">
              <li>
                <i className="ph-bold ph-check-circle" />
                Day Passes & Dedicated Desks
              </li>
              <li>
                <i className="ph-bold ph-check-circle" />
                Soundproof Private Cabins
              </li>
              <li>
                <i className="ph-bold ph-check-circle" />
                Worldmark Aerocity & BKC
              </li>
              <li>
                <i className="ph-bold ph-check-circle" />
                100% Zero Security Deposit
              </li>
            </ul>
            <div className="pillar-card-footer">
              <div>
                <span className="pillar-price-label">Starting From</span>
                <span className="pillar-price-value">
                  ₹299 <small style={{ fontSize: '0.72rem', color: '#94A3B8' }}>/ day</small>
                </span>
              </div>
              <Link to="/coworking-spaces" className="btn btn--gold btn--sm">
                Explore →
              </Link>
            </div>
          </div>
          <div className="pillar-card">
            <div className="pillar-icon-wrap">
              <i className="ph-bold ph-presentation" />
            </div>
            <span className="pillar-badge">On-Demand Suites</span>
            <h3 className="pillar-title">4K Executive Boardrooms</h3>
            <p className="pillar-desc">
              Host client pitches and shareholder reviews in acoustic double-glazed boardrooms equipped with Zoom/Teams
              4K wireless presentation screens.
            </p>
            <ul className="pillar-features-list">
              <li>
                <i className="ph-bold ph-check-circle" />
                Cisco & Polycom 4K AV Suites
              </li>
              <li>
                <i className="ph-bold ph-check-circle" />
                Huddle, Conference & Boardrooms
              </li>
              <li>
                <i className="ph-bold ph-check-circle" />
                15-Minute Instant Hold Guarantee
              </li>
              <li>
                <i className="ph-bold ph-check-circle" />
                Gourmet Barista & Catering
              </li>
            </ul>
            <div className="pillar-card-footer">
              <div>
                <span className="pillar-price-label">Starting From</span>
                <span className="pillar-price-value">
                  ₹499 <small style={{ fontSize: '0.72rem', color: '#94A3B8' }}>/ hr</small>
                </span>
              </div>
              <Link to="/meeting-rooms" className="btn btn--gold btn--sm">
                Reserve →
              </Link>
            </div>
          </div>
          <div className="pillar-card">
            <div className="pillar-icon-wrap">
              <i className="ph-bold ph-certificate" />
            </div>
            <span className="pillar-badge">Legal & Advisory</span>
            <h3 className="pillar-title">Company Registration</h3>
            <p className="pillar-desc">
              Fast-track Pvt Ltd, LLP, and OPC incorporation under official MCA guidelines, bundled with 1-year premium
              virtual office address.
            </p>
            <ul className="pillar-features-list">
              <li>
                <i className="ph-bold ph-check-circle" />
                SPICe+ MCA Government Filing
              </li>
              <li>
                <i className="ph-bold ph-check-circle" />2 DSCs + 2 DINs + PAN/TAN
              </li>
              <li>
                <i className="ph-bold ph-check-circle" />
                Bundled 1-Yr Virtual Office
              </li>
              <li>
                <i className="ph-bold ph-check-circle" />
                100% Government Approval
              </li>
            </ul>
            <div className="pillar-card-footer">
              <div>
                <span className="pillar-price-label">Incorporation Package</span>
                <span className="pillar-price-value">
                  ₹5,499 <small style={{ fontSize: '0.72rem', color: '#94A3B8' }}>one-time</small>
                </span>
              </div>
              <Link to="/company-registration" className="btn btn--gold btn--sm">
                Incorporate →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
