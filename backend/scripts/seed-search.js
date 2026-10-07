/**
 * Seed script — Search module
 *
 * - search_services: copied from frontend/src/data/services.js (imported directly, so the two cannot drift).
 *   Every field is kept as-is except `startingPrice` (rupees) → `starting_price_paise` (rules.md §13).
 * - search_config `popularSearches`: the chips on the client's /search page (SearchResultsPage.jsx POPULAR).
 *   Only created if absent, so re-seeding never overwrites what an admin configured.
 * - search_synonyms / search_redirects: intentionally not seeded (no client data to copy).
 *
 * Usage (from repo root; needs the monorepo checkout because it reads the frontend data file):
 *   node --env-file-if-exists=backend/.env backend/scripts/seed-search.js
 *
 * Safe to re-run (services upsert on slug).
 */
import { pathToFileURL } from 'node:url';
import mongoose from 'mongoose';
import { SERVICES } from '../../frontend/src/data/services.js';
import * as repo from '../src/modules/search/search.repository.js';

/** Copied from frontend/src/pages/search/SearchResultsPage.jsx (POPULAR) — keep in step until the client reads the API. */
export const POPULAR_SEARCHES_SEED = [
  'Virtual Office in Mumbai',
  'Coworking in Nashik',
  'Private Office in Gurgaon',
  'Meeting room for 10 people',
  'GST registration',
];

/** A client service object → its search_services document. */
export function toServiceDocument(service) {
  const { startingPrice, ...fields } = service;
  return { ...fields, ref: `SVC-${service.slug.toUpperCase()}`, starting_price_paise: Math.round(startingPrice * 100) };
}

/** Seeds an already-connected database. Returns counts for the CLI output and tests. */
export async function seedSearch() {
  for (const service of SERVICES) await repo.upsertServiceBySlug(service.slug, toServiceDocument(service));
  const popularCreated = Boolean(
    await repo.insertConfigEntry({ key: 'popularSearches', value: POPULAR_SEARCHES_SEED }),
  );
  return { services: SERVICES.length, popularCreated };
}

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vdesk';
  console.log(`[seed-search] connecting to ${uri}`);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  const { services, popularCreated } = await seedSearch();
  console.log(`[seed-search] services upserted: ${services}`);
  console.log(`[seed-search] popularSearches ${popularCreated ? 'created' : 'already configured — left unchanged'}`);
  await mongoose.disconnect();
  console.log('[seed-search] done ✓');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error('[seed-search] failed:', err);
    process.exit(1);
  });
}
