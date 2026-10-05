import { Router } from 'express';

/**
 * Subscriptions routes — mounted at /api/v1/subscriptions in src/routes.js.
 * Each route = path + middleware (validate, auth) + one controller function. No logic here.
 */
export const subscriptionsRouter = Router();
