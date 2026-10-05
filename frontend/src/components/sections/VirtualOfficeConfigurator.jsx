import {
  generateVoFormalQuote,
  handleVoCentreChange,
  handleVoCityChange,
  proceedVoToKyc,
  selectVoPurpose,
  setVoTenure,
  updateVoDynamicPrice,
} from '@/features/virtualOffice/voConfigurator.js';

/** Virtual office setup configurator with live pricing (PRD §24–29). */
export default function VirtualOfficeConfigurator() {
  return (
    <section className="section vo-platform-section" id="voConfigurator">
      <div className="container">
        <div className="ui-section-head ui-section-head--center">
          <span className="ui-kicker">Custom plan</span>
          <h2 className="ui-title">
            Build your own <em>virtual office plan</em>
          </h2>
          <p className="ui-lead">Choose a city, what you&apos;ll use the address for and any extras. Your price updates as you go.</p>
        </div>
        <div className="vo-journey-stepper reveal">
          <div className="vo-step-item active">
            <div className="vo-step-num">1</div>
            <span className="vo-step-label">Location</span>
          </div>
          <div className="vo-step-line" />
          <div className="vo-step-item active">
            <div className="vo-step-num">2</div>
            <span className="vo-step-label">Centre</span>
          </div>
          <div className="vo-step-line" />
          <div className="vo-step-item active">
            <div className="vo-step-num">3</div>
            <span className="vo-step-label">Purpose</span>
          </div>
          <div className="vo-step-line" />
          <div className="vo-step-item active">
            <div className="vo-step-num">4</div>
            <span className="vo-step-label">Configure</span>
          </div>
          <div className="vo-step-line" />
          <div className="vo-step-item">
            <div className="vo-step-num">5</div>
            <span className="vo-step-label">Pricing</span>
          </div>
          <div className="vo-step-line" />
          <div className="vo-step-item">
            <div className="vo-step-num">6</div>
            <span className="vo-step-label">KYC</span>
          </div>
          <div className="vo-step-line" />
          <div className="vo-step-item">
            <div className="vo-step-num">7</div>
            <span className="vo-step-label">Payment</span>
          </div>
          <div className="vo-step-line" />
          <div className="vo-step-item">
            <div className="vo-step-num">8</div>
            <span className="vo-step-label">Activation</span>
          </div>
        </div>
        <div className="vo-config-grid reveal">
          <div className="vo-config-controls">
            <div className="vo-card-box">
              <h3 className="vo-box-title">
                <i className="ph-bold ph-map-pin" />
                1. Select City & Commercial Centre
              </h3>
              <div className="vo-input-row">
                <div className="form-field">
                  <label className="form-label" htmlFor="voCitySelect">
                    Target City
                  </label>
                  <select
                    id="voCitySelect"
                    className="form-select"
                    onChange={(event) => handleVoCityChange(event.currentTarget.value)}
                    defaultValue="Nashik"
                  >
                    <option value="Mumbai">Mumbai (BKC, Andheri, Lower Parel)</option>
                    <option value="Delhi">Delhi NCR (Connaught Place, Cyber City)</option>
                    <option value="Bangalore">Bangalore (Koramangala, HSR Layout)</option>
                    <option value="Nashik">Nashik (College Road Flagship HQ)</option>
                    <option value="Pune">Pune (Baner, Viman Nagar)</option>
                    <option value="Hyderabad">Hyderabad (HITEC City, Madhapur)</option>
                    <option value="Gurgaon">Gurgaon (DLF Cyber City)</option>
                    <option value="Noida">Noida (Sector 62)</option>
                  </select>
                </div>
                <div className="form-field">
                  <label className="form-label" htmlFor="voCentreSelect">
                    Commercial Centre / Building
                  </label>
                  <select
                    id="voCentreSelect"
                    className="form-select"
                    onChange={(event) => handleVoCentreChange(event.currentTarget.value)}
                  >
                    <option value="NSK-001">V-DESK Headquarters — College Road (Flagship)</option>
                    <option value="NSK-002">Phoenix Business Park — Gangapur Road</option>
                  </select>
                </div>
              </div>
              <div className="vo-centre-meta-banner" id="voCentreMetaBanner">
                <div className="centre-meta-left">
                  <span className="centre-meta-badge">
                    <i className="ph-bold ph-seal-check" />
                    Grade-A Verified
                  </span>
                  <span className="centre-meta-badge">
                    <i className="ph-bold ph-certificate" />
                    100% GST & MCA Suitable
                  </span>
                </div>
                <div className="centre-meta-right">
                  <span className="centre-sla">
                    <i className="ph-bold ph-lightning" />
                    24h Document SLA
                  </span>
                </div>
              </div>
            </div>
            <div className="vo-card-box">
              <h3 className="vo-box-title">
                <i className="ph-bold ph-target" />
                2. What are you using this address for?
              </h3>
              <div className="vo-purpose-grid" id="voPurposeGrid">
                <button
                  type="button"
                  className="vo-purpose-btn active"
                  data-purpose="GST Registration"
                  onClick={(event) => selectVoPurpose(event.currentTarget, 'GST Registration')}
                >
                  <i className="ph-bold ph-certificate" />
                  <div className="purpose-btn-info">
                    <strong>GST Registration</strong>
                    <span>PPOB / Multi-state APOB</span>
                  </div>
                </button>
                <button
                  type="button"
                  className="vo-purpose-btn"
                  data-purpose="Business Address"
                  onClick={(event) => selectVoPurpose(event.currentTarget, 'Business Address')}
                >
                  <i className="ph-bold ph-buildings" />
                  <div className="purpose-btn-info">
                    <strong>Business Address</strong>
                    <span>Prime Commercial Location</span>
                  </div>
                </button>
                <button
                  type="button"
                  className="vo-purpose-btn"
                  data-purpose="Company Registration"
                  onClick={(event) => selectVoPurpose(event.currentTarget, 'Company Registration')}
                >
                  <i className="ph-bold ph-file-text" />
                  <div className="purpose-btn-info">
                    <strong>Company Registration</strong>
                    <span>MCA SPICe+ & CIN Filing</span>
                  </div>
                </button>
                <button
                  type="button"
                  className="vo-purpose-btn"
                  data-purpose="E-commerce"
                  onClick={(event) => selectVoPurpose(event.currentTarget, 'E-commerce')}
                >
                  <i className="ph-bold ph-shopping-cart" />
                  <div className="purpose-btn-info">
                    <strong>E-commerce Hub</strong>
                    <span>Amazon FBA / Flipkart Hub</span>
                  </div>
                </button>
                <button
                  type="button"
                  className="vo-purpose-btn"
                  data-purpose="Branch / Expansion"
                  onClick={(event) => selectVoPurpose(event.currentTarget, 'Branch / Expansion')}
                >
                  <i className="ph-bold ph-arrows-out-cardinal" />
                  <div className="purpose-btn-info">
                    <strong>Branch / Expansion</strong>
                    <span>New State Satellite Office</span>
                  </div>
                </button>
                <button
                  type="button"
                  className="vo-purpose-btn"
                  data-purpose="Mail & Correspondence"
                  onClick={(event) => selectVoPurpose(event.currentTarget, 'Mail & Correspondence')}
                >
                  <i className="ph-bold ph-envelope" />
                  <div className="purpose-btn-info">
                    <strong>Mail & Correspondence</strong>
                    <span>Digital Scan & Forwarding</span>
                  </div>
                </button>
              </div>
            </div>
            <div className="vo-card-box">
              <h3 className="vo-box-title">
                <i className="ph-bold ph-check-square" />
                3. Select Setup Components (Add-Ons)
              </h3>
              <div className="vo-addons-list">
                <label className="vo-addon-item">
                  <input type="checkbox" id="voAddonBase" defaultChecked disabled />
                  <div className="addon-info">
                    <strong>Commercial Business Address & Lease Agreement</strong>
                    <span>Includes registered rent agreement, electricity bill, and owner NOC for filing</span>
                  </div>
                  <div className="addon-price" id="voAddonBasePrice">
                    ₹1,249<small>/mo</small>
                  </div>
                </label>
                <label className="vo-addon-item">
                  <input type="checkbox" id="voAddonGst" defaultChecked onChange={() => updateVoDynamicPrice()} />
                  <div className="addon-info">
                    <strong>Dedicated GST Compliance & Officer Desk Support</strong>
                    <span>NOC verification, physical board signage, and inspection attendance</span>
                  </div>
                  <div className="addon-price">
                    +₹350<small>/mo</small>
                  </div>
                </label>
                <label className="vo-addon-item">
                  <input type="checkbox" id="voAddonIncorporation" onChange={() => updateVoDynamicPrice()} />
                  <div className="addon-info">
                    <strong>Company Incorporation Fast-Track (MCA SPICe+)</strong>
                    <span>Name reservation, DIN, PAN, TAN, MOA/AOA & Certificate of Incorporation</span>
                  </div>
                  <div className="addon-price">
                    +₹2,999<small> (One-time)</small>
                  </div>
                </label>
                <label className="vo-addon-item">
                  <input type="checkbox" id="voAddonMail" defaultChecked onChange={() => updateVoDynamicPrice()} />
                  <div className="addon-info">
                    <strong>Physical Mail & Courier Concierge</strong>
                    <span>Daily mail logging, envelope scans on WhatsApp, and monthly courier forwarding</span>
                  </div>
                  <div className="addon-price">
                    +₹299<small>/mo</small>
                  </div>
                </label>
                <label className="vo-addon-item">
                  <input type="checkbox" id="voAddonMeetingCredits" onChange={() => updateVoDynamicPrice()} />
                  <div className="addon-info">
                    <strong>Monthly 4K Meeting Room Credits (5 Hours/mo)</strong>
                    <span>High-speed Wi-Fi, 65" 4K presentation display, tea/coffee service</span>
                  </div>
                  <div className="addon-price">
                    +₹999<small>/mo</small>
                  </div>
                </label>
              </div>
            </div>
          </div>
          <div className="vo-config-summary">
            <div className="vo-summary-card">
              <div className="summary-header">
                <span className="summary-tag">
                  <i className="ph-bold ph-receipt" />
                  YOUR BUSINESS SETUP
                </span>
                <h4 className="summary-title" id="voSummaryTitle">
                  Nashik Flagship Setup
                </h4>
                <p className="summary-sub" id="voSummarySubtitle">
                  Configured for GST Registration & Commercial Compliance
                </p>
              </div>
              <div className="vo-tenure-toggle">
                <button
                  type="button"
                  className="vo-tenure-btn"
                  id="voTenureMonthly"
                  onClick={() => setVoTenure('monthly')}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  className="vo-tenure-btn active"
                  id="voTenureAnnual"
                  onClick={() => setVoTenure('annual')}
                >
                  Annual (Save 20%)
                </button>
              </div>
              <div className="vo-breakdown-table">
                <div className="breakdown-row">
                  <span>Base Business Address:</span>
                  <strong id="voCalcBase">₹1,249 / mo</strong>
                </div>
                <div className="breakdown-row">
                  <span>Location Adjustment:</span>
                  <strong id="voCalcLocationAdj">₹0 (Nashik HQ)</strong>
                </div>
                <div className="breakdown-row">
                  <span>Selected Add-Ons:</span>
                  <strong id="voCalcAddons">₹649 / mo</strong>
                </div>
                <div className="breakdown-row" id="voDiscountRow">
                  <span style={{ color: 'var(--vd-gold-primary)' }}>Annual Discount (20% Off):</span>
                  <strong style={{ color: 'var(--vd-gold-primary)' }} id="voCalcDiscount">
                    -₹4,555
                  </strong>
                </div>
                <div className="breakdown-row">
                  <span>GST (18% Applicable):</span>
                  <strong id="voCalcTaxes">₹3,279</strong>
                </div>
                <div className="breakdown-divider" />
                <div className="breakdown-row breakdown-row--total">
                  <span>Estimated Total:</span>
                  <div className="total-wrap">
                    <span className="total-amount" id="voCalcTotal">
                      ₹21,499
                    </span>
                    <span className="total-period" id="voCalcPeriod">
                      for 12 Months (All-Inclusive)
                    </span>
                  </div>
                </div>
              </div>
              <div className="vo-summary-actions">
                <button type="button" className="btn btn--primary btn--block btn--lg" onClick={() => proceedVoToKyc()}>
                  <i className="ph-bold ph-fingerprint" />
                  Continue to Digital KYC →
                </button>
                <button type="button" className="btn btn--secondary btn--block" onClick={() => generateVoFormalQuote()}>
                  <i className="ph-bold ph-file-pdf" />
                  Generate Official Quote PDF
                </button>
                <a
                  href="https://wa.me/919876543210?text=Hi%20V-DESK%20Team,%20I%20have%20configured%20a%20Virtual%20Office%20setup%20and%20need%20custom%20assistance"
                  target="_blank"
                  rel="noopener"
                  className="vo-whatsapp-cta"
                >
                  <i className="ph-bold ph-whatsapp-logo" />
                  Consult Specialist on WhatsApp
                </a>
              </div>
              <div className="vo-guarantee-note">
                <i className="ph-bold ph-shield-check" />
                <span>
                  <strong>100% Approval Guarantee:</strong> If your GST or MCA filing is rejected due to premises
                  documentation, 100% refund is processed with zero deductions.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
