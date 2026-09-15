import { rawStyle } from '@/lib/domRefs.js';

/** SECTION: 5-DAY INCORPORATION TIMELINE ROADMAP */
export default function IncorporationTimelineSection() {
  return (
    <section className="section" style={{ padding: '70px 0', background: '#F8FAFC' }}>
      <div className="container">
        <div className="section__header section__header--center">
          <span className="section__eyebrow" style={{ color: 'var(--vd-teal-primary)' }}>
            <i className="ph-bold ph-clock" />
            Accelerated Turnaround
          </span>
          <h2 className="section__title">
            THE 5-DAY SPICe+ MCA
            <br />
            <span className="highlight-gold">INCORPORATION ROADMAP</span>
          </h2>
          <p className="section__desc">
            Track every milestone from digital signature token generation to final Certificate of Incorporation.
          </p>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginTop: '40px',
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '20px',
              borderTop: '4px solid #081D40',
            }}
          >
            <span
              ref={rawStyle(
                'background: #081D40; color: #FFFFFF; font-size: 0.72rem; font-weight: 700; padding: 2px 8px; border-radius: 4px;',
              )}
            >
              DAY 1
            </span>
            <h4 style={{ color: '#081D40', margin: '10px 0 6px 0', fontSize: '1.05rem' }}>DSC & DIN</h4>
            <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0' }}>
              Class-3 encrypted USB tokens generated. Director Identification Numbers applied.
            </p>
          </div>
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '20px',
              borderTop: '4px solid #C59239',
            }}
          >
            <span
              style={{
                background: '#C59239',
                color: '#05132B',
                fontSize: '0.72rem',
                fontWeight: '700',
                padding: '2px 8px',
                borderRadius: '4px',
              }}
            >
              DAY 2
            </span>
            <h4 style={{ color: '#081D40', margin: '10px 0 6px 0', fontSize: '1.05rem' }}>Name Approval</h4>
            <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0' }}>
              RUN / SPICe+ Part A filing with Ministry of Corporate Affairs for unique brand reservation.
            </p>
          </div>
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '20px',
              borderTop: '4px solid #081D40',
            }}
          >
            <span
              ref={rawStyle(
                'background: #081D40; color: #FFFFFF; font-size: 0.72rem; font-weight: 700; padding: 2px 8px; border-radius: 4px;',
              )}
            >
              DAY 3-4
            </span>
            <h4 style={{ color: '#081D40', margin: '10px 0 6px 0', fontSize: '1.05rem' }}>SPICe+ Part B</h4>
            <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0' }}>
              e-MOA, e-AOA drafting. AGILE-PRO integration with V-DESK registered office lease.
            </p>
          </div>
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '20px',
              borderTop: '4px solid #10B981',
            }}
          >
            <span
              style={{
                background: '#10B981',
                color: '#FFFFFF',
                fontSize: '0.72rem',
                fontWeight: '700',
                padding: '2px 8px',
                borderRadius: '4px',
              }}
            >
              DAY 5
            </span>
            <h4 style={{ color: '#081D40', margin: '10px 0 6px 0', fontSize: '1.05rem' }}>COI & PAN Issued</h4>
            <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0' }}>
              Official Certificate of Incorporation (COI) delivered with PAN, TAN, and EPFO/ESIC registrations.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
