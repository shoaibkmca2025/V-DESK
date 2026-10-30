/**
 * The schema and the code have to agree.
 *
 * Allowed values live twice: as a CHECK constraint in migrations/*.sql, and as a constants array in the module
 * that uses them. Adding a status to the array and forgetting the migration would only show up as a failed
 * insert in production, so these tests compare the two directly.
 *
 * They also check the plumbing every repository depends on: money comes back as a number, timestamps as Dates,
 * jsonb as objects, and `updated_at` moves on its own.
 * Run: npx vitest run test/schema.test.js
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { CHANNELS, NOTIFICATION_STATUSES } from '../src/modules/notifications/notifications.constants.js';
import { AVAILABILITY_STATUSES, CITY_TIERS, WORKSPACE_TYPES } from '../src/modules/catalog/catalog.constants.js';
import { ACTIVITY_TYPES, LEAD_STATUSES } from '../src/modules/crm/crm.constants.js';
import { BOOKING_STATUSES } from '../src/modules/booking/booking.constants.js';
import { CONFIG_KEYS } from '../src/modules/search/search.constants.js';
import { CONTENT_TYPES } from '../src/modules/cms/cms.constants.js';
import { CUSTOMER_STATUSES, STAFF_ROLES, USER_STATUSES } from '../src/modules/identity/identity.constants.js';
import { DEVICES } from '../src/modules/analytics/analytics.constants.js';
import { ORDER_STATUSES, SOURCE_TYPES } from '../src/modules/orders/orders.constants.js';
import { PRODUCTS, QUOTE_STATUSES, RULE_KEYS } from '../src/modules/pricing/pricing.constants.js';
import { EVENT_STATUSES } from '../src/shared/events/bus.js';
import { query, row, startTestDb, stopTestDb } from './db.js';

beforeAll(startTestDb);
afterAll(stopTestDb);

/**
 * The values a CHECK constraint allows, read back from the constraint itself. Postgres stores it as text
 * (`status = ANY (ARRAY['a'::text, ...])`), so the quoted strings are what we compare.
 */
async function allowedValues(table, column) {
  const result = await row(
    `SELECT pg_get_constraintdef(c.oid) AS definition
       FROM pg_constraint c
       JOIN pg_class t ON t.oid = c.conrelid
      WHERE t.relname = $1 AND c.contype = 'c' AND pg_get_constraintdef(c.oid) LIKE '%' || $2 || '%'`,
    [table, column],
  );
  expect(result, `no CHECK constraint on ${table}.${column}`).not.toBeNull();
  return [...result.definition.matchAll(/'([^']+)'::text/g)].map((match) => match[1]);
}

describe('the database allows exactly what the code does', () => {
  const cases = [
    ['users', 'role', STAFF_ROLES],
    ['users', 'status', USER_STATUSES],
    ['customers', 'status', CUSTOMER_STATUSES],
    ['cities', 'tier', CITY_TIERS],
    ['centres', 'status', AVAILABILITY_STATUSES],
    ['workspaces', 'type', WORKSPACE_TYPES],
    ['workspaces', 'status', AVAILABILITY_STATUSES],
    ['leads', 'status', LEAD_STATUSES],
    ['lead_activities', 'type', ACTIVITY_TYPES],
    ['pricing_rules', 'key', RULE_KEYS],
    ['quotes', 'status', QUOTE_STATUSES],
    ['quotes', 'product_type', PRODUCTS],
    ['bookings', 'status', BOOKING_STATUSES],
    ['orders', 'status', ORDER_STATUSES],
    ['orders', 'source_type', SOURCE_TYPES],
    ['notification_templates', 'channel', CHANNELS],
    ['notification_log', 'channel', CHANNELS],
    ['notification_log', 'status', NOTIFICATION_STATUSES],
    ['content_entries', 'type', CONTENT_TYPES],
    ['content_revisions', 'type', CONTENT_TYPES],
    ['search_config', 'key', CONFIG_KEYS],
    ['analytics_events', 'device', DEVICES],
    ['domain_events', 'status', EVENT_STATUSES],
  ];

  // Sorted on both sides: the order values appear in a CHECK list means nothing.
  it.each(cases)('%s.%s matches its constants', async (table, column, expected) => {
    expect((await allowedValues(table, column)).sort()).toEqual([...expected].sort());
  });

  it('refuses a value the code would never produce', async () => {
    await expect(
      query(`INSERT INTO cities (ref, slug, name, state, tier) VALUES ('CITY-X', 'x', 'X', 'MH', 'Tier-9')`),
    ).rejects.toMatchObject({ code: '23514' });
  });
});

describe('values come back as the code expects', () => {
  it('money as a number, timestamps as Dates, jsonb as objects, arrays as arrays', async () => {
    await query(
      `INSERT INTO quotes (ref, product_type, product, tenure, rate_month_paise, name, item, pricing, valid_until)
            VALUES ('VDQ-T1', 'virtual_office', 'VO', '12 months', 124900, 'Priya',
                    '{"product":"virtual_office"}', '{"total_paise": 1473820}', now())`,
    );
    const quote = await row(
      `SELECT rate_month_paise, item, pricing, valid_until, created_at, history FROM quotes WHERE ref = 'VDQ-T1'`,
    );
    expect(typeof quote.rate_month_paise).toBe('number');
    expect(quote.rate_month_paise).toBe(124900);
    expect(quote.pricing).toEqual({ total_paise: 1473820 });
    expect(quote.item).toEqual({ product: 'virtual_office' });
    expect(quote.history).toEqual([]);
    expect(quote.valid_until).toBeInstanceOf(Date);
    expect(quote.created_at).toBeInstanceOf(Date);

    await query(
      `INSERT INTO cities (ref, slug, name, state, tier, localities)
            VALUES ('CITY-T1', 't1', 'T', 'MH', 'Tier-1', ARRAY['A', 'B'])`,
    );
    expect((await row(`SELECT localities FROM cities WHERE ref = 'CITY-T1'`)).localities).toEqual(['A', 'B']);
  });

  it('keeps updated_at current without any UPDATE having to remember it', async () => {
    await query(`INSERT INTO customers (ref, mobile, name) VALUES ('CUS-T1', '9811111111', 'Priya')`);
    const before = await row(`SELECT created_at, updated_at FROM customers WHERE ref = 'CUS-T1'`);
    await query(`UPDATE customers SET name = 'Priya K' WHERE ref = 'CUS-T1'`);
    const after = await row(`SELECT created_at, updated_at FROM customers WHERE ref = 'CUS-T1'`);

    expect(after.updated_at.getTime()).toBeGreaterThan(before.updated_at.getTime());
    expect(after.created_at).toEqual(before.created_at);
  });

  it('keeps a booking its own copy of the customer mobile, generated from the stored contact details', async () => {
    await query(
      `INSERT INTO bookings (ref, centre_ref, hub, room, "date", start_hour, duration, starts_at, ends_at,
                             attendees, customer_ref, customer, pricing, expires_at)
            VALUES ('BK-T1', 'CTR-1', 'Hub', 'Conference Room', '2026-12-01', 14, 2, now(), now(), 4, 'CUS-T1',
                    '{"name":"Priya","mobile":"9876543210"}', '{"total_paise":1}', now())`,
    );
    expect((await row(`SELECT customer_mobile FROM bookings WHERE ref = 'BK-T1'`)).customer_mobile).toBe('9876543210');
  });

  it('refuses a date that never existed', async () => {
    await expect(query(`SELECT '2026-02-30'::ist_date`)).rejects.toMatchObject({ code: '22008' });
    await expect(query(`SELECT '1 Dec 2026'::ist_date`)).rejects.toMatchObject({ code: '23514' });
  });
});
