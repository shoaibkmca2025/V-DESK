import { updateTeamSavings } from '@/features/pricing/costCalculator.js';
import { openQuoteModal } from '@/features/quote/quoteModal.js';

/** SECTION: INTERACTIVE DAY PASS & TEAM FLEXI-PASS CALCULATOR */
export default function TeamSavingsCalculator() {
  return (
    <section className="section cw-calc-section" id="teamCalc">
      <div className="container">
        <div className="section__header section__header--center">
          <span className="section__eyebrow">
            <i className="ph-bold ph-chart-line-up" />
            Operational Cost Efficiency
          </span>
          <h2 className="section__title">
            TEAM FLEXI-PASS
            <br />
            <span className="highlight-gold">SAVINGS CALCULATOR</span>
          </h2>
          <p className="section__desc">
            See how much your organization saves switching from a rigid 3-year commercial lease to V-DESK agile
            flexi-passes.
          </p>
        </div>
        <div className="cw-calc-container">
          <div className="cw-calc-inputs-grid">
            <div>
              <label className="cw-calc-label" htmlFor="calcTeamSize">
                Team Size:{' '}
                <span id="teamSizeVal" style={{ color: '#DFB15B', fontSize: '1.2rem' }}>
                  10 Desks
                </span>
              </label>
              <input
                type="range"
                id="calcTeamSize"
                min="1"
                max="50"
                defaultValue="10"
                step="1"
                style={{ width: '100%', accentColor: '#C59239' }}
                onInput={(event) => updateTeamSavings(event.currentTarget.value)}
              />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.75rem',
                  color: '#94A3B8',
                  marginTop: '4px',
                }}
              >
                <span>1 Founder</span>
                <span>25 Members</span>
                <span>50 Pax</span>
              </div>
            </div>
            <div>
              <label className="cw-calc-label" htmlFor="calcSchedule">
                Workspace Schedule
              </label>
              <select
                id="calcSchedule"
                className="form-select cw-calc-select"
                onChange={() => updateTeamSavings()}
                defaultValue="3"
              >
                <option value="5">Full-Time (5 Days / Week)</option>
                <option value="3">Hybrid (3 Days / Week — Recommended)</option>
                <option value="2">Flexi (2 Days / Week)</option>
              </select>
            </div>
          </div>
          <div className="cw-calc-results-grid">
            <div className="cw-calc-result-box">
              <span className="cw-calc-res-title">Traditional Lease Cost</span>
              <strong id="tradCost" style={{ fontSize: '1.3rem', color: '#EF4444', fontWeight: '800' }}>
                ₹1,20,000<small style={{ fontSize: '0.75rem', fontWeight: '400' }}>/mo</small>
              </strong>
              <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Incl. rent, fitouts, AC & power</div>
            </div>
            <div className="cw-calc-result-box">
              <span className="cw-calc-res-title">V-DESK Flexi-Pass</span>
              <strong id="vdeskCost" style={{ fontSize: '1.3rem', color: '#DFB15B', fontWeight: '800' }}>
                ₹35,000<small style={{ fontSize: '0.75rem', fontWeight: '400' }}>/mo</small>
              </strong>
              <div style={{ fontSize: '0.72rem', color: '#10B981' }}>Zero deposit, cancel anytime</div>
            </div>
            <div className="cw-calc-result-box highlight">
              <span className="cw-calc-res-title" style={{ color: '#10B981' }}>
                Net Monthly Savings
              </span>
              <strong id="savingsCost" style={{ fontSize: '1.4rem', color: '#10B981', fontWeight: '800' }}>
                ₹85,000<small style={{ fontSize: '0.75rem', fontWeight: '400' }}>/mo (71%)</small>
              </strong>
              <div style={{ fontSize: '0.72rem', color: '#10B981' }}>Annual ROI: ₹10.2 Lakhs</div>
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
              marginTop: '24px',
            }}
          >
            <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
              <i className="ph-bold ph-shield-check" style={{ color: '#10B981' }} /> Includes enterprise Wi-Fi, meeting
              room credits & pantry access.
            </span>
            <button className="btn btn--gold" onClick={() => openQuoteModal('Team Coworking Flexi-Pass')}>
              <i className="ph-bold ph-paper-plane-tilt" />
              Lock in Team Quote →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
