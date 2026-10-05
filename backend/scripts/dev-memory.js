import { MongoMemoryServer } from 'mongodb-memory-server';

// Runs the API against a throwaway in-memory MongoDB, for machines without MongoDB installed.
// Data is lost when the process stops - use `npm run dev` with a real MongoDB for anything you want to keep.
const mongo = await MongoMemoryServer.create();
process.env.MONGODB_URI = mongo.getUri('vdesk');
console.log(`In-memory MongoDB started at ${process.env.MONGODB_URI} (data is not saved)`);

await import('../src/server.js');
