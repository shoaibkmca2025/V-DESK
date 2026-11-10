import { describe, expect, it } from 'vitest';
import { rowsFor } from '@/components/cards/CentreAddressCard.jsx';
import { LOCATIONS } from '@/data/locations.js';

/*
 * The rows are driven by the exact service strings in data/locations.js. Rename one there — "Coworking" to
 * "Co-Working", say — and every card would quietly fall back to N/A with nothing failing. These tests fail
 * instead. They also pin the units: the card shows the rate as held, never a total, because the real total
 * adds a city adjustment and GST on the server (backend/src/modules/pricing/pricing.engine.js).
 */

const label = (rows, name) => rows.find(([, l]) => l === name);

describe('centre address card rows', () => {
  it('prices every row a centre offers, in the unit the data holds', () => {
    const centre = {
      services: ['Company Registration', 'GST Registration', 'Virtual Office', 'Coworking'],
      vo_price: 1249,
      cw_price: 399,
    };
    const rows = rowsFor(centre);

    expect(rows).toHaveLength(4);
    expect(rows.every(([, , price]) => price !== null)).toBe(true);
    // The monthly rate as held — not multiplied out to a year.
    expect(label(rows, 'Mailing Address').slice(2)).toEqual(['₹1,249', '/mo']);
    expect(label(rows, 'Virtual Desk Plan').slice(2)).toEqual(['₹399', '/day']);
  });

  it('shows N/A for what a centre does not offer', () => {
    const rows = rowsFor({ services: ['Virtual Office'], vo_price: 2499, cw_price: 899 });

    expect(label(rows, 'Mailing Address')[2]).toBe('₹2,499');
    expect(label(rows, 'Business Registration')[2]).toBeNull();
    expect(label(rows, 'GST Registration')[2]).toBeNull();
    expect(label(rows, 'Virtual Desk Plan')[2]).toBeNull();
  });

  it('matches the service names real centres actually use', () => {
    // At least one real centre has to light up each row, or a rename has gone unnoticed.
    for (const name of ['Business Registration', 'GST Registration', 'Mailing Address', 'Virtual Desk Plan']) {
      expect(LOCATIONS.some((centre) => label(rowsFor(centre), name)[2] !== null)).toBe(true);
    }
  });
});
