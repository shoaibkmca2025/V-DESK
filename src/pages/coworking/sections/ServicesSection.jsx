import { openCheckoutModal } from '@/features/checkout/checkout.js';
import { prefillCwTour } from '@/features/coworking/coworking.js';
import { navigateTo } from '@/lib/navigation.js';

/** 5 SIGNATURE WORKSPACE SOLUTIONS (TEC PRODUCT ARCHITECTURE) */
export default function ServicesSection() {
  return (
    <section className="section cw-services-section" id="cwServicesSection">
      <div className="container">
        <div className="section__header section__header--center">
          <span className="section__eyebrow">
            <i className="ph-bold ph-diamonds-four" />
            Signature Solutions
          </span>
          <h2 className="section__title">
            OUR SERVICES AT
            <br />
            <span className="highlight-gold">WORLDMARK AEROCITY & BEYOND</span>
          </h2>
          <p className="section__desc">
            From agile single-day passes to fully serviced bespoke corporate headquarters. Designed to fit your
            enterprise needs at every stage of growth.
          </p>
        </div>
        <div className="cw-services-grid">
          <div className="cw-service-card featured">
            <div className="cw-card-top-pill">ENTERPRISE GRADE</div>
            <div className="cw-service-icon-box">
              <i className="ph-bold ph-door" />
            </div>
            <h3 className="cw-service-title">Private Serviced Office</h3>
            <p className="cw-service-tagline">Move in and get started — your fully serviced executive suite awaits.</p>
            <div className="cw-service-price">
              <span className="cw-price-curr">From ₹11,999</span>{' '}
              <span className="cw-price-period">/ seat / month</span>
            </div>
            <ul className="cw-service-list">
              <li>
                <i className="ph-bold ph-check" />
                Soundproof acoustic walls & frosted branding
              </li>
              <li>
                <i className="ph-bold ph-check" />
                24/7 keyless access & Herman Miller chairs
              </li>
              <li>
                <i className="ph-bold ph-check" />
                Private VLAN, dedicated SSID & server rack rackspace
              </li>
              <li>
                <i className="ph-bold ph-check" />
                Daily executive housekeeping & sanitization
              </li>
              <li>
                <i className="ph-bold ph-check" />6 Hours complimentary boardroom credits / mo
              </li>
            </ul>
            <div className="cw-service-actions">
              <button className="btn btn--gold btn--full" onClick={() => prefillCwTour('Private Serviced Office')}>
                Request Quotation
              </button>
              <button className="btn btn--outline btn--full" onClick={() => prefillCwTour('Private Serviced Office')}>
                Book a Tour
              </button>
            </div>
          </div>
          <div className="cw-service-card">
            <div className="cw-card-top-pill gold">MOST POPULAR</div>
            <div className="cw-service-icon-box">
              <i className="ph-bold ph-laptop" />
            </div>
            <h3 className="cw-service-title">Hot Desk / Dedicated Desk</h3>
            <p className="cw-service-tagline">
              The infrastructure to work from anywhere with constant professional presence.
            </p>
            <div className="cw-service-price">
              <span className="cw-price-curr">From ₹6,999</span> <span className="cw-price-period">/ month</span>
            </div>
            <ul className="cw-service-list">
              <li>
                <i className="ph-bold ph-check" />
                Reserved fixed workstation with lockable pedestal
              </li>
              <li>
                <i className="ph-bold ph-check" />
                24/7 biometric keycard entry
              </li>
              <li>
                <i className="ph-bold ph-check" />
                500 Mbps redundant enterprise dual Wi-Fi
              </li>
              <li>
                <i className="ph-bold ph-check" />
                Unlimited fresh barista-crafted espresso & teas
              </li>
              <li>
                <i className="ph-bold ph-check" />2 Hours monthly boardroom credits
              </li>
            </ul>
            <div className="cw-service-actions">
              <button
                className="btn btn--gold btn--full"
                onClick={() =>
                  openCheckoutModal({ item: 'Dedicated Desk Monthly', amount: 6999, city: 'Delhi Aerocity' })
                }
              >
                Reserve Desk
              </button>
              <button className="btn btn--outline btn--full" onClick={() => prefillCwTour('Dedicated Workstation')}>
                View Plan Details
              </button>
            </div>
          </div>
          <div className="cw-service-card">
            <div className="cw-card-top-pill teal">ON-DEMAND</div>
            <div className="cw-service-icon-box">
              <i className="ph-bold ph-ticket" />
            </div>
            <h3 className="cw-service-title">Flexi Day Pass</h3>
            <p className="cw-service-tagline">
              Drop in and execute with instant access to lounges and high-speed desks.
            </p>
            <div className="cw-service-price">
              <span className="cw-price-curr">₹299</span> <span className="cw-price-period">/ full day</span>
            </div>
            <ul className="cw-service-list">
              <li>
                <i className="ph-bold ph-check" />
                Immediate access: 08:30 – 20:00
              </li>
              <li>
                <i className="ph-bold ph-check" />
                High-speed 500 Mbps guest Wi-Fi
              </li>
              <li>
                <i className="ph-bold ph-check" />
                Unlimited barista coffee & refreshments
              </li>
              <li>
                <i className="ph-bold ph-check" />
                Executive breakout lounges & phone booths
              </li>
              <li>
                <i className="ph-bold ph-check" />
                Printing & scanning credits included
              </li>
            </ul>
            <div className="cw-service-actions">
              <button
                className="btn btn--gold btn--full"
                onClick={() =>
                  openCheckoutModal({ item: 'Instant Drop-in Day Pass', amount: 299, city: 'Delhi Aerocity' })
                }
              >
                Instant Day Pass
              </button>
              <a href="#teamCalc" className="btn btn--outline btn--full">
                Calculate Team Pack
              </a>
            </div>
          </div>
          <div className="cw-service-card">
            <div className="cw-card-top-pill">ON-DEMAND HOURLY</div>
            <div className="cw-service-icon-box">
              <i className="ph-bold ph-presentation" />
            </div>
            <h3 className="cw-service-title">Meeting Room & Boardrooms</h3>
            <p className="cw-service-tagline">
              Acoustically treated corporate spaces engineered for seamless presentations.
            </p>
            <div className="cw-service-price">
              <span className="cw-price-curr">From ₹799</span> <span className="cw-price-period">/ hour</span>
            </div>
            <ul className="cw-service-list">
              <li>
                <i className="ph-bold ph-check" />
                4K dual display screens & Cisco/Polycom systems
              </li>
              <li>
                <i className="ph-bold ph-check" />
                Acoustic wall panelling & soundproof isolation
              </li>
              <li>
                <i className="ph-bold ph-check" />
                Digital whiteboards & wireless screen casting
              </li>
              <li>
                <i className="ph-bold ph-check" />
                Gourmet tea, coffee & water service served to guests
              </li>
              <li>
                <i className="ph-bold ph-check" />
                Capacities from 4-person huddle to 24-seat boardroom
              </li>
            </ul>
            <div className="cw-service-actions">
              <button className="btn btn--gold btn--full" onClick={() => navigateTo('/meeting-rooms')}>
                Book Room Online
              </button>
              <button className="btn btn--outline btn--full" onClick={() => prefillCwTour('Executive Boardroom')}>
                Inquire Package
              </button>
            </div>
          </div>
          <div className="cw-service-card">
            <div className="cw-card-top-pill gold">COMPLIANCE READY</div>
            <div className="cw-service-icon-box">
              <i className="ph-bold ph-buildings" />
            </div>
            <h3 className="cw-service-title">Business Concierge & Virtual Office</h3>
            <p className="cw-service-tagline">
              Establish an elite commercial presence with complete MCA & GST compliance.
            </p>
            <div className="cw-service-price">
              <span className="cw-price-curr">From ₹1,499</span> <span className="cw-price-period">/ month</span>
            </div>
            <ul className="cw-service-list">
              <li>
                <i className="ph-bold ph-check" />
                Worldmark Aerocity registered commercial address
              </li>
              <li>
                <i className="ph-bold ph-check" />
                100% Notarized rent agreement, NOC & electricity bill
              </li>
              <li>
                <i className="ph-bold ph-check" />
                Corporate receptionist to greet visitors and tax officers
              </li>
              <li>
                <i className="ph-bold ph-check" />
                Real-time WhatsApp mail alerts & forwarding
              </li>
              <li>
                <i className="ph-bold ph-check" />
                Access to executive lounges during business trips
              </li>
            </ul>
            <div className="cw-service-actions">
              <button className="btn btn--gold btn--full" onClick={() => navigateTo('/virtual-office')}>
                Get Virtual Setup
              </button>
              <button className="btn btn--outline btn--full" onClick={() => prefillCwTour('Business Concierge')}>
                Inquire Concierge
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
