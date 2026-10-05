import { Router } from 'express';
import { isDbReady } from './config/db.js';
import { AppError } from './shared/errors/AppError.js';
import { analyticsRouter } from './modules/analytics/index.js';
import { bookingRouter } from './modules/booking/index.js';
import { catalogRouter } from './modules/catalog/index.js';
import { cmsRouter } from './modules/cms/index.js';
import { crmRouter } from './modules/crm/index.js';
import { enterpriseRouter } from './modules/enterprise/index.js';
import { identityRouter } from './modules/identity/index.js';
import { kycRouter } from './modules/kyc/index.js';
import { notificationsRouter } from './modules/notifications/index.js';
import { ordersRouter } from './modules/orders/index.js';
import { pricingRouter } from './modules/pricing/index.js';
import { searchRouter } from './modules/search/index.js';
import { subscriptionsRouter } from './modules/subscriptions/index.js';

/** Health probes for the hosting platform — unversioned and public (rules.md §31). */
export const healthRouter = Router();

healthRouter.get('/health', (_req, res) => {
  res.json({ data: { status: 'ok' } });
});

healthRouter.get('/ready', (_req, res, next) => {
  if (!isDbReady()) return next(new AppError(503, 'NOT_READY', 'Database is not connected'));
  res.json({ data: { status: 'ready' } });
});

/** Versioned API (/api/v1). Every module's router is mounted here; see docs/backend/modules.md §3. */
export const apiRouter = Router();

apiRouter.use('/auth', identityRouter);
apiRouter.use('/catalog', catalogRouter);
apiRouter.use('/search', searchRouter);
apiRouter.use('/leads', crmRouter);
apiRouter.use('/pricing', pricingRouter);
apiRouter.use('/bookings', bookingRouter);
apiRouter.use('/orders', ordersRouter);
apiRouter.use('/kyc', kycRouter);
apiRouter.use('/subscriptions', subscriptionsRouter);
apiRouter.use('/notifications', notificationsRouter);
apiRouter.use('/analytics', analyticsRouter);
apiRouter.use('/content', cmsRouter);
apiRouter.use('/enterprise', enterpriseRouter);
