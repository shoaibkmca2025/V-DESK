import { Router } from 'express';

/**
 * CRM routes — mounted at /api/v1/leads in src/routes.js.
 * Each route = path + middleware (validate, auth) + one controller function. No logic here.
 */
export const crmRouter = Router();
