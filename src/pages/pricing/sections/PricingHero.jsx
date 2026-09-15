import { openEnterpriseSuiteModal } from '@/features/enterprise/enterpriseSuite.js';
import { handleHomeHeroConsultSubmit } from '@/features/leads/leadForms.js';
import { toggleBillingCycle } from '@/features/pricing/costCalculator.js';

/** HERO SECTION (OBSIDIAN-NAVY & CHAMPAGNE-GOLD SPLIT HERO) */
export default function PricingHero() {
  return (
    <section className="section pricing-hero-split" id="pricingHero">
      <div className="container">
        <div className="pricing-hero-grid">
          <div className="hero-content-col">
            <div className="hero-badge-pill">
              <i className="ph-bold ph-percent" />
              <span>Zero Brokerage • 100% GST Tax Credit • Save Up to 88%</span>
            </div>
            <h1 className="hero-luxury-title">
              Transparent Commercial Pricing <br />
              <span className="highlight-gold">& Operational ROI Matrix</span>
            </h1>
            <p className="hero-luxury-desc">
              Eliminate capital lock-ins and massive security deposits. Experience up to 88% operational savings
              compared to traditional commercial leases, with full GST input tax credit (ITC) pass-through on every
              plan.
            </p>
            <div className="hero-stats-quad">
              <div className="hero-stat-box">
                <strong>88% Save</strong>
                <span>vs Traditional Leases</span>
              </div>
              <div className="hero-stat-box">
                <strong>₹0</strong>
                <span>Brokerage & Deposit</span>
              </div>
              <div className="hero-stat-box">
                <strong>100% ITC</strong>
                <span>Full GST Tax Credit</span>
              </div>
              <div className="hero-stat-box">
                <strong>20% Off</strong>
                <span>Annual Commitments</span>
              </div>
            </div>
            <div className="hero-trust-grid">
              <div className="hero-trust-badge">
                <i className="ph-bold ph-check-circle" />
                <span>100% MCA & GST Approval Guarantee</span>
              </div>
              <div className="hero-trust-badge">
                <i className="ph-bold ph-check-circle" />
                <span>Notarized 12-Month Commercial Lease</span>
              </div>
              <div className="hero-trust-badge">
                <i className="ph-bold ph-check-circle" />
                <span>Physical Corporate Name Board</span>
              </div>
              <div className="hero-trust-badge">
                <i className="ph-bold ph-check-circle" />
                <span>Free Address Replacement Policy</span>
              </div>
            </div>
            <div style={{ margin: '20px 0', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span style={{ fontSize: '0.85rem', color: '#CBD5E1', fontWeight: '600' }}>Billing Cycle:</span>
              <div className="billing-toggle-wrap">
                <button
                  type="button"
                  className="billing-opt-btn"
                  id="billingOptMonthly"
                  onClick={() => toggleBillingCycle('monthly')}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  className="billing-opt-btn active"
                  id="billingOptAnnual"
                  onClick={() => toggleBillingCycle('annual')}
                >
                  Annual
                </button>
                <span className="billing-save-badge">Save 20%</span>
              </div>
            </div>
            <div className="hero-action-buttons">
              <a href="#plansMatrix" className="btn btn--gold btn--lg">
                <i className="ph-bold ph-table" />
                Compare All Plans →
              </a>
              <button type="button" className="btn btn--outline btn--lg" onClick={() => openEnterpriseSuiteModal()}>
                <i className="ph-bold ph-buildings" />
                Enterprise Custom RFP
              </button>
            </div>
          </div>
          <div className="hero-form-col">
            <div className="hero-lead-card" id="pricingInquiryCard">
              <div className="hero-card-ribbon">
                <i className="ph-bold ph-lightning" /> INSTANT QUOTE
              </div>
              <div className="hero-card-header">
                <h3>
                  <i className="ph-bold ph-calculator" />
                  Custom Team Quotation
                </h3>
                <p>Select your team size and target cities for immediate discounted pricing</p>
              </div>
              <form
                id="pricingHeroForm"
                className="hero-lead-form"
                onSubmit={(event) => handleHomeHeroConsultSubmit(event)}
              >
                <div className="form-group">
                  <label htmlFor="pricingHeroName">Full Name *</label>
                  <input
                    type="text"
                    id="homeHeroName"
                    className="form-control"
                    placeholder="e.g. Vikramaditya Roy"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="pricingHeroPhone">Mobile / WhatsApp *</label>
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
                  <label htmlFor="pricingHeroEmail">Corporate Email *</label>
                  <input
                    type="email"
                    id="homeHeroEmail"
                    className="form-control"
                    placeholder="name@company.in"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="pricingHeroService">Selected Plan Calibre *</label>
                  <select id="homeHeroService" className="form-control" required defaultValue="Gold GST Ready">
                    <option value="Silver Business Address">Silver Business Address (₹899/mo)</option>
                    <option value="Gold GST Ready">Gold GST Ready (₹1,299/mo • Most Popular)</option>
                    <option value="Platinum Business Plus">Platinum Business Plus (₹2,199/mo)</option>
                    <option value="Coworking Dedicated Desks">Coworking Dedicated Desks (₹5,999/mo)</option>
                    <option value="Private Executive Cabin">Private Executive Cabin (₹18,999/mo)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="pricingHeroCity">Target City *</label>
                  <select id="homeHeroCity" className="form-control" required>
                    <option value="Delhi NCR">Delhi NCR (Aerocity, CP)</option>
                    <option value="Mumbai">Mumbai (BKC, Andheri)</option>
                    <option value="Bengaluru">Bengaluru (Koramangala)</option>
                    <option value="Gurugram">Gurugram (Cyber City)</option>
                    <option value="Nashik HQ">Nashik (Flagship HQ)</option>
                    <option value="Pune">Pune (Baner)</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="btn btn--gold btn--full"
                  style={{ padding: '13px', fontWeight: '700', marginTop: '6px' }}
                >
                  <i className="ph-bold ph-paper-plane-tilt" />
                  Lock in 20% Annual Discount →
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
