import { PIPELINE_STAGES } from '@/data/constants.js';
import { getTelemetryEvents } from '@/features/analytics/telemetry.js';
import { catalog } from '@/features/catalog/catalogStore.js';
import { calculateLeadScore, getLeads } from '@/features/crm/leadStore.js';
import { action, escapeHtml } from '@/lib/html.js';
import { renderAdminLeads } from './adminLeadsTable.js';

/* Admin operations suite (PRD §42–44, §52–56): the modal (#adminSuiteModal) and the /admin page. */

let activeAdminTab = 'dashboard';
let activeStandaloneTab = 'dashboard';

function setActiveTab(selector, tab) {
  document.querySelectorAll(selector).forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
}

function kanbanBoard(leads) {
  return PIPELINE_STAGES.map((stage) => {
    const matching = leads.filter((l) => (l.status || 'NEW') === stage);
    return `
            <div class="kanban-col">
              <div class="kanban-col-header">
                <span>${stage}</span>
                <span class="kanban-col-count">${matching.length}</span>
              </div>
              <div class="kanban-cards-stack">
                ${matching
                  .map((l) => {
                    const score = calculateLeadScore(l);
                    return `
                    <div class="kanban-card" ${action('advanceLeadStatus', l.id)}>
                      <div class="kanban-card-top">
                        <strong>${escapeHtml(l.name || 'Unnamed')}</strong>
                        <span class="lead-score-pill ${score >= 70 ? 'high' : 'med'}">${score} pts</span>
                      </div>
                      <div style="font-size: 0.76rem; color: rgba(255,255,255,0.7);">${escapeHtml(l.company || 'Enterprise')} &bull; ${escapeHtml(l.city || 'Pan-India')}</div>
                      <div style="font-size: 0.72rem; color: var(--vd-gold-primary); margin-top: 4px;">${escapeHtml(l.plan || l.service || 'Virtual Office')}</div>
                      <div style="font-size: 0.68rem; color: rgba(255,255,255,0.5); margin-top: 4px;">Click to advance stage &rarr;</div>
                    </div>
                  `;
                  })
                  .join('')}
                ${matching.length === 0 ? '<div style="font-size: 0.76rem; color: rgba(255,255,255,0.4); text-align: center; padding: 20px;">No leads</div>' : ''}
              </div>
            </div>
          `;
  }).join('');
}

function telemetryLog(events) {
  return `
        ${events.length === 0 ? '<div style="color: #64748B;">No telemetry events recorded yet. Perform searches to see live log.</div>' : ''}
        ${events
          .map(
            (e) => `
          <div style="margin-bottom: 8px; border-bottom: 1px solid #1E293B; padding-bottom: 4px;">
            <span style="color: #10B981;">[${new Date(e.timestamp).toLocaleTimeString()}]</span>
            <strong style="color: var(--vd-gold-primary); margin: 0 8px;">${escapeHtml(e.type)}</strong>
            <span style="color: #94A3B8;">(${escapeHtml(e.device)})</span>
            <span style="color: #E2E8F0; margin-left: 8px;">${escapeHtml(JSON.stringify(e.data))}</span>
          </div>
        `,
          )
          .join('')}`;
}

function renderTelemetryInto(container) {
  const log = container.querySelector('[data-telemetry-log]');
  if (log) log.innerHTML = telemetryLog(getTelemetryEvents());
}

/* ---------------------------------------------------------------------------
   Modal admin suite (#adminSuiteModal)
   --------------------------------------------------------------------------- */
export function switchAdminTab(tab) {
  activeAdminTab = tab;
  setActiveTab('.admin-nav-tabs .admin-tab', tab);

  const body = document.getElementById('adminTabBody');
  if (!body) return;

  const leads = getLeads();

  if (tab === 'dashboard') {
    body.innerHTML = `
      <div class="admin-kpi-grid">
        <div class="admin-kpi-card">
          <span class="admin-kpi-lbl">Total Leads</span>
          <strong class="admin-kpi-val">${leads.length}</strong>
          <span class="admin-kpi-trend">↑ 18% vs last month</span>
        </div>
        <div class="admin-kpi-card">
          <span class="admin-kpi-lbl">Conversion Rate</span>
          <strong class="admin-kpi-val">28.4%</strong>
          <span class="admin-kpi-trend">Industry Avg: 12%</span>
        </div>
        <div class="admin-kpi-card">
          <span class="admin-kpi-lbl">Active Virtual Offices</span>
          <strong class="admin-kpi-val">1,482</strong>
          <span class="admin-kpi-trend">Across 10 Metros</span>
        </div>
        <div class="admin-kpi-card">
          <span class="admin-kpi-lbl">MRR (Infrastructure)</span>
          <strong class="admin-kpi-val">₹38.4L</strong>
          <span class="admin-kpi-trend">98.2% Renewal Rate</span>
        </div>
      </div>

      <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 20px;">
        <h4 style="margin-top: 0; color: var(--vd-gold-primary);"><i class="ph-bold ph-lightning"></i> Recent Operational Activity</h4>
        <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.85rem; line-height: 2;">
          <li>✓ New KYC dossier submitted for <strong>Zenith D2C Brands (Mumbai BKC)</strong> &bull; 10m ago</li>
          <li>✓ Boardroom reserved at <strong>Nashik Headquarters (8 Pax)</strong> &bull; 25m ago</li>
          <li>✓ GST NOC generated for <strong>Patel &amp; Associates (Delhi CP)</strong> &bull; 1h ago</li>
          <li>✓ Annual renewal processed for <strong>Artisan Commerce (Bangalore)</strong> &bull; 2h ago</li>
        </ul>
      </div>
    `;
  } else if (tab === 'pipeline') {
    body.innerHTML = `
      <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
        <h4 style="margin: 0; color: #fff;">Pipeline Stages: NEW → CONTACTED → QUALIFIED → PROPOSAL → WON</h4>
        <button class="btn btn--outline btn--sm" ${action('exportLeadsToCSV')}><i class="ph-bold ph-download-simple"></i> Export CSV</button>
      </div>

      <div class="admin-pipeline-kanban">
        ${kanbanBoard(leads)}
      </div>
    `;
  } else if (tab === 'customers') {
    body.innerHTML = `
      <h4 style="color: #fff; margin-top: 0;">Active Customer Accounts</h4>
      <table class="proposal-table" style="background: rgba(255,255,255,0.03); color: #fff;">
        <thead>
          <tr><th>Client</th><th>Entity</th><th>City</th><th>Plan</th><th>Next Renewal</th><th>Status</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>Zenith D2C Brands</td>
            <td>Pvt Ltd</td>
            <td>Mumbai (BKC)</td>
            <td>Virtual Office + GST</td>
            <td>12 Mar 2027</td>
            <td><span style="color:#10B981;">Active</span></td>
          </tr>
          <tr>
            <td>Patel &amp; Associates</td>
            <td>CA Firm</td>
            <td>Delhi (CP)</td>
            <td>Multi-City Suite</td>
            <td>28 Oct 2026</td>
            <td><span style="color:#10B981;">Active</span></td>
          </tr>
          <tr>
            <td>Artisan Commerce</td>
            <td>Pvt Ltd</td>
            <td>Bangalore</td>
            <td>APOB Hub</td>
            <td>05 Jun 2027</td>
            <td><span style="color:#10B981;">Active</span></td>
          </tr>
        </tbody>
      </table>
    `;
  } else if (tab === 'inventory') {
    body.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h4 style="margin: 0; color: #fff;">Commercial Centres &amp; Workspace Inventory</h4>
        <button class="btn btn--primary btn--sm" ${action('showToast', 'Inventory Manager', 'Ready to add new Grade-A commercial centre.', 'info')}>+ Add Centre</button>
      </div>
      <table class="proposal-table" style="background: rgba(255,255,255,0.03); color: #fff;">
        <thead>
          <tr><th>Code</th><th>Centre Name</th><th>City</th><th>VO Rate</th><th>Desks</th><th>Status</th></tr>
        </thead>
        <tbody>
          ${catalog.locations
            .map(
              (l) => `
            <tr>
              <td><code>${escapeHtml(l.id)}</code></td>
              <td><strong>${escapeHtml(l.fullName)}</strong></td>
              <td>${escapeHtml(l.city)}</td>
              <td>₹${l.vo_price}/mo</td>
              <td>${escapeHtml(l.meetingCapacity)}</td>
              <td><span style="color:#10B981;">● Online</span></td>
            </tr>
          `,
            )
            .join('')}
        </tbody>
      </table>
    `;
  } else if (tab === 'pricing') {
    body.innerHTML = `
      <h4 style="color: #fff; margin-top: 0;">Dynamic Pricing Rules Engine</h4>
      <p style="color: rgba(255,255,255,0.7); font-size: 0.85rem;">Formula: Base Price + Location Multiplier + Add-Ons - Discounts + Statutory Taxes (18% GST)</p>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <div style="background: rgba(255,255,255,0.04); padding: 18px; border-radius: 12px;">
          <h5 style="color: var(--vd-gold-primary); margin-top: 0;">City Multipliers</h5>
          <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.84rem; line-height: 2;">
            <li>Mumbai MMR: <strong>+₹750/mo</strong></li>
            <li>Delhi NCR: <strong>+₹550/mo</strong></li>
            <li>Bangalore Tech: <strong>+₹500/mo</strong></li>
            <li>Nashik Flagship: <strong>Base Rate (₹0 adjustment)</strong></li>
          </ul>
        </div>
        <div style="background: rgba(255,255,255,0.04); padding: 18px; border-radius: 12px;">
          <h5 style="color: var(--vd-gold-primary); margin-top: 0;">Statutory Add-On Rules</h5>
          <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.84rem; line-height: 2;">
            <li>Dedicated GST Compliance NOC: <strong>+₹350/mo</strong></li>
            <li>Mail Forwarding Concierge: <strong>+₹299/mo</strong></li>
            <li>Incorporation Fast-Track: <strong>+₹2,999 one-time</strong></li>
            <li>Annual Tenure Discount: <strong>20% Off Gross</strong></li>
          </ul>
        </div>
      </div>
    `;
  } else if (tab === 'kyc') {
    body.innerHTML = `
      <h4 style="color: #fff; margin-top: 0;">Compliance &amp; KYC Verification Desk</h4>
      <div style="background: rgba(255,255,255,0.04); border-radius: 12px; padding: 16px; margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong>Acme Technologies Pvt Ltd (CIN: U74999MH2026PTC9812)</strong>
            <div style="font-size: 0.8rem; color: rgba(255,255,255,0.7);">Director: Vikramaditya Roy &bull; PAN, Aadhaar, Bank Proof Uploaded</div>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn--primary btn--sm" ${action('showToast', 'KYC Approved ✓', 'Dossier approved. Notarized rent agreement queued for dispatch.', 'success')}>Approve Dossier</button>
            <button class="btn btn--outline btn--sm" ${action('showToast', 'Clarification Sent', 'Requested re-upload of electricity bill.', 'info')}>Query / Reject</button>
          </div>
        </div>
      </div>
    `;
  } else if (tab === 'cms') {
    body.innerHTML = `
      <h4 style="color: #fff; margin-top: 0;">CMS &amp; Universal Search Configuration</h4>
      <div style="background: rgba(255,255,255,0.04); padding: 18px; border-radius: 12px;">
        <h5 style="color: var(--vd-gold-primary); margin-top: 0;">Configured Popular Search Chips</h5>
        <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px;">
          <span class="hero-chip">Mumbai</span>
          <span class="hero-chip">Delhi</span>
          <span class="hero-chip">Nashik</span>
          <span class="hero-chip">Bangalore</span>
          <span class="hero-chip">Virtual Office</span>
          <span class="hero-chip">Coworking</span>
          <span class="hero-chip">Private Office</span>
          <span class="hero-chip">GST</span>
        </div>
        <button class="btn btn--primary btn--sm" ${action('showToast', 'CMS Updated', 'Search controls and chips synchronized.', 'success')}>Save Configuration</button>
      </div>
    `;
  } else if (tab === 'telemetry') {
    body.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h4 style="margin: 0; color: #fff;">Real-Time Search Telemetry &amp; Event Stream</h4>
        <button class="btn btn--outline btn--sm" ${action('switchAdminTab', 'telemetry')}><i class="ph-bold ph-arrows-clockwise"></i> Refresh</button>
      </div>
      <div data-telemetry-log style="background: #000; border-radius: 10px; padding: 16px; font-family: monospace; font-size: 0.8rem; max-height: 480px; overflow-y: auto;"></div>
    `;
    renderTelemetryInto(body);
  }
}

/* ---------------------------------------------------------------------------
   Standalone admin page (/admin)
   --------------------------------------------------------------------------- */
export function switchStandaloneAdminTab(tab) {
  activeStandaloneTab = tab;
  setActiveTab('.standalone-admin-tab', tab);

  const body = document.getElementById('standaloneAdminTabBody');
  if (!body) return;

  const leads = getLeads();

  if (tab === 'dashboard') {
    body.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px;">
        <div style="background: #081D40; border: 1px solid rgba(197, 146, 57, 0.25); border-radius: 12px; padding: 20px;">
          <span style="font-size: 0.8rem; color: #94A3B8; text-transform: uppercase;">Total Inbound Leads</span>
          <strong style="font-size: 1.8rem; font-weight: 800; color: #10B981; display: block; margin-top: 4px;">${leads.length}</strong>
          <small style="color: #64748B;">↑ 22% this week</small>
        </div>
        <div style="background: #081D40; border: 1px solid rgba(197, 146, 57, 0.25); border-radius: 12px; padding: 20px;">
          <span style="font-size: 0.8rem; color: #94A3B8; text-transform: uppercase;">Conversion Rate</span>
          <strong style="font-size: 1.8rem; font-weight: 800; color: #C59239; display: block; margin-top: 4px;">28.4%</strong>
          <small style="color: #64748B;">Target: 25%</small>
        </div>
        <div style="background: #081D40; border: 1px solid rgba(197, 146, 57, 0.25); border-radius: 12px; padding: 20px;">
          <span style="font-size: 0.8rem; color: #94A3B8; text-transform: uppercase;">Active Subscriptions</span>
          <strong style="font-size: 1.8rem; font-weight: 800; color: #38BDF8; display: block; margin-top: 4px;">1,482</strong>
          <small style="color: #64748B;">Across 10 Metros</small>
        </div>
        <div style="background: #081D40; border: 1px solid rgba(197, 146, 57, 0.25); border-radius: 12px; padding: 20px;">
          <span style="font-size: 0.8rem; color: #94A3B8; text-transform: uppercase;">MRR (Infrastructure)</span>
          <strong style="font-size: 1.8rem; font-weight: 800; color: #F59E0B; display: block; margin-top: 4px;">₹38.4L</strong>
          <small style="color: #64748B;">98.2% Renewal Rate</small>
        </div>
      </div>

      <div style="background: #081D40; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h3 style="margin: 0; color: #FFF; font-size: 1.15rem;"><i class="ph-bold ph-funnel"></i> Recent Client Inquiries</h3>
          <button class="btn btn--outline btn--sm" ${action('exportLeadsToCSV')}><i class="ph-bold ph-download-simple"></i> Export CSV</button>
        </div>
        <div class="admin-table-wrap">
          <table class="admin-table">
            <thead>
              <tr><th>Lead ID</th><th>Name</th><th>Contact</th><th>City</th><th>Service</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody id="adminLeadsTableBody2"></tbody>
          </table>
        </div>
      </div>
    `;
    renderAdminLeads();
  } else if (tab === 'pipeline') {
    body.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h4 style="margin: 0; color: #fff;">Kanban Pipeline Stages</h4>
        <button class="btn btn--outline btn--sm" ${action('exportLeadsToCSV')}><i class="ph-bold ph-download-simple"></i> Export CSV</button>
      </div>
      <div class="admin-pipeline-kanban">
        ${kanbanBoard(leads)}
      </div>
    `;
  } else if (tab === 'telemetry') {
    body.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h4 style="margin: 0; color: #fff;">Real-Time Search Telemetry Stream</h4>
        <button class="btn btn--outline btn--sm" ${action('switchStandaloneAdminTab', 'telemetry')}><i class="ph-bold ph-arrows-clockwise"></i> Refresh</button>
      </div>
      <div data-telemetry-log style="background: #000; border-radius: 10px; padding: 16px; font-family: monospace; font-size: 0.8rem; max-height: 480px; overflow-y: auto;"></div>
    `;
    renderTelemetryInto(body);
  }
}
