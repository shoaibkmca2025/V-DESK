import { Router } from 'express';

/**
 * Pricing routes — mounted at /api/v1/pricing in src/routes.js.
 * Each route = path + middleware (validate, auth) + one controller function. No logic here.
 */
export const pricingRouter = Router();
