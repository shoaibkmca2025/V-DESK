import { MongoMemoryReplSet } from 'mongodb-memory-server';

/**
 * One MongoDB for the whole test run, started before any test file (vitest `globalSetup`).
 *
 * - A single-node **replica set**, so code that uses transactions (the event outbox) runs for real in tests.
 * - Shared: each test file gets its own database on it (test/db.js), instead of each file booting its own mongod —
 *   25+ servers starting at once timed out on slower machines and made runs flaky.
 *
 * The URI reaches test files through the environment; workers are started after this runs, so they inherit it.
 */
export default async function setup() {
  const replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  process.env.VDESK_TEST_MONGO_URI = replSet.getUri();
  return async () => {
    await replSet.stop();
  };
}
