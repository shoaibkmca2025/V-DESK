import { logger } from '../lib/logger.js';

/**
 * One access-log line per request: method, path, status, duration and the request id.
 *
 * Written out rather than taken from `pino-http`, which reaches into pino's internals and so does not load
 * on Cloudflare Workers (ADR-011). What it did for us was four small things — the four below — and the
 * fields are the ones docs/backend/logs.md specifies.
 *
 * Paths are logged without their query string, which can carry personal data (rules.md §21).
 */
const IGNORE = new Set(['/health']);

const levelFor = (statusCode, failed) => {
  if (failed || statusCode >= 500) return 'error';
  if (statusCode >= 400) return 'warn';
  return 'info';
};

export function httpLogger(req, res, next) {
  if (IGNORE.has(req.url?.split('?')[0])) return next();

  const started = process.hrtime.bigint();
  let failed = false;
  // A connection that drops mid-response still gets a line, marked as a failure.
  res.once('error', () => {
    failed = true;
  });

  res.once('finish', () => {
    const responseTime = Number(process.hrtime.bigint() - started) / 1e6;
    logger[levelFor(res.statusCode, failed)](
      {
        req: { id: req.id, method: req.method, path: req.url?.split('?')[0] },
        res: { statusCode: res.statusCode },
        responseTime: Math.round(responseTime),
      },
      'request completed',
    );
  });

  next();
}
