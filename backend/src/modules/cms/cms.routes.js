import { Router } from 'express';

/**
 * CMS routes — mounted at /api/v1/content in src/routes.js.
 * Each route = path + middleware (validate, auth) + one controller function. No logic here.
 */
export const cmsRouter = Router();
