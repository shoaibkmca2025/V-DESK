import { checkMcaName } from '@/features/companyRegistration/companyRegistration.js';
import { handleHomeHeroConsultSubmit } from '@/features/leads/leadForms.js';

/** HERO SECTION (OBSIDIAN-NAVY & CHAMPAGNE-GOLD SPLIT HERO) */
export default function CompanyRegistrationHero() {
  return (
    <section className="section compreg-hero-split" id="compregHero">
      <div className="container">
        <div className="compreg-hero-grid">
          <div className="hero-content-col">
            <div className="hero-badge-pill">
              <i className="ph-bold ph-certificate" />
              <span>Government SPICe+ MCA Filing Suite • 100% Approval Guarantee</span>
            </div>
            <h1 className="hero-luxury-title">
              Incorporate Your Company <br />
              <span className="highlight-gold">With Certified CA/CS Advisory</span>
            </h1>
            <p className="hero-luxury-desc">
              Fast-track Private Limited, LLP, and OPC incorporation under official Ministry of Corporate Affairs
              guidelines. Every package includes 2 Class-3 DSCs, DINs, PAN/TAN, corporate bank account, and a bundled
              1-year premium virtual office address.
            </p>
            <div className="hero-stats-quad">
              <div className="hero-stat-box">
                <strong>3-5 Days</strong>
                <span>MCA Approval SLA</span>
              </div>
              <div className="hero-stat-box">
                <strong>1-Yr Free</strong>
                <span>Virtual Office Incl.</span>
              </div>
              <div className="hero-stat-box">
                <strong>100%</strong>
                <span>Govt Approval</span>
              </div>
              <div className="hero-stat-box">
                <strong>₹0</strong>
                <span>Hidden Legal Costs</span>
              </div>
            </div>
            <div className="hero-trust-grid">
              <div className="hero-trust-badge">
                <i className="ph-bold ph-check-circle" />
                <span>2 Class-3 Digital Signatures (DSC)</span>
              </div>
              <div className="hero-trust-badge">
                <i className="ph-bold ph-check-circle" />
                <span>Director Identification Numbers (DIN)</span>
              </div>
              <div className="hero-trust-badge">
                <i className="ph-bold ph-check-circle" />
                <span>Zero Physical MCA Rejections</span>
              </div>
              <div className="hero-trust-badge">
                <i className="ph-bold ph-check-circle" />
                <span>Senior CA On-Duty Oversight</span>
              </div>
            </div>
            <div className="hero-action-buttons">
              <a href="#compregLeadCard" className="btn btn--gold btn--lg">
                <i className="ph-bold ph-paper-plane-tilt" />
                Start Incorporation →
              </a>
              <a href="#entityMatrix" className="btn btn--outline btn--lg">
                <i className="ph-bold ph-scales" />
                Compare Entity Types
              </a>
              <a href="#incorpWizard" className="btn btn--glass btn--lg">
                <i className="ph-bold ph-magic-wand" />
                5-Step Wizard
              </a>
            </div>
          </div>
          <div className="hero-form-col">
            <div className="hero-lead-card" id="compregLeadCard">
              <div className="hero-card-ribbon">
                <i className="ph-bold ph-lightning" /> FAST-TRACK MCA
              </div>
              <div className="hero-card-header">
                <h3>
                  <i className="ph-bold ph-certificate" />
                  Company Name & Filing
                </h3>
                <p>Verify name availability and receive certified incorporation advisory in 15 minutes</p>
              </div>
              <form
                id="compregHeroForm"
                className="hero-lead-form"
                onSubmit={(event) => handleHomeHeroConsultSubmit(event)}
              >
                <div className="form-group">
                  <label htmlFor="compregHeroName">Founder Full Name *</label>
                  <input
                    type="text"
                    id="homeHeroName"
                    className="form-control"
                    placeholder="e.g. Vikramaditya Roy"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="compregHeroPhone">Mobile / WhatsApp Number *</label>
                  <input
                    type="tel"
                    id="homeHeroPhone"
                    className="form-control"
                    placeholder="10-digit mobile number"
                    pattern={'[0-9]{10}'}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="compregHeroEmail">Official Email *</label>
                  <input
                    type="email"
                    id="homeHeroEmail"
                    className="form-control"
                    placeholder="founder@company.in"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="compregHeroService">Corporate Entity Structure *</label>
                  <select id="homeHeroService" className="form-control" required defaultValue="Private Limited Company">
                    <option value="Private Limited Company">Private Limited (Pvt Ltd • ₹6,999)</option>
                    <option value="Limited Liability Partnership">Limited Liability Partnership (LLP • ₹5,499)</option>
                    <option value="One Person Company">One Person Company (OPC • ₹4,499)</option>
                    <option value="Section 8 Non-Profit">Section 8 Foundation (NGO • ₹7,999)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="compregProposedName">Proposed Company Name (MCA RUN Pre-Check)</label>
                  <input
                    type="text"
                    id="compregProposedName"
                    className="form-control"
                    placeholder="e.g. Apex Cloud Innovations"
                    onInput={(event) => checkMcaName(event.currentTarget.value)}
                  />
                  <div id="mcaPrecheckResult" style={{ marginTop: '8px', fontSize: '0.8rem', display: 'none' }} />
                </div>
                <button
                  type="submit"
                  className="btn btn--gold btn--full"
                  style={{ padding: '13px', fontWeight: '700', marginTop: '6px' }}
                >
                  <i className="ph-bold ph-paper-plane-tilt" />
                  Verify Name & Start Filing →
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
