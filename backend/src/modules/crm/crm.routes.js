/**
 * CRM routes — mounted at /api/v1/leads in src/routes.js.
 * Each route = path + middleware (validate, auth) + one controller function. No logic here.
 */
import { Router } from 'express';
import { requireAdminKey } from '../../shared/middleware/requireAdminKey.js';
import { validate } from '../../shared/middleware/validate.js';
import * as controller from './crm.controller.js';
import { createLeadBody, leadRefParams, listLeadsQuery, updateLeadBody } from './crm.validation.js';

export const crmRouter = Router();

// ── Public ────────────────────────────────────
// TODO(rules.md §11): per-IP and per-phone/email rate limit + Turnstile CAPTCHA once that middleware exists.
crmRouter.post('/', validate({ body: createLeadBody }), controller.createLead);

// ── Staff (x-admin-key until identity ships JWT + RBAC) ──
crmRouter.get('/', requireAdminKey, validate({ query: listLeadsQuery }), controller.listLeads);
// Declared before /:ref so "stats" is not read as a lead ref.
crmRouter.get('/stats', requireAdminKey, controller.getLeadStats);
crmRouter.get('/:ref', requireAdminKey, validate({ params: leadRefParams }), controller.getLead);
crmRouter.patch(
  '/:ref',
  requireAdminKey,
  validate({ params: leadRefParams, body: updateLeadBody }),
  controller.updateLead,
);
