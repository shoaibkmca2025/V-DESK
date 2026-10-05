import { Router } from 'express';

/**
 * Search routes — mounted at /api/v1/search in src/routes.js.
 * Each route = path + middleware (validate, auth) + one controller function. No logic here.
 */
export const searchRouter = Router();
