/**
 * Enterprise service — business rules. Gets and saves data through enterprise.repository.js.
 * Never uses `req`/`res` or SQL directly, so it can be unit-tested and reused by background jobs.
 */
