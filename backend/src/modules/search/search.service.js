/**
 * Search service — universal search (PRD §9–16) and its admin-managed settings (PRD §20).
 *
 * Rules (docs/backend/rules.md, modules.md §3.3):
 *  - No req/res and no Mongoose here; search data goes through search.repository.js.
 *  - Centres, workspaces and cities come from catalog's public service (its index.js), never its models (§1).
 *  - Matching and ranking reuse the client's rules (search.intent.js), in memory over the catalog — no text index
 *    in Phase 1 (decision 2026-10-07, docs/backend/memory.md).
 *  - Logs carry refs and keys only; visitor queries are not logged (§21).
 */
import { randomInt } from 'node:crypto';
import { badRequest, conflict, notFound } from '../../shared/errors/AppError.js';
import { logger } from '../../shared/lib/logger.js';
import { listCentres, listCities, listWorkspaces } from '../catalog/index.js';
import { FALLBACK_SERVICE_SUGGESTIONS, RELAX_ORDER, SIMILAR_CITY_COUNT, SUGGEST_LIMIT } from './search.constants.js';
import {
  buildInventory,
  filterItems,
  filtersFromIntent,
  matchServices,
  normalizeQuery,
  parseSearchIntent,
  routeForIntent,
  sortItems,
} from './search.intent.js';
import { mapConfigEntry, mapRedirect, mapServiceSummary, mapSynonym } from './search.mapper.js';
import * as repo from './search.repository.js';

const log = logger.child({ module: 'search' });

/** Filters before the query or the caller narrows them. No price cap unless `maxPrice` is sent. */
const DEFAULT_FILTERS = Object.freeze({
  city: 'all',
  type: 'all',
  capacity: 'all',
  maxPrice: undefined,
  sort: 'recommended',
});

// ──────────────────────────────────────────────
// Pure rules
// ──────────────────────────────────────────────

/** Rewrites whole-word synonym terms in an already-normalised query, longest term first. */
export function applySynonyms(normalized, synonyms) {
  const ordered = [...synonyms].sort((a, b) => b.term.length - a.term.length);
  return ordered.reduce((text, { term, replacement }) => {
    const pattern = new RegExp(`(^|\\s)${escapeRegex(term)}(?=\\s|$)`, 'g');
    return text.replace(pattern, (_match, lead) => `${lead}${replacement.toLowerCase()}`);
  }, normalized);
}

/**
 * Zero results: drop capacity, then type, then city (cumulatively) until something matches.
 * @returns {{ relaxed: string[], results: object[] }}
 */
export function relaxFilters(inventory, filters, promotedRefs) {
  const relaxed = [];
  let current = { ...filters };
  for (const key of RELAX_ORDER) {
    if (current[key] === 'all') continue;
    current = { ...current, [key]: 'all' };
    relaxed.push(key);
    const results = filterItems(inventory, current);
    if (results.length > 0) return { relaxed, results: sortItems(results, current.sort, promotedRefs) };
  }
  return { relaxed, results: [] };
}

/** The client's zero-result chips: up to 5 other cities for the same type, plus service shortcuts if none matched. */
export function zeroResultSuggestions(cities, parsed, filters, matchedServiceCount) {
  const product = filters.type === 'all' ? 'Virtual Office' : filters.type;
  const cityChips = cities
    .filter((c) => c.name !== parsed?.location)
    .slice(0, SIMILAR_CITY_COUNT)
    .map((c) => ({ type: 'city', label: c.name, query: `${product} in ${c.name}` }));
  const serviceChips =
    matchedServiceCount === 0 ? FALLBACK_SERVICE_SUGGESTIONS.map((s) => ({ type: 'service', label: s, query: s })) : [];
  return [...cityChips, ...serviceChips];
}

export function generateRedirectRef() {
  const suffix = Array.from({ length: 4 }, () => randomInt(36).toString(36)).join('');
  return `RDR-${Date.now().toString(36)}${suffix}`.toUpperCase();
}

// ──────────────────────────────────────────────
// Public
// ──────────────────────────────────────────────

/**
 * Universal search. An exact redirect wins the `route`; otherwise the parsed intent decides it (null → stay on
 * the results page). Filters the query implies are applied first, then any filters the caller sent.
 */
export async function search({ q = '', ...explicitFilters }) {
  const normalized = normalizeQuery(q);
  const [redirect, synonyms, services, promotedRefs, centres, workspaces] = await Promise.all([
    normalized ? repo.findRedirectByQuery(normalized) : null,
    repo.findSynonyms(),
    repo.findServices(),
    getConfigValue('promotedCentres'),
    listCentres(),
    listWorkspaces(),
  ]);

  const expanded = applySynonyms(normalized, synonyms);
  const parsed = parseSearchIntent(expanded);
  if (parsed) parsed.rawQuery = q;

  const sent = Object.fromEntries(Object.entries(explicitFilters).filter(([, value]) => value !== undefined));
  const filters = { ...filtersFromIntent(parsed, DEFAULT_FILTERS), ...sent };

  const inventory = buildInventory(centres, workspaces);
  const results = sortItems(filterItems(inventory, filters), filters.sort, promotedRefs);
  const matchedServices = matchServices(expanded, services).map(mapServiceSummary);

  let recommendations = null;
  if (results.length === 0) {
    const cities = await listCities();
    recommendations = {
      ...relaxFilters(inventory, filters, promotedRefs),
      suggestions: zeroResultSuggestions(cities, parsed, filters, matchedServices.length),
    };
  }

  return {
    query: q,
    intent: parsed,
    route: redirect?.target ?? routeForIntent(parsed),
    redirected: Boolean(redirect),
    filters: { ...filters, maxPrice: filters.maxPrice ?? null },
    results,
    services: matchedServices,
    recommendations,
  };
}

/**
 * Autocomplete: popular searches, cities, localities and services whose label contains the text, in that order,
 * at most 8. `route` is the landing page when there is one; otherwise the client searches `query`.
 */
export async function suggest(q) {
  const needle = normalizeQuery(q);
  const [popular, cities, services] = await Promise.all([
    getConfigValue('popularSearches'),
    listCities(),
    repo.findServices(),
  ]);

  const candidates = [
    ...popular.map((label) => ({ type: 'popular', label, route: routeForIntent(parseSearchIntent(label)) })),
    ...cities.map((c) => ({ type: 'city', label: c.name, route: `/locations/${c.slug}`, match: c.name })),
    ...cities.flatMap((c) =>
      (c.localities ?? []).map((l) => ({
        type: 'locality',
        label: `${l}, ${c.name}`,
        route: `/locations/${c.slug}`,
        match: l,
      })),
    ),
    ...services.map((s) => ({ type: 'service', label: s.name, route: `/services/${s.slug}` })),
  ];

  const seen = new Set();
  const suggestions = [];
  for (const { match, ...item } of candidates) {
    const key = item.label.toLowerCase();
    if (seen.has(key) || !(match ?? item.label).toLowerCase().includes(needle)) continue;
    seen.add(key);
    suggestions.push({ ...item, query: item.label });
    if (suggestions.length === SUGGEST_LIMIT) break;
  }
  return suggestions;
}

/** Popular-search chips, in the order the admin configured them (empty when not configured). */
export async function getPopularSearches() {
  const popular = await getConfigValue('popularSearches');
  return popular.map((query) => ({ query }));
}

async function getConfigValue(key) {
  const entry = await repo.findConfigEntry(key);
  return entry?.value ?? [];
}

// ──────────────────────────────────────────────
// Staff — synonyms (read-only until admin editing is scoped)
// ──────────────────────────────────────────────

export async function listSynonyms() {
  return (await repo.findSynonyms()).map(mapSynonym);
}

// ──────────────────────────────────────────────
// Staff — redirects
// ──────────────────────────────────────────────

export async function listRedirects() {
  return (await repo.findRedirects()).map(mapRedirect);
}

/** `query` arrives normalised (validation); one live redirect per query → 409 REDIRECT_EXISTS. */
export async function createRedirect({ query, target }, actor) {
  const doc = await repo.insertRedirect({ ref: generateRedirectRef(), query, target });
  if (!doc) throw conflict('REDIRECT_EXISTS', 'A redirect for this query already exists');
  log.info({ event: 'search.redirect_created', redirectRef: doc.ref, actor }, 'search redirect created');
  return mapRedirect(doc);
}

export async function updateRedirect(ref, changes, actor) {
  const doc = await repo.updateRedirect(ref, changes);
  if (doc === false) throw conflict('REDIRECT_EXISTS', 'A redirect for this query already exists');
  if (!doc) throw notFound('REDIRECT_NOT_FOUND', `No redirect found for ref '${ref}'`);
  log.info({ event: 'search.redirect_updated', redirectRef: ref, actor }, 'search redirect updated');
  return mapRedirect(doc);
}

export async function deleteRedirect(ref, actor) {
  if (!(await repo.deleteRedirect(ref))) throw notFound('REDIRECT_NOT_FOUND', `No redirect found for ref '${ref}'`);
  log.info({ event: 'search.redirect_deleted', redirectRef: ref, actor }, 'search redirect deleted');
}

// ──────────────────────────────────────────────
// Staff — config entries
// ──────────────────────────────────────────────

export async function listConfig() {
  return (await repo.findConfigEntries()).map(mapConfigEntry);
}

/** One live entry per key → 409 CONFIG_EXISTS (use PATCH to change it). */
export async function createConfig({ key, value }, actor) {
  await assertConfigValue(key, value);
  const doc = await repo.insertConfigEntry({ key, value });
  if (!doc) throw conflict('CONFIG_EXISTS', `Search config '${key}' already exists; update it instead`);
  log.info({ event: 'search.config_created', key, actor }, 'search config created');
  return mapConfigEntry(doc);
}

export async function updateConfig(key, value, actor) {
  await assertConfigValue(key, value);
  const doc = await repo.updateConfigEntry(key, value);
  if (!doc) throw notFound('CONFIG_NOT_FOUND', `No search config entry '${key}'`);
  log.info({ event: 'search.config_updated', key, actor }, 'search config updated');
  return mapConfigEntry(doc);
}

export async function deleteConfig(key, actor) {
  if (!(await repo.deleteConfigEntry(key))) throw notFound('CONFIG_NOT_FOUND', `No search config entry '${key}'`);
  log.info({ event: 'search.config_deleted', key, actor }, 'search config deleted');
}

/** Promoted centres must exist in catalog, so ranking never points at a missing or retired centre. */
async function assertConfigValue(key, value) {
  if (key !== 'promotedCentres') return;
  const known = new Set((await listCentres()).map((c) => c.ref));
  const unknown = value.filter((ref) => !known.has(ref));
  if (unknown.length > 0) throw badRequest('UNKNOWN_CENTRE', 'Some promoted centres do not exist', { unknown });
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
