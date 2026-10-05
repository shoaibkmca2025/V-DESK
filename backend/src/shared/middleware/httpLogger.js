import { pinoHttp } from 'pino-http';
import { logger } from '../lib/logger.js';

/** One access-log line per request. Paths are logged without query strings, which can carry PII. */
export const httpLogger = pinoHttp({
  logger,
  genReqId: (req) => req.id,
  autoLogging: { ignore: (req) => req.url === '/health' },
  customLogLevel: (_req, res, err) => {
    if (err || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  serializers: {
    req: (req) => ({ id: req.id, method: req.method, path: req.url?.split('?')[0] }),
    res: (res) => ({ statusCode: res.statusCode }),
  },
});
