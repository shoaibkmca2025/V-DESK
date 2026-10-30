import pino from 'pino';
import { env } from '../../config/env.js';
import { onWorkers } from '../../config/runtime.js';

/*
 * Workers have no stdout: one line per log goes to the console instead, which is what Cloudflare's own
 * log stream and Logpush read. Everywhere else pino writes to stdout as usual.
 */
const destination = onWorkers ? { write: (line) => console.log(line.trimEnd()) } : undefined;

/** Structured JSON logs (docs/backend/logs.md). PII and secrets are redacted centrally here. */
export const logger = pino(
  {
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
    transport:
      env.NODE_ENV === 'development' && !onWorkers ? { target: 'pino-pretty', options: { colorize: true } } : undefined,
  },
  destination,
);
