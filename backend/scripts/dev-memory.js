import { MongoMemoryReplSet } from 'mongodb-memory-server';

// Runs the API and the background worker in one process against a throwaway in-memory MongoDB — a single-node
// replica set, so transactions and the event outbox behave as in production. For machines without MongoDB.
// Data is lost when the process stops - use `npm run dev` + `npm run dev:worker` with a real MongoDB to keep it.
const mongo = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
process.env.MONGODB_URI = mongo.getUri('vdesk');
console.log(`In-memory MongoDB replica set started at ${process.env.MONGODB_URI} (data is not saved)`);

await import('../src/server.js');
const { startWorker } = await import('../src/worker.js');
startWorker();
