import { rawStyle } from '@/lib/domRefs.js';

/** SECTION: OPERATIONAL SAVINGS COMPARISON (TRADITIONAL VS V-DESK) */
export default function SavingsComparisonSection() {
  return (
    <section className="section" style={{ padding: '70px 0', background: '#FFFFFF' }}>
      <div className="container">
        <div className="section__header section__header--center">
          <span className="section__eyebrow" style={{ color: '#C59239' }}>
            <i className="ph-bold ph-trend-up" />
            Fiscal Intelligence
          </span>
          <h2 className="section__title">
            88% OPERATIONAL SAVINGS
            <br />
            <span className="highlight-gold">VS TRADITIONAL COMMERCIAL LEASE</span>
          </h2>
          <p className="section__desc">
            Compare standard 1,000 sq.ft commercial office lock-in against V-DESK Virtual Office & Flexi Infrastructure.
          </p>
        </div>
        <div style={{ maxWidth: '820px', margin: '35px auto 0 auto', overflowX: 'auto' }}>
          <table
            className="tax-invoice-table"
            style={{
              background: '#FFF',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
            }}
          >
            <thead>
              <tr>
                <th ref={rawStyle('padding: 16px; background: #081D40; color: #FFF;')}>Expense Line Item</th>
                <th ref={rawStyle('padding: 16px; background: #081D40; color: #EF4444;')}>
                  Traditional Commercial Lease
                </th>
                <th ref={rawStyle('padding: 16px; background: #081D40; color: #10B981;')}>
                  V-DESK Virtual Infrastructure
                </th>
                <th ref={rawStyle('padding: 16px; background: #081D40; color: #C59239;')}>Net Savings</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>Security Deposit (6 Months)</strong>
                </td>
                <td style={{ color: '#EF4444' }}>₹3,60,000 (Locked capital)</td>
                <td style={{ color: '#10B981' }}>
                  <strong>₹0</strong> (Zero deposit)
                </td>
                <td>
                  <strong style={{ color: '#10B981' }}>₹3,60,000</strong>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Brokerage Fee</strong>
                </td>
                <td style={{ color: '#EF4444' }}>₹60,000 (1-month rent)</td>
                <td style={{ color: '#10B981' }}>
                  <strong>₹0</strong> (Direct sovereign)
                </td>
                <td>
                  <strong style={{ color: '#10B981' }}>₹60,000</strong>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Interior Fitouts & Furniture</strong>
                </td>
                <td style={{ color: '#EF4444' }}>₹4,50,000 (Sunk capital)</td>
                <td style={{ color: '#10B981' }}>
                  <strong>₹0</strong> (Ready infrastructure)
                </td>
                <td>
                  <strong style={{ color: '#10B981' }}>₹4,50,000</strong>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Annual Rent & Maintenance</strong>
                </td>
                <td style={{ color: '#EF4444' }}>₹7,20,000 / year</td>
                <td style={{ color: '#10B981' }}>
                  <strong>₹14,999 / year</strong>
                </td>
                <td>
                  <strong style={{ color: '#10B981' }}>₹7,05,001</strong>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Electricity, Internet & Housekeeping</strong>
                </td>
                <td style={{ color: '#EF4444' }}>₹1,80,000 / year</td>
                <td style={{ color: '#10B981' }}>
                  <strong>Included in plan</strong>
                </td>
                <td>
                  <strong style={{ color: '#10B981' }}>₹1,80,000</strong>
                </td>
              </tr>
              <tr style={{ background: '#FAF8F3', fontWeight: '800', fontSize: '1.05rem' }}>
                <td>First Year Total Outflow:</td>
                <td style={{ color: '#EF4444' }}>₹17,70,000</td>
                <td style={{ color: '#10B981' }}>₹14,999</td>
                <td>
                  <span style={{ color: '#10B981', fontSize: '1.2rem' }}>₹17,55,001 (99.1% Saved)</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
