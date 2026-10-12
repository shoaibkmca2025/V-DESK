import { randomUUID } from 'node:crypto';
import mongoose from 'mongoose';
import { detectTransactionSupport } from '../src/config/db.js';

/**
 * Real MongoDB for integration tests (rules.md rule 32). test/globalSetup.js starts one single-node replica set
 * for the whole run; every test file connects to its own, freshly named database on it. Use in a test file:
 *   beforeAll(startTestDb); afterEach(clearTestDb); afterAll(stopTestDb);
 */
export async function startTestDb() {
  const uri = process.env.VDESK_TEST_MONGO_URI;
  if (!uri) throw new Error('VDESK_TEST_MONGO_URI is not set — run tests through vitest (test/globalSetup.js)');
  await mongoose.connect(uri, { dbName: `test_${randomUUID().slice(0, 12)}` });
  await detectTransactionSupport();
  // Build declared indexes (e.g. unique refs) before tests rely on them.
  await Promise.all(Object.values(mongoose.models).map((model) => model.init()));
}

export async function clearTestDb() {
  const collections = Object.values(mongoose.connection.collections);
  await Promise.all(collections.map((collection) => collection.deleteMany({})));
}

export async function stopTestDb() {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
}
