import { Router } from 'express';

/**
 * Identity routes — mounted at /api/v1/auth in src/routes.js.
 * Each route = path + middleware (validate, auth) + one controller function. No logic here.
 */
export const identityRouter = Router();
