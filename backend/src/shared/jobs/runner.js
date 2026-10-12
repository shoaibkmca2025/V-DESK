import { logger } from '../lib/logger.js';

const log = logger.child({ module: 'jobs' });

/**
 * Runs each job's `run()` every `everyMs`, measured from the end of the previous run, so a slow run is never
 * overlapped by the next one in the same process (ADR-008). Jobs that may run in several worker processes at once
 * must make their own claims safe — the outbox and notification queue claim one item at a time with a lease.
 *
 * `run()` may return a summary of counts; it is logged when any count is non-zero. A failing run is logged and the
 * job carries on at its next interval.
 * @param {{ name: string, everyMs: number, run: () => Promise<Record<string, number> | void> }[]} jobs
 * @returns {{ stop: () => Promise<void> }} stop() waits for runs in progress, then schedules nothing more
 */
export function startJobs(jobs) {
  let stopping = false;
  const timers = new Set();
  const inFlight = new Set();

  const schedule = (job, delayMs) => {
    if (stopping) return;
    const timer = setTimeout(() => {
      timers.delete(timer);
      void tick(job);
    }, delayMs);
    timers.add(timer);
  };

  async function tick(job) {
    const run = (async () => {
      try {
        const summary = await job.run();
        if (summary && Object.values(summary).some((count) => count > 0)) {
          log.info({ event: 'job.ran', job: job.name, ...summary }, 'job ran');
        }
      } catch (err) {
        log.error({ event: 'job.failed', job: job.name, err }, 'job failed');
      }
    })();
    inFlight.add(run);
    await run;
    inFlight.delete(run);
    schedule(job, job.everyMs);
  }

  for (const job of jobs) schedule(job, 0);
  log.info({ jobs: jobs.map((job) => job.name) }, 'jobs started');

  return {
    async stop() {
      stopping = true;
      for (const timer of timers) clearTimeout(timer);
      timers.clear();
      await Promise.all(inFlight);
    },
  };
}
