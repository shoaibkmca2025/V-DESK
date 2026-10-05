import { createApp } from './app.js';
import { connectDb, disconnectDb } from './config/db.js';
import { env } from './config/env.js';
import { logger } from './shared/lib/logger.js';

try {
  await connectDb();
} catch (err) {
  logger.fatal({ err }, 'could not connect to MongoDB — is it running? Check MONGODB_URI');
  process.exit(1);
}

const server = createApp().listen(env.PORT, () => {
  logger.info(`V-DESK API listening on http://localhost:${env.PORT}`);
});

let shuttingDown = false;

/** Stop accepting requests, let in-flight ones finish, then close the database (rules.md §30). */
function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ signal }, 'shutting down');

  server.close(async (err) => {
    await disconnectDb();
    process.exit(err ? 1 : 0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (err) => {
  logger.fatal({ err }, 'unhandled promise rejection');
  shutdown('unhandledRejection');
});
