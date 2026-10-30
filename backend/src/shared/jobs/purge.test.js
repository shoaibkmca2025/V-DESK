/**
 * The purge job: it deletes what MongoDB's TTL indexes used to expire, and nothing else.
 *
 * The point of these tests is the "nothing else" half — a job that runs hourly against every table is only
 * safe if it leaves live rows, confirmed bookings and dead events alone.
 * Run: npx vitest run src/shared/jobs/purge.test.js
 */
import { afterEach, afterAll, beforeAll, describe, expect, it } from 'vitest';
import { OTP_SEND_WINDOW_MS } from '../../modules/identity/identity.constants.js';
import { RETENTION_SECONDS } from '../../modules/analytics/analytics.constants.js';
import { clearTestDb, count, insert, startTestDb, stopTestDb } from '../../../test/db.js';
import { purgeExpiredRows } from './purge.js';

const NOW = new Date('2026-10-30T06:00:00.000Z');
const ago = (ms) => new Date(NOW.getTime() - ms);
const ahead = (ms) => new Date(NOW.getTime() + ms);
const DAY = 86_400_000;

beforeAll(startTestDb);
afterEach(clearTestDb);
afterAll(stopTestDb);

describe('purgeExpiredRows', () => {
  it('deletes what is past its time and keeps what is not', async () => {
    await insert('refresh_tokens', { tokenHash: 'dead', userRef: 'USR-1', family: 'f1', expiresAt: ago(DAY) });
    await insert('refresh_tokens', { tokenHash: 'live', userRef: 'USR-1', family: 'f2', expiresAt: ahead(DAY) });

    await insert('otp_challenges', {
      mobile: '9811111111',
      codeHash: 'x',
      expiresAt: ago(DAY),
      windowStartedAt: ago(DAY),
      lastSentAt: ago(OTP_SEND_WINDOW_MS + 60_000),
    });
    await insert('otp_challenges', {
      mobile: '9822222222',
      codeHash: 'y',
      expiresAt: ahead(300_000),
      windowStartedAt: ago(60_000),
      lastSentAt: ago(60_000),
    });

    const slot = { centreRef: 'CTR-1', room: 'Conference Room', date: '2026-10-29' };
    // A lapsed hold's hour, a live hold's hour, and a confirmed booking's hour (expires_at NULL).
    await insert('booking_slots', { ...slot, hour: 9, bookingRef: 'BK-LAPSED', expiresAt: ago(600_000) });
    await insert('booking_slots', { ...slot, hour: 10, bookingRef: 'BK-HELD', expiresAt: ahead(300_000) });
    await insert('booking_slots', { ...slot, hour: 11, bookingRef: 'BK-CONFIRMED', expiresAt: null });

    const event = { type: 'lead.created', occurredAt: ago(DAY), actorType: 'public', entityType: 'lead' };
    await insert('domain_events', {
      ...event,
      ref: 'DE-OLD',
      entityRef: 'VD-1',
      status: 'DONE',
      nextAttemptAt: ago(DAY),
      expireAt: ago(DAY),
    });
    await insert('domain_events', {
      ...event,
      ref: 'DE-RECENT',
      entityRef: 'VD-2',
      status: 'DONE',
      nextAttemptAt: ago(DAY),
      expireAt: ahead(29 * DAY),
    });
    // DEAD events are kept however old they are: somebody has to look at them.
    await insert('domain_events', {
      ...event,
      ref: 'DE-DEAD',
      entityRef: 'VD-3',
      status: 'DEAD',
      nextAttemptAt: ago(90 * DAY),
      expireAt: ago(90 * DAY),
    });
    await insert('domain_events', {
      ...event,
      ref: 'DE-PENDING',
      entityRef: 'VD-4',
      status: 'PENDING',
      nextAttemptAt: ago(DAY),
    });

    await insert('analytics_events', {
      ref: 'EVT-OLD',
      type: 'hero_search',
      occurredAt: ago(RETENTION_SECONDS * 1000 + DAY),
      dedupeKey: 'old',
      createdAt: ago(RETENTION_SECONDS * 1000 + DAY),
    });
    await insert('analytics_events', {
      ref: 'EVT-NEW',
      type: 'hero_search',
      occurredAt: ago(DAY),
      dedupeKey: 'new',
      createdAt: ago(DAY),
    });

    expect(await purgeExpiredRows(NOW)).toEqual({
      refreshTokens: 1,
      otpChallenges: 1,
      bookingSlots: 1,
      domainEvents: 1,
      analyticsEvents: 1,
    });

    expect(await count('refresh_tokens')).toBe(1);
    expect(await count('otp_challenges')).toBe(1);
    expect(await count('booking_slots')).toBe(2);
    expect(await count('booking_slots', 'expires_at IS NULL')).toBe(1);
    expect(await count('analytics_events')).toBe(1);
    const events = await count('domain_events');
    expect(events).toBe(3);
    expect(await count('domain_events', `status = 'DEAD'`)).toBe(1);
    expect(await count('domain_events', `status = 'PENDING'`)).toBe(1);
  });

  it('does nothing when there is nothing to delete, and is safe to run again', async () => {
    expect(await purgeExpiredRows(NOW)).toEqual({
      refreshTokens: 0,
      otpChallenges: 0,
      bookingSlots: 0,
      domainEvents: 0,
      analyticsEvents: 0,
    });
    expect(await purgeExpiredRows(NOW)).toMatchObject({ refreshTokens: 0 });
  });
});
