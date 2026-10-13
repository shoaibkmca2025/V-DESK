# jobs — background work

Work that must not run inside a request (rules.md §28) runs in the **worker**: a second process from the same code,
connected to the same MongoDB (ADR-008 — no Redis or BullMQ).

| File            | What                                                                                 |
| --------------- | ------------------------------------------------------------------------------------ |
| `runner.js`     | `startJobs(jobs)`: runs each job every `everyMs`, never overlapping itself; `stop()` |
| `src/jobs.js`   | the job list (like `src/routes.js`) and the messaging providers                      |
| `src/worker.js` | the process: connects, starts the jobs, stops gracefully on SIGTERM/SIGINT           |

| Job                       | Every | Does                                                                          |
| ------------------------- | ----- | ----------------------------------------------------------------------------- |
| `events.dispatch`         | 1 s   | delivers outbox events to their handlers (`shared/events/bus.js`)             |
| `booking.expire_holds`    | 30 s  | saves lapsed holds as EXPIRED (`booking.hold_expired`), frees their hours     |
| `pricing.expire_quotes`   | 60 s  | saves open quotes past `validUntil` as EXPIRED (`quote.expired`)              |
| `notifications.send`      | 5 s   | sends queued notifications — only registered once a messaging provider exists |
| `subscriptions.lifecycle` | 60 s  | renewal reminders T-30/7/1, period end → GRACE, grace end → SUSPENDED         |

Run it: `npm run worker` (production), `npm run dev:worker` (local, restarts on change), or `npm run dev:memory`,
which runs API and worker in one process.

## Adding a job

1. A function that does a bounded batch of work and returns counts, e.g. `{ done: 3, failed: 0 }` (logged when non-zero).
2. It must be safe in **several workers at once**: claim each item with an atomic `findOneAndUpdate` plus a lease
   (see `bus.js` `claimNext`, `notifications.repository.js` `claimNext`). A job that must run exactly once per period
   across all workers (e.g. a nightly rollup) needs a lock document — add that pattern when the first such job lands.
3. Add it to `buildJobs()` in `src/jobs.js`.
