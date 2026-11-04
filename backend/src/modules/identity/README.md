# Identity module

Staff sign-in (one-time setup code → own password → mandatory MFA), customer sign-in with Google at checkout,
sessions, roles and permissions (PRD §69–70, rules.md §19–20, ADR-012).

- **Mounted at:** `/api/v1/auth`
- **Build phase:** 1 (staff) · 2 (customers)
- **Tables:** `users`, `customers`, `refresh_tokens`
- **Exports (`index.js`):** `requireStaff(permission)`, `authenticate`, `requirePermission`, `requireCustomer`,
  `optionalCustomer`, `hasPermission`, `mapCustomer`, `createUser` — every module's staff routes use `requireStaff`
- **Frontend that calls it:** admin console (`features/admin`, `features/auth/staffSession.js`), checkout and the
  portal (`features/auth/session.js`)
- **Needs:** `JWT_SECRET` and `MFA_ENCRYPTION_KEY` (≥ 32 chars each) — unset → `503 AUTH_NOT_CONFIGURED`.
  Customer sign-in also needs `GOOGLE_CLIENT_ID` (public; the same value the website is built with).

## Staff endpoints (relative to the mount path)

| Method  | Path              | Access                | What it does                                                                         |
| ------- | ----------------- | --------------------- | ------------------------------------------------------------------------------------ |
| `POST`  | `/login`          | public (rate-limited) | `{ email, password }` → `{ mfaToken, mfaRequired \| mfaEnrollmentRequired }`, or     |
|         |                   |                       | with a setup code as `password` → `{ passwordSetupRequired: true, setupToken }`      |
| `POST`  | `/password/setup` | setup token           | `{ setupToken, newPassword }` → the MFA step, as `/login` answers it                 |
| `POST`  | `/mfa/enroll`     | MFA token             | `{ mfaToken }` → `{ secret, otpauthUrl }` (first sign-in only)                       |
| `POST`  | `/mfa/verify`     | MFA token             | `{ mfaToken, code }` → `{ accessToken, expiresIn, user }` + refresh cookie           |
| `POST`  | `/refresh`        | refresh cookie        | Rotates the cookie, returns a new access token                                       |
| `POST`  | `/logout`         | refresh cookie        | Revokes the session, clears the cookie → 204                                         |
| `GET`   | `/me`             | Bearer                | The signed-in user with `permissions`                                                |
| `POST`  | `/password`       | Bearer                | `{ currentPassword, newPassword }` → 204; ends the user's other sessions             |
| `GET`   | `/users`          | `users:manage`        | Staff list, newest first, `?cursor=&limit=`                                          |
| `POST`  | `/users`          | `users:manage`        | `{ email, name, role }` → 201 with a one-time `setupCode` (shown only in this reply) |
| `GET`   | `/users/:ref`     | `users:manage`        | One user (`passwordSet`, `setupCodeExpiresAt`, never the code)                       |
| `PATCH` | `/users/:ref`     | `users:manage`        | Any of `{ name, role, status, issueSetupCode: true, resetMfa: true, unlock: true }`  |

## A new staff member's first sign-in

1. A super admin creates the account (`POST /users`) and passes on the `setupCode`, e.g. `ABCD-EFGH-JKMN`. Nobody
   types a password for someone else, so an admin never knows a staff member's password.
2. The staff member signs in with their email and the code as the password. `POST /login` answers
   `{ passwordSetupRequired: true, setupToken }` (15 minutes) — no session, no MFA token.
3. `POST /password/setup` stores the password they choose (12+ characters, at least one letter and one number) and
   answers with the MFA step. The code is spent: it never works again.
4. MFA as for everyone: `POST /mfa/enroll` (first time), then `POST /mfa/verify` with the authenticator code.

A forgotten password: an admin sends `PATCH /users/:ref { issueSetupCode: true }`. That removes the old password,
ends the person's sessions and returns a fresh code; their MFA stays as it was (add `resetMfa: true` for a lost
phone). Codes last 72 hours; a new code cancels the previous one and any setup already in progress.

## Every staff sign-in after that

1. `POST /login` checks the password and returns a 5-minute `mfaToken` — never a session.
2. `POST /mfa/verify` with the 6-digit code returns a 15-minute `accessToken` (send as `Authorization: Bearer …`) and
   sets the `vd_rt` refresh cookie (`HttpOnly`, `SameSite=Strict`, `Path=/api/v1/auth`, `Secure` in production,
   7 days). The first good code also switches MFA on.
3. `POST /refresh` before the access token expires. Each refresh replaces the cookie; a replaced cookie presented again
   more than 10 s later revokes every session from that sign-in (theft signal).

For manual testing, `npm run totp -- <secret>` prints the current code instead of a phone app.

## Customers — "Continue with Google" at checkout

Nobody needs an account to browse, ask for a quote or hold a room. A customer signs in only to pay:

| Method  | Path                | Access          | What it does                                                                     |
| ------- | ------------------- | --------------- | -------------------------------------------------------------------------------- |
| `POST`  | `/google`           | public          | `{ credential }` (the Google button's ID token) → `{ accessToken, customer }` +  |
|         |                     |                 | `vd_crt` cookie (`Path=/api/v1/auth/customer`, 30 days). Creates the account the |
|         |                     |                 | first time.                                                                      |
| `POST`  | `/customer/refresh` | customer cookie | Rotates the cookie, returns a new access token                                   |
| `POST`  | `/customer/logout`  | customer cookie | → 204                                                                            |
| `GET`   | `/customer/me`      | customer Bearer | The account                                                                      |
| `PATCH` | `/customer/me`      | customer Bearer | Any of `{ name, mobile, email, company }`                                        |

- The token is checked on the server (`src/integrations/google.js`): Google's signature, issuer, our client ID as
  audience, expiry, and a verified email. Failures → `401 GOOGLE_TOKEN_INVALID` / `GOOGLE_EMAIL_UNVERIFIED`; Google's
  keys unreachable → `503 GOOGLE_UNAVAILABLE`.
- The account is keyed by Google's stable `sub`, never the email. Signing in again fills in a missing email but never
  overwrites details the customer changed.
- A customer token has `typ: 'customer'` and no permissions: it opens no staff route, and a staff token opens no portal
  route. `optionalCustomer` is for routes guests may use too (holding a room) — a stale token there just means "guest".

## Rules worth knowing

- **Lockout:** wrong passwords, wrong setup codes and wrong TOTP codes share one counter — 5 failures lock the account
  for 15 minutes (`429 ACCOUNT_LOCKED`). An admin can `PATCH { unlock: true }`.
- **Same answer** (`401 INVALID_CREDENTIALS`) for unknown email, disabled account and wrong password, with equal timing.
- **Codes are single-use:** each 30-second TOTP step is accepted once per user; a setup code works once.
- **Changes apply at once:** every request reloads the user, so disabling or demoting someone takes effect on their
  next call. Role change, disable, MFA reset and a new setup code also revoke their refresh tokens.
- **Guards:** you can't change your own role/status/MFA or issue yourself a setup code
  (`409 CANNOT_CHANGE_OWN_ACCESS`), and the last active `SUPER_ADMIN` can't be demoted or disabled
  (`409 LAST_SUPER_ADMIN`).
- **Secrets at rest:** passwords are argon2id; setup codes and refresh tokens are SHA-256 only; TOTP secrets are
  AES-256-GCM sealed with `MFA_ENCRYPTION_KEY`.

## Permissions (`identity.constants.js` → `PERMISSIONS`)

| Permission             | Roles (SUPER_ADMIN always has every permission) | Used by                               |
| ---------------------- | ----------------------------------------------- | ------------------------------------- |
| `users:manage`         | —                                               | `/auth/users`                         |
| `leads:read`           | OPS_ADMIN, SALES_MANAGER, SALES_EXEC            | `GET /leads`, `/leads/stats`, `/:ref` |
| `leads:write`          | SALES_MANAGER, SALES_EXEC                       | `PATCH /leads/:ref`                   |
| `leads:export`         | SALES_MANAGER                                   | `GET /leads/export.csv`               |
| `search:manage`        | OPS_ADMIN, CONTENT                              | `/search/admin/*`                     |
| `catalog:manage`       | OPS_ADMIN                                       | `/catalog/admin/*`                    |
| `analytics:read`       | OPS_ADMIN, SALES_MANAGER, FINANCE               | `GET /analytics/*`                    |
| `pricing:manage`       | FINANCE                                         | `PUT/DELETE /pricing/rules/:key`      |
| `quotes:read`          | OPS_ADMIN, SALES_MANAGER, SALES_EXEC, FINANCE   | `GET /pricing/quotes`, `/rules`       |
| `bookings:read`        | OPS_ADMIN, SALES_MANAGER                        | `GET /bookings`                       |
| `bookings:write`       | OPS_ADMIN                                       | confirm / change booking status       |
| `orders:read`          | OPS_ADMIN, SALES_MANAGER, FINANCE               | `GET /orders`                         |
| `notifications:manage` | OPS_ADMIN, CONTENT                              | notification templates                |
| `notifications:read`   | OPS_ADMIN                                       | delivery log (masked)                 |
| `content:manage`       | OPS_ADMIN, CONTENT                              | `/content/admin/*`                    |
| `content:approve`      | — (SUPER_ADMIN only)                            | publishing trust claims               |

**Switch-over:** `requireStaff(p)` also accepts the old `x-admin-key` (full access, actor `admin-key`) when no
`Authorization` header is sent, so the admin console keeps working until it signs in with JWT. Remove that branch
(and `ADMIN_API_KEY`) once it does.

## First super admin

- **Local:** `POST /api/v1/auth/users` with `x-admin-key` and `role: "SUPER_ADMIN"`.
- **Servers without an admin key:** `node --env-file-if-exists=.env scripts/create-admin.js you@vdesk.in "Your Name"`
  prints a one-time setup code; sign in on the admin page with it and choose your password.

## Not built yet

Audit log (rules.md §26), organisations (enterprise module), Redis-backed rate limits for more than one API instance.
Staff password sign-in hashes with argon2id (~0.5 s of CPU), which needs the Workers Paid plan — on the free plan it
can fail with error 1102 (ADR-011).
