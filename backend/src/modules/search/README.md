# Search module

Universal search (PRD §9–16): intent parsing, filters, ranking, zero-result recommendations, and the admin-managed
settings behind it (PRD §20).

- **Mounted at:** `/api/v1/search`
- **Build phase:** 1
- **Collections:** `search_services`, `search_synonyms`, `search_redirects`, `search_config`
- **Reads (via `catalog/index.js`):** centres, workspaces, cities — never catalog's models
- **Frontend that will call it:** `features/search/*`, `pages/search/SearchResultsPage.jsx`, `components/ui/SearchHero.jsx`

## Endpoints (relative to the mount path)

| Method   | Path                    | Access | What it does                                                       |
| -------- | ----------------------- | ------ | ------------------------------------------------------------------ |
| `GET`    | `/`                     | public | Search. `?q=&city=&type=&capacity=&maxPrice=&sort=` (all optional) |
| `GET`    | `/suggest?q=`           | public | Autocomplete: popular → cities → localities → services, max 8      |
| `GET`    | `/popular`              | public | Popular-search chips `[{ query }]`, admin order; `[]` if none      |
| `GET`    | `/admin/synonyms`       | staff  | List synonyms (read-only; none seeded)                             |
| `GET`    | `/admin/redirects`      | staff  | List redirects                                                     |
| `POST`   | `/admin/redirects`      | staff  | `{ query, target }` → 201; same live query → `409 REDIRECT_EXISTS` |
| `PATCH`  | `/admin/redirects/:ref` | staff  | Any of `{ query, target }`; unknown → `404 REDIRECT_NOT_FOUND`     |
| `DELETE` | `/admin/redirects/:ref` | staff  | Soft delete → 204                                                  |
| `GET`    | `/admin/config`         | staff  | List config entries `{ key, value }`                               |
| `POST`   | `/admin/config`         | staff  | `{ key, value }` → 201; key already live → `409 CONFIG_EXISTS`     |
| `PATCH`  | `/admin/config/:key`    | staff  | `{ value }`; unknown → `404 CONFIG_NOT_FOUND`                      |
| `DELETE` | `/admin/config/:key`    | staff  | Soft delete → 204                                                  |

**Staff access:** a Bearer token with `search:manage` (OPS_ADMIN, CONTENT, SUPER_ADMIN — see `identity/README.md`),
or the temporary `x-admin-key` during the switch-over (see `crm/README.md`).

### `GET /` response

```jsonc
{
  "data": {
    "query": "virtual office in mumbai",
    "intent": { "rawQuery": "…", "intent": "Virtual Office", "location": "Mumbai", "locality": null,
                "capacity": null, "service": null, "summary": "Virtual Office • Mumbai" },   // null for a blank q
    "route": "/locations/mumbai/virtual-office",   // landing page, or null → stay on /search
    "redirected": false,                           // true when an admin redirect supplied `route`
    "filters": { "city": "Mumbai", "type": "Virtual Office", "capacity": "all", "maxPrice": null, "sort": "recommended" },
    "results": [{ "ref", "name", "type", "city", "locality", "address", "capacity",
                  "price_month_paise", "status", "rating", "reviews" }],
    "services": [{ "slug", "name", "icon", "starting_price_paise", "priceUnit" }],
    "recommendations": null   // or { relaxed: ["capacity", …], results: […], suggestions: [{ type, label, query }] }
  },
  "meta": { "total": 3 }      // results + services
}
```

## How a search runs (`search.service.js`)

1. **Redirect** — the normalised query (lower-case, single spaces) is looked up exactly in `search_redirects`. A hit
   sets `route` and `redirected: true`; results are still returned.
2. **Synonyms** — whole-word terms are rewritten, longest first ("bengaluru" → "bangalore"). Redirects are matched
   on the query _before_ this step.
3. **Intent** — `parseSearchIntent` and `routeForIntent` in `search.intent.js` are ports of the client's
   `parseSearchIntent.js` / `routeForQuery`, quirks included (e.g. "cp" matches inside words).
4. **Filters** — defaults (`all`, no price cap) → what the query implies (`filtersFromIntent`) → any filter the caller
   sent. Values are the explorer's own (`2-5`, `Meeting Rooms`, `price-asc`); `maxPrice` is in **rupees**.
5. **Inventory** — catalog centres become `Virtual Office` items (capacity 10, as the client does; `rating`/`reviews`
   `null` — the client's invented numbers are not served), workspaces keep their own values and take their
   centre's address. Amounts are **paise**.
6. **Ranking** — `recommended` keeps catalog order but lifts `promotedCentres` (config) to the top in admin order;
   `price-asc`, `price-desc`, `capacity` ignore promotion.
7. **Services** — the client's `matchServices` over `search_services`.
8. **Zero results** — capacity, then type, then city are dropped (cumulatively) until something matches →
   `recommendations.results`; price is never relaxed. `suggestions` are the client's chips: up to 5 other catalog
   cities as "`<type or Virtual Office>` in `<city>`", plus GST / Company Registration when no service matched.

## Config keys

| Key               | Value                                     | Used by                                   |
| ----------------- | ----------------------------------------- | ----------------------------------------- |
| `promotedCentres` | ≤ 50 catalog centre refs (must exist)     | ranking (`sort=recommended`)              |
| `popularSearches` | ≤ 20 distinct query strings (≤ 100 chars) | `GET /popular`, first group of `/suggest` |

## Seeding

`node --env-file-if-exists=backend/.env backend/scripts/seed-search.js` (from the repo root) upserts the three
services from `frontend/src/data/services.js` (imported directly; `startingPrice` → `starting_price_paise`) and creates
`popularSearches` from the client's /search page chips if it doesn't exist. Synonyms and redirects are not seeded.

## Phase 1 decisions

- **No text index.** The catalog is ~20 rows, so search loads it through catalog's service and filters in memory.
  Atlas Search / OpenSearch replaces this in Phase 4 (`phases.md`). No caching layer yet either.
- Synonyms are read-only over the API until synonym editing is scoped.

## Not built yet

- Search telemetry ingest (`analytics` module) and popularity counting — `popularSearches` is curated, not measured.
- Guides in results (the client also matches `data/guides.js`; that content belongs to `cms`).
- Rate limiting, caching / CDN, `catalog.updated` cache invalidation, audit log for admin changes (logged only).

Full spec: [docs/backend/modules.md §3.3](../../../../docs/backend/modules.md). Layer rules: [backend/README.md](../../../README.md).
