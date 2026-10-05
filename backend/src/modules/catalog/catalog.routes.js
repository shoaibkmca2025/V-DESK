import { Router } from 'express';

/**
 * Catalog routes — mounted at /api/v1/catalog in src/routes.js.
 * Each route = path + middleware (validate, auth) + one controller function. No logic here.
 */
export const catalogRouter = Router();
