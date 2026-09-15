import { switchStandaloneAdminTab } from '@/features/admin/adminSuite.js';
import { exportLeadsToCSV } from '@/features/admin/leadActions.js';
import { rawStyle } from '@/lib/domRefs.js';

/** STANDALONE SUPER ADMIN SUITE (PRD Sec 42-44, 52-56) */
export default function AdminDashboard() {
  return (
    <section
      className="section admin-page-wrap"
      ref={rawStyle('background: #05132B; color: #FFFFFF; min-height: 85vh; padding: 40px 0;')}
    >
      <div className="container">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            paddingBottom: '16px',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#10B981',
                  display: 'inline-block',
                }}
              />
              <span className="beacon-dot emerald" />
              <span
                style={{
                  color: '#10B981',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  fontWeight: '700',
                  letterSpacing: '0.05em',
                }}
              >
                System Telemetry Online • Latency: 12ms • 10 Metros Synced
              </span>
            </div>
            <h1 style={{ color: '#FFFFFF', fontSize: '1.6rem', margin: '4px 0 0 0' }}>
              <i className="ph-bold ph-shield-check" style={{ color: '#C59239' }} /> V-DESK Operations & CRM Console
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
              Role: <strong>Principal Super Administrator</strong>
            </span>
            <button className="btn btn--outline btn--sm" onClick={() => exportLeadsToCSV()}>
              <i className="ph-bold ph-download-simple" />
              Export Leads CSV
            </button>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            gap: '10px',
            marginBottom: '24px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            paddingBottom: '12px',
            overflowX: 'auto',
          }}
        >
          <button
            type="button"
            className="standalone-admin-tab active"
            onClick={() => switchStandaloneAdminTab('dashboard')}
            data-tab="dashboard"
          >
            <i className="ph-bold ph-gauge" />
            Executive Dashboard
          </button>
          <button
            type="button"
            className="standalone-admin-tab"
            onClick={() => switchStandaloneAdminTab('pipeline')}
            data-tab="pipeline"
          >
            <i className="ph-bold ph-kanban" />
            Kanban Pipeline CRM
          </button>
          <button
            type="button"
            className="standalone-admin-tab"
            onClick={() => switchStandaloneAdminTab('telemetry')}
            data-tab="telemetry"
          >
            <i className="ph-bold ph-activity" />
            Search Telemetry Stream
          </button>
        </div>
        <div id="standaloneAdminTabBody" />
      </div>
    </section>
  );
}
