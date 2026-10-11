import { env } from '../../config/env.js';
import * as turnstile from '../../integrations/turnstile.js';
import { AppError, badRequest } from '../errors/AppError.js';
import { logger } from '../lib/logger.js';

const MAX_TOKEN_LENGTH = 2048;

/**
 * CAPTCHA check for public write endpoints (rules.md §11). The token comes from the website's Turnstile widget,
 * in the `cf-turnstile-response` header or a `captchaToken` body field.
 *
 * Off while TURNSTILE_SECRET_KEY is unset (local, tests, until the website sends tokens). When Cloudflare can't
 * be reached the request fails with 503 rather than letting it through — the client queues forms and retries.
 */
export function requireCaptcha({ verify = turnstile.verify } = {}) {
  return async (req, _res, next) => {
    if (!env.TURNSTILE_SECRET_KEY) return next();

    const token = req.get('cf-turnstile-response') ?? req.body?.captchaToken;
    if (typeof token !== 'string' || token.length === 0 || token.length > MAX_TOKEN_LENGTH) {
      return next(badRequest('CAPTCHA_REQUIRED', 'Please complete the security check'));
    }

    let result;
    try {
      result = await verify({ secret: env.TURNSTILE_SECRET_KEY, token, remoteIp: req.ip });
    } catch (err) {
      (req.log ?? logger).warn({ err: err.message }, 'CAPTCHA verification unavailable');
      return next(
        new AppError(503, 'CAPTCHA_UNAVAILABLE', 'The security check is unavailable. Please try again shortly.'),
      );
    }
    if (!result.success) return next(badRequest('CAPTCHA_FAILED', 'The security check failed. Please try again.'));
    next();
  };
}
