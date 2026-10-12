import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../shared/lib/logger.js';

mongoose.set('strictQuery', true);

let transactions = false;

/**
 * Multi-document transactions need a replica set (Atlas always is one; a plain local `mongod` is not). The event
 * outbox relies on them (ADR-005/008), so production refuses to start without one; elsewhere the API still runs,
 * with a loud warning that outbox writes are not atomic (see shared/lib/transactions.js).
 */
export async function detectTransactionSupport() {
  const hello = await mongoose.connection.db.admin().command({ hello: 1 });
  transactions = Boolean(hello.setName) || hello.msg === 'isdbgrid';
  return transactions;
}

export function supportsTransactions() {
  return transactions;
}

export async function connectDb(uri = env.MONGODB_URI) {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  const ok = await detectTransactionSupport();
  logger.info({ db: mongoose.connection.name, transactions: ok }, 'MongoDB connected');
  if (!ok) {
    if (env.NODE_ENV === 'production') {
      throw new Error('MongoDB is not a replica set: transactions are required in production (ADR-008)');
    }
    logger.warn(
      'MongoDB is a standalone server: writes and their outbox events are NOT atomic here. ' +
        'Use `npm run dev:memory` or a single-node replica set (backend/README.md) to match production.',
    );
  }
}

export function disconnectDb() {
  return mongoose.disconnect();
}

export function isDbReady() {
  return mongoose.connection.readyState === 1;
}
