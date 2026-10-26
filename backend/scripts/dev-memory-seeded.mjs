/**
 * Local API + worker on a throwaway in-memory MongoDB — one command to get an API for frontend
 * work without installing a database. Seed it over HTTP afterwards (scripts/seed-over-api.mjs).
 *
 *   node scripts/dev-memory-seeded.mjs            # http://127.0.0.1:5000
 *   PORT=5055 node scripts/dev-memory-seeded.mjs
 *
 * Data is lost when the process stops. Use `npm run dev` against a real MongoDB to keep it.
 */
import mongoose from 'mongoose';
import { MongoMemoryReplSet, MongoMemoryServer } from 'mongodb-memory-server';

/** Can something actually talk to this URI? */
async function reachable(uri, attempts) {
  for (let i = 0; i < attempts; i++) {
    try {
      const connection = await mongoose.createConnection(uri, { serverSelectionTimeoutMS: 3000 }).asPromise();
      await connection.db.admin().command({ ping: 1 });
      await connection.close();
      return true;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  return false;
}

/*
 * A single-node replica set matches production (transactions, the event outbox), but the in-memory
 * one does not always elect a primary on Windows. Rather than hang, fall back to a standalone
 * server: every endpoint still works, writes and their outbox events just aren't atomic — which the
 * API already warns about at boot.
 */
let uri;
try {
  const replicaSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  uri = replicaSet.getUri('vdesk');
  if (!(await reachable(uri, 12))) throw new Error('no primary was elected');
  console.log('[dev] in-memory replica set ready (transactions on)');
} catch (error) {
  console.warn(`[dev] replica set unavailable (${error.message}); falling back to a standalone server`);
  const standalone = await MongoMemoryServer.create();
  uri = standalone.getUri('vdesk');
  if (!(await reachable(uri, 10))) throw new Error('could not start an in-memory MongoDB');
  console.log('[dev] in-memory standalone ready (transactions off — outbox writes are not atomic)');
}
process.env.MONGODB_URI = uri;
process.env.PORT ??= '5000';
process.env.NODE_ENV ??= 'development';
process.env.LOG_LEVEL ??= 'warn';
// Local-only development values so every endpoint is reachable without a .env file.
process.env.ADMIN_API_KEY ??= 'local-dev-admin-key-0123456789';
process.env.JWT_SECRET ??= 'local-dev-jwt-secret-0123456789-abcdefghijklmnop';
process.env.MFA_ENCRYPTION_KEY ??= 'local-dev-mfa-key-0123456789-abcdefghijklmnop';
process.env.SITE_URL ??= 'http://localhost:5173';
process.env.CORS_ORIGINS ??= 'http://localhost:5173,http://localhost:4173,http://127.0.0.1:5173,http://127.0.0.1:4173';

await import('../src/server.js');
const { startWorker } = await import('../src/worker.js');
startWorker();

// Report the real connection state rather than assuming the import succeeded.
const started = Date.now();
const timer = setInterval(() => {
  if (mongoose.connection.readyState === 1) {
    clearInterval(timer);
    console.log(`[dev] API + worker ready on http://127.0.0.1:${process.env.PORT} (in-memory data, not saved)`);
    console.log(`[dev] staff header: x-admin-key: ${process.env.ADMIN_API_KEY}`);
  } else if (Date.now() - started > 30_000) {
    clearInterval(timer);
    console.error('[dev] the API never connected to the in-memory database');
  }
}, 500);
