import { RETENTION_SECONDS } from '../../modules/analytics/analytics.constants.js';
import { OTP_SEND_WINDOW_MS } from '../../modules/identity/identity.constants.js';
import { exec } from '../lib/sql.js';

/**
 * Deletes the rows that used to disappear on their own (ADR-010).
 *
 * MongoDB expired them with TTL indexes; PostgreSQL has no such thing, so the worker does it on a schedule —
 * which is visible, testable, and logged, unlike a background monitor nobody can see.
 *
 * Nothing here is load-bearing for correctness. Every one of these rows is already refused on read once it
 * is past its time: a lapsed hold reads as EXPIRED, an expired refresh token or OTP is rejected, a delivered
 * event is DONE. This job only stops the tables growing for ever.
 */

/** Analytics events are kept for this long after they arrive (13 months, PRD §58). */
const ANALYTICS_RETENTION_MS = RETENTION_SECONDS * 1000;

export async function purgeExpiredRows(now = new Date()) {
  const [refreshTokens, otpChallenges, bookingSlots, domainEvents, analyticsEvents] = await Promise.all([
    // A revoked or expired token can never be traded in again.
    exec(`DELETE FROM refresh_tokens WHERE expires_at < $1`, [now]),
    // The row outlives its code to hold the send budget; once the window has closed it means nothing.
    exec(`DELETE FROM otp_challenges WHERE last_sent_at < $1`, [new Date(now.getTime() - OTP_SEND_WINDOW_MS)]),
    /*
     * Slots of a hold that lapsed. A confirmed booking's slots have expires_at NULL and are never touched;
     * the booking service also clears lapsed slots before it inserts, so an hour is free the moment the hold
     * is up — this is only the sweeping-up.
     */
    exec(`DELETE FROM booking_slots WHERE expires_at IS NOT NULL AND expires_at < $1`, [now]),
    // Delivered events, after their retention. DEAD ones stay: somebody has to look at them.
    exec(`DELETE FROM domain_events WHERE status = 'DONE' AND expire_at IS NOT NULL AND expire_at < $1`, [now]),
    exec(`DELETE FROM analytics_events WHERE created_at < $1`, [new Date(now.getTime() - ANALYTICS_RETENTION_MS)]),
  ]);

  return { refreshTokens, otpChallenges, bookingSlots, domainEvents, analyticsEvents };
}
