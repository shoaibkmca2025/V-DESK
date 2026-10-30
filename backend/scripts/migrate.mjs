/**
 * Applies the SQL files in backend/migrations to DATABASE_URL, in filename order, once each.
 *
 *   npm run migrate                      # against DATABASE_URL (.env or the environment)
 *   DATABASE_URL=postgres://… npm run migrate
 *   npm run migrate -- --status          # what is applied and what is pending
 *
 * Each file runs inside its own transaction together with the row that records it, so a migration either
 * lands completely or not at all — there is no half-applied state to unpick. Files are immutable once
 * applied: change the schema by adding the next file, never by editing an old one.
 */
import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import pg from 'pg';

const DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'migrations');
const statusOnly = process.argv.includes('--status');

const sha = (text) => createHash('sha256').update(text).digest('hex').slice(0, 12);

async function migrationFiles() {
  const names = (await readdir(DIR)).filter((name) => name.endsWith('.sql')).sort();
  return Promise.all(
    names.map(async (name) => ({
      version: name.replace(/\.sql$/, ''),
      name,
      sql: await readFile(join(DIR, name), 'utf8'),
    })),
  );
}

/** The table has to exist before it can be read, and the first migration is what creates it. */
async function appliedVersions(client) {
  const { rows } = await client
    .query(
      `
    SELECT version FROM schema_migrations ORDER BY version
  `,
    )
    .catch((err) => (err.code === '42P01' ? { rows: [] } : Promise.reject(err)));
  return new Set(rows.map((r) => r.version));
}

export async function migrate({ connectionString = process.env.DATABASE_URL, log = console.log } = {}) {
  if (!connectionString) throw new Error('DATABASE_URL is not set');
  const client = new pg.Client({ connectionString });
  await client.connect();
  try {
    const files = await migrationFiles();
    const applied = await appliedVersions(client);
    const pending = files.filter((file) => !applied.has(file.version));

    if (statusOnly) {
      for (const file of files) log(`${applied.has(file.version) ? 'applied' : 'pending'}  ${file.name}`);
      return { applied: [...applied], pending: pending.map((f) => f.version) };
    }

    if (pending.length === 0) {
      log(`[migrate] up to date (${applied.size} applied)`);
      return { applied: [...applied], pending: [] };
    }

    for (const file of pending) {
      const started = Date.now();
      await client.query('BEGIN');
      try {
        await client.query(file.sql);
        await client.query('INSERT INTO schema_migrations (version) VALUES ($1)', [file.version]);
        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK').catch(() => {});
        throw new Error(`migration ${file.name} failed: ${err.message}`, { cause: err });
      }
      log(`[migrate] applied ${file.name} (${sha(file.sql)}) in ${Date.now() - started} ms`);
    }
    return { applied: [...applied, ...pending.map((f) => f.version)], pending: [] };
  } finally {
    await client.end();
  }
}

// Only run when invoked directly, so tests and the dev script can import `migrate()`.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    await migrate();
  } catch (err) {
    console.error(`[migrate] ${err.message}`);
    process.exit(1);
  }
}
