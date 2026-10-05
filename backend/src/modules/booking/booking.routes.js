import { Router } from 'express';

/**
 * Booking routes — mounted at /api/v1/bookings in src/routes.js.
 * Each route = path + middleware (validate, auth) + one controller function. No logic here.
 */
export const bookingRouter = Router();
