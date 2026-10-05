# Subscriptions module

Service activation (payment + KYC + ops sign-off), agreements and renewals.

- **Mounted at:** `/api/v1/subscriptions`
- **Build phase:** 2–3
- **Collections:** `subscriptions`, `agreements`, `renewals`
- **Frontend that will call it:** `features/portal/customerPortal.js`

## Planned endpoints (relative to the mount path)

- GET /mine
- POST /:ref/renew
- ops: POST /:ref/activate · /:ref/suspend

Full spec: [docs/backend/modules.md §3.9](../../../../docs/backend/modules.md). Layer rules: [backend/README.md](../../../README.md).
