/**
 * Pricing service — effective pricing rules, quote previews, and quotes.
 *
 * Rules (docs/backend/rules.md):
 *  - Prices are computed here from catalog data and pricing rules; the client never sends a price.
 *  - Effective rules = DEFAULT_PRICING_RULES with staff overrides per key (pricing_rules).
 *  - A quote freezes its breakdown at creation; later rule changes never alter it.
 *  - Creating a quote needs an Idempotency-Key (§10): a replay returns the same quote, and reusing a key
 *    for a different request is 409.
 *  - Status moves follow QUOTE_TRANSITIONS (§5). Open quotes past `validUntil` read as EXPIRED and can no
 *    longer be accepted; EXPIRED is saved by the first such attempt or by the `pricing.expire_quotes` job.
 *  - `quote.sent`, `quote.accepted` and `quote.expired` are written to the outbox in the same transaction as the
 *    change (ADR-005), only when it is saved. Payloads carry refs and product types only.
 *  - Logs carry quote refs, product types and totals — never names or companies (§21).
 */
import { createHash } from 'node:crypto';
import { badRequest, conflict, notFound } from '../../shared/errors/AppError.js';
import { publish } from '../../shared/events/bus.js';
import { logger } from '../../shared/lib/logger.js';
import { decodeCursor, toPage } from '../../shared/lib/pagination.js';
import { generateRef } from '../../shared/lib/refs.js';
import { withTransaction } from '../../shared/lib/transactions.js';
import { getCentre } from '../catalog/index.js';
import {
  DEFAULT_PRICING_RULES,
  OPEN_STATUSES,
  QUOTE_TRANSITIONS,
  QUOTE_VALIDITY_DAYS,
  RULE_KEYS,
} from './pricing.constants.js';
import { priceItem } from './pricing.engine.js';
import { effectiveStatus, mapQuote, mapQuoteForStaff, mapRule } from './pricing.mapper.js';
import * as repo from './pricing.repository.js';

const log = logger.child({ module: 'pricing' });
const DAY_MS = 24 * 60 * 60 * 1000;

// ──────────────────────────────────────────────
// Rules
// ──────────────────────────────────────────────

async function loadOverrides() {
  return new Map((await repo.findRuleOverrides()).map((doc) => [doc.key, doc]));
}

/** The rule set prices are computed with: defaults, replaced key by key by staff overrides. */
export async function getEffectiveRules() {
  const overrides = await loadOverrides();
  return Object.fromEntries(RULE_KEYS.map((key) => [key, overrides.get(key)?.value ?? DEFAULT_PRICING_RULES[key]]));
}

export async function listRules() {
  const overrides = await loadOverrides();
  return RULE_KEYS.map((key) => {
    const override = overrides.get(key);
    return mapRule(key, override?.value ?? DEFAULT_PRICING_RULES[key], override);
  });
}

export async function setRule(key, value, actor) {
  const doc = await repo.upsertRule(key, value, actor);
  log.info({ event: 'pricing.rule_changed', key, actor }, 'pricing rule overridden');
  return mapRule(key, doc.value, doc);
}

/** Drops the override so the key falls back to its default. */
export async function resetRule(key, actor) {
  const removed = await repo.deleteRule(key);
  if (removed) log.info({ event: 'pricing.rule_reset', key, actor }, 'pricing rule reset to default');
  return mapRule(key, DEFAULT_PRICING_RULES[key], null);
}

// ──────────────────────────────────────────────
// Preview
// ──────────────────────────────────────────────

/** Prices one item without storing anything (PRD §55). Unknown centres are 404 CENTRE_NOT_FOUND. */
export async function previewItem(item) {
  const [rules, centre] = await Promise.all([
    getEffectiveRules(),
    item.product === 'virtual_office' ? getCentre(item.centreRef) : undefined,
  ]);
  return priceItem(item, rules, { centre });
}

// ──────────────────────────────────────────────
// Quotes
// ──────────────────────────────────────────────

const hashRequest = (body) => createHash('sha256').update(JSON.stringify(body)).digest('hex');

async function findReplay(idempotencyKey, requestHash) {
  const existing = await repo.findQuoteByIdempotencyKey(idempotencyKey);
  if (existing && existing.requestHash !== requestHash) {
    throw conflict('IDEMPOTENCY_KEY_REUSED', 'This Idempotency-Key was already used for a different quote');
  }
  return existing;
}

/**
 * Prices the item and stores a SENT quote valid for QUOTE_VALIDITY_DAYS.
 * @returns {Promise<{ quote: object, created: boolean }>} created=false when the key was replayed
 */
export async function createQuote({ name, company, item }, idempotencyKey, now = new Date()) {
  if (!idempotencyKey) {
    throw badRequest(
      'IDEMPOTENCY_KEY_REQUIRED',
      'Send an Idempotency-Key header (for example a UUID) with each new quote',
    );
  }
  const requestHash = hashRequest({ name, company, item });
  const replay = await findReplay(idempotencyKey, requestHash);
  if (replay) return { quote: mapQuote(replay, now), created: false };

  const { product: productType, label, tenure, rate_month_paise, ...pricing } = await previewItem(item);
  const doc = await insertQuoteWithEvent({
    ref: generateRef('VDQ', 8),
    status: 'SENT',
    productType,
    product: label,
    purpose: item.purpose ?? '',
    tenure,
    rate_month_paise,
    name,
    company: company ?? '',
    item,
    pricing,
    validUntil: new Date(now.getTime() + QUOTE_VALIDITY_DAYS * DAY_MS),
    history: [{ status: 'SENT', at: now, actor: 'public' }],
    idempotencyKey,
    requestHash,
  });
  if (!doc) {
    // A concurrent request with the same key won the insert; answer as its replay.
    const winner = await findReplay(idempotencyKey, requestHash);
    if (winner) return { quote: mapQuote(winner, now), created: false };
    throw conflict('QUOTE_CONFLICT', 'Could not create the quote. Please try again.');
  }

  log.info({ event: 'quote.sent', quoteRef: doc.ref, productType, total_paise: pricing.total_paise }, 'quote created');
  return { quote: mapQuote(doc, now), created: true };
}

/** Thrown inside the transaction to abort it when the Idempotency-Key was taken by a concurrent request. */
class KeyTaken extends Error {}

/** Saves the quote and `quote.sent` together; null when the Idempotency-Key was taken meanwhile. */
async function insertQuoteWithEvent(data) {
  try {
    return await withTransaction(async (session) => {
      const doc = await repo.insertQuote(data, { session });
      if (!doc) throw new KeyTaken();
      await publish(
        {
          type: 'quote.sent',
          entity: { type: 'quote', ref: doc.ref },
          actor: { type: 'public' },
          payload: { productType: doc.productType },
        },
        { session },
      );
      return doc;
    });
  } catch (err) {
    if (err instanceof KeyTaken) return null;
    throw err;
  }
}

/** The event announcing a move into each status; other moves (VIEWED, REJECTED) have none (modules.md §3.4). */
const STATUS_EVENTS = { ACCEPTED: 'quote.accepted', EXPIRED: 'quote.expired' };

/**
 * Moves a quote from `from` to `to` and records the matching event with it. Moves other than EXPIRED also require
 * the quote to be valid at `now`. Returns the updated quote, or null — with no event — if it changed meanwhile.
 */
async function transitionQuote(ref, from, to, actor, now) {
  return withTransaction(async (session) => {
    const validAt = to === 'EXPIRED' ? undefined : now;
    const updated = await repo.updateQuoteStatus(ref, from, to, { status: to, at: now, actor }, { validAt, session });
    if (updated && STATUS_EVENTS[to]) {
      await publish(
        {
          type: STATUS_EVENTS[to],
          entity: { type: 'quote', ref },
          actor: { type: actor === 'system' ? 'system' : 'public' },
          payload: { from, productType: updated.productType },
        },
        { session },
      );
    }
    return updated;
  });
}

async function findQuoteOrThrow(ref) {
  const quote = await repo.findQuoteByRef(ref);
  if (!quote) throw notFound('QUOTE_NOT_FOUND', `No quote found for ref '${ref}'`);
  return quote;
}

/** The share-link view. */
export async function getQuote(ref, now = new Date()) {
  return mapQuote(await findQuoteOrThrow(ref), now);
}

/**
 * Customer moves on a shared quote: VIEWED / ACCEPTED / REJECTED. Repeating the current status is a
 * no-op, and VIEWED is only recorded the first time a SENT quote is opened.
 */
export async function changeQuoteStatus(ref, to, actor, now = new Date()) {
  const quote = await findQuoteOrThrow(ref);
  const current = effectiveStatus(quote, now);
  if (current === to || (to === 'VIEWED' && current !== 'SENT')) return mapQuote(quote, now);

  if (current === 'EXPIRED') {
    if (quote.status !== 'EXPIRED') await transitionQuote(ref, quote.status, 'EXPIRED', 'system', now);
    throw conflict('QUOTE_EXPIRED', 'This quote has expired. Please ask your advisor for a fresh one.', {
      validUntil: quote.validUntil,
    });
  }
  const allowed = QUOTE_TRANSITIONS[current] ?? [];
  if (!allowed.includes(to)) {
    throw conflict('INVALID_STATUS_TRANSITION', `A quote cannot move from ${current} to ${to}`, {
      from: current,
      to,
      allowed,
    });
  }

  const updated = await transitionQuote(ref, quote.status, to, actor, now);
  if (!updated) throw conflict('QUOTE_CHANGED', 'This quote was just changed. Please reload and try again.');
  log.info({ event: `quote.${to.toLowerCase()}`, quoteRef: ref, from: current, to }, 'quote status changed');
  return mapQuote(updated, now);
}

/** Staff list, newest first, with each quote's status timeline. */
export async function listQuotes({ status, cursor, limit }, now = new Date()) {
  const after = cursor ? decodeCursor(cursor) : undefined;
  const { items, nextCursor } = toPage(await repo.findQuotes({ status, after, limit }), limit);
  return { quotes: items.map((doc) => mapQuoteForStaff(doc, now)), nextCursor };
}

// ──────────────────────────────────────────────
// Expiry job (worker)
// ──────────────────────────────────────────────

/**
 * Saves EXPIRED on open quotes past their validUntil, publishing `quote.expired` for each. Each move is a conditional
 * update, so several workers — or a customer accepting at the same moment — can never both win.
 * @returns {Promise<{ expired: number }>}
 */
export async function expireLapsedQuotes({ limit = 100, now = new Date() } = {}) {
  let expired = 0;
  for (const quote of await repo.findLapsedQuotes(OPEN_STATUSES, now, limit)) {
    if (await transitionQuote(quote.ref, quote.status, 'EXPIRED', 'system', now)) expired += 1;
  }
  return { expired };
}
