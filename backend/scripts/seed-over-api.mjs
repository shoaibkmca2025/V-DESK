/**
 * Seeds a running API with the catalog, over HTTP, using the staff endpoints.
 *
 * Useful when the database is only reachable by the API process itself (the in-memory server used
 * by `dev:memory:seeded`), and as a live check that the staff catalog endpoints work.
 *
 *   node scripts/seed-over-api.mjs                       # http://127.0.0.1:5000
 *   API=http://127.0.0.1:5055 KEY=<x-admin-key> node scripts/seed-over-api.mjs
 *
 * Re-runnable: an entry that already exists is reported as "exists" and left alone.
 */
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const API = (process.env.API ?? 'http://127.0.0.1:5000').replace(/\/+$/, '');
const KEY = process.env.KEY ?? 'local-dev-admin-key-0123456789';
const V1 = `${API}/api/v1`;

const frontendData = path.resolve(import.meta.dirname, '../../frontend/src/data');
const { CITIES } = await import(pathToFileURL(path.join(frontendData, 'cities.js')).href);
const { LOCATIONS } = await import(pathToFileURL(path.join(frontendData, 'locations.js')).href);
const { WORKSPACES } = await import(pathToFileURL(path.join(frontendData, 'workspaces.js')).href);

const rupeesToPaise = (value) => (typeof value === 'number' ? Math.round(value * 100) : null);

async function post(pathname, body) {
  const response = await fetch(V1 + pathname, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-admin-key': KEY },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  let payload = null;
  try {
    payload = JSON.parse(text);
  } catch {
    /* not json */
  }
  return { status: response.status, payload, text: text.slice(0, 200) };
}

const counts = { created: 0, exists: 0, failed: 0 };
function record(kind, name, result) {
  if (result.status < 300) counts.created++;
  else if (result.status === 409) counts.exists++;
  else {
    counts.failed++;
    console.error(`  ✗ ${kind} ${name}: ${result.status} ${result.text}`);
  }
}

console.log(`[seed-api] ${V1}`);

for (const city of CITIES) {
  const result = await post('/catalog/admin/cities', {
    slug: city.slug,
    name: city.name,
    state: city.state,
    tier: city.tier,
    tagline: city.tagline ?? '',
    localities: city.localities ?? [],
  });
  record('city', city.slug, result);
}
console.log(`[seed-api] cities: +${counts.created} existing ${counts.exists} failed ${counts.failed}`);

// Centres get a generated ref, so "already seeded" is judged by city + area name.
const existingCentres = await fetch(`${V1}/catalog/centres`).then((r) => r.json());
const seenAreas = new Set(
  (existingCentres.data ?? []).map((centre) => `${centre.city}|${centre.areaName}`.toLowerCase()),
);

const before = { ...counts };
for (const centre of LOCATIONS) {
  if (seenAreas.has(`${centre.city}|${centre.areaName}`.toLowerCase())) {
    counts.exists++;
    continue;
  }
  const result = await post('/catalog/admin/centres', {
    citySlug: centre.city.toLowerCase(),
    areaName: centre.areaName,
    fullName: centre.fullName,
    address: centre.address,
    services: centre.services ?? [],
    vo_price_paise: rupeesToPaise(centre.vo_price),
    cw_price_paise: rupeesToPaise(centre.cw_price),
    meetingCapacity: centre.meetingCapacity ?? '',
    status: centre.status ?? 'available',
    flagship: Boolean(centre.flagship),
  });
  record('centre', centre.id, result);
}
console.log(
  `[seed-api] centres: +${counts.created - before.created} existing ${counts.exists - before.exists} failed ${counts.failed - before.failed}`,
);

// Centre refs are issued by the API, so look them up by city + area before adding workspaces.
const createdCentres = await fetch(`${V1}/catalog/centres`).then((r) => r.json());
const refByArea = new Map(
  (createdCentres.data ?? []).map((centre) => [`${centre.city}|${centre.areaName}`.toLowerCase(), centre.ref]),
);
const refForBundledCentre = (id) => {
  const centre = LOCATIONS.find((l) => l.id === id);
  return centre ? refByArea.get(`${centre.city}|${centre.areaName}`.toLowerCase()) : undefined;
};

const beforeWorkspaces = { ...counts };
const existingWorkspaces = await fetch(`${V1}/catalog/workspaces`).then((r) => r.json());
const seenWorkspaces = new Set((existingWorkspaces.data ?? []).map((w) => w.name.toLowerCase()));

for (const workspace of WORKSPACES) {
  if (seenWorkspaces.has(workspace.name.toLowerCase())) {
    counts.exists++;
    continue;
  }
  const centreRef = refForBundledCentre(workspace.centreId);
  if (!centreRef) {
    counts.failed++;
    console.error(`  ✗ workspace ${workspace.id}: no centre for ${workspace.centreId}`);
    continue;
  }
  const result = await post('/catalog/admin/workspaces', {
    centreRef,
    name: workspace.name,
    type: workspace.type,
    capacity: workspace.capacity,
    price_month_paise: rupeesToPaise(workspace.priceMonth),
    price_hour_paise: rupeesToPaise(workspace.priceHour),
    amenities: workspace.amenities ?? [],
    status: workspace.status ?? 'available',
    locality: workspace.locality,
    rating: workspace.rating ?? null,
    reviews: workspace.reviews ?? 0,
  });
  record('workspace', workspace.id, result);
}
console.log(
  `[seed-api] workspaces: +${counts.created - beforeWorkspaces.created} existing ${counts.exists - beforeWorkspaces.exists} failed ${counts.failed - beforeWorkspaces.failed}`,
);

const bundle = await fetch(`${V1}/catalog`).then((r) => r.json());
const sizes = Object.fromEntries(Object.entries(bundle.data ?? {}).map(([key, value]) => [key, value.length]));
console.log('[seed-api] catalog now holds', sizes);
if (counts.failed) process.exitCode = 1;
