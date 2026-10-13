/**
 * Enterprise routes — mounted at /api/v1/enterprise in src/routes.js.
 * Each route = path + middleware (rate limit, CAPTCHA, auth, validate) + one controller function. No logic here.
 *
 * Staff routes need a signed-in user with enterprise:* (the legacy x-admin-key is refused). Member routes accept staff
 * or a customer member — customers answer 503 CUSTOMER_AUTH_NOT_AVAILABLE until identity has customer sign-in.
 */
import { Router } from 'express';
import { rateLimit } from '../../shared/middleware/rateLimit.js';
import { requireCaptcha } from '../../shared/middleware/requireCaptcha.js';
import { validate } from '../../shared/middleware/validate.js';
import { requireCustomer, requireCustomerOrStaff, requireStaffPrincipal as staff } from '../identity/index.js';
import * as controller from './enterprise.controller.js';
import * as v from './enterprise.validation.js';

export const enterpriseRouter = Router();

const rfpLimit = rateLimit({ name: 'enterprise RFPs', windowMs: 60_000, max: 10 });
const memberLimit = rateLimit({ name: 'organisation requests', windowMs: 60_000, max: 60 });
const orgParams = validate({ params: v.organisationParams });
/** Staff with `staffPermission`, or a member (the service checks the organisation role). */
const staffOrMember = (staffPermission) => [memberLimit, requireCustomerOrStaff(staffPermission)];

// ── Public ────────────────────────────────────
enterpriseRouter.post('/rfps', rfpLimit, requireCaptcha(), validate({ body: v.submitRfpBody }), controller.submitRfp);

// ── RFPs (staff) ──────────────────────────────
enterpriseRouter.get('/rfps', staff('enterprise:read'), validate({ query: v.listRfpsQuery }), controller.listRfps);
enterpriseRouter.get('/rfps/:ref', staff('enterprise:read'), validate({ params: v.rfpParams }), controller.getRfp);
enterpriseRouter.patch(
  '/rfps/:ref/status',
  staff('enterprise:manage'),
  validate({ params: v.rfpParams, body: v.rfpStatusBody }),
  controller.changeRfpStatus,
);

// ── Customer ──────────────────────────────────
enterpriseRouter.get('/me/organisations', memberLimit, requireCustomer, controller.listMyOrganisations);

// ── Organisations ─────────────────────────────
const orgs = Router();
orgs.get('/', staff('enterprise:read'), validate({ query: v.listOrganisationsQuery }), controller.listOrganisations);
orgs.post('/', staff('enterprise:manage'), validate({ body: v.createOrganisationBody }), controller.createOrganisation);
orgs.get('/:ref', ...staffOrMember('enterprise:read'), orgParams, controller.getOrganisation);
orgs.patch(
  '/:ref',
  staff('enterprise:manage'),
  validate({ params: v.organisationParams, body: v.updateOrganisationBody }),
  controller.updateOrganisation,
);
orgs.delete('/:ref', staff('enterprise:manage'), orgParams, controller.deleteOrganisation);

// Members
orgs.post(
  '/:ref/members',
  ...staffOrMember('enterprise:manage'),
  validate({ params: v.organisationParams, body: v.addMemberBody }),
  controller.addMember,
);
orgs.patch(
  '/:ref/members/:customerId',
  ...staffOrMember('enterprise:manage'),
  validate({ params: v.memberParams, body: v.changeMemberBody }),
  controller.changeMemberRole,
);
orgs.delete(
  '/:ref/members/:customerId',
  ...staffOrMember('enterprise:manage'),
  validate({ params: v.memberParams }),
  controller.removeMember,
);

// Team bookings
orgs.get('/:ref/bookings', ...staffOrMember('enterprise:read'), orgParams, controller.listTeamBookings);
orgs.post(
  '/:ref/bookings',
  ...staffOrMember('enterprise:manage'),
  validate({ params: v.organisationParams, body: v.linkBookingBody }),
  controller.linkBooking,
);

// Consolidated billing
orgs.post(
  '/:ref/orders',
  staff('enterprise:manage'),
  validate({ params: v.organisationParams, body: v.linkOrderBody }),
  controller.linkOrder,
);
orgs.get(
  '/:ref/billing',
  ...staffOrMember('enterprise:read'),
  validate({ params: v.organisationParams, query: v.billingQuery }),
  controller.billingStatement,
);
orgs.get(
  '/:ref/billing.csv',
  staff('enterprise:read'),
  validate({ params: v.organisationParams, query: v.billingQuery }),
  controller.billingStatementCsv,
);

// Price books and reports
orgs.get('/:ref/price-books', staff('enterprise:read'), orgParams, controller.listPriceBooks);
orgs.post(
  '/:ref/price-books',
  staff('enterprise:pricing'),
  validate({ params: v.organisationParams, body: v.priceBookBody }),
  controller.setPriceBook,
);
orgs.get(
  '/:ref/price-preview',
  ...staffOrMember('enterprise:read'),
  validate({ params: v.organisationParams, query: v.pricePreviewQuery }),
  controller.previewPrice,
);
orgs.get('/:ref/report', ...staffOrMember('enterprise:read'), orgParams, controller.organisationReport);

enterpriseRouter.use('/organisations', orgs);
