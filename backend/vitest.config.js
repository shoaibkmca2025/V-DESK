import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.js', 'test/**/*.test.js'],
    env: {
      NODE_ENV: 'test',
      LOG_LEVEL: 'silent',
      ADMIN_API_KEY: 'test-admin-key-0123456789',
      JWT_SECRET: 'test-jwt-secret-0123456789-0123456789-abcdef',
      MFA_ENCRYPTION_KEY: 'test-mfa-key-0123456789-0123456789-abcdef',
    },
    // The first run may download the MongoDB binary used by mongodb-memory-server.
    hookTimeout: 120_000,
  },
});
