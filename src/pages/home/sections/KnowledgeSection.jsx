import { toggleFaq } from '@/features/faq/faq.js';

/** SECTION 10 &mdash; KNOWLEDGE CENTER & FAQS Editorial Resource Guides & Legal Clarifications */
export default function KnowledgeSection() {
  return (
    <section className="section knowledge" id="knowledge">
      <div className="container">
        <div className="section__header section__header--center reveal">
          <span className="section__eyebrow">Compliance & Insights</span>
          <h2 className="section__title">
            KNOWLEDGE FOR
            <br />
            BUILDING BUSINESS.
          </h2>
          <p className="section__desc">
            Authoritative guides on GST regulations, corporate structures, and modern commercial real estate.
          </p>
        </div>
        <div className="knowledge__grid reveal-stagger">
          <article className="knowledge__card">
            <div className="knowledge__card-image">
              <img
                src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=600&q=80"
                alt="Virtual Office GST Guide"
                loading="lazy"
              />
            </div>
            <div className="knowledge__card-body">
              <div className="knowledge__card-meta">
                <span className="knowledge__card-category">GST Compliance</span>
                <span className="knowledge__card-time">8 min read</span>
              </div>
              <h3 className="knowledge__card-title">Is a Virtual Office 100% Legal for GST Registration in India?</h3>
              <p className="knowledge__card-excerpt">
                A comprehensive analysis of CGST Act 2017 provisions, mandatory landlord documentation, and how V-DESK
                facilitates successful officer inspections.
              </p>
            </div>
          </article>
          <article className="knowledge__card">
            <div className="knowledge__card-image">
              <img
                src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80"
                alt="Company Registration Entity Guide"
                loading="lazy"
              />
            </div>
            <div className="knowledge__card-body">
              <div className="knowledge__card-meta">
                <span className="knowledge__card-category">Incorporation</span>
                <span className="knowledge__card-time">12 min read</span>
              </div>
              <h3 className="knowledge__card-title">Pvt Ltd vs. LLP: Choosing the Right Entity Structure in 2026</h3>
              <p className="knowledge__card-excerpt">
                A detailed comparison of compliance obligations, taxation rates, director liabilities, and institutional
                funding eligibility for Indian founders.
              </p>
            </div>
          </article>
          <article className="knowledge__card">
            <div className="knowledge__card-image">
              <img
                src="https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=600&q=80"
                alt="Commercial Real Estate Cost Comparison"
                loading="lazy"
              />
            </div>
            <div className="knowledge__card-body">
              <div className="knowledge__card-meta">
                <span className="knowledge__card-category">Commercial Real Estate</span>
                <span className="knowledge__card-time">6 min read</span>
              </div>
              <h3 className="knowledge__card-title">Traditional Lease vs. Smart Infrastructure: 88% Cost Reduction</h3>
              <p className="knowledge__card-excerpt">
                An itemized financial audit contrasting security deposits, maintenance, and civil fitouts against V-DESK
                verified commercial infrastructure.
              </p>
            </div>
          </article>
        </div>
        <div className="faq-section reveal">
          <div className="faq-item open">
            <button className="faq-item__question" onClick={(event) => toggleFaq(event.currentTarget)}>
              <span>Is a Virtual Office 100% legal for GST and Company Registration?</span>
              <span className="faq-item__arrow">▼</span>
            </button>
            <div className="faq-item__answer">
              <p>
                Yes, absolutely. Under the CGST Act 2017 and MCA SPICe+ regulations, any enterprise can operate legally
                from a commercial premises provided they possess: (1) A registered commercial rent agreement, (2) An NOC
                from the legal property owner, and (3) A recent electricity bill. V-DESK provides 100% genuine and
                verified documents.
              </p>
            </div>
          </div>
          <div className="faq-item">
            <button className="faq-item__question" onClick={(event) => toggleFaq(event.currentTarget)}>
              <span>What documents are required to activate a V-DESK Virtual Office?</span>
              <span className="faq-item__arrow">▼</span>
            </button>
            <div className="faq-item__answer">
              <p>
                Basic KYC documents: PAN Card, Aadhaar Card, passport photo and Certificate of Incorporation (if already
                incorporated). Once uploaded, your notarized agreement and NOC are issued within 24 working hours.
              </p>
            </div>
          </div>
          <div className="faq-item">
            <button className="faq-item__question" onClick={(event) => toggleFaq(event.currentTarget)}>
              <span>What happens during a GST physical premises inspection?</span>
              <span className="faq-item__arrow">▼</span>
            </button>
            <div className="faq-item__answer">
              <p>
                Our center managers facilitate GST inspections. Your company name is displayed on the physical directory
                board, legal files are maintained on site, and our concierge coordinates with the visiting officer for
                smooth approval.
              </p>
            </div>
          </div>
          <div className="faq-item">
            <button className="faq-item__question" onClick={(event) => toggleFaq(event.currentTarget)}>
              <span>How does V-DESK handle incoming mail and couriers?</span>
              <span className="faq-item__arrow">▼</span>
            </button>
            <div className="faq-item__answer">
              <p>
                All incoming mail is logged on arrival. You receive instant WhatsApp and email notifications. On your
                instruction, we can scan and email contents or forward the physical courier to your address.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
