import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../shared/lib/logger.js';

mongoose.set('strictQuery', true);

export async function connectDb(uri = env.MONGODB_URI) {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  logger.info({ db: mongoose.connection.name }, 'MongoDB connected');
}

export function disconnectDb() {
  return mongoose.disconnect();
}

export function isDbReady() {
  return mongoose.connection.readyState === 1;
}
