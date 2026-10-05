import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

/**
 * Real MongoDB in memory for integration tests (rules.md rule 32). Use in a test file:
 *   beforeAll(startTestDb); afterEach(clearTestDb); afterAll(stopTestDb);
 */
let mongo;

export async function startTestDb() {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  // Build declared indexes (e.g. unique refs) before tests rely on them.
  await Promise.all(Object.values(mongoose.models).map((model) => model.init()));
}

export async function clearTestDb() {
  const collections = Object.values(mongoose.connection.collections);
  await Promise.all(collections.map((collection) => collection.deleteMany({})));
}

export async function stopTestDb() {
  await mongoose.disconnect();
  await mongo?.stop();
}
