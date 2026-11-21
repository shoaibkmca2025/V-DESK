import { describe, expect, it } from 'vitest';
import { COVERAGE, COVERAGE_CITIES, COVERAGE_CLAIM, COVERAGE_LOCATIONS, COVERAGE_STATES } from '@/data/coverage.js';

/*
 * `COVERAGE_CLAIM` is printed on the homepage, the footer, the top bar and the nav. It is an advertising
 * claim, so the number has to be one the list can back. If someone raises it without adding locations —
 * or trims the list below it — this fails rather than putting an untrue figure in front of customers.
 */
describe('coverage claim', () => {
  it('is backed by the list', () => {
    const claimed = Number(COVERAGE_CLAIM.replace('+', ''));

    expect(Number.isFinite(claimed)).toBe(true);
    expect(COVERAGE_LOCATIONS).toBeGreaterThanOrEqual(claimed);
  });

  it('counts locations, not cities — there are far fewer cities than locations', () => {
    // The distinction the claim rests on: 143 addresses, but only 49 cities.
    expect(COVERAGE_CITIES).toBeLessThan(COVERAGE_LOCATIONS);
    expect(COVERAGE_CITIES).toBeLessThan(Number(COVERAGE_CLAIM.replace('+', '')));
  });

  it('has a state, a city and no empty rows', () => {
    expect(COVERAGE_STATES).toBe(COVERAGE.length);
    for (const [state, entries] of COVERAGE) {
      expect(state.trim()).not.toBe('');
      expect(entries.length).toBeGreaterThan(0);
      for (const [city] of entries) expect(city.trim()).not.toBe('');
    }
  });
});
