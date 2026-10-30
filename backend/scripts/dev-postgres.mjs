/**
 * Local API + worker on a throwaway PostgreSQL — one command to get an API for frontend work without
 * installing a database. The schema is migrated on start; seed it over HTTP afterwards
 * (scripts/seed-over-api.mjs).
 *
 *   node scripts/dev-postgres.mjs             # http://127.0.0.1:5000
 *   PORT=5055 node scripts/dev-postgres.mjs
 *   KEEP_DATA=1 node scripts/dev-postgres.mjs # reuse the same data next time
 *
 * Without KEEP_DATA the data directory is thrown away on exit. Point DATABASE_URL at Neon and use
 * `npm run dev` instead to work against real data.
 */
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import EmbeddedPostgres from 'embedded-postgres';
import { migrate } from './migrate.mjs';

const port = Number(process.env.PG_PORT ?? 0) || 54330;
const keep = process.env.KEEP_DATA === '1';
const dataDir = keep ? join(tmpdir(), 'vdesk-dev-postgres') : mkdtempSync(join(tmpdir(), 'vdesk-pg-'));

const postgres = new EmbeddedPostgres({
  databaseDir: dataDir,
  user: 'vdesk',
  password: 'vdesk',
  port,
  persistent: keep,
  // The schema is UTF-8; initdb on Windows would otherwise pick the machine's code page.
  initdbFlags: ['--encoding=UTF8', '--locale=C'],
  onLog: () => {},
});

if (!keep || !process.env.SKIP_INIT) {
  try {
    await postgres.initialise();
  } catch (err) {
    if (!keep) throw err; // a kept directory is already initialised
  }
}
await postgres.start();
try {
  await postgres.createDatabase('vdesk');
} catch {
  /* already there, which is what KEEP_DATA is for */
}

process.env.DATABASE_URL = `postgresql://vdesk:vdesk@127.0.0.1:${port}/vdesk`;
await migrate({ connectionString: process.env.DATABASE_URL, log: (line) => console.log(line) });

process.env.PORT ??= '5000';
process.env.NODE_ENV ??= 'development';
process.env.LOG_LEVEL ??= 'warn';
// Local-only development values so every endpoint is reachable without a .env file.
process.env.ADMIN_API_KEY ??= 'local-dev-admin-key-0123456789';
process.env.JWT_SECRET ??= 'local-dev-jwt-secret-0123456789-abcdefghijklmnop';
process.env.MFA_ENCRYPTION_KEY ??= 'local-dev-mfa-key-0123456789-abcdefghijklmnop';
process.env.SITE_URL ??= 'http://localhost:5173';
process.env.CORS_ORIGINS ??= 'http://localhost:5173,http://localhost:4173,http://127.0.0.1:5173,http://127.0.0.1:4173';

// src/server.js connects the pool itself and exits if it cannot.
await import('../src/server.js');
const { startWorker } = await import('../src/worker.js');
startWorker();

console.log(`[dev] API + worker ready on http://127.0.0.1:${process.env.PORT}`);
console.log(`[dev] postgres: ${process.env.DATABASE_URL}${keep ? '' : ' (thrown away on exit)'}`);
console.log(`[dev] staff header: x-admin-key: ${process.env.ADMIN_API_KEY}`);

const shutdown = async () => {
  await postgres.stop().catch(() => {});
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
