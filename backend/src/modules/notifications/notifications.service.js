/**
 * Notifications service — business rules. Gets and saves data through notifications.repository.js.
 * Never uses `req`/`res` or Mongoose directly, so it can be unit-tested and reused by background jobs.
 */
