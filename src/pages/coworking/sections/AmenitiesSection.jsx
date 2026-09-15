import { filterCwAmenities } from '@/features/coworking/coworking.js';

/** 16+ WORLD-CLASS AMENITIES (TEC AMENITIES MATRIX) */
export default function AmenitiesSection() {
  return (
    <section className="section cw-amenities-section" id="cwAmenitiesSection">
      <div className="container">
        <div className="section__header section__header--center">
          <span className="section__eyebrow">
            <i className="ph-bold ph-star" />
            Executive Specifications
          </span>
          <h2 className="section__title">
            WORLD-CLASS AMENITIES
            <br />
            <span className="highlight-gold">CURATED FOR PEAK PERFORMANCE</span>
          </h2>
          <p className="section__desc">
            Every detail at Worldmark Aerocity is engineered to elevate productivity, foster collaboration, and reflect
            corporate prestige.
          </p>
        </div>
        <div className="cw-amenities-filters">
          <button
            type="button"
            className="cw-filter-pill active"
            onClick={(event) => filterCwAmenities('all', event.currentTarget)}
          >
            All Amenities (16)
          </button>
          <button
            type="button"
            className="cw-filter-pill"
            onClick={(event) => filterCwAmenities('tech', event.currentTarget)}
          >
            Technology & Security
          </button>
          <button
            type="button"
            className="cw-filter-pill"
            onClick={(event) => filterCwAmenities('comfort', event.currentTarget)}
          >
            Ergonomics & Comfort
          </button>
          <button
            type="button"
            className="cw-filter-pill"
            onClick={(event) => filterCwAmenities('hospitality', event.currentTarget)}
          >
            Hospitality & Wellness
          </button>
          <button
            type="button"
            className="cw-filter-pill"
            onClick={(event) => filterCwAmenities('business', event.currentTarget)}
          >
            Business Support
          </button>
        </div>
        <div className="cw-amenities-grid" id="cwAmenitiesGrid">
          <div className="cw-amenity-card" data-category="comfort">
            <div className="cw-amenity-icon">
              <i className="ph-bold ph-armchair" />
            </div>
            <h4>Herman Miller Ergonomics</h4>
            <p>Aeron & Mirra 2 lumbar-support seating with pneumatic height and tilt adjustments.</p>
          </div>
          <div className="cw-amenity-card" data-category="comfort">
            <div className="cw-amenity-icon">
              <i className="ph-bold ph-arrows-down-up" />
            </div>
            <h4>Adjustable Standing Desks</h4>
            <p>Motorized height-adjustable sit-to-stand executive desks for dynamic focus.</p>
          </div>
          <div className="cw-amenity-card" data-category="hospitality">
            <div className="cw-amenity-icon">
              <i className="ph-bold ph-coffee" />
            </div>
            <h4>Serviced Barista Cafe</h4>
            <p>Freshly brewed artisanal espresso, single-origin pour-overs, and fine organic teas.</p>
          </div>
          <div className="cw-amenity-card" data-category="business">
            <div className="cw-amenity-icon">
              <i className="ph-bold ph-presentation" />
            </div>
            <h4>8 Executive Boardrooms</h4>
            <p>Acoustically isolated conference rooms with dual 4K Cisco/Poly video endpoints.</p>
          </div>
          <div className="cw-amenity-card" data-category="comfort">
            <div className="cw-amenity-icon">
              <i className="ph-bold ph-phone-call" />
            </div>
            <h4>Soundproof Phone Booths</h4>
            <p>Private acoustic pods for confidential client calls and Zoom video conferences.</p>
          </div>
          <div className="cw-amenity-card" data-category="tech">
            <div className="cw-amenity-icon">
              <i className="ph-bold ph-wifi-high" />
            </div>
            <h4>Dual 500 Mbps Redundant Wi-Fi</h4>
            <p>Enterprise dual-loop optical fiber pipelines with 99.99% uptime guarantee.</p>
          </div>
          <div className="cw-amenity-card" data-category="comfort">
            <div className="cw-amenity-icon">
              <i className="ph-bold ph-book-open" />
            </div>
            <h4>Coworking Silent Library</h4>
            <p>Dedicated distraction-free study zone engineered for deep creative focus.</p>
          </div>
          <div className="cw-amenity-card" data-category="tech">
            <div className="cw-amenity-icon">
              <i className="ph-bold ph-wrench" />
            </div>
            <h4>Dedicated On-Site IT Team</h4>
            <p>In-house network engineers on-site for immediate hardware and connectivity support.</p>
          </div>
          <div className="cw-amenity-card" data-category="business">
            <div className="cw-amenity-icon">
              <i className="ph-bold ph-airplane" />
            </div>
            <h4>Airport Transfer Concierge</h4>
            <p>Chauffeur assistance and instant 5-minute express transit to IGI Airport terminals.</p>
          </div>
          <div className="cw-amenity-card" data-category="hospitality">
            <div className="cw-amenity-icon">
              <i className="ph-bold ph-barbell" />
            </div>
            <h4>Gym & Wellness Rooms</h4>
            <p>Full fitness studio access, relaxation pods, and dedicated mother's nursing rooms.</p>
          </div>
          <div className="cw-amenity-card" data-category="tech">
            <div className="cw-amenity-icon">
              <i className="ph-bold ph-lock-key" />
            </div>
            <h4>Keyless Smart Locking</h4>
            <p>Biometric fingerprint scanners and encrypted RFID smartphone credential access.</p>
          </div>
          <div className="cw-amenity-card" data-category="tech">
            <div className="cw-amenity-icon">
              <i className="ph-bold ph-hard-drives" />
            </div>
            <h4>Mini Data Centres</h4>
            <p>Tier-3 server rack colocation with climate control and backup power generators.</p>
          </div>
          <div className="cw-amenity-card" data-category="hospitality">
            <div className="cw-amenity-icon">
              <i className="ph-bold ph-sparkle" />
            </div>
            <h4>5-Star Housekeeping</h4>
            <p>Continuous professional sanitization, desk upkeep, and hospitality service.</p>
          </div>
          <div className="cw-amenity-card" data-category="hospitality">
            <div className="cw-amenity-icon">
              <i className="ph-bold ph-users-three" />
            </div>
            <h4>Community & Networking Events</h4>
            <p>Exclusive executive mixers, founder roundtables, and cross-industry forums.</p>
          </div>
          <div className="cw-amenity-card" data-category="business">
            <div className="cw-amenity-icon">
              <i className="ph-bold ph-user-circle" />
            </div>
            <h4>Business Concierge Support</h4>
            <p>Professional front desk receptionists to greet visitors and manage guest sign-ins.</p>
          </div>
          <div className="cw-amenity-card" data-category="business">
            <div className="cw-amenity-icon">
              <i className="ph-bold ph-printer" />
            </div>
            <h4>Cloud Printing & Courier Hub</h4>
            <p>Encrypted multi-function laser printing, scanning, and centralized courier intake.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
