# Pricing module

Pricing engine and quotes. All amounts are integers in paise; GST 18 % applied on the final line.

- **Mounted at:** `/api/v1/pricing`
- **Build phase:** 1 (quote preview) · 2 (quotes)
- **Collections:** `pricing_rules`, `quotes`, `quote_items`
- **Frontend that will call it:** `features/virtualOffice/voConfigurator.js`, `features/quote/*`, `features/pricing/costCalculator.js`

## Planned endpoints (relative to the mount path)

- POST /quote-preview
- POST /quotes
- GET /quotes/:ref
- PATCH /quotes/:ref/status
- GET /quotes/:ref/pdf

Full spec: [docs/backend/modules.md §3.4](../../../../docs/backend/modules.md). Layer rules: [backend/README.md](../../../README.md).
