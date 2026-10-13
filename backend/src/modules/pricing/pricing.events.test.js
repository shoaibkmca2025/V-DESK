/**
 * Pricing — quote domain events: `quote.sent`, `quote.accepted`, `quote.expired`, each saved with the change it
 * announces (outbox, ADR-008) and only for a real move; `quote.expired` once EXPIRED is saved.
 * Run: npx vitest run src/modules/pricing/pricing.events.test.js
 */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearTestDb, startTestDb, stopTestDb } from '../../../test/db.js';
import { DomainEvent } from '../../shared/events/events.model.js';
import { Centre } from '../catalog/catalog.model.js';
import { QUOTE_VALIDITY_DAYS } from './pricing.constants.js';
import { Quote } from './pricing.model.js';
import * as service from './pricing.service.js';

const NOW = new Date('2026-10-11T03:30:00.000Z');
const DAY_MS = 24 * 60 * 60 * 1000;
const afterValidity = (ms = 1000) => new Date(NOW.getTime() + QUOTE_VALIDITY_DAYS * DAY_MS + ms);
const ITEM = { product: 'virtual_office', centreRef: 'CTR-NSK-001', tenure: 'annual', addons: {} };

let seq = 0;
const create = async (key = `q-key-${++seq}`) =>
  (await service.createQuote({ name: 'Priya Kulkarni', company: 'Zenith', item: ITEM }, key, NOW)).quote.ref;
const events = (type) => DomainEvent.find(type ? { type } : {}).lean();

beforeAll(startTestDb);
beforeEach(() =>
  Centre.create({
    ref: 'CTR-NSK-001',
    cityRef: 'CITY-NSK',
    city: 'Nashik',
    areaName: 'College Road',
    fullName: 'V-DESK Headquarters — College Road',
    address: 'College Road, Nashik',
    services: ['Virtual Office'],
    vo_price_paise: 124900,
  }),
);
afterEach(async () => {
  vi.restoreAllMocks();
  await clearTestDb();
});
afterAll(stopTestDb);

describe('quote.sent', () => {
  it('is published once per quote — a replayed Idempotency-Key adds nothing — with no personal data', async () => {
    const ref = await create('same-key');
    expect(await create('same-key')).toBe(ref);
    const [event, ...rest] = await events('quote.sent');
    expect(rest).toHaveLength(0);
    expect(event).toMatchObject({ entity: { type: 'quote', ref }, payload: { productType: 'virtual_office' } });
    expect(JSON.stringify(event.payload)).not.toMatch(/Priya|Zenith/);
  });

  it('saves no quote when the outbox write fails', async () => {
    vi.spyOn(DomainEvent, 'create').mockRejectedValueOnce(new Error('outbox down'));
    await expect(create()).rejects.toThrow('outbox down');
    expect(await Quote.countDocuments()).toBe(0);
  });
});

describe('quote.accepted', () => {
  it('is published on acceptance only — not for views, repeats or rejections', async () => {
    const ref = await create();
    await service.changeQuoteStatus(ref, 'VIEWED', 'public', NOW);
    await service.changeQuoteStatus(ref, 'ACCEPTED', 'public', NOW);
    await service.changeQuoteStatus(ref, 'ACCEPTED', 'public', NOW);
    const [event, ...rest] = await events('quote.accepted');
    expect(rest).toHaveLength(0);
    expect(event.payload).toMatchObject({ from: 'VIEWED' });

    const rejected = await create();
    await service.changeQuoteStatus(rejected, 'REJECTED', 'public', NOW);
    await expect(service.changeQuoteStatus(rejected, 'ACCEPTED', 'public', NOW)).rejects.toMatchObject({
      code: 'INVALID_STATUS_TRANSITION',
    });
    expect(await events('quote.accepted')).toHaveLength(1);
  });

  it('cannot be accepted once lapsed; the attempt saves EXPIRED and publishes quote.expired instead', async () => {
    const ref = await create();
    await expect(service.changeQuoteStatus(ref, 'ACCEPTED', 'public', afterValidity())).rejects.toMatchObject({
      code: 'QUOTE_EXPIRED',
    });
    expect(await events('quote.accepted')).toHaveLength(0);
    expect(await events('quote.expired')).toHaveLength(1);
    expect((await Quote.findOne({ ref }).lean()).status).toBe('EXPIRED');
  });

  it('leaves the quote open when the outbox write fails', async () => {
    const ref = await create();
    vi.spyOn(DomainEvent, 'create').mockRejectedValueOnce(new Error('outbox down'));
    await expect(service.changeQuoteStatus(ref, 'ACCEPTED', 'public', NOW)).rejects.toThrow('outbox down');
    expect((await Quote.findOne({ ref }).lean()).status).toBe('SENT');
  });
});

describe('quote.expired', () => {
  it('is published by the expiry job only after validUntil, once per quote, never for closed quotes', async () => {
    const open = await create();
    const viewed = await create();
    await service.changeQuoteStatus(viewed, 'VIEWED', 'public', NOW);
    const accepted = await create();
    await service.changeQuoteStatus(accepted, 'ACCEPTED', 'public', NOW);

    expect(await service.expireLapsedQuotes({ now: afterValidity(-1000) })).toEqual({ expired: 0 });
    expect(await service.expireLapsedQuotes({ now: afterValidity() })).toEqual({ expired: 2 });
    expect(await service.expireLapsedQuotes({ now: afterValidity(2000) })).toEqual({ expired: 0 });

    const expired = await events('quote.expired');
    expect(expired.map((e) => e.entity.ref).sort()).toEqual([open, viewed].sort());
    expect(expired.every((e) => e.actor.type === 'system')).toBe(true);
    expect((await Quote.findOne({ ref: accepted }).lean()).status).toBe('ACCEPTED');
  });

  it('is published once when two jobs run at the same time', async () => {
    await create();
    const at = afterValidity();
    const runs = await Promise.all([service.expireLapsedQuotes({ now: at }), service.expireLapsedQuotes({ now: at })]);
    expect(runs[0].expired + runs[1].expired).toBe(1);
    expect(await events('quote.expired')).toHaveLength(1);
  });
});
