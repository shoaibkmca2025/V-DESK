import { Router } from 'express';

/**
 * Analytics routes — mounted at /api/v1/analytics in src/routes.js.
 * Each route = path + middleware (validate, auth) + one controller function. No logic here.
 */
export const analyticsRouter = Router();
