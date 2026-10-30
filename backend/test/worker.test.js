import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildJobs } from '../src/jobs.js';
import { startJobs } from '../src/shared/jobs/runner.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Waits until `condition()` holds, up to `timeoutMs`. The runner's intervals are real time, and a busy
 * machine can starve the event loop for a while, so these tests wait for the behaviour instead of assuming
 * how many runs fit in a fixed sleep.
 */
async function waitFor(condition, { timeoutMs = 3000, everyMs = 5 } = {}) {
  const deadline = Date.now() + timeoutMs;
  while (!condition()) {
    if (Date.now() > deadline) return false;
    await sleep(everyMs);
  }
  return true;
}

describe('job runner', () => {
  let runner;
  afterEach(async () => {
    await runner?.stop();
    runner = undefined;
  });

  it('runs a job repeatedly and never overlaps it with itself', async () => {
    let running = 0;
    let maxConcurrent = 0;
    const run = vi.fn(async () => {
      running += 1;
      maxConcurrent = Math.max(maxConcurrent, running);
      await sleep(15);
      running -= 1;
    });
    runner = startJobs([{ name: 'test.repeat', everyMs: 1, run }]);
    expect(await waitFor(() => run.mock.calls.length > 2)).toBe(true);
    expect(maxConcurrent).toBe(1);
  });

  it('keeps going after a failing run', async () => {
    const run = vi.fn().mockRejectedValueOnce(new Error('boom')).mockResolvedValue({ done: 0 });
    runner = startJobs([{ name: 'test.flaky', everyMs: 1, run }]);
    expect(await waitFor(() => run.mock.calls.length > 1)).toBe(true);
  });

  it('stop() waits for the run in progress and schedules nothing more', async () => {
    let finished = false;
    const run = vi.fn(async () => {
      await sleep(40);
      finished = true;
    });
    runner = startJobs([{ name: 'test.stop', everyMs: 1, run }]);
    await sleep(5);
    await runner.stop();
    expect(finished).toBe(true);
    const calls = run.mock.calls.length;
    await sleep(30);
    expect(run.mock.calls.length).toBe(calls);
  });
});

describe('worker jobs', () => {
  it('always dispatches events; sends notifications only with a provider', () => {
    expect(buildJobs({ providers: {} }).map((job) => job.name)).toEqual(['events.dispatch', 'rows.purge']);
    expect(buildJobs({ providers: { email: { send: async () => ({}) } } }).map((job) => job.name)).toEqual([
      'events.dispatch',
      'rows.purge',
      'notifications.send',
    ]);
  });
});
