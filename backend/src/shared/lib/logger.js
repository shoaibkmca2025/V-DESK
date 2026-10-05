import pino from 'pino';
import { env } from '../../config/env.js';

/** Structured JSON logs to stdout (docs/backend/logs.md). PII and secrets are redacted centrally here. */
export const logger = pino({
  level: env.LOG_LEVEL,
  base: { service: 'vdesk-api', env: env.NODE_ENV },
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      '*.password',
      '*.otp',
      '*.token',
      '*.mobile',
      '*.email',
      '*.pan',
      '*.aadhaar',
    ],
    censor: '[redacted]',
  },
  transport: env.NODE_ENV === 'development' ? { target: 'pino-pretty', options: { colorize: true } } : undefined,
});
