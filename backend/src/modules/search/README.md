# Search module

Universal search: intent parsing, filters, ranking, zero-result recommendations.

- **Mounted at:** `/api/v1/search`
- **Build phase:** 1
- **Collections:** `search_synonyms`, `search_redirects`, `popular_searches`, `search_config`
- **Frontend that will call it:** `features/search/*`, `features/commandPalette/*`

## Planned endpoints (relative to the mount path)

- GET /?q=
- GET /suggest?q=
- admin: CRUD on search config

Full spec: [docs/backend/modules.md §3.3](../../../../docs/backend/modules.md). Layer rules: [backend/README.md](../../../README.md).
