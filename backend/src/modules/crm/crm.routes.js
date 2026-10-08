/**
 * CRM routes — mounted at /api/v1/leads in src/routes.js.
 * Each route = path + middleware (validate, auth) + one controller function. No logic here.
 */
import { Router } from 'express';
import { rateLimit } from '../../shared/middleware/rateLimit.js';
import { validate } from '../../shared/middleware/validate.js';
import { requireStaff } from '../identity/index.js';
import * as controller from './crm.controller.js';
import { createLeadBody, leadRefParams, listLeadsQuery, updateLeadBody } from './crm.validation.js';

export const crmRouter = Router();

// ── Public ────────────────────────────────────
// TODO(rules.md §11): per-phone/email limit + Turnstile CAPTCHA; the per-IP limit below is the first layer.
const enquiryLimit = rateLimit({ name: 'enquiries', windowMs: 60_000, max: 10 });
crmRouter.post('/', enquiryLimit, validate({ body: createLeadBody }), controller.createLead);

// ── Staff (Bearer token with the permission, or x-admin-key during the switch-over) ──
crmRouter.get('/', requireStaff('leads:read'), validate({ query: listLeadsQuery }), controller.listLeads);
// Declared before /:ref so "stats" is not read as a lead ref.
crmRouter.get('/stats', requireStaff('leads:read'), controller.getLeadStats);
crmRouter.get('/:ref', requireStaff('leads:read'), validate({ params: leadRefParams }), controller.getLead);
crmRouter.patch(
  '/:ref',
  requireStaff('leads:write'),
  validate({ params: leadRefParams, body: updateLeadBody }),
  controller.updateLead,
);
