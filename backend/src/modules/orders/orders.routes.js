import { Router } from 'express';

/**
 * Orders routes — mounted at /api/v1/orders in src/routes.js.
 * Each route = path + middleware (validate, auth) + one controller function. No logic here.
 */
export const ordersRouter = Router();
