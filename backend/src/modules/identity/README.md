# Identity module

Users, login, phone OTP for customers, roles (RBAC) and admin MFA.

- **Mounted at:** `/api/v1/auth`
- **Build phase:** 1 (staff login) · 2 (customer login)
- **Collections:** `users`, `refresh_tokens`, `organizations`, `mfa_secrets`
- **Frontend that will call it:** `features/auth/session.js`, `admin console guard`, `portal login`

## Planned endpoints (relative to the mount path)

- POST /register
- POST /login
- POST /refresh
- POST /logout
- POST /otp/request · /otp/verify
- POST /mfa/enroll · /mfa/verify
- GET /me

Full spec: [docs/backend/modules.md §3.1](../../../../docs/backend/modules.md). Layer rules: [backend/README.md](../../../README.md).
