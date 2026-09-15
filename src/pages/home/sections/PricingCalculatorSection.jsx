import { runCostCalculation, setBillingTenure, updateTeamSlider } from '@/features/pricing/costCalculator.js';
import { openQuoteModal } from '@/features/quote/quoteModal.js';

/** SECTION 07 &mdash; PRICING / ROI FINANCIAL CALCULATOR Traditional Lease vs. V-DESK Smart Solution Comparison */
export default function PricingCalculatorSection() {
  return (
    <section className="section pricing" id="pricing">
      <div className="container">
        <div className="section__header section__header--center reveal">
          <span className="section__eyebrow">Financial Efficiency</span>
          <h2 className="section__title">
            CALCULATE YOUR
            <br />
            OPERATIONAL SAVINGS.
          </h2>
          <p className="section__desc">
            See how modern commercial infrastructure saves up to 88% compared to traditional lock-in commercial leases.
          </p>
        </div>
        <div className="pricing-tenure-wrap reveal">
          <div className="pricing-tenure-toggle" role="group" aria-label="Billing Commitment">
            <button
              type="button"
              className="tenure-pill active"
              id="tenureAnnualBtn"
              onClick={() => setBillingTenure('annual')}
            >
              <span>Annual Commitment</span>
              <span className="tenure-save-badge">Save 20%</span>
            </button>
            <button
              type="button"
              className="tenure-pill"
              id="tenureFlexibleBtn"
              onClick={() => setBillingTenure('flexible')}
            >
              <span>Quarterly / Flexible</span>
            </button>
          </div>
        </div>
        <div className="pricing__layout">
          <div className="pricing__controls reveal">
            <div className="pricing__field">
              <div className="pricing__label">
                <span>1. Select Target Commercial Tier</span>
              </div>
              <select
                id="calcCity"
                className="pricing__select"
                onChange={() => runCostCalculation()}
                defaultValue="Tier-2 Commercial Hub (Pune / Nashik)"
              >
                <option value="Tier-1 Metro (Mumbai / Delhi / BLR)">Tier-1 Metro (Mumbai / Delhi / Bangalore)</option>
                <option value="Tier-2 Commercial Hub (Pune / Nashik)">Tier-2 Commercial Hub (Pune / Nashik)</option>
                <option value="Tier-3 Emerging Cities">Tier-3 Emerging Commercial Hubs</option>
              </select>
            </div>
            <div className="pricing__field">
              <div className="pricing__label">
                <span>2. Primary Workspace Service</span>
              </div>
              <select
                id="calcService"
                className="pricing__select"
                onChange={() => runCostCalculation()}
                defaultValue="Virtual Office for GST"
              >
                <option value="Virtual Office for GST">Virtual Office for GST</option>
                <option value="Coworking Dedicated Desks">Coworking Dedicated Desks</option>
                <option value="Private Office Cabin">Private Office Cabin</option>
                <option value="Hybrid Combo">Hybrid Virtual + Workspaces</option>
              </select>
            </div>
            <div className="pricing__field">
              <div className="pricing__label">
                <span>3. Team Capacity</span>
                <span className="pricing__label-badge" id="calcTeamDisplay">
                  5 Members
                </span>
              </div>
              <div className="pricing__range-wrap">
                <input
                  type="range"
                  id="calcTeamSlider"
                  className="pricing__range"
                  min="1"
                  max="50"
                  defaultValue="5"
                  onInput={(event) => updateTeamSlider(event.currentTarget.value)}
                />
              </div>
            </div>
            <div className="pricing__field">
              <div className="pricing__label">
                <span>4. Agreement Duration</span>
              </div>
              <select
                id="calcDuration"
                className="pricing__select"
                onChange={() => runCostCalculation()}
                defaultValue="12"
              >
                <option value="12">12 Months (20% Annual Savings)</option>
                <option value="6">6 Months</option>
                <option value="24">24 Months (Long-Term Rate Lock)</option>
              </select>
            </div>
            <div className="pricing__field">
              <div className="pricing__label">
                <span>5. Enterprise Add-ons</span>
              </div>
              <div className="pricing__checkbox-group">
                <label className="pricing__checkbox-label">
                  <input type="checkbox" id="calcAddonGST" defaultChecked onChange={() => runCostCalculation()} />
                  <span>GST Monthly Filing & Senior CA Support</span>
                </label>
                <label className="pricing__checkbox-label">
                  <input type="checkbox" id="calcAddonMeeting" onChange={() => runCostCalculation()} />
                  <span>Monthly 10-Hour Executive Boardroom Bundle</span>
                </label>
              </div>
            </div>
          </div>
          <div className="pricing__summary reveal">
            <div className="pricing__summary-kicker">Comparative Cost Breakdown</div>
            <div className="pricing__comparison">
              <div className="pricing__bar">
                <div className="pricing__bar-header">
                  <span className="pricing__bar-title">Traditional Commercial Lease (Deposit, Fitouts, Rent)</span>
                  <span className="pricing__bar-value" id="tradLeaseVal">
                    ₹14,40,000 / yr
                  </span>
                </div>
                <div className="pricing__bar-track">
                  <div className="pricing__bar-fill pricing__bar-fill--trad" style={{ width: '100%' }} />
                </div>
              </div>
              <div className="pricing__bar">
                <div className="pricing__bar-header">
                  <span className="pricing__bar-title">V-DESK Smart Solution (Zero Brokerage, Zero Fitouts)</span>
                  <span className="pricing__bar-value pricing__bar-value--accent" id="vdeskEstVal">
                    ₹17,988 / yr
                  </span>
                </div>
                <div className="pricing__bar-track">
                  <div
                    className="pricing__bar-fill pricing__bar-fill--vdesk"
                    id="vdeskFillBar"
                    style={{ width: '15%' }}
                  />
                </div>
              </div>
            </div>
            <div className="pricing__savings">
              <div className="pricing__savings-value" id="vdeskSavingsPercent">
                88%
              </div>
              <div className="pricing__savings-label">Net Annual Capital Saved</div>
            </div>
            <div className="pricing__breakdown">
              <div className="pricing__breakdown-row">
                <span>Selected Plan:</span>
                <strong id="calcPlanSummary">Virtual Office for GST</strong>
              </div>
              <div className="pricing__breakdown-row">
                <span>Agreement Duration:</span>
                <strong id="calcDurationSummary">12 Months</strong>
              </div>
              <div className="pricing__breakdown-row">
                <span>Included Add-ons:</span>
                <strong id="calcAddonsSummary">GST Filing & CA Support</strong>
              </div>
            </div>
            <button className="btn btn--primary btn--block btn--lg" onClick={() => openQuoteModal('Calculator CTA')}>
              GET MY EXACT QUOTE →
            </button>
            <p className="pricing__disclaimer">
              *Cost comparison is an automated projection for financial planning based on market real estate benchmarks.
              Final binding quotations are issued following KYC verification.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
