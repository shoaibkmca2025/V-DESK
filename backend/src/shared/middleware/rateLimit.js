import { env } from '../../config/env.js';
import { AppError } from '../errors/AppError.js';

const SWEEP_THRESHOLD = 10_000;

/**
 * Fixed-window rate limit per client IP (rules.md §11). In-memory, so each API instance counts on its own —
 * move the counters to Redis when we run more than one instance.
 * Off under NODE_ENV=test so integration tests can submit freely; rateLimit.test.js turns it on explicitly.
 *
 * @param {{ name: string, windowMs: number, max: number, enabled?: boolean }} options
 */
export function rateLimit({ name, windowMs, max, enabled = env.NODE_ENV !== 'test' }) {
  const hits = new Map();

  return (req, res, next) => {
    if (!enabled) return next();
    const now = Date.now();
    if (hits.size > SWEEP_THRESHOLD) {
      for (const [key, entry] of hits) if (entry.resetAt <= now) hits.delete(key);
    }

    const key = req.ip ?? 'unknown';
    let entry = hits.get(key);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(key, entry);
    }
    entry.count += 1;

    if (entry.count > max) {
      res.set('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)));
      return next(new AppError(429, 'RATE_LIMITED', `Too many requests to ${name}. Please wait and try again.`));
    }
    next();
  };
}
