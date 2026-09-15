import { readJson, writeJson } from '@/lib/storage.js';

/** CRM lead store persisted in localStorage (PRD §43). Seeds a demo pipeline on first visit. */

const CRM_KEY = 'VDESK_LEADS';

function hoursAgo(hours) {
  return new Date(Date.now() - 3600000 * hours).toISOString();
}

function demoLeads() {
  return [
    { id: 'VD-MUM-8921', name: 'Priya Kulkarni', mobile: '9820194820', email: 'priya@zenithd2c.com', city: 'Mumbai', service: 'Virtual Office for GST', company: 'Zenith D2C Brands', source: 'Website Configurator', status: 'QUALIFIED', createdAt: hoursAgo(2), updatedAt: hoursAgo(2) },
    { id: 'VD-NSK-4412', name: 'Rajesh Patel', mobile: '9422238491', email: 'rajesh@patelassociates.in', city: 'Nashik', service: 'Boardroom Hourly Pass', company: 'Patel & Associates CA', source: 'Meeting Scheduler', status: 'NEW', createdAt: hoursAgo(5), updatedAt: hoursAgo(5) },
    { id: 'VD-BLR-7729', name: 'Suhani Agarwal', mobile: '9880123984', email: 'suhani@artisancommerce.in', city: 'Bangalore', service: 'Company Registration SPICe+', company: 'Artisan Commerce', source: 'Incorporation Wizard', status: 'PROPOSAL_SENT', createdAt: hoursAgo(18), updatedAt: hoursAgo(18) },
    { id: 'VD-DEL-1093', name: 'Vikramaditya Roy', mobile: '9811094821', email: 'vikram@acmetech.io', city: 'Delhi', service: 'Dedicated Flex Coworking', company: 'Acme Tech Hub', source: 'Direct Inbound', status: 'CONVERTED', createdAt: hoursAgo(48), updatedAt: hoursAgo(48) },
  ];
}

export function getLeads() {
  const cached = readJson(CRM_KEY, null);
  if (Array.isArray(cached) && cached.length > 0) return cached;
  const seeded = demoLeads();
  writeJson(CRM_KEY, seeded);
  return seeded;
}

function saveLeads(leads) {
  writeJson(CRM_KEY, leads);
}

/**
 * Records a new enquiry and returns it. Website forms always start at NEW; internal tools may pass
 * `options.status` to create a lead directly in another pipeline stage.
 */
export function addLead(data, options = {}) {
  const leads = getLeads();
  const lead = {
    id: 'VD-' + Date.now().toString(36).toUpperCase(),
    ...data,
    status: options.status ?? 'NEW',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  leads.unshift(lead);
  saveLeads(leads);
  return lead;
}

export function setLeadStatus(id, status) {
  const leads = getLeads();
  const lead = leads.find((l) => l.id === id);
  if (!lead) return null;
  lead.status = status;
  lead.updatedAt = new Date().toISOString();
  saveLeads(leads);
  return lead;
}

/** Lead scoring heuristic (PRD §44). */
export function calculateLeadScore(lead) {
  let score = 40;
  if (lead.phone) score += 20;
  if (lead.email && !lead.email.includes('gmail') && !lead.email.includes('yahoo')) score += 15;
  if (lead.company) score += 10;
  if (lead.status === 'QUALIFIED') score += 15;
  return Math.min(100, score);
}
