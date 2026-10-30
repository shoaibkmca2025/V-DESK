import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import EmbeddedPostgres from 'embedded-postgres';
import { migrate } from '../scripts/migrate.mjs';

/**
 * One PostgreSQL for the whole test run, started before any test file (vitest `globalSetup`).
 *
 * - A real server, not a fake: partial unique indexes, generated columns, row-value cursors and
 *   transactions are what the repositories rely on, so tests have to run against the real thing.
 * - Shared: the schema is migrated once into a template database, and each test file copies that template
 *   into its own database (test/db.js). Copying is a file-level operation, so it costs milliseconds —
 *   migrating 23 tables per file, or booting a server per file, would not.
 *
 * Set VDESK_TEST_DATABASE_URL to run the suite against an existing PostgreSQL (a Neon branch, CI's
 * service container) instead of the embedded one. The URL must name a database the suite may create
 * databases from — it is used as the admin connection.
 *
 * The connection details reach test files through the environment; workers start after this runs.
 */
const TEMPLATE_DB = 'vdesk_test_template';

export default async function setup() {
  if (process.env.VDESK_TEST_DATABASE_URL) {
    const base = new URL(process.env.VDESK_TEST_DATABASE_URL);
    await prepareTemplate(base);
    process.env.VDESK_TEST_PG_BASE = base.href;
    return () => {};
  }

  const dataDir = mkdtempSync(join(tmpdir(), 'vdesk-test-pg-'));
  const port = Number(process.env.VDESK_TEST_PG_PORT ?? 0) || 54331;
  const postgres = new EmbeddedPostgres({
    databaseDir: dataDir,
    user: 'vdesk',
    password: 'vdesk',
    port,
    persistent: false,
    // The schema is UTF-8 (it has comments with en dashes in them) and initdb on Windows would otherwise
    // pick the machine's code page, which cannot store them.
    initdbFlags: ['--encoding=UTF8', '--locale=C'],
    onLog: () => {},
  });
  await postgres.initialise();
  await postgres.start();
  await postgres.createDatabase('postgres_admin_target');

  const base = new URL(`postgresql://vdesk:vdesk@127.0.0.1:${port}/postgres_admin_target`);
  await prepareTemplate(base);
  process.env.VDESK_TEST_PG_BASE = base.href;

  return async () => {
    await postgres.stop().catch(() => {});
    rmSync(dataDir, { recursive: true, force: true });
  };
}

/** Creates (or recreates) the migrated template every run, so the schema under test is today's. */
async function prepareTemplate(base) {
  const { default: pg } = await import('pg');
  const admin = new pg.Client({ connectionString: base.href });
  await admin.connect();
  try {
    // Dropping first keeps a reused external database honest: the template is always freshly migrated.
    await admin.query(`DROP DATABASE IF EXISTS ${TEMPLATE_DB} WITH (FORCE)`);
    await admin.query(`CREATE DATABASE ${TEMPLATE_DB}`);
  } finally {
    await admin.end();
  }
  const templateUrl = new URL(base.href);
  templateUrl.pathname = `/${TEMPLATE_DB}`;
  await migrate({ connectionString: templateUrl.href, log: () => {} });
}
