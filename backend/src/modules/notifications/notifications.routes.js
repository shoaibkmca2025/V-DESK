import { Router } from 'express';

/**
 * Notifications routes — mounted at /api/v1/notifications in src/routes.js.
 * Each route = path + middleware (validate, auth) + one controller function. No logic here.
 */
export const notificationsRouter = Router();
