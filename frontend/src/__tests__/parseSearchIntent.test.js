import { describe, expect, it } from 'vitest';
import { parseSearchIntent } from '@/features/search/parseSearchIntent.js';

describe('parseSearchIntent (PRD §10)', () => {
  it('detects virtual office + city', () => {
    expect(parseSearchIntent('Virtual office in Mumbai')).toMatchObject({ intent: 'Virtual Office', location: 'Mumbai' });
  });
  it('detects private office with capacity', () => {
    expect(parseSearchIntent('Office for 8 people in Gurgaon')).toMatchObject({ intent: 'Private Office', location: 'Gurgaon', capacity: 8 });
  });
  it('detects meeting rooms with capacity', () => {
    expect(parseSearchIntent('Meeting room for 10 people')).toMatchObject({ intent: 'Meeting Room', capacity: 10 });
  });
  it('detects business services', () => {
    expect(parseSearchIntent('GST registration')).toMatchObject({ intent: 'Business Service', service: 'GST Registration' });
  });
  it('detects localities', () => {
    expect(parseSearchIntent('bkc mumbai').locality).toBe('Bandra Kurla Complex (BKC)');
  });
  it('returns null for empty input', () => {
    expect(parseSearchIntent('   ')).toBeNull();
  });
});
