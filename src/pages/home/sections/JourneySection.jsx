import { openQuoteModal } from '@/features/quote/quoteModal.js';
import { scrollToSection } from '@/features/ui/scroll.js';
import { asset } from '@/lib/assets.js';

/** SECTION 03 &mdash; BUSINESS JOURNEY START -> ESTABLISH -> WORK -> GROW Visually Immersive Narrative Experience */
export default function JourneySection() {
  return (
    <section className="section journey" id="journey">
      <div className="container">
        <div className="section__header section__header--center reveal">
          <span className="section__eyebrow">The V-DESK Growth Pathway</span>
          <h2 className="section__title">
            FROM FIRST REGISTRATION
            <br />
            TO MULTI-CITY SCALE.
          </h2>
          <p className="section__desc">
            A unified commercial infrastructure platform designed to support your enterprise at every step of its
            lifecycle.
          </p>
        </div>
        <div className="journey__stages-grid reveal-stagger">
          <div className="journey__stage-card">
            <div className="journey__stage-badge">01</div>
            <div className="journey__stage-media">
              <img
                src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=600&q=80"
                alt="Company Registration Foundation"
                loading="lazy"
              />
              <span className="journey__stage-pill">Foundation</span>
            </div>
            <div className="journey__stage-content">
              <h3 className="journey__stage-name">START</h3>
              <p className="journey__stage-summary">
                Incorporate your company with complete MCA, PAN, TAN, and DSC compliance through certified experts.
              </p>
              <div className="journey__stage-services">
                <span className="journey__tag">
                  <i className="ph-bold ph-check" />
                  Pvt Ltd / LLP Registration
                </span>
                <span className="journey__tag">
                  <i className="ph-bold ph-check" />
                  MCA SPICe+ & DIN
                </span>
                <span className="journey__tag">
                  <i className="ph-bold ph-check" />
                  Trademark Protection
                </span>
              </div>
              <button className="btn btn--outline btn--sm" onClick={() => scrollToSection('#wizard')}>
                Start Incorporation →
              </button>
            </div>
          </div>
          <div className="journey__stage-card">
            <div className="journey__stage-badge">02</div>
            <div className="journey__stage-media">
              <img src={asset('assets/vdesk-reception.jpg')} alt="Virtual Office Commercial Address" loading="lazy" />
              <span className="journey__stage-pill">Presence</span>
            </div>
            <div className="journey__stage-content">
              <h3 className="journey__stage-name">ESTABLISH</h3>
              <p className="journey__stage-summary">
                Secure a prime commercial business address with notarized rent agreements and landlord NOC for GST &
                MCA.
              </p>
              <div className="journey__stage-services">
                <span className="journey__tag">
                  <i className="ph-bold ph-check" />
                  Prime Virtual Office
                </span>
                <span className="journey__tag">
                  <i className="ph-bold ph-check" />
                  GST PPOB & APOB
                </span>
                <span className="journey__tag">
                  <i className="ph-bold ph-check" />
                  Physical Name Board
                </span>
              </div>
              <button className="btn btn--outline btn--sm" onClick={() => openQuoteModal('Virtual Office Setup')}>
                Explore Addresses →
              </button>
            </div>
          </div>
          <div className="journey__stage-card">
            <div className="journey__stage-badge">03</div>
            <div className="journey__stage-media">
              <img src={asset('assets/vdesk-coworking.jpg')} alt="Coworking and Private Offices" loading="lazy" />
              <span className="journey__stage-pill">Operations</span>
            </div>
            <div className="journey__stage-content">
              <h3 className="journey__stage-name">WORK</h3>
              <p className="journey__stage-summary">
                Flexible workspaces designed for productivity: dedicated desks, private executive cabins, and 4K
                boardrooms.
              </p>
              <div className="journey__stage-services">
                <span className="journey__tag">
                  <i className="ph-bold ph-check" />
                  Dedicated Coworking
                </span>
                <span className="journey__tag">
                  <i className="ph-bold ph-check" />
                  Private Cabins
                </span>
                <span className="journey__tag">
                  <i className="ph-bold ph-check" />
                  Hourly Boardrooms
                </span>
              </div>
              <button className="btn btn--outline btn--sm" onClick={() => scrollToSection('#services')}>
                View Workspaces →
              </button>
            </div>
          </div>
          <div className="journey__stage-card">
            <div className="journey__stage-badge">04</div>
            <div className="journey__stage-media">
              <img
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80"
                alt="Pan-India Business Scale"
                loading="lazy"
              />
              <span className="journey__stage-pill">Expansion</span>
            </div>
            <div className="journey__stage-content">
              <h3 className="journey__stage-name">GROW</h3>
              <p className="journey__stage-summary">
                Expand into new Indian commercial metros without real estate lock-in or long-term lease liabilities.
              </p>
              <div className="journey__stage-services">
                <span className="journey__tag">
                  <i className="ph-bold ph-check" />
                  Multi-City Network
                </span>
                <span className="journey__tag">
                  <i className="ph-bold ph-check" />
                  Multi-State APOB GST
                </span>
                <span className="journey__tag">
                  <i className="ph-bold ph-check" />
                  Enterprise Dedicated Desk
                </span>
              </div>
              <button className="btn btn--outline btn--sm" onClick={() => scrollToSection('#locations')}>
                Explore Locations →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
