/**
 * KYC service — business rules. Gets and saves data through kyc.repository.js.
 * Never uses `req`/`res` or SQL directly, so it can be unit-tested and reused by background jobs.
 */
