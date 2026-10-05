import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { apiRouter, healthRouter } from './routes.js';
import { errorHandler, notFoundHandler } from './shared/middleware/errorHandler.js';
import { httpLogger } from './shared/middleware/httpLogger.js';
import { requestId } from './shared/middleware/requestId.js';

/** Builds the Express app without starting it, so tests can drive it with supertest. */
export function createApp() {
  const app = express();

  app.use(requestId);
  app.use(httpLogger);
  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGINS, credentials: true, exposedHeaders: ['X-Request-Id'] }));
  app.use(express.json({ limit: '100kb' }));

  app.use(healthRouter);
  app.use('/api/v1', apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
