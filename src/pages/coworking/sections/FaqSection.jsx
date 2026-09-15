import { toggleCwFaq } from '@/features/faq/faq.js';

/** COWORKING & WORKSPACE COMPLIANCE FAQ ACCORDION */
export default function FaqSection() {
  return (
    <section className="section cw-faq-section" id="cwFaqSection">
      <div className="container">
        <div className="section__header section__header--center">
          <span className="section__eyebrow">
            <i className="ph-bold ph-question" />
            Comprehensive Knowledge Base
          </span>
          <h2 className="section__title">
            FREQUENTLY ASKED QUESTIONS ABOUT
            <br />
            <span className="highlight-gold">COWORKING & SERVICED OFFICES</span>
          </h2>
          <p className="section__desc">
            Everything you need to know about access protocols, GST compliance, IT security, guest hosting, and flexible
            agreements.
          </p>
        </div>
        <div className="cw-faq-accordion">
          <div className="cw-faq-item active">
            <button
              type="button"
              className="cw-faq-trigger"
              onClick={(event) => toggleCwFaq(event.currentTarget)}
              aria-expanded="true"
            >
              <span>Can I use a dedicated desk or private cabin for GST and MCA company registration?</span>
              <i className="ph-bold ph-caret-down" />
            </button>
            <div className="cw-faq-body">
              <p>
                Yes, absolutely! When you subscribe to a Dedicated Workstation or Private Serviced Office at Worldmark
                Aerocity or any V-DESK centre, we provide a complete 100% compliant documentation kit: a registered
                12-month commercial lease agreement, explicit landlord NOC for commercial business operations, the
                latest paid commercial electricity bill with municipal demarcation, and an official acrylic company
                nameplate installed at the venue for GST officer physical inspection.
              </p>
            </div>
          </div>
          <div className="cw-faq-item">
            <button
              type="button"
              className="cw-faq-trigger"
              onClick={(event) => toggleCwFaq(event.currentTarget)}
              aria-expanded="false"
            >
              <span>What are the operating hours for Day Passes vs Dedicated Desks and Private Cabins?</span>
              <i className="ph-bold ph-caret-down" />
            </button>
            <div className="cw-faq-body">
              <p>
                Flexi Day Pass holders enjoy access from 08:30 to 20:00, Monday through Saturday. Dedicated Desk and
                Private Executive Cabin members receive 24/7/365 round-the-clock access via biometric fingerprint
                scanners and encrypted smartphone RFID credentials, supported by 24-hour building security and power
                backup.
              </p>
            </div>
          </div>
          <div className="cw-faq-item">
            <button
              type="button"
              className="cw-faq-trigger"
              onClick={(event) => toggleCwFaq(event.currentTarget)}
              aria-expanded="false"
            >
              <span>Can I host client meetings and visitors if I work from a coworking space?</span>
              <i className="ph-bold ph-caret-down" />
            </button>
            <div className="cw-faq-body">
              <p>
                Yes. All members are welcome to host visitors. Our executive front-desk concierge will professionally
                greet your guests, notify you via WhatsApp or phone, and guide them to our designer waiting lounges. For
                meetings, you can book our 4K AV boardrooms by the hour using the online scheduler or your monthly
                complimentary meeting credits.
              </p>
            </div>
          </div>
          <div className="cw-faq-item">
            <button
              type="button"
              className="cw-faq-trigger"
              onClick={(event) => toggleCwFaq(event.currentTarget)}
              aria-expanded="false"
            >
              <span>How does internet security and IT infrastructure work? Can our team set up a private VLAN?</span>
              <i className="ph-bold ph-caret-down" />
            </button>
            <div className="cw-faq-body">
              <p>
                We provide enterprise-grade dual-loop redundant optical fiber with automatic failover and 99.99% uptime.
                For tech teams and financial institutions requiring heightened compliance (ISO/SOC-2), our on-site IT
                engineering team can configure dedicated corporate SSIDs, private VLAN subnets, static public IPs, and
                secure rackspace in our climate-controlled mini data centres.
              </p>
            </div>
          </div>
          <div className="cw-faq-item">
            <button
              type="button"
              className="cw-faq-trigger"
              onClick={(event) => toggleCwFaq(event.currentTarget)}
              aria-expanded="false"
            >
              <span>What is included in the complimentary meeting room credits?</span>
              <i className="ph-bold ph-caret-down" />
            </button>
            <div className="cw-faq-body">
              <p>
                Dedicated desk members receive 2 complimentary hours per month, and Private Serviced Office members
                receive 6 to 12 complimentary hours per month (depending on suite capacity). Credits can be used for any
                4-person huddle room, 10-person conference room, or 24-seat boardroom across all V-DESK network
                locations.
              </p>
            </div>
          </div>
          <div className="cw-faq-item">
            <button
              type="button"
              className="cw-faq-trigger"
              onClick={(event) => toggleCwFaq(event.currentTarget)}
              aria-expanded="false"
            >
              <span>Are there lock-in contracts or heavy security deposits?</span>
              <i className="ph-bold ph-caret-down" />
            </button>
            <div className="cw-faq-body">
              <p>
                No. Traditional commercial leases demand 6–12 months of locked-up rental deposits and rigid 3-year
                lock-ins. At V-DESK, we champion agile operations: day passes require zero commitment, dedicated desks
                are month-to-month or annual with zero security deposit options, and private cabins require just 1 month
                refundable security with flexible 30-day expansion/downsizing notices.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
