# KYC module

KYC applications and document verification. Files live in S3; the database stores metadata only.

- **Mounted at:** `/api/v1/kyc`
- **Build phase:** 2
- **Collections:** `kyc_applications`, `documents`
- **Frontend that will call it:** `features/kyc/kyc.js`

## Planned endpoints (relative to the mount path)

- POST /
- POST /:ref/documents/upload-url
- PATCH /:ref/documents/:id/review
- GET /:ref

Full spec: [docs/backend/modules.md §3.8](../../../../docs/backend/modules.md). Layer rules: [backend/README.md](../../../README.md).
