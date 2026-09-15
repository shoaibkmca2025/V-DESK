import { LEAD_TABLE_STATUSES } from '@/data/constants.js';
import { getLeads } from '@/features/crm/leadStore.js';
import { changeAction, escapeHtml } from '@/lib/html.js';

function statusOptions(lead) {
  return LEAD_TABLE_STATUSES.map(
    (s) => `<option value="${s}" ${lead.status === s ? 'selected' : ''}>${s.replace(/_/g, ' ')}</option>`,
  ).join('');
}

/** Lead table used by the admin modal (#adminLeadsTableBody) and the admin page dashboard (#adminLeadsTableBody2). */
export function renderAdminLeads() {
  const leads = getLeads();
  const tbodies = [document.getElementById('adminLeadsTableBody'), document.getElementById('adminLeadsTableBody2')].filter(Boolean);
  if (tbodies.length === 0) return;

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };
  setText('totalLeadsMetric', leads.length);
  setText('newLeadsMetric', leads.filter((l) => l.status === 'NEW').length);
  setText('qualifiedLeadsMetric', leads.filter((l) => l.status === 'QUALIFIED').length);
  setText('convertedLeadsMetric', leads.filter((l) => l.status === 'CONVERTED').length);

  const rows = leads
    .map(
      (l) => `
    <tr>
      <td>${new Date(l.createdAt).toLocaleDateString('en-IN')}</td>
      <td><strong style="color:var(--vd-zinc-200, #FFF);">${escapeHtml(l.name)}</strong><br><span style="font-size:0.75rem; color:#94A3B8;">${escapeHtml(l.mobile)} • ${escapeHtml(l.email)}</span></td>
      <td>${escapeHtml(l.city)}<br><span style="font-size:0.75rem; color:var(--vd-gold-primary, #C59239);">${escapeHtml(l.service)}</span></td>
      <td><span style="font-size:0.75rem; color:#94A3B8;">${escapeHtml(l.source || '—')}</span></td>
      <td>
        <select ${changeAction('updateLeadStatus', l.id)} style="background:#05132B; color:#FFF; border:1px solid rgba(255,255,255,0.2); border-radius:4px; padding:3px 6px; font-size:0.75rem;">
          ${statusOptions(l)}
        </select>
      </td>
      <td>
        <a href="tel:${escapeHtml(l.mobile)}" class="btn btn--outline btn--sm" style="font-size:0.75rem; padding: 3px 8px;">Call</a>
      </td>
    </tr>
  `,
    )
    .join('');

  tbodies.forEach((tb) => {
    tb.innerHTML = rows;
  });
}

export function filterAdminLeads() {
  const search = (document.getElementById('adminSearchInput')?.value || '').toLowerCase();
  const status = document.getElementById('adminStatusFilter')?.value || 'ALL';
  let leads = getLeads();

  if (status !== 'ALL') leads = leads.filter((l) => l.status === status);
  if (search) {
    leads = leads.filter(
      (l) =>
        (l.name || '').toLowerCase().includes(search) ||
        (l.mobile || '').includes(search) ||
        (l.email || '').toLowerCase().includes(search) ||
        (l.city || '').toLowerCase().includes(search),
    );
  }

  const tbody = document.getElementById('adminLeadsTableBody');
  if (!tbody) return;

  tbody.innerHTML = leads
    .map(
      (l) => `
    <tr>
      <td>${new Date(l.createdAt).toLocaleDateString('en-IN')}</td>
      <td><strong style="color:var(--vd-zinc-200);">${escapeHtml(l.name)}</strong><br><span style="font-size:0.75rem;">${escapeHtml(l.mobile)} • ${escapeHtml(l.email)}</span></td>
      <td>${escapeHtml(l.city)}<br><span style="font-size:0.75rem;">${escapeHtml(l.service)}</span></td>
      <td><span style="font-size:0.75rem;">${escapeHtml(l.source || '—')}</span></td>
      <td>
        <select ${changeAction('updateLeadStatus', l.id)}>
          ${statusOptions(l)}
        </select>
      </td>
      <td>
        <a href="tel:${escapeHtml(l.mobile)}" class="btn btn--ghost btn--sm" style="font-size:0.75rem;">Call</a>
      </td>
    </tr>
  `,
    )
    .join('');
}

export function openAdminModal() {
  const modal = document.getElementById('adminModal');
  if (!modal) return;
  modal.classList.add('open', 'active');
  document.body.style.overflow = 'hidden';
  renderAdminLeads();
}
