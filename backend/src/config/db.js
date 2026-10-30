import pg from 'pg';
import { env } from './env.js';
import { onWorkers } from './runtime.js';
import { logger } from '../shared/lib/logger.js';

/**
 * The PostgreSQL connection, as `shared/lib/sql.js` consumes it: something with `query()` and `connect()`.
 *
 * On a Node server that is a `pg.Pool` held for the life of the process. On Cloudflare Workers it is a
 * connection per use through Hyperdrive, because an isolate is frozen between requests and a pooled socket
 * would not survive — Hyperdrive keeps the real pool, so opening one is a local hop (ADR-011).
 *
 * Neon is the managed Postgres behind this in every deployed environment; on a Node host, DATABASE_URL
 * should be Neon's pooled (`-pooler`) connection string, so each instance's own pool sits behind Neon's.
 */

/*
 * `pg` hands back a JS Date for timestamptz, a string for bigint and a string for numeric. Dates are what
 * the services expect; the other two would quietly change types the API has always returned as numbers, so
 * they are parsed here, once, instead of in every repository.
 *   20 = int8 (bigint)   1700 = numeric
 * Integer paise fit in a double exactly up to 2^53 paise (≈ ₹90 trillion), so Number is safe for money.
 */
pg.types.setTypeParser(20, (value) => (value === null ? null : Number(value)));
pg.types.setTypeParser(1700, (value) => (value === null ? null : Number(value)));

let active = null;
let connected = false;
/**
 * Where the connection string comes from. The default is the validated setting; the Workers entry point
 * replaces it with one that reads the Hyperdrive binding, which may only be touched inside a handler —
 * reading it mints a credential, and Workers forbid that at module scope.
 */
let connectionStringFrom = () => env.DATABASE_URL;

/** Called by src/cloudflare/entry.js. The function runs on first use, never at import. */
export function useConnectionString(provider) {
  connectionStringFrom = provider;
}

function poolOptions(connectionString) {
  return {
    connectionString,
    max: env.DATABASE_POOL_MAX,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
    // The test suite must not be kept alive by an idle connection.
    allowExitOnIdle: env.NODE_ENV === 'test',
  };
}

/**
 * The Workers stand-in for a pool: every statement and every transaction gets its own short-lived client.
 * Hyperdrive is what makes that cheap, and it is the shape Cloudflare documents for `pg`.
 */
function workersConnection(connectionString) {
  const open = async () => {
    const client = new pg.Client({ connectionString });
    await client.connect();
    return client;
  };
  return {
    async query(...args) {
      const client = await open();
      try {
        return await client.query(...args);
      } finally {
        await client.end().catch(() => {});
      }
    },
    async connect() {
      const client = await open();
      // `release()` is what sql.js calls in its `finally`; here it closes rather than returns.
      client.release = () => {
        void client.end().catch(() => {});
      };
      return client;
    },
  };
}

function create(connectionString = connectionStringFrom()) {
  if (onWorkers) return workersConnection(connectionString);
  const pool = new pg.Pool(poolOptions(connectionString));
  /*
   * A pool error (Neon dropping an idle connection, a failover) arrives on the pool, not on a query. Left
   * unhandled it is an uncaught exception that ends the process; `pg` discards the broken client either way
   * and the next query gets a fresh one.
   */
  pool.on('error', (err) => logger.warn({ err }, 'idle PostgreSQL client errored; it was discarded'));
  return pool;
}

/**
 * Resolved per query rather than at import, because repositories import this at module load — long before
 * `connectDb()` runs on a server, and before the test database exists in the suite.
 */
export const pool = {
  query: (...args) => current().query(...args),
  connect: (...args) => current().connect(...args),
};

function current() {
  active ??= create();
  return active;
}

/** Replaces the connection — tests point the API at their own database. */
export function usePool(next) {
  active = next;
  connected = Boolean(next);
  return next;
}

/**
 * PostgreSQL has transactions everywhere, so the event outbox is always atomic — unlike MongoDB, which
 * needed a replica set for it (ADR-008). Kept as a function because callers and tests still ask.
 */
export function supportsTransactions() {
  return true;
}

/** Opens the connection and proves it works, so a server fails at boot rather than on its first request. */
export async function connectDb(connectionString = connectionStringFrom()) {
  active ??= create(connectionString);
  const { rows } = await active.query('SELECT current_database() AS db, version() AS version');
  connected = true;
  logger.info({ db: rows[0].db, server: rows[0].version.split(',')[0] }, 'PostgreSQL connected');
}

export async function disconnectDb() {
  const previous = active;
  active = null;
  connected = false;
  await previous?.end?.();
}

/**
 * Whether the database answers *now* — `/ready` tells a load balancer or Cloudflare whether to send this
 * instance traffic, and a flag set at boot would keep saying yes long after the database went away.
 */
export async function checkDbReady() {
  try {
    await pool.query('SELECT 1');
    connected = true;
  } catch {
    connected = false;
  }
  return connected;
}

/** The last thing we know, without asking again. */
export function isDbReady() {
  return connected;
}
