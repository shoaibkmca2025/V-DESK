import { z } from 'zod';

/**
 * Every environment variable the API reads, validated once at boot. Import `env` instead of touching
 * `process.env` anywhere else, so a missing or malformed setting fails fast with a clear message.
 * Add new settings here (and to .env.example) as modules need them.
 */
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
  ADMIN_API_KEY: z.preprocess((value) => (value === '' ? undefined : value), z.string().min(16).optional()),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const problems = parsed.error.issues.map((issue) => `  ${issue.path.join('.')}: ${issue.message}`).join('\n');
  throw new Error(`Invalid environment configuration:\n${problems}`);
}

export const env = Object.freeze(parsed.data);
