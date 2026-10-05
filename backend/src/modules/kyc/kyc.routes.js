import { Router } from 'express';

/**
 * KYC routes — mounted at /api/v1/kyc in src/routes.js.
 * Each route = path + middleware (validate, auth) + one controller function. No logic here.
 */
export const kycRouter = Router();
