import { PIPELINE_STAGES } from '@/data/constants.js';
import { addLead, getLeads, setLeadStatus } from '@/features/crm/leadStore.js';
import { showToast } from '@/features/ui/toast.js';
import { renderAdminLeads } from './adminLeadsTable.js';
import { switchAdminTab } from './adminSuite.js';

export function updateLeadStatus(id, status) {
  if (setLeadStatus(id, status)) renderAdminLeads();
}

export function advanceLeadStatus(leadId) {
  const lead = getLeads().find((l) => l.id === leadId);
  if (!lead) return;

  const curIdx = PIPELINE_STAGES.indexOf(lead.status || 'NEW');
  const nextStatus = PIPELINE_STAGES[(curIdx + 1) % PIPELINE_STAGES.length];
  setLeadStatus(leadId, nextStatus);

  showToast('Lead Status Advanced', `${lead.name || 'Lead'} moved to ${nextStatus}`, 'success');
  switchAdminTab('pipeline');
}

export function exportLeadsToCSV() {
  const leads = getLeads();
  if (!leads.length) {
    showToast('No leads to export.');
    return;
  }
  const headers = ['ID', 'Name', 'Mobile', 'Email', 'City', 'Service', 'Company', 'Source', 'Status', 'Date'];
  const rows = leads.map((l) => [l.id, l.name, l.mobile, l.email, l.city, l.service, l.company || '', l.source || '', l.status, l.createdAt]);
  const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `vdesk-leads-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  showToast('CSV exported successfully.');
}

export function seedSampleLeads() {
  const names = ['Vikram Desai', 'Ananya Shah', 'Arjun Mehta', 'Kavita Nair', 'Nikhil Kumar'];
  const cities = ['Mumbai', 'Nashik', 'Delhi', 'Bangalore', 'Pune'];
  const services = ['Virtual Office', 'GST Registration', 'Company Registration', 'Coworking', 'Private Office'];
  const statuses = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'CONVERTED'];
  const pick = (list) => list[Math.floor(Math.random() * list.length)];

  const name = pick(names);
  addLead(
    {
      name,
      mobile: '98' + Math.floor(10000000 + Math.random() * 90000000),
      email: name.toLowerCase().replace(/\s/g, '.') + '@gmail.com',
      city: pick(cities),
      service: pick(services),
      company: 'Demo Corp',
      source: 'Admin — Seeded Sample',
    },
    { status: pick(statuses) },
  );
  renderAdminLeads();
  showToast(`Sample lead "${name}" added.`);
}
