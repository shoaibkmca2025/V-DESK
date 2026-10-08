/**
 * Pricing engine — pure functions from (product input, rules, catalog data) to a priced breakdown.
 * No database, no request: the service loads rules and the centre, then calls `priceItem`.
 *
 * PRD §55: base + location adjustment + add-ons − discount + GST 18 %. All amounts integer paise;
 * a percentage of an amount is rounded half-up to the paisa, and only on the line it produces.
 * The client rounds discount and GST to whole rupees, so its figures can differ from these by under ₹1.
 */
import { badRequest, conflict } from '../../shared/errors/AppError.js';
import { BASIS_POINTS } from './pricing.constants.js';

/** `bp` basis points of `amount` paise, rounded half-up to the paisa. */
export function percentOf(amount, bp) {
  return Math.round((amount * bp) / BASIS_POINTS);
}

const line = (code, label, quantity, unitPaise) => ({
  code,
  label,
  quantity,
  unit_paise: unitPaise,
  amount_paise: unitPaise * quantity,
});

/** Shared tail: subtotal → discount → GST on top (or, for tax-inclusive prices, GST carved out of the total). */
function summarise({ lines, discountBp = 0, discountLabel = null, gstBp, taxInclusive = false }) {
  const subtotal = lines.reduce((sum, l) => sum + l.amount_paise, 0);
  const discount = percentOf(subtotal, discountBp);
  const net = subtotal - discount;
  const gst = taxInclusive ? net - Math.round((net * BASIS_POINTS) / (BASIS_POINTS + gstBp)) : percentOf(net, gstBp);
  return {
    currency: 'INR',
    lines,
    subtotal_paise: subtotal,
    discount: discount > 0 ? { label: discountLabel, rate_bp: discountBp, amount_paise: discount } : null,
    taxable_paise: taxInclusive ? net - gst : net,
    gst: { rate_bp: gstBp, amount_paise: gst, inclusive: taxInclusive },
    total_paise: taxInclusive ? net : net + gst,
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
    rate_month_paise: rules.desk_month_paise - percentOf(rules.desk_month_paise, tier?.discount_bp ?? 0),
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
