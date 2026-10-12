import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.js', 'test/**/*.test.js'],
    // One shared single-node MongoDB replica set for the whole run; each file gets its own database (test/db.js).
    globalSetup: ['test/globalSetup.js'],
    env: {
      NODE_ENV: 'test',
      LOG_LEVEL: 'silent',
      ADMIN_API_KEY: 'test-admin-key-0123456789',
      JWT_SECRET: 'test-jwt-secret-0123456789-0123456789-abcdef',
      MFA_ENCRYPTION_KEY: 'test-mfa-key-0123456789-0123456789-abcdef',
      SALES_ALERT_EMAIL: 'sales@vdesk.test',
    },
    // The first run may download the MongoDB binary used by mongodb-memory-server.
    hookTimeout: 120_000,
    // Integration tests sign staff in (argon2 hashing) and can take a few seconds on a busy machine.
    testTimeout: 20_000,
  },
});
