# Analytics module

Website telemetry, KPIs and funnels.

- **Mounted at:** `/api/v1/analytics`
- **Build phase:** 1
- **Collections:** `events (time-series)`, `kpi_daily`
- **Frontend that will call it:** `features/analytics/telemetry.js`

## Planned endpoints (relative to the mount path)

- POST /events (batch, fire-and-forget)
- GET /kpis?range=
- GET /funnel

Full spec: [docs/backend/modules.md §3.11](../../../../docs/backend/modules.md). Layer rules: [backend/README.md](../../../README.md).
