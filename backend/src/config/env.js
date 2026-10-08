import { z } from 'zod';

/**
 * Every environment variable the API reads, validated once at boot. Import `env` instead of touching
 * `process.env` anywhere else, so a missing or malformed setting fails fast with a clear message.
 * Add new settings here (and to .env.example) as modules need them.
 */
const blankToUndefined = (value) => (value === '' ? undefined : value);

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  MONGODB_URI: z.string().min(1).default('mongodb://127.0.0.1:27017/vdesk'),
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:5173')
    .transform((value) =>
      value
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
    ),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  /**
   * Shared secret for staff endpoints, sent as `x-admin-key` (docs/backend/memory.md §3). Temporary until
   * identity ships JWT + RBAC. Unset → staff endpoints answer 503, so a missing key never means "open".
   */
  ADMIN_API_KEY: z.preprocess(blankToUndefined, z.string().min(16).optional()),
  /** Signs staff access tokens (HS256). Unset → /auth answers 503 AUTH_NOT_CONFIGURED. */
  JWT_SECRET: z.preprocess(blankToUndefined, z.string().min(32).optional()),
  /** Encrypts TOTP secrets at rest. Separate from JWT_SECRET so rotating one never breaks the other. */
  MFA_ENCRYPTION_KEY: z.preprocess(blankToUndefined, z.string().min(32).optional()),
  /** Proxy hops in front of the API (Cloudflare, load balancer). Needed so rate limits see the visitor's IP. */
  TRUST_PROXY: z.coerce.number().int().min(0).default(0),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const problems = parsed.error.issues.map((issue) => `  ${issue.path.join('.')}: ${issue.message}`).join('\n');
  throw new Error(`Invalid environment configuration:\n${problems}`);
}

export const env = Object.freeze(parsed.data);
