/**
 * Search controller — reads `req.validated`, calls search.service.js, sends `{ data, meta? }`.
 * No business rules and no database access here. Express 5 forwards async errors — no try/catch needed.
 */
import * as searchService from './search.service.js';

// ── Public ────────────────────────────────────

/** GET /api/v1/search — results, matched services, landing route and zero-result recommendations. */
export async function search(req, res) {
  const data = await searchService.search(req.validated.query);
  res.json({ data, meta: { total: data.results.length + data.services.length } });
}

/** GET /api/v1/search/suggest — autocomplete. */
export async function suggest(req, res) {
  const data = await searchService.suggest(req.validated.query.q);
  res.json({ data });
}

/** GET /api/v1/search/popular — popular-search chips. */
export async function popular(_req, res) {
  const data = await searchService.getPopularSearches();
  res.json({ data });
}

// ── Staff ─────────────────────────────────────

export async function listSynonyms(_req, res) {
  res.json({ data: await searchService.listSynonyms() });
}

export async function listRedirects(_req, res) {
  res.json({ data: await searchService.listRedirects() });
}

export async function createRedirect(req, res) {
  const data = await searchService.createRedirect(req.validated.body, req.actor);
  res.status(201).json({ data });
}

export async function updateRedirect(req, res) {
  const data = await searchService.updateRedirect(req.validated.params.ref, req.validated.body, req.actor);
  res.json({ data });
}

export async function deleteRedirect(req, res) {
  await searchService.deleteRedirect(req.validated.params.ref, req.actor);
  res.status(204).end();
}

export async function listConfig(_req, res) {
  res.json({ data: await searchService.listConfig() });
}

export async function createConfig(req, res) {
  const data = await searchService.createConfig(req.validated.body, req.actor);
  res.status(201).json({ data });
}

export async function updateConfig(req, res) {
  const data = await searchService.updateConfig(req.validated.params.key, req.validated.body.value, req.actor);
  res.json({ data });
}

export async function deleteConfig(req, res) {
  await searchService.deleteConfig(req.validated.params.key, req.actor);
  res.status(204).end();
}
