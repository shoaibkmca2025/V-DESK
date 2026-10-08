# Identity module

Staff sign-in with mandatory MFA, sessions, roles and permissions (PRD §69–70, rules.md §19–20). Customer login
(phone OTP) is Phase 2.

- **Mounted at:** `/api/v1/auth`
- **Build phase:** 1 (staff) · 2 (customers)
- **Collections:** `users`, `refresh_tokens`
- **Exports (`index.js`):** `requireStaff(permission)`, `authenticate`, `requirePermission`, `hasPermission`,
  `createUser` — every module's staff routes use `requireStaff`
- **Frontend that will call it:** admin console guard, `features/auth/session.js` (portal login, Phase 2)
- **Needs:** `JWT_SECRET` and `MFA_ENCRYPTION_KEY` (≥ 32 chars each). Unset → `503 AUTH_NOT_CONFIGURED`.

## Endpoints (relative to the mount path)

| Method  | Path          | Access                | What it does                                                                 |
| ------- | ------------- | --------------------- | ---------------------------------------------------------------------------- |
| `POST`  | `/login`      | public (rate-limited) | `{ email, password }` → `{ mfaToken, mfaRequired \| mfaEnrollmentRequired }` |
| `POST`  | `/mfa/enroll` | MFA token             | `{ mfaToken }` → `{ secret, otpauthUrl }` (first sign-in only)               |
| `POST`  | `/mfa/verify` | MFA token             | `{ mfaToken, code }` → `{ accessToken, expiresIn, user }` + refresh cookie   |
| `POST`  | `/refresh`    | refresh cookie        | Rotates the cookie, returns a new access token                               |
| `POST`  | `/logout`     | refresh cookie        | Revokes the session, clears the cookie → 204                                 |
| `GET`   | `/me`         | Bearer                | The signed-in user with `permissions`                                        |
| `POST`  | `/password`   | Bearer                | `{ currentPassword, newPassword }` → 204; ends the user's other sessions     |
| `GET`   | `/users`      | `users:manage`        | Staff list, newest first, `?cursor=&limit=`                                  |
| `POST`  | `/users`      | `users:manage`        | `{ email, name, role, password }` (temporary password) → 201                 |
| `GET`   | `/users/:ref` | `users:manage`        | One user                                                                     |
| `PATCH` | `/users/:ref` | `users:manage`        | Any of `{ name, role, status, password, resetMfa: true, unlock: true }`      |

## Signing in

1. `POST /login` checks the password and returns a 5-minute `mfaToken` — never a session.
2. First time: `POST /mfa/enroll` returns a TOTP secret and `otpauth://` URL for an authenticator app.
3. `POST /mfa/verify` with the 6-digit code returns a 15-minute `accessToken` (send as `Authorization: Bearer …`) and
   sets the `vd_rt` refresh cookie (`HttpOnly`, `SameSite=Strict`, `Path=/api/v1/auth`, `Secure` in production,
   7 days). The first good code also switches MFA on.
4. `POST /refresh` before the access token expires. Each refresh replaces the cookie; a replaced cookie presented again
   more than 10 s later revokes every session from that sign-in (theft signal).

For manual testing, `npm run totp -- <secret>` prints the current code instead of a phone app.

## Rules worth knowing

- **Lockout:** wrong passwords and wrong codes share one counter — 5 failures lock the account for 15 minutes
  (`429 ACCOUNT_LOCKED`). A correct password alone doesn't reset it. An admin can `PATCH { unlock: true }`.
- **Same answer** (`401 INVALID_CREDENTIALS`) for unknown email, disabled account and wrong password, with equal timing.
- **Codes are single-use:** each 30-second TOTP step is accepted once per user.
- **Changes apply at once:** every request reloads the user, so disabling or demoting someone takes effect on their
  next call. Role change, disable, MFA reset and password reset also revoke their refresh tokens.
- **Guards:** you can't change your own role/status/MFA (`409 CANNOT_CHANGE_OWN_ACCESS`), and the last active
  `SUPER_ADMIN` can't be demoted or disabled (`409 LAST_SUPER_ADMIN`).
- **Secrets at rest:** passwords are argon2id; TOTP secrets are AES-256-GCM sealed with `MFA_ENCRYPTION_KEY`; refresh
  tokens are stored as SHA-256 only.

## Permissions (`identity.constants.js` → `PERMISSIONS`)

| Permission       | Roles (SUPER_ADMIN always has every permission) | Used by                               |
| ---------------- | ----------------------------------------------- | ------------------------------------- |
| `users:manage`   | —                                               | `/auth/users`                         |
| `leads:read`     | OPS_ADMIN, SALES_MANAGER, SALES_EXEC            | `GET /leads`, `/leads/stats`, `/:ref` |
| `leads:write`    | SALES_MANAGER, SALES_EXEC                       | `PATCH /leads/:ref`                   |
| `search:manage`  | OPS_ADMIN, CONTENT                              | `/search/admin/*`                     |
| `analytics:read` | OPS_ADMIN, SALES_MANAGER, FINANCE               | `GET /analytics/*`                    |
| `pricing:manage` | FINANCE                                         | `PUT/DELETE /pricing/rules/:key`      |
| `quotes:read`    | OPS_ADMIN, SALES_MANAGER, SALES_EXEC, FINANCE   | `GET /pricing/quotes`, `/rules`       |

**Switch-over:** `requireStaff(p)` also accepts the old `x-admin-key` (full access, actor `admin-key`) when no
`Authorization` header is sent, so the admin console keeps working until it signs in with JWT. Remove that branch
(and `ADMIN_API_KEY`) once it does.

## First super admin

- **Local:** `POST /api/v1/auth/users` with `x-admin-key` and `role: "SUPER_ADMIN"`.
- **Servers without an admin key:**
  `ADMIN_PASSWORD='…' node --env-file-if-exists=.env scripts/create-admin.js you@vdesk.in "Your Name"`.

## Not built yet

Customer register / phone OTP (Phase 2, needs an SMS provider and the owner's decision in memory.md §6), audit log
(rules.md §26), organisations (enterprise module), Redis-backed rate limits for more than one API instance.
