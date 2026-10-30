/**
 * Which runtime this process is: Node (a server or the test suite) or a Cloudflare Worker.
 *
 * Only three things differ, and each one is handled where it belongs rather than by a flag passed around:
 * logs have no stdout to write to (shared/lib/logger.js), database connections are opened per use behind
 * Hyperdrive instead of pooled in the process (config/db.js), and the background jobs are cron invocations
 * instead of a loop (cloudflare/entry.js).
 */
export const onWorkers = globalThis.navigator?.userAgent === 'Cloudflare-Workers';
