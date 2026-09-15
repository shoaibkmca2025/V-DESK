import { openQuoteModal } from '@/features/quote/quoteModal.js';
import { generateWizardRecommendation, navigateWizard, selectWizardChoice } from '@/features/wizard/setupWizard.js';

export default function SetupWizardSection() {
  return (
    <section className="section wizard" id="wizard">
      <div className="container">
        <div className="section__header section__header--center reveal">
          <span className="section__eyebrow">Interactive Advisory</span>
          <h2 className="section__title">
            CUSTOMIZE YOUR
            <br />
            BUSINESS SETUP BLUEPRINT.
          </h2>
          <p className="section__desc">
            Complete our 5-step advisory flow to receive a personalized legal and workspace roadmap.
          </p>
        </div>
        <div className="wizard__container reveal">
          <div className="wizard__progress">
            <div
              className="wizard__step-node active"
              id="wizNode1"
              onClick={() => navigateWizard(1)}
              role="button"
              tabIndex="0"
              title="Step 1: Business Structure"
            >
              1
            </div>
            <div className="wizard__step-line" id="wizLine1" />
            <div
              className="wizard__step-node"
              id="wizNode2"
              onClick={() => navigateWizard(2)}
              role="button"
              tabIndex="0"
              title="Step 2: Operating City"
            >
              2
            </div>
            <div className="wizard__step-line" id="wizLine2" />
            <div
              className="wizard__step-node"
              id="wizNode3"
              onClick={() => navigateWizard(3)}
              role="button"
              tabIndex="0"
              title="Step 3: Services Required"
            >
              3
            </div>
            <div className="wizard__step-line" id="wizLine3" />
            <div
              className="wizard__step-node"
              id="wizNode4"
              onClick={() => navigateWizard(4)}
              role="button"
              tabIndex="0"
              title="Step 4: Operational Scale"
            >
              4
            </div>
            <div className="wizard__step-line" id="wizLine4" />
            <div
              className="wizard__step-node"
              id="wizNode5"
              onClick={() => navigateWizard(5)}
              role="button"
              tabIndex="0"
              title="Step 5: Recommendation Blueprint"
            >
              5
            </div>
          </div>
          <div className="wizard__pane active" id="wizPane1">
            <h3 className="wizard__pane-title">01. What is your intended business structure?</h3>
            <p className="wizard__pane-desc">Choose your legal entity type or operational model.</p>
            <div className="wizard__choices">
              <button
                className="wizard__choice selected"
                onClick={(event) => selectWizardChoice('entity', 'Private Limited Company', event.currentTarget)}
              >
                <strong>Private Limited (Pvt Ltd)</strong>
                <span>Ideal for scalable startups, equity funding & enterprise operations</span>
              </button>
              <button
                className="wizard__choice"
                onClick={(event) => selectWizardChoice('entity', 'LLP', event.currentTarget)}
              >
                <strong>LLP (Limited Liability Partnership)</strong>
                <span>Best for professional consultants, agencies & medium partnerships</span>
              </button>
              <button
                className="wizard__choice"
                onClick={(event) => selectWizardChoice('entity', 'E-Commerce (APOB/VPOB)', event.currentTarget)}
              >
                <strong>E-Commerce (Amazon/Flipkart)</strong>
                <span>Multi-state GST registration for e-commerce fulfillment hubs</span>
              </button>
              <button
                className="wizard__choice"
                onClick={(event) => selectWizardChoice('entity', 'Branch Expansion', event.currentTarget)}
              >
                <strong>Branch / Satellite Presence</strong>
                <span>Fast commercial entry into new Indian metropolitan territories</span>
              </button>
            </div>
            <div className="wizard__nav">
              <div />
              <button className="btn btn--primary" onClick={() => navigateWizard(2)}>
                Next: Select City →
              </button>
            </div>
          </div>
          <div className="wizard__pane" id="wizPane2">
            <h3 className="wizard__pane-title">02. Select your primary operating city</h3>
            <p className="wizard__pane-desc">Where would you like to register your business address?</p>
            <div className="wizard__choices">
              <button
                className="wizard__choice selected"
                onClick={(event) => selectWizardChoice('city', 'Nashik (Flagship)', event.currentTarget)}
              >
                <strong>Nashik (Flagship)</strong>
                <span>College Road & Gangapur Road Hubs</span>
              </button>
              <button
                className="wizard__choice"
                onClick={(event) => selectWizardChoice('city', 'Mumbai', event.currentTarget)}
              >
                <strong>Mumbai</strong>
                <span>BKC, Andheri East & Lower Parel</span>
              </button>
              <button
                className="wizard__choice"
                onClick={(event) => selectWizardChoice('city', 'Delhi NCR', event.currentTarget)}
              >
                <strong>Delhi NCR</strong>
                <span>Connaught Place & Cyber City Gurgaon</span>
              </button>
              <button
                className="wizard__choice"
                onClick={(event) => selectWizardChoice('city', 'Bangalore', event.currentTarget)}
              >
                <strong>Bangalore</strong>
                <span>Koramangala & HSR Layout</span>
              </button>
              <button
                className="wizard__choice"
                onClick={(event) => selectWizardChoice('city', 'Pune', event.currentTarget)}
              >
                <strong>Pune</strong>
                <span>Baner & Viman Nagar</span>
              </button>
              <button
                className="wizard__choice"
                onClick={(event) => selectWizardChoice('city', 'Hyderabad', event.currentTarget)}
              >
                <strong>Hyderabad</strong>
                <span>HITEC City & Madhapur</span>
              </button>
            </div>
            <div className="wizard__nav">
              <button className="btn btn--secondary" onClick={() => navigateWizard(1)}>
                ← Back
              </button>
              <button className="btn btn--primary" onClick={() => navigateWizard(3)}>
                Next: Select Services →
              </button>
            </div>
          </div>
          <div className="wizard__pane" id="wizPane3">
            <h3 className="wizard__pane-title">03. What specific solutions do you require?</h3>
            <p className="wizard__pane-desc">Select all that apply to your current business phase.</p>
            <div className="wizard__multi-grid">
              <label className="wizard__multi-option">
                <input type="checkbox" id="wizReqVO" defaultChecked />
                Virtual Office (Registered Commercial Address)
              </label>
              <label className="wizard__multi-option">
                <input type="checkbox" id="wizReqGST" defaultChecked />
                GST Registration & Filing Support
              </label>
              <label className="wizard__multi-option">
                <input type="checkbox" id="wizReqReg" defaultChecked />
                Company Incorporation (MCA SPICe+)
              </label>
              <label className="wizard__multi-option">
                <input type="checkbox" id="wizReqTM" />
                Trademark Search & Protection
              </label>
              <label className="wizard__multi-option">
                <input type="checkbox" id="wizReqCW" />
                Coworking Dedicated Workstations
              </label>
              <label className="wizard__multi-option">
                <input type="checkbox" id="wizReqMR" />
                On-Demand Executive Boardroom Access
              </label>
            </div>
            <div className="wizard__nav">
              <button className="btn btn--secondary" onClick={() => navigateWizard(2)}>
                ← Back
              </button>
              <button className="btn btn--primary" onClick={() => navigateWizard(4)}>
                Next: Operational Details →
              </button>
            </div>
          </div>
          <div className="wizard__pane" id="wizPane4">
            <h3 className="wizard__pane-title">04. Operational timeframe & scale</h3>
            <p className="wizard__pane-desc">Helps us allocate center resources and schedule document preparation.</p>
            <div className="wizard__form-fields">
              <div className="form-field">
                <label className="form-label" htmlFor="wizUrgency">
                  Required Activation Timeline
                </label>
                <select id="wizUrgency" className="form-select">
                  <option value="Urgent (Under 24 Hours)">Urgent (Within 24 Hours)</option>
                  <option value="This Week">Within This Week</option>
                  <option value="Next Month">Next Month</option>
                </select>
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="wizTeam">
                  Estimated Team Headcount
                </label>
                <select id="wizTeam" className="form-select">
                  <option value="Solo / 1-2 Co-founders">Solo / 1—2 Co-founders</option>
                  <option value="3-8 Team Members">3—8 Team Members</option>
                  <option value="9+ Members">9+ Enterprise Members</option>
                </select>
              </div>
            </div>
            <div className="wizard__nav">
              <button className="btn btn--secondary" onClick={() => navigateWizard(3)}>
                ← Back
              </button>
              <button className="btn btn--primary" onClick={() => generateWizardRecommendation()}>
                Generate Recommendation →
              </button>
            </div>
          </div>
          <div className="wizard__pane" id="wizPane5">
            <div className="wizard__result">
              <span className="wizard__result-badge">Personalized Consultation Blueprint</span>
              <h3 className="wizard__result-title">YOUR V-DESK BUSINESS BLUEPRINT IS READY.</h3>
              <div className="wizard__result-card">
                <h4 className="wizard__result-heading" id="recBundleHeading">
                  Virtual Office + GST + Company Registration
                </h4>
                <p className="wizard__result-desc" id="recBundleDesc">
                  Complete turnkey package including certified commercial rent deed, landlord NOC, MCA SPICe+
                  incorporation filing, and dedicated CA consultation.
                </p>
                <div className="wizard__result-meta">
                  <div className="wizard__result-stat">
                    <span>Estimated Investment:</span>
                    <strong id="recCost">₹18,999 (All-Inclusive)</strong>
                  </div>
                  <div className="wizard__result-stat">
                    <span>Activation Turnaround:</span>
                    <strong id="recTime">24—48 Working Hours</strong>
                  </div>
                  <div className="wizard__result-stat">
                    <span>Selected Prime Hub:</span>
                    <strong id="recCity">Nashik (Flagship)</strong>
                  </div>
                </div>
              </div>
              <div className="wizard__result-docs">
                <h4>Required KYC Document Checklist:</h4>
                <ul>
                  <li>PAN Card & Aadhaar Card of Directors / Partners / Proprietor</li>
                  <li>Passport Size Color Photograph & Specimen Signature</li>
                  <li>Two Proposed Corporate Names for MCA Name Approval</li>
                </ul>
              </div>
              <button className="btn btn--primary btn--lg btn--block" onClick={() => openQuoteModal('Wizard Result')}>
                GET MY PERSONALIZED BLUEPRINT QUOTE →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
