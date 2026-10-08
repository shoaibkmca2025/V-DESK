/**
 * Identity routes — mounted at /api/v1/auth in src/routes.js.
 * Each route = path + middleware (validate, auth) + one controller function. No logic here.
 */
import { Router } from 'express';
import { rateLimit } from '../../shared/middleware/rateLimit.js';
import { validate } from '../../shared/middleware/validate.js';
import * as controller from './identity.controller.js';
import { authenticate, requireStaff } from './identity.middleware.js';
import {
  changePasswordBody,
  createUserBody,
  listUsersQuery,
  loginBody,
  mfaEnrollBody,
  mfaVerifyBody,
  updateUserBody,
  userRefParams,
} from './identity.validation.js';

export const identityRouter = Router();

// One budget for the whole sign-in flow (password + enroll + code) per IP; the account lockout covers
// guessing spread across many IPs.
const signInLimit = rateLimit({ name: 'sign-in', windowMs: 60_000, max: 10 });
const refreshLimit = rateLimit({ name: 'session refresh', windowMs: 60_000, max: 30 });

// ── Sign-in & sessions ────────────────────────
identityRouter.post('/login', signInLimit, validate({ body: loginBody }), controller.login);
identityRouter.post('/mfa/enroll', signInLimit, validate({ body: mfaEnrollBody }), controller.enrollMfa);
identityRouter.post('/mfa/verify', signInLimit, validate({ body: mfaVerifyBody }), controller.verifyMfa);
identityRouter.post('/refresh', refreshLimit, controller.refresh);
identityRouter.post('/logout', controller.logout);

// ── Signed-in user ────────────────────────────
identityRouter.get('/me', authenticate, controller.me);
identityRouter.post('/password', authenticate, validate({ body: changePasswordBody }), controller.changePassword);

// ── Staff user management ─────────────────────
const users = Router();
users.use(requireStaff('users:manage'));
users.get('/', validate({ query: listUsersQuery }), controller.listUsers);
users.post('/', validate({ body: createUserBody }), controller.createUser);
users.get('/:ref', validate({ params: userRefParams }), controller.getUser);
users.patch('/:ref', validate({ params: userRefParams, body: updateUserBody }), controller.updateUser);
identityRouter.use('/users', users);
