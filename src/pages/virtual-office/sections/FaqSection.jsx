import { toggleVoFaq } from '@/features/faq/faq.js';

/** 7. VIRTUAL OFFICE REGULATORY FAQ ACCORDION (myHQ Reference Standard) */
export default function FaqSection() {
  return (
    <section className="section vo-faq-section" id="voFaqSection">
      <div className="container">
        <div className="section__header section__header--center reveal">
          <span className="section__eyebrow" style={{ color: 'var(--vd-gold-primary)' }}>
            <i className="ph-bold ph-question" />
            Regulatory & Compliance Helpdesk
          </span>
          <h2 className="section__title">
            FREQUENTLY ASKED
            <br />
            <span className="highlight-gold">QUESTIONS ABOUT VIRTUAL OFFICES</span>
          </h2>
          <p className="section__desc">
            Everything you need to know about MCA compliance, GST verification, bank accounts, and documentation
            guarantees.
          </p>
        </div>
        <div className="vo-faq-accordion reveal">
          <div className="vo-faq-item active">
            <button
              type="button"
              className="vo-faq-trigger"
              onClick={(event) => toggleVoFaq(event.currentTarget)}
              aria-expanded="true"
            >
              <span>What is a Virtual Office and who needs it?</span>
              <i className="ph-bold ph-caret-down vo-faq-icon" />
            </button>
            <div className="vo-faq-body">
              <p>
                A virtual office provides businesses with a recognized commercial address, valid lease agreements, and
                administrative support (mail handling, meeting rooms) without incurring the massive capital costs of
                renting, staffing, and furnishing physical office space. It is an ideal cost-effective solution for
                startups incorporating a company, e-commerce sellers requiring GST registrations across multiple states
                (PPOB/APOB), remote businesses, and enterprises needing local presence in new metros across India.
              </p>
            </div>
          </div>
          <div className="vo-faq-item">
            <button
              type="button"
              className="vo-faq-trigger"
              onClick={(event) => toggleVoFaq(event.currentTarget)}
              aria-expanded="false"
            >
              <span>Will GST or MCA officials reject this virtual office address?</span>
              <i className="ph-bold ph-caret-down vo-faq-icon" />
            </button>
            <div className="vo-faq-body">
              <p>
                No. V-DESK addresses are 100% compliant with Ministry of Corporate Affairs (MCA) SPICe+ guidelines and
                Section 22/24 of the Central Goods and Services Tax (CGST) Act. We provide registered notarized rent
                agreements, owner NOCs specifically authorizing commercial usage, and current paid commercial
                electricity bills with clear municipal demarcation. Over 10,000+ businesses have successfully registered
                using our approved Grade-A network.
              </p>
            </div>
          </div>
          <div className="vo-faq-item">
            <button
              type="button"
              className="vo-faq-trigger"
              onClick={(event) => toggleVoFaq(event.currentTarget)}
              aria-expanded="false"
            >
              <span>What happens if the GST officer conducts an unannounced physical site inspection?</span>
              <i className="ph-bold ph-caret-down vo-faq-icon" />
            </button>
            <div className="vo-faq-body">
              <p>
                All V-DESK virtual offices are located in active, fully-staffed commercial coworking facilities. Under
                GST Rule 25, when a tax officer visits for physical verification, our on-site center manager greets the
                inspector, presents your registered lease agreement and owner NOC, and displays your company's physical
                name board permanently installed at the entrance.
              </p>
            </div>
          </div>
          <div className="vo-faq-item">
            <button
              type="button"
              className="vo-faq-trigger"
              onClick={(event) => toggleVoFaq(event.currentTarget)}
              aria-expanded="false"
            >
              <span>Can I open a current bank account using V-DESK's virtual office address?</span>
              <i className="ph-bold ph-caret-down vo-faq-icon" />
            </button>
            <div className="vo-faq-body">
              <p>
                Absolutely. Leading public and private banks (HDFC, ICICI, SBI, Axis, Kotak, IndusInd) accept V-DESK's
                registered rent deed, owner NOC, electricity bill, and Certificate of Incorporation (COI) / GST
                Certificate for current bank account opening and KYC verification.
              </p>
            </div>
          </div>
          <div className="vo-faq-item">
            <button
              type="button"
              className="vo-faq-trigger"
              onClick={(event) => toggleVoFaq(event.currentTarget)}
              aria-expanded="false"
            >
              <span>Which documents do I need to submit to get my Virtual Office?</span>
              <i className="ph-bold ph-caret-down vo-faq-icon" />
            </button>
            <div className="vo-faq-body">
              <p>Getting started is 100% digital and takes under 5 minutes:</p>
              <ul style={{ margin: '0.5rem 0 0 1.25rem', padding: '0' }}>
                <li>PAN Card of the company and/or authorized director/proprietor</li>
                <li>Aadhaar Card or Passport of authorized directors (Address Proof)</li>
                <li>Passport-size photograph of directors</li>
                <li>
                  Certificate of Incorporation (COI) or Partnership Deed (if already incorporated; not needed for new
                  setups)
                </li>
              </ul>
            </div>
          </div>
          <div className="vo-faq-item">
            <button
              type="button"
              className="vo-faq-trigger"
              onClick={(event) => toggleVoFaq(event.currentTarget)}
              aria-expanded="false"
            >
              <span>How does V-DESK's 100% Money-Back Guarantee work?</span>
              <i className="ph-bold ph-caret-down vo-faq-icon" />
            </button>
            <div className="vo-faq-body">
              <p>
                In the rare event that your GST or MCA incorporation application is rejected by the government authority
                due to any deficiency or defect in the property documentation provided by V-DESK, we first offer a
                complimentary alternative address of equal or higher tier, or process a 100% full refund with zero
                cancellation charges.
              </p>
            </div>
          </div>
          <div className="vo-faq-item">
            <button
              type="button"
              className="vo-faq-trigger"
              onClick={(event) => toggleVoFaq(event.currentTarget)}
              aria-expanded="false"
            >
              <span>How is incoming mail, speed post, and legal courier handled?</span>
              <i className="ph-bold ph-caret-down vo-faq-icon" />
            </button>
            <div className="vo-faq-body">
              <p>
                All incoming postal communication, tax notices, bank chequebooks, and packages received at your virtual
                office address are securely received by our front-desk concierge. You receive instant digital WhatsApp
                and email notifications with envelope scans. On-demand physical parcel forwarding to your residential or
                operational address is available across India.
              </p>
            </div>
          </div>
        </div>
        <div
          style={{
            marginTop: '3.5rem',
            textAlign: 'center',
            padding: '2.5rem 1.5rem',
            background: 'rgba(8, 29, 64, 0.8)',
            border: '1px solid rgba(197, 146, 57, 0.3)',
            borderRadius: '16px',
          }}
          className="reveal"
        >
          <h3 style={{ color: '#FFFFFF', fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>
            Ready to Establish Your Prime Office Address?
          </h3>
          <p style={{ color: '#C2D1E5', fontSize: '0.92rem', maxWidth: '580px', margin: '0 auto 1.5rem' }}>
            Join 10,000+ founders and enterprises operating compliantly across India. Speak with our Senior CA
            Consultant today.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#voLeadCard" className="btn btn--primary btn--lg">
              <i className="ph-bold ph-lightning" />
              Get Instant Quote Now →
            </a>
            <a
              href="https://wa.me/919876543210?text=Hi%20V-DESK%20Team,%20I%20need%20a%20Virtual%20Office%20quote"
              target="_blank"
              rel="noopener"
              className="btn btn--outline btn--lg"
            >
              <i className="ph-bold ph-whatsapp-logo" />
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
