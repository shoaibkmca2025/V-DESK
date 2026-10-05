# Catalog module

Cities, centres, workspaces and inventory.

- **Mounted at:** `/api/v1/catalog`
- **Build phase:** 1
- **Collections:** `cities`, `localities`, `centres`, `workspaces`, `amenities`, `workspace_types`
- **Frontend that will call it:** `features/catalog/catalogStore.js`, `features/locations/*`, `features/marketplace/*`, `features/discovery/*`

## Planned endpoints (relative to the mount path)

- GET / (full catalog bundle)
- GET /cities
- GET /centres?city=
- GET /workspaces?city=&type=&capacity=&maxPrice=
- ops: CRUD on centres / workspaces

Full spec: [docs/backend/modules.md §3.2](../../../../docs/backend/modules.md). Layer rules: [backend/README.md](../../../README.md).
