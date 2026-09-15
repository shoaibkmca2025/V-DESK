import { prefillCwTour } from '@/features/coworking/coworking.js';
import { openQuoteModal } from '@/features/quote/quoteModal.js';

/** CROSS-CENTRE FLAGSHIP NETWORK (TEC SISTER LOCATIONS) */
export default function NetworkSection() {
  return (
    <section className="section cw-network-section" id="cwNetworkSection">
      <div className="container">
        <div className="section__header section__header--center">
          <span className="section__eyebrow">
            <i className="ph-bold ph-globe" />
            Pan-India Presence
          </span>
          <h2 className="section__title">
            NEARBY FLAGSHIP CENTRES &<br />
            <span className="highlight-gold">CROSS-CENTRE NETWORK ACCESS</span>
          </h2>
          <p className="section__desc">
            Your V-DESK executive membership unlocks premium business lounges and boardroom facilities across all major
            Indian commercial capitals.
          </p>
        </div>
        <div className="cw-network-grid">
          <div className="cw-network-card active">
            <div className="cw-network-status">Current Centre</div>
            <h3 className="cw-network-name">Worldmark Aerocity</h3>
            <p className="cw-network-loc">
              <i className="ph-bold ph-map-pin" />
              Gateway District, Aerocity, New Delhi
            </p>
            <span className="cw-network-transit">
              <i className="ph-bold ph-airplane" />5 Mins to IGI Airport • Metro Walk
            </span>
            <div className="cw-network-footer">
              <span className="cw-network-pricing">From ₹6,999/mo</span>
              <button className="btn btn--gold btn--sm" onClick={() => prefillCwTour('Private Serviced Office')}>
                Book Tour
              </button>
            </div>
          </div>
          <div className="cw-network-card">
            <div className="cw-network-status available">Available</div>
            <h3 className="cw-network-name">DLF Cyber City</h3>
            <p className="cw-network-loc">
              <i className="ph-bold ph-map-pin" />
              Building 10, DLF Phase 2, Gurugram
            </p>
            <span className="cw-network-transit">
              <i className="ph-bold ph-train" />
              Cyber City Rapid Metro • Fortune 500 Hub
            </span>
            <div className="cw-network-footer">
              <span className="cw-network-pricing">From ₹7,499/mo</span>
              <button className="btn btn--outline btn--sm" onClick={() => openQuoteModal('DLF Cyber City Coworking')}>
                Inquire
              </button>
            </div>
          </div>
          <div className="cw-network-card">
            <div className="cw-network-status available">Available</div>
            <h3 className="cw-network-name">Statesman House, CP</h3>
            <p className="cw-network-loc">
              <i className="ph-bold ph-map-pin" />
              Barakhamba Road, Connaught Place, New Delhi
            </p>
            <span className="cw-network-transit">
              <i className="ph-bold ph-train" />
              Barakhamba Road Metro • Heritage CBD
            </span>
            <div className="cw-network-footer">
              <span className="cw-network-pricing">From ₹7,999/mo</span>
              <button className="btn btn--outline btn--sm" onClick={() => openQuoteModal('Connaught Place Coworking')}>
                Inquire
              </button>
            </div>
          </div>
          <div className="cw-network-card">
            <div className="cw-network-status available">Available</div>
            <h3 className="cw-network-name">One BKC, Mumbai</h3>
            <p className="cw-network-loc">
              <i className="ph-bold ph-map-pin" />G Block, Bandra Kurla Complex, Mumbai
            </p>
            <span className="cw-network-transit">
              <i className="ph-bold ph-currency-inr" />
              Financial Capital Gateway • LEED Platinum
            </span>
            <div className="cw-network-footer">
              <span className="cw-network-pricing">From ₹8,999/mo</span>
              <button className="btn btn--outline btn--sm" onClick={() => openQuoteModal('One BKC Mumbai Coworking')}>
                Inquire
              </button>
            </div>
          </div>
          <div className="cw-network-card">
            <div className="cw-network-status available">Available</div>
            <h3 className="cw-network-name">Koramangala Tech Park</h3>
            <p className="cw-network-loc">
              <i className="ph-bold ph-map-pin" />
              80 Feet Road, Koramangala, Bengaluru
            </p>
            <span className="cw-network-transit">
              <i className="ph-bold ph-rocket-launch" />
              Startup Epicentre • 24/7 Hacker Lounges
            </span>
            <div className="cw-network-footer">
              <span className="cw-network-pricing">From ₹6,499/mo</span>
              <button
                className="btn btn--outline btn--sm"
                onClick={() => openQuoteModal('Bengaluru Koramangala Coworking')}
              >
                Inquire
              </button>
            </div>
          </div>
          <div className="cw-network-card">
            <div className="cw-network-status available">Flagship HQ</div>
            <h3 className="cw-network-name">V-DESK Corporate Tower</h3>
            <p className="cw-network-loc">
              <i className="ph-bold ph-map-pin" />
              College Road, Thatte Nagar, Nashik
            </p>
            <span className="cw-network-transit">
              <i className="ph-bold ph-shield-check" />
              Owned Infrastructure • Central Operations
            </span>
            <div className="cw-network-footer">
              <span className="cw-network-pricing">From ₹4,999/mo</span>
              <button className="btn btn--outline btn--sm" onClick={() => openQuoteModal('Nashik HQ Coworking')}>
                Inquire
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
