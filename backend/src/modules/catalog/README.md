# Catalog module

Cities, centres and workspaces — the inventory the website, search and pricing read.

- **Mounted at:** `/api/v1/catalog`
- **Build phase:** 1
- **Collections:** `cities`, `centres`, `workspaces`
- **Exports (`index.js`):** the public read functions (`getCentre`, `listWorkspaces`, …) — search and pricing use these
- **Frontend that will call it:** `features/catalog/catalogStore.js`, `features/locations/*`, `features/marketplace/*`,
  `features/discovery/*`; staff screens (to be designed) for the admin endpoints
- **Seed:** `scripts/seed-catalog.js` (the frontend's cities, centres and workspaces)

## Public endpoints (relative to the mount path)

| Method | Path               | What it does                                                                |
| ------ | ------------------ | --------------------------------------------------------------------------- |
| `GET`  | `/`                | Bundle: `{ cities, centres, workspaces }`                                   |
| `GET`  | `/cities`          | Active cities, by name                                                      |
| `GET`  | `/cities/:slug`    | One city (`mumbai`)                                                         |
| `GET`  | `/centres`         | `?city=<slug>`; flagship first                                              |
| `GET`  | `/centres/:ref`    | One centre (`CTR-MUM-001`)                                                  |
| `GET`  | `/workspaces`      | `?city=<name, any case>&type=&capacity=<min seats>&maxPrice=<rupees/month>` |
| `GET`  | `/workspaces/:ref` | One workspace (`WS-MUM-001`)                                                |

Only active, non-deleted records are public. Prices are integer paise: `vo_price_paise`, `cw_price_paise`,
`price_month_paise`, `price_hour_paise`.

## Staff endpoints — `/admin/*`, permission `catalog:manage` (OPS_ADMIN, SUPER_ADMIN)

| Method   | Path                     | What it does                                                                           |
| -------- | ------------------------ | -------------------------------------------------------------------------------------- |
| `GET`    | `/admin/cities`          | All cities incl. inactive                                                              |
| `POST`   | `/admin/cities`          | `{ slug, name, state, tier, tagline?, localities?, active? }` → 201, ref `CITY-<SLUG>` |
| `PATCH`  | `/admin/cities/:slug`    | Any of `{ name, state, tier, tagline, localities, active }` (slug can't change)        |
| `DELETE` | `/admin/cities/:slug`    | Soft delete → 204; `409 CITY_HAS_CENTRES` while it has centres                         |
| `GET`    | `/admin/centres`         | All centres incl. inactive, `?city=<slug>`                                             |
| `POST`   | `/admin/centres`         | `{ citySlug, areaName, fullName, address, services?, vo_price_paise?, … }` → 201       |
| `PATCH`  | `/admin/centres/:ref`    | Any centre field except its city                                                       |
| `DELETE` | `/admin/centres/:ref`    | Soft delete → 204; `409 CENTRE_HAS_WORKSPACES` while it has workspaces                 |
| `GET`    | `/admin/workspaces`      | All workspaces incl. inactive, `?centreRef=`                                           |
| `POST`   | `/admin/workspaces`      | `{ centreRef, name, type, capacity, price_month_paise, price_hour_paise, … }` → 201    |
| `PATCH`  | `/admin/workspaces/:ref` | Any workspace field except its centre                                                  |
| `DELETE` | `/admin/workspaces/:ref` | Soft delete → 204                                                                      |

`x-admin-key` also works during the switch-over (see `identity/README.md`).

### Rules worth knowing

- **Refs never change and are never reused.** New centres continue the city's numbering (`CTR-NSK-003`), new
  workspaces the centre's (`WS-NSK-004`), counting deleted ones. New city refs are `CITY-` + the slug.
- **Inactive vs deleted:** `active: false` hides a record from the public API but keeps it editable — use it for
  "temporarily unavailable". `DELETE` is a soft delete for good.
- **Fixed parents:** a centre's city and a workspace's centre are set at creation. The copied `city` name (and a
  workspace's `locality`, which defaults to the centre's `areaName`) follow from them; renaming a city updates its
  centres and workspaces.
- **Prices** are integer paise; a decimal like `1249.5` is `400 VALIDATION_FAILED`.
- **`catalog.updated`** (outbox, ADR-008) is saved in the same transaction as every staff create, edit and delete,
  with `entity: { type: city|centre|workspace, ref }` and `payload: { action, fields }` (field names, never values). A
  city rename and the copied names on its centres and workspaces are one transaction. An edit that changes no value
  saves nothing and publishes nothing. No handler yet — CDN purge waits for a CDN decision.

## Not built yet

Image upload (signed URLs — needs the storage integration), availability calendar (comes with `booking`), a
`catalog.updated` handler that purges the CDN cache.

Full spec: [docs/backend/modules.md §3.2](../../../../docs/backend/modules.md). Layer rules: [backend/README.md](../../../README.md).
