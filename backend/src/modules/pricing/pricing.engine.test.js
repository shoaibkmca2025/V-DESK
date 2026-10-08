/**
 * Pricing engine — unit tests with hand-checked figures, plus a drift guard against the frontend's numbers.
 * Run: npx vitest run src/modules/pricing/pricing.engine.test.js
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { GST_RATE } from '../../../../frontend/src/data/constants.js';
import { CITY_PRICING_MULTIPLIERS } from '../../../../frontend/src/data/cityPricing.js';
import { MEETING_ROOMS } from '../../../../frontend/src/data/meetingRooms.js';
import { DEFAULT_PRICING_RULES as RULES } from './pricing.constants.js';
import { priceItem } from './pricing.engine.js';

const NASHIK = {
  ref: 'CTR-NSK-001',
  city: 'Nashik',
  fullName: 'V-DESK Headquarters — College Road',
  services: ['Virtual Office', 'Coworking'],
  vo_price_paise: 124900,
};
const MUMBAI = { ...NASHIK, ref: 'CTR-MUM-001', city: 'Mumbai', fullName: 'V-DESK Mumbai', vo_price_paise: 199900 };

/** Every breakdown must reconcile to the paisa (ADR-007 allocation). */
function expectReconciles(priced) {
  const discount = priced.discount?.amount_paise ?? 0;
  expect(priced.lines.reduce((sum, l) => sum + l.amount_paise, 0)).toBe(priced.subtotal_paise);
  expect(priced.taxable_paise + priced.gst.amount_paise).toBe(priced.total_paise);
  const net = priced.gst.inclusive ? priced.total_paise : priced.taxable_paise;
  expect(priced.subtotal_paise - discount).toBe(net);
  for (const value of [
    priced.subtotal_paise,
    discount,
    priced.taxable_paise,
    priced.gst.amount_paise,
    priced.total_paise,
  ]) {
    expect(Number.isSafeInteger(value)).toBe(true);
  }
}

const withRule = (key, patch) => ({ ...RULES, [key]: { ...RULES[key], ...patch } });

describe('paise-exact rounding (ADR-007)', () => {
  it('rounds only the total: an odd-paise VO price where per-line rounding would be a paisa short', () => {
    // (1 249.37 + 299) × 12 = 18 580.44 → −20 % = 14 864.352 exact → +18 % = 17 539.93536 → ₹17,539.94.
    // Rounding the discount first (₹3,716.09) and then GST (₹2,675.58) would give ₹17,539.93.
    const priced = priceItem({ product: 'virtual_office', tenure: 'annual', addons: { mail: true } }, RULES, {
      centre: { ...NASHIK, vo_price_paise: 124937 },
    });
    expect(priced).toMatchObject({
      subtotal_paise: 1858044,
      discount: { amount_paise: 371609 },
      taxable_paise: 1486435,
      gst: { amount_paise: 267559 },
      total_paise: 1753994,
    });
    expectReconciles(priced);
  });

  it('rounds only the total: an odd-paise room rate where per-line rounding would be a paisa over', () => {
    // 4 h × ₹499.01 = 1 996.04 → −10 % = 1 796.436 exact → +18 % = 2 119.79448 → ₹2,119.79 (per line: ₹2,119.80).
    const rules = withRule('meeting_room', {
      rooms: RULES.meeting_room.rooms.map((r) => (r.name === 'Huddle Room' ? { ...r, hour_paise: 49901 } : r)),
    });
    const priced = priceItem({ product: 'meeting_room', room: 'Huddle Room', hours: 4 }, rules);
    expect(priced.total_paise).toBe(211979);
    expectReconciles(priced);
  });

  it('carves GST out of a GST-inclusive total after its single rounding', () => {
    const rules = withRule('bundle', {
      items: Object.fromEntries(
        Object.entries(RULES.bundle.items).map(([key, item]) => [key, { ...item, price_paise: 100001 }]),
      ),
    });
    const priced = priceItem(
      { product: 'bundle', services: ['virtual-office', 'gst-registration', 'company-incorporation'] },
      rules,
    );
    // 3 × ₹1,000.01 = 3 000.03 − 15 % = 2 550.0255 exact → total ₹2,550.03; taxable = 255 003 / 1.18 = 216 104.24 → 216 104.
    expect(priced).toMatchObject({
      subtotal_paise: 300003,
      discount: { amount_paise: 45000 },
      total_paise: 255003,
      taxable_paise: 216104,
      gst: { amount_paise: 38899 },
    });
    expectReconciles(priced);
  });

  it('reconciles for every product across odd-paise rates and every discount tier', () => {
    const odd = { ...NASHIK, vo_price_paise: 124937 };
    for (const tenure of ['monthly', 'annual']) {
      for (let mask = 0; mask < 16; mask += 1) {
        const addons = {
          gst: !!(mask & 1),
          mail: !!(mask & 2),
          meetingCredits: !!(mask & 4),
          incorporation: !!(mask & 8),
        };
        expectReconciles(priceItem({ product: 'virtual_office', tenure, addons }, RULES, { centre: odd }));
      }
    }
    for (const hours of [1, 3, 4, 7, 8, 12]) {
      expectReconciles(priceItem({ product: 'meeting_room', room: 'Boardroom', hours }, RULES));
    }
    for (const desks of [1, 49, 50, 99, 100, 199, 200, 333]) {
      expectReconciles(priceItem({ product: 'enterprise_desks', desks, months: 7 }, RULES));
    }
    const keys = Object.keys(RULES.bundle.items);
    for (let n = 1; n <= keys.length; n += 1) {
      expectReconciles(priceItem({ product: 'bundle', services: keys.slice(0, n) }, RULES));
    }
  });
});

describe('virtual office', () => {
  it('annual: base + add-ons, 20 % off the subtotal, then 18 % GST', () => {
    const priced = priceItem(
      { product: 'virtual_office', tenure: 'annual', addons: { gst: true, mail: true } },
      RULES,
      { centre: NASHIK },
    );
    expect(priced.lines.map((l) => [l.code, l.quantity, l.amount_paise])).toEqual([
      ['vo_base', 12, 1498800],
      ['addon_gst', 12, 420000],
      ['addon_mail', 12, 358800],
    ]);
    expect(priced).toMatchObject({
      label: 'Nashik Virtual Office Platform',
      tenure: '12 Months',
      rate_month_paise: 124900,
      subtotal_paise: 2277600,
      discount: { rate_bp: 2000, amount_paise: 455520 },
      taxable_paise: 1822080,
      gst: { rate_bp: 1800, amount_paise: 327974, inclusive: false },
      total_paise: 2150054, // client shows ₹21,501 after rounding each line to the rupee
    });
  });

  it('monthly: location adjustment and one-time incorporation, no discount', () => {
    const priced = priceItem({ product: 'virtual_office', tenure: 'monthly', addons: { incorporation: true } }, RULES, {
      centre: MUMBAI,
    });
    expect(priced.lines.map((l) => l.code)).toEqual(['vo_base', 'location', 'incorporation']);
    expect(priced.lines[1].label).toBe('Location (Mumbai MMR Grade-A)');
    expect(priced).toMatchObject({ subtotal_paise: 574800, discount: null, total_paise: 678264, tenure: '1 Month' });
  });

  it('refuses a centre without a virtual office', () => {
    const coworkingOnly = { ...NASHIK, services: ['Coworking'] };
    expect(() => priceItem({ product: 'virtual_office', tenure: 'annual' }, RULES, { centre: coworkingOnly })).toThrow(
      expect.objectContaining({ code: 'PRODUCT_NOT_OFFERED' }),
    );
  });
});

describe('meeting rooms', () => {
  it.each([
    ['Conference Room', 2, null, 188564],
    ['Boardroom', 4, 1000, 509335],
    ['Training Hall', 8, 2000, 1509645],
  ])('%s for %i h → discount %s bp, total %i paise', (room, hours, discountBp, total) => {
    const priced = priceItem({ product: 'meeting_room', room, hours }, RULES);
    expect(priced.discount?.rate_bp ?? null).toBe(discountBp);
    expect(priced.total_paise).toBe(total);
  });

  it('matches room names case-insensitively and rejects unknown ones', () => {
    expect(priceItem({ product: 'meeting_room', room: 'huddle room', hours: 1 }, RULES).label).toBe(
      'Huddle Room (4 Pax)',
    );
    expect(() => priceItem({ product: 'meeting_room', room: 'Ballroom', hours: 1 }, RULES)).toThrow(
      expect.objectContaining({ code: 'UNKNOWN_ROOM' }),
    );
  });
});

describe('enterprise desks', () => {
  it('applies the bulk rebate tier for the desk count', () => {
    const priced = priceItem({ product: 'enterprise_desks', desks: 50, months: 12 }, RULES);
    expect(priced).toMatchObject({
      label: 'Enterprise Bulk (50 Desks)',
      rate_month_paise: 679915,
      subtotal_paise: 479940000,
      discount: { rate_bp: 1500, amount_paise: 71991000 },
      total_paise: 481379820,
    });
    expect(priceItem({ product: 'enterprise_desks', desks: 49, months: 12 }, RULES).discount.rate_bp).toBe(500);
    expect(priceItem({ product: 'enterprise_desks', desks: 200, months: 12 }, RULES).discount.rate_bp).toBe(3500);
  });
});

describe('bundle', () => {
  it('takes 15 % off from three services; GST is inside the price', () => {
    const priced = priceItem(
      { product: 'bundle', services: ['virtual-office', 'gst-registration', 'company-incorporation'] },
      RULES,
    );
    expect(priced).toMatchObject({
      label: 'Virtual Office + GST Registration + Company Incorporation',
      subtotal_paise: 2198600,
      discount: { rate_bp: 1500, amount_paise: 329790 },
      gst: { amount_paise: 285073, inclusive: true },
      taxable_paise: 1583737,
      total_paise: 1868810,
    });
  });

  it('gives no discount below three services, ignores repeats and rejects unknown keys', () => {
    const two = priceItem(
      { product: 'bundle', services: ['gst-registration', 'gst-registration', 'trademark-registration'] },
      RULES,
    );
    expect(two.lines).toHaveLength(2);
    expect(two.discount).toBeNull();
    expect(() => priceItem({ product: 'bundle', services: ['moon-office'] }, RULES)).toThrow(
      expect.objectContaining({ code: 'UNKNOWN_BUNDLE_ITEM' }),
    );
  });
});

// The defaults must stay equal to what the frontend charges until the frontend reads prices from the API.
describe('defaults match the frontend', () => {
  const source = (path) => readFileSync(new URL(`../../../../frontend/src/${path}`, import.meta.url), 'utf8');
  const rupees = (paise) => paise / 100;

  it('GST, city adjustments and meeting room rates (exported data)', () => {
    expect(RULES.tax.gst_bp).toBe(Math.round(GST_RATE * 10_000));
    const adjustments = Object.fromEntries(
      Object.entries(RULES.virtual_office.city_adjustments).map(([city, c]) => [
        city,
        { adj: rupees(c.adj_month_paise), label: c.label },
      ]),
    );
    expect(adjustments).toEqual(
      Object.fromEntries(
        Object.entries(CITY_PRICING_MULTIPLIERS).map(([city, c]) => [city, { adj: c.adj, label: c.label }]),
      ),
    );
    expect(RULES.meeting_room.rooms.map((r) => [r.name, r.capacity, rupees(r.hour_paise)])).toEqual(
      MEETING_ROOMS.map((r) => [r.name, r.capacity, r.priceHour]),
    );
  });

  it('virtual office add-ons and annual discount (voConfigurator.js)', () => {
    const code = source('features/virtualOffice/voConfigurator.js');
    const addons = code
      .match(/ADDON_MONTHLY = \{ gst: (\d+), mail: (\d+), meetingCredits: (\d+) \}/)
      .slice(1)
      .map(Number);
    expect(Object.values(RULES.virtual_office.addons_month_paise).map(rupees)).toEqual(addons);
    expect(rupees(RULES.virtual_office.incorporation_once_paise)).toBe(
      Number(code.match(/INCORPORATION_ONE_TIME = (\d+)/)[1]),
    );
    expect(RULES.virtual_office.annual_discount_bp / 10_000).toBe(Number(code.match(/ANNUAL_DISCOUNT = ([\d.]+)/)[1]));
  });

  it('enterprise base rate and rebate tiers (enterpriseSuite.js)', () => {
    const code = source('features/enterprise/enterpriseSuite.js');
    expect(rupees(RULES.enterprise_desks.desk_month_paise)).toBe(Number(code.match(/BASE_RATE_PER_DESK = (\d+)/)[1]));
    const tiers = [...code.matchAll(/if \(desks >= (\d+)\) return ([\d.]+);/g)].map((m) => [
      Number(m[1]),
      Number(m[2]),
    ]);
    tiers.push([1, Number(code.match(/return ([\d.]+);\r?\n\}/)[1])]);
    expect(RULES.enterprise_desks.bulk_discounts.map((t) => [t.min_desks, t.discount_bp / 10_000])).toEqual(tiers);
  });

  it('meeting room duration discounts (roomBooking.js) and wizard bundle prices (setupWizard.js)', () => {
    const booking = source('features/meetingRooms/roomBooking.js');
    const [, longHours, longMult, midHours, midMult] = booking.match(
      /duration >= (\d+) \? ([\d.]+) : duration >= (\d+) \? ([\d.]+)/,
    );
    expect(RULES.meeting_room.duration_discounts.map((t) => [t.min_hours, 1 - t.discount_bp / 10_000])).toEqual([
      [Number(longHours), Number(longMult)],
      [Number(midHours), Number(midMult)],
    ]);

    const wizard = source('features/wizard/setupWizard.js');
    const prices = [...wizard.matchAll(/services\.push\('([^']+)'\); cost \+= (\d+);/g)].map((m) => [
      m[1],
      Number(m[2]),
    ]);
    expect(Object.values(RULES.bundle.items).map((i) => [i.label, rupees(i.price_paise)])).toEqual(prices);
    expect(wizard).toMatch(
      new RegExp(
        `services\\.length >= ${RULES.bundle.discount_min_items}\\) cost = Math\\.round\\(cost \\* ${1 - RULES.bundle.discount_bp / 10_000}\\)`,
      ),
    );
  });
});
