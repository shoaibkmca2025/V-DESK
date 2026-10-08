/**
 * Pricing engine — pure functions from (product input, rules, catalog data) to a priced breakdown.
 * No database, no request: the service loads rules and the centre, then calls `priceItem`.
 *
 * PRD §55: base + location adjustment + add-ons − discount + GST 18 %. All amounts integer paise, rates basis
 * points. Paise-exact (ADR-007, docs/backend/memory.md): the discount and GST are kept exact (shared/lib/money.js)
 * and the only rounding is the final total; the discount / taxable / GST lines are then allocated from that total
 * so they always add up to it. The client rounds discount and GST to whole rupees per step, so its figures can
 * differ from these by under ₹1.
 */
import { badRequest, conflict } from '../../shared/errors/AppError.js';
import { exactBps, roundToPaise, toExact } from '../../shared/lib/money.js';
import { BASIS_POINTS } from './pricing.constants.js';

const line = (code, label, quantity, unitPaise) => ({
  code,
  label,
  quantity,
  unit_paise: unitPaise,
  amount_paise: unitPaise * quantity,
});

/**
 * The taxable value inside a GST-inclusive total, rounded half-up: total × 10 000 / (10 000 + rate). It is an
 * allocation of the already-rounded total, not a step towards it.
 */
function taxableWithin(totalPaise, gstBp) {
  return roundToPaise((toExact(totalPaise) * BigInt(BASIS_POINTS)) / BigInt(BASIS_POINTS + gstBp));
}

/**
 * Shared tail: subtotal → discount → GST on top (or, for tax-inclusive prices, GST carved out of the total).
 * Exact until the total, which is rounded once (ADR-007). Lines are then allocated from it: discount =
 * subtotal − rounded net, and GST = total − taxable, so subtotal − discount + GST (or taxable + GST) = total exactly.
 */
function summarise({ lines, discountBp = 0, discountLabel = null, gstBp, taxInclusive = false }) {
  const subtotal = lines.reduce((sum, l) => sum + l.amount_paise, 0);
  const exactNet = toExact(subtotal) - exactBps(toExact(subtotal), discountBp);
  const total = roundToPaise(taxInclusive ? exactNet : exactNet + exactBps(exactNet, gstBp));

  const net = taxInclusive ? total : roundToPaise(exactNet);
  const discount = subtotal - net;
  const taxable = taxInclusive ? taxableWithin(total, gstBp) : net;
  const gst = total - taxable;
  return {
    currency: 'INR',
    lines,
    subtotal_paise: subtotal,
    discount: discount > 0 ? { label: discountLabel, rate_bp: discountBp, amount_paise: discount } : null,
    taxable_paise: taxable,
    gst: { rate_bp: gstBp, amount_paise: gst, inclusive: taxInclusive },
    total_paise: total,
  };
}

/** First tier whose threshold `value` reaches, from tiers sorted by threshold, highest first. */
function tierFor(tiers, field, value) {
  return [...tiers].sort((a, b) => b[field] - a[field]).find((tier) => value >= tier[field]) ?? null;
}

// ──────────────────────────────────────────────
// Products
// ──────────────────────────────────────────────

/** Virtual office at a catalog centre. The annual discount covers the whole subtotal, as the client's does. */
export function priceVirtualOffice({ centre, tenure, addons = {} }, rules, gstBp) {
  if (!centre.vo_price_paise || !(centre.services ?? []).includes('Virtual Office')) {
    throw conflict('PRODUCT_NOT_OFFERED', `Centre ${centre.ref} does not offer a virtual office`);
  }
  const months = tenure === 'annual' ? 12 : 1;
  const city = rules.city_adjustments[centre.city];
  const lines = [line('vo_base', `${centre.fullName} — virtual office`, months, centre.vo_price_paise)];
  if (city?.adj_month_paise > 0) lines.push(line('location', `Location (${city.label})`, months, city.adj_month_paise));

  const addonLabels = { gst: 'GST compliance support', mail: 'Mail forwarding', meetingCredits: 'Meeting credits' };
  for (const [key, label] of Object.entries(addonLabels)) {
    if (addons[key]) lines.push(line(`addon_${key}`, label, months, rules.addons_month_paise[key]));
  }
  if (addons.incorporation)
    lines.push(line('incorporation', 'Company incorporation (one-time)', 1, rules.incorporation_once_paise));

  return {
    product: 'virtual_office',
    label: `${centre.city} Virtual Office Platform`,
    tenure: months === 12 ? '12 Months' : '1 Month',
    rate_month_paise: centre.vo_price_paise,
    ...summarise({
      lines,
      discountBp: months === 12 ? rules.annual_discount_bp : 0,
      discountLabel: 'Annual commitment discount',
      gstBp,
    }),
  };
}

export function priceMeetingRoom({ room: roomName, hours }, rules, gstBp) {
  const room = rules.rooms.find((r) => r.name.toLowerCase() === roomName.toLowerCase());
  if (!room) {
    throw badRequest('UNKNOWN_ROOM', `No meeting room format '${roomName}'`, {
      rooms: rules.rooms.map((r) => r.name),
    });
  }
  const tier = tierFor(rules.duration_discounts, 'min_hours', hours);
  return {
    product: 'meeting_room',
    label: `${room.name} (${room.capacity})`,
    tenure: `${hours} Hour${hours === 1 ? '' : 's'}`,
    rate_month_paise: null,
    ...summarise({
      lines: [line('room_hours', `${room.name} — per hour`, hours, room.hour_paise)],
      discountBp: tier?.discount_bp ?? 0,
      discountLabel: `Duration discount (${tier?.min_hours}+ hours)`,
      gstBp,
    }),
  };
}

export function priceEnterpriseDesks({ desks, months }, rules, gstBp) {
  const tier = tierFor(rules.bulk_discounts, 'min_desks', desks);
  const deskMonths = desks * months;
  const priced = summarise({
    lines: [
      line(
        'desk_months',
        `Dedicated desk — per desk per month (${desks} × ${months})`,
        deskMonths,
        rules.desk_month_paise,
      ),
    ],
    discountBp: tier?.discount_bp ?? 0,
    discountLabel: 'Bulk desk rebate',
    gstBp,
  });
  return {
    product: 'enterprise_desks',
    label: `Enterprise Bulk (${desks} Desks)`,
    tenure: `${months} Month${months === 1 ? '' : 's'}`,
    // What one desk costs per month after the rebate, for the "/ seat / mo" figure.
    // A figure of its own (not part of the total), so it gets its own single rounding.
    rate_month_paise: roundToPaise(
      toExact(rules.desk_month_paise) - exactBps(toExact(rules.desk_month_paise), tier?.discount_bp ?? 0),
    ),
    ...priced,
  };
}

/** Wizard bundle: the client shows these as "(All-Inclusive)", so GST is inside the price, not added. */
export function priceBundle({ services }, rules, gstBp) {
  const unknown = services.filter((key) => !rules.items[key]);
  if (unknown.length > 0) {
    throw badRequest('UNKNOWN_BUNDLE_ITEM', `Unknown bundle services: ${unknown.join(', ')}`, {
      services: Object.keys(rules.items),
    });
  }
  const unique = [...new Set(services)];
  const lines = unique.map((key) => line(key, rules.items[key].label, 1, rules.items[key].price_paise));
  const discounted = unique.length >= rules.discount_min_items;
  return {
    product: 'bundle',
    label: lines.map((l) => l.label).join(' + '),
    tenure: 'One-time',
    rate_month_paise: null,
    ...summarise({
      lines,
      discountBp: discounted ? rules.discount_bp : 0,
      discountLabel: `Bundle discount (${rules.discount_min_items}+ services)`,
      gstBp,
      taxInclusive: true,
    }),
  };
}

/**
 * Prices one validated item. `rules` is the effective rule set (defaults + overrides); `centre` is the
 * catalog centre for a virtual office.
 */
export function priceItem(item, rules, { centre } = {}) {
  const gstBp = rules.tax.gst_bp;
  switch (item.product) {
    case 'virtual_office':
      return priceVirtualOffice({ ...item, centre }, rules.virtual_office, gstBp);
    case 'meeting_room':
      return priceMeetingRoom(item, rules.meeting_room, gstBp);
    case 'enterprise_desks':
      return priceEnterpriseDesks(item, rules.enterprise_desks, gstBp);
    case 'bundle':
      return priceBundle(item, rules.bundle, gstBp);
    default:
      throw badRequest('UNKNOWN_PRODUCT', `Unknown product '${item.product}'`);
  }
}
