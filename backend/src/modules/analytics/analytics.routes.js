/**
 * Analytics routes — mounted at /api/v1/analytics in src/routes.js.
 * Each route = path + middleware (validate, auth) + one controller function. No logic here.
 */
import express, { Router } from 'express';
import { rateLimit } from '../../shared/middleware/rateLimit.js';
import { validate } from '../../shared/middleware/validate.js';
import { requireStaff } from '../identity/index.js';
import * as controller from './analytics.controller.js';
import { ingestBody, listEventsQuery, rangeQuery } from './analytics.validation.js';

export const analyticsRouter = Router();

// ── Public (website telemetry) ────────────────
const ingestLimit = rateLimit({ name: 'analytics', windowMs: 60_000, max: 60 });
analyticsRouter.post(
  '/events',
  ingestLimit,
  express.text({ type: 'text/plain', limit: '100kb' }),
  controller.parseBeaconBody,
  validate({ body: ingestBody }),
  controller.ingestEvents,
);

// ── Staff ─────────────────────────────────────
const staff = requireStaff('analytics:read');
analyticsRouter.get('/events', staff, validate({ query: listEventsQuery }), controller.listEvents);
analyticsRouter.get('/kpis', staff, validate({ query: rangeQuery }), controller.getKpis);
analyticsRouter.get('/funnel', staff, validate({ query: rangeQuery }), controller.getFunnel);
