import { Router } from 'express';

/**
 * Enterprise routes — mounted at /api/v1/enterprise in src/routes.js.
 * Each route = path + middleware (validate, auth) + one controller function. No logic here.
 */
export const enterpriseRouter = Router();
