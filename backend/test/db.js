import { randomUUID } from 'node:crypto';
import pg from 'pg';
import { usePool } from '../src/config/db.js';

/**
 * Real PostgreSQL for integration tests (rules.md rule 32). test/globalSetup.js starts one server for the
 * whole run and migrates a template database; every test file copies that template into its own database,
 * so files never see each other's rows. Use in a test file:
 *   beforeAll(startTestDb); afterEach(clearTestDb); afterAll(stopTestDb);
 */
const TEMPLATE_DB = 'vdesk_test_template';

let database = null;
let testPool = null;
let tables = null;

function base() {
  const url = process.env.VDESK_TEST_PG_BASE;
  if (!url) throw new Error('VDESK_TEST_PG_BASE is not set — run tests through vitest (test/globalSetup.js)');
  return new URL(url);
}

async function onAdmin(sql) {
  const admin = new pg.Client({ connectionString: base().href });
  await admin.connect();
  try {
    return await admin.query(sql);
  } finally {
    await admin.end();
  }
}

export async function startTestDb() {
  database = `vdesk_test_${randomUUID().replaceAll('-', '').slice(0, 12)}`;
  await onAdmin(`CREATE DATABASE ${database} TEMPLATE ${TEMPLATE_DB}`);
  const url = base();
  url.pathname = `/${database}`;
  testPool = usePool(new pg.Pool({ connectionString: url.href, max: 5, allowExitOnIdle: true }));

  const { rows } = await testPool.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE' AND table_name <> 'schema_migrations'
  `);
  tables = rows.map((r) => `"${r.table_name}"`).join(', ');
}

/** One statement, so emptying 23 tables between tests costs one round trip. */
export async function clearTestDb() {
  await testPool.query(`TRUNCATE TABLE ${tables} RESTART IDENTITY CASCADE`);
}

export async function stopTestDb() {
  await testPool?.end();
  usePool(null);
  testPool = null;
  if (database) await onAdmin(`DROP DATABASE IF EXISTS ${database} WITH (FORCE)`);
  database = null;
}

// ── Reading and writing rows directly, for tests that check what was stored ──

/** Any statement, on this test file's database. */
export async function query(sql, params = []) {
  return testPool.query(sql, params);
}

/** Every matching row, as the database holds it (snake_case columns unless the query aliases them). */
export async function rows(sql, params = []) {
  return (await testPool.query(sql, params)).rows;
}

export async function row(sql, params = []) {
  return (await testPool.query(sql, params)).rows[0] ?? null;
}

export async function count(table, where = '', params = []) {
  const { rows: result } = await testPool.query(
    `SELECT count(*)::int AS n FROM ${table} ${where ? `WHERE ${where}` : ''}`,
    params,
  );
  return result[0].n;
}

/**
 * Inserts a row from a plain object, mapping camelCase keys to snake_case columns — the short way to put
 * a fixture in place without writing out the column list.
 */
export async function insert(table, data) {
  const names = Object.keys(data);
  const columns = names.map((name) => `"${snake(name)}"`).join(', ');
  const values = names.map((_, i) => `$${i + 1}`).join(', ');
  const { rows: result } = await testPool.query(
    `INSERT INTO ${table} (${columns}) VALUES (${values}) RETURNING *`,
    names.map((name) => data[name]),
  );
  return result[0];
}

const snake = (name) => name.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
