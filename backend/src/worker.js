import { pathToFileURL } from 'node:url';
import { connectDb, disconnectDb } from './config/db.js';
import { buildJobs, messagingProviders } from './jobs.js';
import { startJobs } from './shared/jobs/runner.js';
import { logger } from './shared/lib/logger.js';

/**
 * Background worker: a second process next to the API (same code, same database) that runs src/jobs.js — outbox
 * delivery, notification sending and row purging (ADR-008, ADR-010). Run one or more: `npm run worker`
 * (`npm run dev:worker` locally). Exported so `npm run dev:pg` can run it inside the API process.
 */
export function startWorker() {
  const providers = messagingProviders();
  if (Object.keys(providers).length === 0) {
    logger.warn('no messaging provider configured: notifications are queued but not sent');
  }
  return startJobs(buildJobs({ providers }));
}

async function main() {
  try {
    await connectDb();
  } catch (err) {
    logger.fatal({ err }, 'worker could not connect to PostgreSQL');
    process.exit(1);
  }
  const worker = startWorker();

  let shuttingDown = false;
  // Let runs in progress finish (their claims are leased, so a hard kill is also safe — just slower to recover).
  const shutdown = async (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info({ signal }, 'worker shutting down');
    setTimeout(() => process.exit(1), 30_000).unref();
    await worker.stop();
    await disconnectDb();
    process.exit(0);
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
