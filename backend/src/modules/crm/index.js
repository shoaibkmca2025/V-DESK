/** Public surface of the CRM module. Other code imports from here, never from the files inside. */
export { crmRouter } from './crm.routes.js';
export { computeLeadScore, createLead, getLead, getLeadStats, listLeads, updateLead } from './crm.service.js';
