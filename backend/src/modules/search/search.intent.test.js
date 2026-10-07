/**
 * Search module — unit tests for the pure rules ported from the client (search.intent.js) and the service's
 * pure helpers. Cases mirror frontend/src/__tests__/parseSearchIntent.test.js plus the client's edge behaviour.
 * Run: npx vitest run src/modules/search/search.intent.test.js
 */
import { describe, expect, it } from 'vitest';
import { SERVICES } from '../../../../frontend/src/data/services.js';
import { POPULAR_SEARCHES_SEED, toServiceDocument } from '../../../scripts/seed-search.js';
import {
  buildInventory,
  capacityBucket,
  filterItems,
  filtersFromIntent,
  matchesCapacity,
  matchServices,
  normalizeQuery,
  parseSearchIntent,
  routeForIntent,
  sortItems,
} from './search.intent.js';
import { applySynonyms, generateRedirectRef, relaxFilters, zeroResultSuggestions } from './search.service.js';
import { REDIRECT_REF_PATTERN } from './search.constants.js';

const ALL = { city: 'all', type: 'all', capacity: 'all', maxPrice: undefined, sort: 'recommended' };
const route = (q) => routeForIntent(parseSearchIntent(q));
const serviceNames = (q) => matchServices(q, SERVICES).map((s) => s.slug);

const item = (overrides) => ({
  ref: 'X',
  name: 'X',
  type: 'Virtual Office',
  city: 'Mumbai',
  locality: '',
  address: '',
  capacity: 10,
  price_month_paise: 100000,
  status: 'available',
  rating: null,
  reviews: null,
  ...overrides,
});

describe('parseSearchIntent (same cases as the client test)', () => {
  it('detects virtual office + city', () => {
    expect(parseSearchIntent('Virtual office in Mumbai')).toMatchObject({
      intent: 'Virtual Office',
      location: 'Mumbai',
    });
  });
  it('detects private office with capacity', () => {
    expect(parseSearchIntent('Office for 8 people in Gurgaon')).toMatchObject({
      intent: 'Private Office',
      location: 'Gurgaon',
      capacity: 8,
    });
  });
  it('detects meeting rooms with capacity', () => {
    expect(parseSearchIntent('Meeting room for 10 people')).toMatchObject({ intent: 'Meeting Room', capacity: 10 });
  });
  it('detects business services', () => {
    expect(parseSearchIntent('GST registration')).toMatchObject({
      intent: 'Business Service',
      service: 'GST Registration',
    });
  });
  it('detects localities', () => {
    expect(parseSearchIntent('bkc mumbai').locality).toBe('Bandra Kurla Complex (BKC)');
  });
  it('returns null for empty input', () => {
    expect(parseSearchIntent('   ')).toBeNull();
    expect(parseSearchIntent(undefined)).toBeNull();
  });
});

describe('parseSearchIntent (client edge behaviour)', () => {
  it('builds the same summary string', () => {
    expect(parseSearchIntent('office for 8 people in bkc mumbai').summary).toBe(
      'Private Office • Mumbai (Bandra Kurla Complex (BKC)) • 8 Pax',
    );
    expect(parseSearchIntent('gst').summary).toBe('Business Service • GST Registration');
  });

  it('only counts a number as capacity next to a people word, up to 200', () => {
    expect(parseSearchIntent('room for 4').capacity).toBe(4);
    expect(parseSearchIntent('coworking 2026').capacity).toBeNull();
    expect(parseSearchIntent('500 seats').capacity).toBeNull();
  });

  it('treats 4+ people as a private office unless a stronger intent matches first', () => {
    expect(parseSearchIntent('space for 6 people').intent).toBe('Private Office');
    expect(parseSearchIntent('space for 3 people').intent).toBe('General Discovery');
    expect(parseSearchIntent('boardroom for 6 people').intent).toBe('Meeting Room');
  });

  it('classifies coworking, company registration and city-only queries', () => {
    expect(parseSearchIntent('hot desk').intent).toBe('Coworking');
    expect(parseSearchIntent('llp registration')).toMatchObject({ service: 'Company Registration' });
    expect(parseSearchIntent('apob address').intent).toBe('Virtual Office');
    expect(parseSearchIntent('pune').intent).toBe('Location Hub Explorer');
    expect(parseSearchIntent('something else').intent).toBe('General Discovery');
  });

  it('keeps the client quirk that "cp" matches inside other words', () => {
    expect(parseSearchIntent('cpu').locality).toBe('Connaught Place');
  });
});

describe('routeForIntent', () => {
  it('routes city + product to the landing page', () => {
    expect(route('virtual office mumbai')).toBe('/locations/mumbai/virtual-office');
    expect(route('meeting room in nashik')).toBe('/locations/nashik/meeting-rooms');
    expect(route('office for 8 people in gurgaon')).toBe('/locations/gurgaon/private-office');
  });
  it('routes services and city hubs; nothing for vague queries', () => {
    expect(route('GST registration')).toBe('/services/gst-registration');
    expect(route('pvt ltd')).toBe('/services/company-registration');
    expect(route('pune')).toBe('/locations/pune');
    expect(route('coworking')).toBeNull();
    expect(routeForIntent(null)).toBeNull();
  });
});

describe('filters', () => {
  it('buckets capacity like the client', () => {
    expect([1, 2, 5, 6, 10, 11, 25, 26].map(capacityBucket)).toEqual([
      '1',
      '2-5',
      '2-5',
      '6-10',
      '6-10',
      '11-25',
      '11-25',
      '25+',
    ]);
    expect(matchesCapacity('25+', 25)).toBe(true);
    expect(matchesCapacity('11-25', 25)).toBe(true);
    expect(matchesCapacity('all', 999)).toBe(true);
  });

  it('derives filters from the intent, overriding city and type', () => {
    const base = { ...ALL, city: 'Pune', type: 'Coworking' };
    expect(filtersFromIntent(parseSearchIntent('meeting room for 10 people'), base)).toMatchObject({
      city: 'all',
      type: 'Meeting Rooms',
      capacity: '6-10',
    });
    expect(filtersFromIntent(null, base)).toEqual(base);
  });

  it('filters city/type case-insensitively and caps price in rupees against paise', () => {
    const items = [
      item({ ref: 'A', price_month_paise: 150000 }),
      item({ ref: 'B', city: 'Pune', price_month_paise: 99900 }),
    ];
    expect(filterItems(items, { ...ALL, city: 'mumbai' }).map((i) => i.ref)).toEqual(['A']);
    expect(filterItems(items, { ...ALL, type: 'virtual office' })).toHaveLength(2);
    expect(filterItems(items, { ...ALL, maxPrice: 1500 }).map((i) => i.ref)).toEqual(['A', 'B']);
    expect(filterItems(items, { ...ALL, maxPrice: 1499 }).map((i) => i.ref)).toEqual(['B']);
  });

  it('excludes items without a price only when a price cap is set', () => {
    const items = [item({ price_month_paise: null })];
    expect(filterItems(items, ALL)).toHaveLength(1);
    expect(filterItems(items, { ...ALL, maxPrice: 50000 })).toHaveLength(0);
  });
});

describe('inventory and ranking', () => {
  const centres = [
    {
      ref: 'CTR-A',
      fullName: 'A Centre',
      city: 'Mumbai',
      areaName: 'BKC',
      address: 'Addr A',
      vo_price_paise: 249900,
      status: 'limited',
    },
  ];
  const workspaces = [
    {
      ref: 'WS-1',
      centreRef: 'CTR-A',
      name: 'Suite',
      type: 'Private Office',
      city: 'Mumbai',
      locality: 'BKC',
      capacity: 8,
      price_month_paise: 4800000,
      status: 'available',
      rating: 4.9,
      reviews: 142,
    },
    {
      ref: 'WS-2',
      centreRef: 'CTR-GONE',
      name: 'Desk',
      type: 'Coworking',
      city: 'Mumbai',
      locality: 'X',
      capacity: 1,
      price_month_paise: 799900,
      status: 'available',
      rating: 4.8,
      reviews: 98,
    },
  ];

  it('flattens centres as virtual offices with capacity 10 and no invented reviews', () => {
    const [centre, suite, desk] = buildInventory(centres, workspaces);
    expect(centre).toEqual({
      ref: 'CTR-A',
      name: 'A Centre',
      type: 'Virtual Office',
      city: 'Mumbai',
      locality: 'BKC',
      address: 'Addr A',
      capacity: 10,
      price_month_paise: 249900,
      status: 'limited',
      rating: null,
      reviews: null,
    });
    expect(suite).toMatchObject({ address: 'Addr A', rating: 4.9, reviews: 142, price_month_paise: 4800000 });
    expect(desk.address).toBe('');
  });

  it('lifts promoted centres to the top for recommended, in admin order', () => {
    const items = [
      item({ ref: 'C1' }),
      item({ ref: 'C2' }),
      item({ ref: 'C3' }),
      item({ ref: 'W1', type: 'Coworking' }),
    ];
    expect(sortItems(items, 'recommended', ['C3', 'C2']).map((i) => i.ref)).toEqual(['C3', 'C2', 'C1', 'W1']);
    expect(sortItems(items, 'recommended', ['W1']).map((i) => i.ref)).toEqual(['C1', 'C2', 'C3', 'W1']);
    expect(sortItems(items, 'recommended').map((i) => i.ref)).toEqual(['C1', 'C2', 'C3', 'W1']);
  });

  it('ignores promotion for explicit sorts', () => {
    const items = [
      item({ ref: 'A', price_month_paise: 3, capacity: 1 }),
      item({ ref: 'B', price_month_paise: 1, capacity: 5 }),
    ];
    expect(sortItems(items, 'price-asc', ['A']).map((i) => i.ref)).toEqual(['B', 'A']);
    expect(sortItems(items, 'price-desc').map((i) => i.ref)).toEqual(['A', 'B']);
    expect(sortItems(items, 'capacity', ['A']).map((i) => i.ref)).toEqual(['B', 'A']);
  });
});

describe('matchServices (client rules over the seeded services)', () => {
  it('matches by name, slug and suitability keywords', () => {
    expect(serviceNames('GST registration')).toContain('gst-registration');
    expect(serviceNames('virtual office')).toContain('virtual-office');
    // "MCA Company Incorporation" is a virtual-office suitability line, so the client matches both.
    expect(serviceNames('company')).toEqual(['virtual-office', 'company-registration']);
    expect(serviceNames('marketplace sellers')).toEqual(['gst-registration']);
    expect(serviceNames('   ')).toEqual([]);
    expect(serviceNames('xyz')).toEqual([]);
  });
});

describe('service helpers', () => {
  it('normalises queries', () => {
    expect(normalizeQuery('  GST   Registration ')).toBe('gst registration');
    expect(normalizeQuery(undefined)).toBe('');
  });

  it('applies synonyms on whole words, longest term first', () => {
    const synonyms = [
      { term: 'blr', replacement: 'bangalore' },
      { term: 'new delhi', replacement: 'delhi' },
      { term: 'new', replacement: 'NEWER' },
    ];
    expect(applySynonyms('office in blr', synonyms)).toBe('office in bangalore');
    expect(applySynonyms('blrx office', synonyms)).toBe('blrx office');
    expect(applySynonyms('cp new delhi', synonyms)).toBe('cp delhi');
    expect(applySynonyms('new office', synonyms)).toBe('newer office');
    expect(applySynonyms('anything', [])).toBe('anything');
  });

  it('relaxes capacity, then type, then city until something matches', () => {
    const items = [
      item({ ref: 'P', city: 'Pune', type: 'Virtual Office' }),
      item({ ref: 'M', type: 'Meeting Rooms', capacity: 12 }),
    ];
    const meetingInPune = { ...ALL, city: 'Pune', type: 'Meeting Rooms', capacity: '6-10' };
    expect(relaxFilters(items, meetingInPune, [])).toEqual({ relaxed: ['capacity', 'type'], results: [items[0]] });
    expect(relaxFilters(items, { ...ALL, city: 'Delhi' }, [])).toEqual({ relaxed: ['city'], results: items });
    expect(relaxFilters(items, { ...ALL, maxPrice: 1 }, [])).toEqual({ relaxed: [], results: [] });
  });

  it('suggests other cities for the same product, plus services when none matched', () => {
    const cities = ['Bangalore', 'Chennai', 'Delhi', 'Gurgaon', 'Hyderabad', 'Mumbai', 'Nashik'].map((name) => ({
      name,
    }));
    const parsed = parseSearchIntent('meeting room in delhi');
    const chips = zeroResultSuggestions(cities, parsed, { ...ALL, type: 'Meeting Rooms' }, 0);
    expect(chips.filter((c) => c.type === 'city').map((c) => c.query)).toEqual([
      'Meeting Rooms in Bangalore',
      'Meeting Rooms in Chennai',
      'Meeting Rooms in Gurgaon',
      'Meeting Rooms in Hyderabad',
      'Meeting Rooms in Mumbai',
    ]);
    expect(chips.filter((c) => c.type === 'service').map((c) => c.query)).toEqual([
      'GST Registration',
      'Company Registration',
    ]);
    expect(zeroResultSuggestions(cities, null, ALL, 1).every((c) => c.query.startsWith('Virtual Office in'))).toBe(
      true,
    );
  });

  it('generates unique redirect refs in the documented format', () => {
    const refs = new Set(Array.from({ length: 50 }, generateRedirectRef));
    expect(refs.size).toBe(50);
    for (const ref of refs) expect(ref).toMatch(REDIRECT_REF_PATTERN);
  });
});

describe('seed conversion', () => {
  it('keeps every client service field and stores the price in paise', () => {
    for (const service of SERVICES) {
      const { startingPrice, ...rest } = service;
      const doc = toServiceDocument(service);
      expect(doc).toEqual({
        ...rest,
        ref: `SVC-${service.slug.toUpperCase()}`,
        starting_price_paise: startingPrice * 100,
      });
    }
  });

  it('seeds the popular chips shown on the client /search page', () => {
    expect(POPULAR_SEARCHES_SEED).toEqual([
      'Virtual Office in Mumbai',
      'Coworking in Nashik',
      'Private Office in Gurgaon',
      'Meeting room for 10 people',
      'GST registration',
    ]);
  });
});
