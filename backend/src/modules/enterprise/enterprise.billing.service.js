/**
 * Enterprise — team bookings, consolidated billing, custom price books and reports (modules.md §3.13).
 *
 *  - Team bookings / billed orders: a booking or order (owned by booking / orders) is attributed to an organisation
 *    by ref. Its existence and current status are read through that module's public service — never its model — and
 *    one record belongs to at most one organisation.
 *  - Consolidated billing: a statement of the organisation's orders (current status and totals in paise) with a CSV
 *    export. It is not a GST invoice: invoices are blocked with payments (memory.md §6).
 *  - Price books: an organisation-specific replacement of pricing's `enterprise_desks` rule, versioned and
 *    append-only, priced by pricing's own engine (ADR-007 rounding) — this module never does price arithmetic.
 */
import { conflict } from '../../shared/errors/AppError.js';
import { csvRow } from '../../shared/lib/csv.js';
import { withTransaction } from '../../shared/lib/transactions.js';
import { getBooking } from '../booking/index.js';
import { getOrder } from '../orders/index.js';
import { getEffectiveRules, priceItem } from '../pricing/index.js';
import { announce, assertStaff, audit, loadOrgForActor, log, orgCan, recordAudit } from './enterprise.common.js';
import { mapLink, mapPriceBook } from './enterprise.mapper.js';
import * as repo from './enterprise.repository.js';

const orgEntity = (ref) => ({ type: 'organisation', ref });
const UNLINKABLE_BOOKING = ['CANCELLED', 'EXPIRED'];

// ──────────────────────────────────────────────
// Links
// ──────────────────────────────────────────────

class Taken extends Error {}

async function insertLink(org, data, actor, context, now) {
  try {
    return await withTransaction(async (session) => {
      const link = await repo.insertLink({ organisationRef: org.ref, linkedBy: actor.id, ...data }, { session });
      if (!link) throw new Taken();
      const entry = audit(actor, context, now, {
        action: `${data.kind}.linked`,
        entityType: data.kind,
        entityRef: data.targetRef,
        scopeRef: org.ref,
      });
      await recordAudit([entry], { session });
      const payload = { kind: data.kind, ref: data.targetRef };
      await announce('enterprise.record_linked', orgEntity(org.ref), actor, payload, now, session);
      return link;
    });
  } catch (err) {
    if (err instanceof Taken) throw conflict('ALREADY_LINKED', `That ${data.kind} already belongs to an organisation`);
    throw err;
  }
}

/**
 * A team booking: attributes a live room booking to the organisation, optionally for one member. Staff
 * (enterprise:manage) or a member allowed to book (org:book) — a plain member can only book for themselves.
 */
export async function linkBooking(ref, { bookingRef, memberCustomerId }, actor, context) {
  const { org, membership } = await loadOrgForActor(ref, actor, { staff: 'enterprise:manage', member: 'org:book' });
  const member = memberCustomerId ?? (membership ? membership.customerId : null);
  if (membership && member !== membership.customerId && !orgCan(membership.role, 'org:members')) {
    throw conflict('BOOK_FOR_SELF_ONLY', 'Members can attribute bookings to themselves only');
  }
  if (member && !(await repo.findMember(ref, member))) {
    throw conflict('NOT_A_MEMBER', 'That customer is not a member of the organisation');
  }
  const booking = await getBooking(bookingRef);
  if (UNLINKABLE_BOOKING.includes(booking.status)) {
    throw conflict('BOOKING_NOT_LINKABLE', `A ${booking.status} booking cannot be added`, { status: booking.status });
  }
  const link = await insertLink(
    org,
    { kind: 'booking', targetRef: booking.ref, memberCustomerId: member },
    actor,
    context,
    new Date(),
  );
  log.info({ event: 'enterprise.booking_linked', organisationRef: ref, bookingRef: booking.ref }, 'booking linked');
  return mapLink(link);
}

/** Consolidated billing: attributes an order to the organisation (staff only — billing is a staff decision). */
export async function linkOrder(ref, { orderRef }, actor, context) {
  const { org } = await loadOrgForActor(ref, actor, { staff: 'enterprise:manage' });
  const order = await getOrder(orderRef);
  const link = await insertLink(org, { kind: 'order', targetRef: order.ref }, actor, context, new Date());
  log.info({ event: 'enterprise.order_linked', organisationRef: ref, orderRef: order.ref }, 'order linked');
  return mapLink(link);
}

/** The organisation's team bookings with their current state (from booking). */
export async function listTeamBookings(ref, actor) {
  await loadOrgForActor(ref, actor, { staff: 'enterprise:read', member: 'org:read' });
  const links = await repo.findLinks(ref, 'booking');
  return Promise.all(
    links.map(async (link) => {
      const booking = await getBooking(link.targetRef);
      return {
        ...mapLink(link),
        status: booking.status,
        hub: booking.hub,
        room: booking.room,
        date: booking.date,
        slot: booking.slot,
        attendees: booking.attendees,
        total_paise: booking.pricing?.total_paise ?? null,
      };
    }),
  );
}

// ──────────────────────────────────────────────
// Consolidated billing
// ──────────────────────────────────────────────

const inRange = (date, from, to) => (!from || date >= from) && (!to || date < to);

/** The organisation's orders created in [from, to), with current status, and totals in paise. */
async function statementLines(ref, { from, to }) {
  const links = await repo.findLinks(ref, 'order');
  const orders = await Promise.all(links.map((link) => getOrder(link.targetRef)));
  return orders
    .filter((order) => inRange(new Date(order.createdAt), from, to))
    .map((order) => ({
      orderRef: order.ref,
      description: order.description,
      status: order.status,
      currency: order.currency,
      total_paise: order.total_paise,
      createdAt: order.createdAt,
    }));
}

function totalsOf(lines) {
  const sum = (status) => lines.filter((l) => !status || l.status === status).reduce((t, l) => t + l.total_paise, 0);
  return {
    orders: lines.length,
    billed_paise: sum(null) - sum('CANCELLED') - sum('EXPIRED'),
    paid_paise: sum('PAID'),
    outstanding_paise: sum('PENDING_PAYMENT'),
    currency: 'INR',
  };
}

/** Staff (enterprise:read) or members with org:billing. */
export async function billingStatement(ref, period, actor) {
  const { org } = await loadOrgForActor(ref, actor, { staff: 'enterprise:read', member: 'org:billing' });
  const lines = await statementLines(ref, period);
  return { organisationRef: org.ref, name: org.name, gstin: org.gstin, period, lines, totals: totalsOf(lines) };
}

/** The statement as CSV (staff only; formula-safe cells, shared/lib/csv.js). */
export async function billingStatementCsv(ref, period, actor) {
  assertStaff(actor, 'enterprise:read');
  const { lines } = await billingStatement(ref, period, actor);
  const header = csvRow(['orderRef', 'createdAt', 'description', 'status', 'currency', 'total_paise']);
  return (
    '﻿' +
    header +
    lines.map((l) => csvRow([l.orderRef, l.createdAt, l.description, l.status, l.currency, l.total_paise])).join('')
  );
}

// ──────────────────────────────────────────────
// Price books
// ──────────────────────────────────────────────

/**
 * Finance sets the organisation's price book: a new version replacing pricing's `enterprise_desks` rule. Versions
 * are append-only; a stale `expectedVersion` (someone saved meanwhile) is 409 PRICE_BOOK_CHANGED.
 */
export async function setPriceBook(ref, { enterprise_desks, note, expectedVersion }, actor, context) {
  const { org } = await loadOrgForActor(ref, actor, { staff: 'enterprise:pricing' });
  const current = org.priceBookVersion;
  const changed = () =>
    conflict('PRICE_BOOK_CHANGED', 'The price book changed since you loaded it. Reload and try again.', {
      version: current,
    });
  if ((expectedVersion ?? null) !== current) throw changed();
  const version = (current ?? 0) + 1;
  const now = new Date();
  const book = await withTransaction(async (session) => {
    const doc = await repo.insertPriceBook(
      { organisationRef: ref, version, enterprise_desks, note: note ?? '', createdBy: actor.id },
      { session },
    );
    if (!doc || !(await repo.setPriceBookVersion(ref, current, version, { session }))) throw changed();
    const entry = audit(actor, context, now, {
      action: 'price_book.published',
      entityType: 'price_book',
      entityRef: `${ref}:v${version}`,
      scopeRef: ref,
      before: current === null ? null : `v${current}`,
      after: `v${version}`,
    });
    await recordAudit([entry], { session });
    await announce('enterprise.price_book_updated', orgEntity(ref), actor, { version }, now, session);
    return doc;
  });
  log.info({ event: 'enterprise.price_book_updated', organisationRef: ref, version }, 'price book updated');
  return mapPriceBook(book);
}

export async function listPriceBooks(ref, actor) {
  await loadOrgForActor(ref, actor, { staff: 'enterprise:read' });
  return (await repo.findPriceBooks(ref)).map(mapPriceBook);
}

/**
 * Prices desks for the organisation with pricing's engine and its active price book (standard rules if none).
 * Staff (enterprise:read) or members with org:billing.
 */
export async function previewPrice(ref, { desks, months }, actor) {
  const { org } = await loadOrgForActor(ref, actor, { staff: 'enterprise:read', member: 'org:billing' });
  const rules = await getEffectiveRules();
  const book = org.priceBookVersion ? await repo.findPriceBook(ref, org.priceBookVersion) : null;
  const effective = book ? { ...rules, enterprise_desks: book.enterprise_desks } : rules;
  const priced = priceItem({ product: 'enterprise_desks', desks, months }, effective);
  return { organisationRef: ref, priceBookVersion: book?.version ?? null, ...priced };
}

// ──────────────────────────────────────────────
// Reports
// ──────────────────────────────────────────────

const countBy = (items, key) => items.reduce((acc, item) => ({ ...acc, [item[key]]: (acc[item[key]] ?? 0) + 1 }), {});

/** One-page organisation report: members by role, team bookings by status, billing totals, price book version. */
export async function organisationReport(ref, actor) {
  const { org } = await loadOrgForActor(ref, actor, { staff: 'enterprise:read', member: 'org:billing' });
  const [members, bookings, lines] = await Promise.all([
    repo.findMembers(ref),
    listTeamBookings(ref, actor),
    statementLines(ref, {}),
  ]);
  return {
    organisationRef: org.ref,
    name: org.name,
    members: { total: members.length, byRole: countBy(members, 'role') },
    teamBookings: { total: bookings.length, byStatus: countBy(bookings, 'status') },
    billing: { ...totalsOf(lines), byStatus: countBy(lines, 'status') },
    priceBookVersion: org.priceBookVersion,
    generatedAt: new Date(),
  };
}
