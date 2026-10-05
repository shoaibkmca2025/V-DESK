# CRM module

Leads from every website form and the sales pipeline (NEW → CONTACTED → QUALIFIED → PROPOSAL → NEGOTIATION → WON / LOST).

- **Mounted at:** `/api/v1/leads`
- **Build phase:** 1
- **Collections:** `leads`, `lead_activities`, `campaigns`
- **Frontend that will call it:** `features/crm/leadStore.js`, `features/leads/leadForms.js`, `features/admin/*`

## Planned endpoints (relative to the mount path)

- POST / (public, rate-limited, CAPTCHA)
- GET /
- GET /:ref
- PATCH /:ref (status, assign, note)
- GET /stats
- POST /:ref/convert

Full spec: [docs/backend/modules.md §3.5](../../../../docs/backend/modules.md). Layer rules: [backend/README.md](../../../README.md).
