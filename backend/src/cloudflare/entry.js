/**
 * Cloudflare Workers entry point (ADR-011).
 *
 * The same Express app that `src/server.js` listens with, handed to the Workers request lifecycle by
 * `httpServerHandler`; and the same background jobs that `src/worker.js` loops over, driven by cron
 * triggers instead. There is no V-DESK logic here — only the three things a Worker does differently.
 *
 * 1. **Settings.** Workers populate `process.env` from their vars and secrets lazily, the first time
 *    anything touches `process` — which can be *after* a module has been evaluated. `config/env.js`
 *    validates its settings at import, so on a Worker it can run a moment too early and conclude that
 *    JWT_SECRET is missing; that isolate then answers 503 on every `/auth` route while its neighbours work.
 *    So the bindings are copied over first, and the app is imported only afterwards.
 * 2. **The database.** Hyperdrive's connection string is handed over as a function, because reading that
 *    binding mints a credential and a Worker may only do that inside a handler, never at module scope.
 * 3. **Background work.** A Worker cannot hold a 1-second loop, so `wrangler.jsonc` schedules the jobs:
 *    every minute for the outbox and the message queue, hourly for the row purge.
 */
import { env as bindings } from 'cloudflare:workers';
import { httpServerHandler } from 'cloudflare:node';

/*
 * Only the text and JSON bindings — reading an object binding's own properties (Hyperdrive's
 * `connectionString`) is what Workers forbid out here, and `Object.entries` does not touch them.
 */
for (const [name, value] of Object.entries(bindings)) {
  if (typeof value === 'string') process.env[name] ??= value;
}

// Imported after the loop above, because importing the app validates the settings.
const { createApp } = await import('../app.js');
const { useConnectionString } = await import('../config/db.js');
const { buildJobs } = await import('../jobs.js');
const { logger } = await import('../shared/lib/logger.js');

useConnectionString(() => bindings.HYPERDRIVE.connectionString);

/** A routing key for `httpServerHandler`, not a port anything listens on. */
const PORT = 8787;
createApp().listen(PORT);
const { fetch } = httpServerHandler({ port: PORT });

/** Hourly work is scheduled separately, so the minute-by-minute run stays small. */
const HOURLY = '0 * * * *';

/**
 * One pass of the jobs due on this trigger. `buildJobs()` is the same list the worker process runs, so a
 * job added there is picked up here without being registered twice.
 */
async function runDueJobs(cron) {
  const hourly = cron === HOURLY;
  const jobs = buildJobs().filter((job) => (job.name === 'rows.purge') === hourly);

  for (const job of jobs) {
    try {
      const summary = await job.run();
      if (summary && Object.values(summary).some((count) => count > 0)) {
        logger.info({ event: 'job.ran', job: job.name, cron, ...summary }, 'job ran');
      }
    } catch (err) {
      // One failing job must not stop the others; everything it touches is retried on its own schedule.
      logger.error({ event: 'job.failed', job: job.name, cron, err }, 'job failed');
    }
  }
}

export default {
  fetch,
  async scheduled(controller, _env, ctx) {
    // waitUntil keeps the invocation alive for the whole pass without holding up the trigger.
    ctx.waitUntil(runDueJobs(controller.cron));
  },
};
