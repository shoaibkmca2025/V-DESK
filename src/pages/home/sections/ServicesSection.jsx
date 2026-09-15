import { openQuoteModal } from '@/features/quote/quoteModal.js';
import { asset } from '@/lib/assets.js';

/** SECTION 04 &mdash; SERVICES SHOWCASE 7 Upgraded Architectural Service Cards */
export default function ServicesSection() {
  return (
    <section className="section services" id="services">
      <div className="container">
        <div className="section__header reveal">
          <span className="section__eyebrow">Enterprise Solutions</span>
          <h2 className="section__title">
            EVERYTHING YOUR
            <br />
            BUSINESS NEEDS TO OPERATE.
          </h2>
          <p className="section__desc">
            Grade-A workspace and corporate compliance infrastructure designed to eliminate overhead and scale
            seamlessly.
          </p>
        </div>
        <div className="services__grid">
          <article className="service-card--featured reveal">
            <div className="service-card__image">
              <img
                src={asset('assets/vdesk-reception.jpg')}
                alt="V-DESK Virtual Office — Premium business address"
                loading="lazy"
              />
              <span className="service-card__badge">Most Popular</span>
            </div>
            <div className="service-card__body">
              <div className="service-card__category">Corporate Presence</div>
              <h3 className="service-card__name">Virtual Office</h3>
              <p className="service-card__desc">
                Prestigious commercial business addresses for companies, founders, and e-commerce brands. 100% compliant
                for GST and MCA incorporation.
              </p>
              <div className="service-card__features">
                <div className="service-card__feature">
                  <span className="check">
                    <i className="ph-bold ph-check" />
                  </span>
                  Registered Rent Agreement & Landlord NOC
                </div>
                <div className="service-card__feature">
                  <span className="check">
                    <i className="ph-bold ph-check" />
                  </span>
                  Latest Commercial Electricity Bill Copy
                </div>
                <div className="service-card__feature">
                  <span className="check">
                    <i className="ph-bold ph-check" />
                  </span>
                  Physical Company Name Board Display
                </div>
                <div className="service-card__feature">
                  <span className="check">
                    <i className="ph-bold ph-check" />
                  </span>
                  Official Mail & Courier Intake with WhatsApp Alerts
                </div>
              </div>
              <div className="service-card__footer">
                <span className="service-card__price">
                  From ₹1,249<small>/mo</small>
                </span>
                <button className="btn btn--primary btn--sm" onClick={() => openQuoteModal('Virtual Office')}>
                  Choose Plan →
                </button>
              </div>
            </div>
          </article>
          <article className="service-card--standard reveal">
            <div className="service-card__image">
              <img src={asset('assets/vdesk-coworking.jpg')} alt="V-DESK Coworking Spaces" loading="lazy" />
              <span className="service-card__badge-subtle">High Flexibility</span>
            </div>
            <div className="service-card__body">
              <div className="service-card__category">Productive Space</div>
              <h3 className="service-card__name">Coworking Spaces</h3>
              <p className="service-card__desc">
                Flexible hot desks and dedicated workstations with ergonomic seating, enterprise-grade Wi-Fi, and
                barista coffee.
              </p>
              <div className="service-card__features">
                <div className="service-card__feature">
                  <span className="check">
                    <i className="ph-bold ph-check" />
                  </span>
                  Hot Desks & Dedicated Workstations
                </div>
                <div className="service-card__feature">
                  <span className="check">
                    <i className="ph-bold ph-check" />
                  </span>
                  500 Mbps High-Speed Secure Wi-Fi
                </div>
                <div className="service-card__feature">
                  <span className="check">
                    <i className="ph-bold ph-check" />
                  </span>
                  Unlimited Tea, Coffee & Community Access
                </div>
              </div>
              <div className="service-card__footer">
                <span className="service-card__price">
                  From ₹399<small>/day</small>
                </span>
                <button className="btn btn--primary btn--sm" onClick={() => openQuoteModal('Coworking Spaces')}>
                  Book Desk →
                </button>
              </div>
            </div>
          </article>
          <article className="service-card--standard reveal">
            <div className="service-card__image">
              <img src={asset('assets/vdesk-boardroom.jpg')} alt="V-DESK Meeting Rooms" loading="lazy" />
              <span className="service-card__badge-subtle">4K High-Tech</span>
            </div>
            <div className="service-card__body">
              <div className="service-card__category">Client Conferences</div>
              <h3 className="service-card__name">Meeting Rooms</h3>
              <p className="service-card__desc">
                Executive boardrooms and collaboration suites equipped with wireless presentation screens and video
                conferencing.
              </p>
              <div className="service-card__features">
                <div className="service-card__feature">
                  <span className="check">
                    <i className="ph-bold ph-check" />
                  </span>
                  4-Pax Huddles to 20-Pax Executive Boardrooms
                </div>
                <div className="service-card__feature">
                  <span className="check">
                    <i className="ph-bold ph-check" />
                  </span>
                  Zoom & Teams Wireless Presentation Displays
                </div>
                <div className="service-card__feature">
                  <span className="check">
                    <i className="ph-bold ph-check" />
                  </span>
                  Instant Hourly & Daily Booking Options
                </div>
              </div>
              <div className="service-card__footer">
                <span className="service-card__price">
                  From ₹499<small>/hour</small>
                </span>
                <button className="btn btn--primary btn--sm" onClick={() => openQuoteModal('Meeting Rooms')}>
                  Reserve Room →
                </button>
              </div>
            </div>
          </article>
          <article className="service-card--featured reveal">
            <div className="service-card__image">
              <img
                src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80"
                alt="V-DESK Private Office Cabins"
                loading="lazy"
              />
              <span className="service-card__badge">Dedicated Team</span>
            </div>
            <div className="service-card__body">
              <div className="service-card__category">Executive Cabins</div>
              <h3 className="service-card__name">Private Offices</h3>
              <p className="service-card__desc">
                Dedicated, lockable private cabins tailored for growing teams of 2 to 25+ people. Fully furnished with
                custom branding and 24/7 access.
              </p>
              <div className="service-card__features">
                <div className="service-card__feature">
                  <span className="check">
                    <i className="ph-bold ph-check" />
                  </span>
                  24/7 Secure Access with RFID Keycards
                </div>
                <div className="service-card__feature">
                  <span className="check">
                    <i className="ph-bold ph-check" />
                  </span>
                  Dedicated High-Speed Private LAN & Subnet
                </div>
                <div className="service-card__feature">
                  <span className="check">
                    <i className="ph-bold ph-check" />
                  </span>
                  Custom Acoustic Glass & Company Branding
                </div>
                <div className="service-card__feature">
                  <span className="check">
                    <i className="ph-bold ph-check" />
                  </span>
                  Daily Housekeeping, Concierge & Facilities
                </div>
              </div>
              <div className="service-card__footer">
                <span className="service-card__price">
                  From ₹11,999<small>/mo</small>
                </span>
                <button className="btn btn--primary btn--sm" onClick={() => openQuoteModal('Private Offices')}>
                  Tour Cabins →
                </button>
              </div>
            </div>
          </article>
          <article className="service-card--compact reveal">
            <div className="service-card__icon">
              <i className="ph-bold ph-shield-check" />
            </div>
            <div className="service-card__category">Legal Foundation</div>
            <h3 className="service-card__name">Company Registration</h3>
            <p className="service-card__desc">
              End-to-end incorporation via MCA SPICe+. Pvt Ltd, LLP, OPC & Section 8 with complete legal guidance.
            </p>
            <div className="service-card__features">
              <div className="service-card__feature">
                <span className="check">
                  <i className="ph-bold ph-check" />
                </span>
                DIN, PAN, TAN & Class-3 DSC
              </div>
              <div className="service-card__feature">
                <span className="check">
                  <i className="ph-bold ph-check" />
                </span>
                MOA, AOA & Certified Incorporation Deed
              </div>
              <div className="service-card__feature">
                <span className="check">
                  <i className="ph-bold ph-check" />
                </span>
                Complimentary Senior CA Consultation
              </div>
            </div>
            <div className="service-card__footer">
              <span className="service-card__price">From ₹4,999</span>
              <button className="btn btn--primary btn--sm" onClick={() => openQuoteModal('Company Registration')}>
                Incorporate →
              </button>
            </div>
          </article>
          <article className="service-card--compact reveal">
            <div className="service-card__icon">
              <i className="ph-bold ph-certificate" />
            </div>
            <div className="service-card__category">Tax Compliance</div>
            <h3 className="service-card__name">GST Registration</h3>
            <p className="service-card__desc">
              Single-state PPOB and multi-state APOB registration with document preparation and officer visit support.
            </p>
            <div className="service-card__features">
              <div className="service-card__feature">
                <span className="check">
                  <i className="ph-bold ph-check" />
                </span>
                Full ARN Tracking & Clarification Handling
              </div>
              <div className="service-card__feature">
                <span className="check">
                  <i className="ph-bold ph-check" />
                </span>
                GST Officer Physical Inspection Assistance
              </div>
              <div className="service-card__feature">
                <span className="check">
                  <i className="ph-bold ph-check" />
                </span>
                Amazon & Flipkart Marketplace Compliance
              </div>
            </div>
            <div className="service-card__footer">
              <span className="service-card__price">From ₹1,499</span>
              <button className="btn btn--primary btn--sm" onClick={() => openQuoteModal('GST Registration')}>
                Register GST →
              </button>
            </div>
          </article>
          <article className="service-card--compact reveal">
            <div className="service-card__icon">
              <i className="ph-bold ph-trademark" />
            </div>
            <div className="service-card__category">Brand Protection</div>
            <h3 className="service-card__name">Trademark Registration</h3>
            <p className="service-card__desc">
              Complete trademark search, Nice classification analysis, expedited online filing, and objection defense.
            </p>
            <div className="service-card__features">
              <div className="service-card__feature">
                <span className="check">
                  <i className="ph-bold ph-check" />
                </span>
                In-Depth Comprehensive Conflict Search
              </div>
              <div className="service-card__feature">
                <span className="check">
                  <i className="ph-bold ph-check" />
                </span>
                TM Application Receipt Within 24 Hours
              </div>
              <div className="service-card__feature">
                <span className="check">
                  <i className="ph-bold ph-check" />
                </span>
                Legal Examination & Hearing Representation
              </div>
            </div>
            <div className="service-card__footer">
              <span className="service-card__price">From ₹1,999</span>
              <button className="btn btn--primary btn--sm" onClick={() => openQuoteModal('Trademark Registration')}>
                Protect Brand →
              </button>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
