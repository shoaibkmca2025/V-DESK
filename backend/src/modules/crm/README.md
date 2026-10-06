# CRM module

Leads from every website form and the sales pipeline (NEW → CONTACTED → QUALIFIED → PROPOSAL → NEGOTIATION → WON / LOST).

- **Mounted at:** `/api/v1/leads`
- **Build phase:** 1
- **Collections:** `leads`, `lead_activities` (`campaigns` comes with UTM attribution)
- **Frontend that will call it:** `features/crm/leadStore.js`, `features/leads/leadForms.js`, `features/admin/*`

## Endpoints (relative to the mount path)

| Method  | Path     | Access | What it does                                                                                   |
| ------- | -------- | ------ | ---------------------------------------------------------------------------------------------- |
| `POST`  | `/`      | public | Record a website enquiry. Returns `{ ref, createdAt }` only (201 new, 200 replayed `ref`)      |
| `GET`   | `/`      | staff  | List, newest first. `?status=&city=&source=&assignedTo=&q=&limit=&cursor=` → `meta.nextCursor` |
| `GET`   | `/stats` | staff  | `{ total, byStatus, bySource }`                                                                |
| `GET`   | `/:ref`  | staff  | One lead plus its `activities` timeline                                                        |
| `PATCH` | `/:ref`  | staff  | Any of `{ status, assignedTo (null unassigns), note }`                                         |

**Staff access** is temporary: send `x-admin-key: <ADMIN_API_KEY>`. Missing/wrong key → `401 ADMIN_KEY_INVALID`;
key not configured on the server → `503 ADMIN_AUTH_NOT_CONFIGURED`. Replaced by JWT + RBAC when `identity` ships.

**Lead fields** match the client lead object: `name` (required), `mobile` and/or `email` (at least one), `city`,
`service`, `company`, `notes` (visitor's message), `source`. The client's `id` is the `ref` (`VD-…`); sending it makes
the submission idempotent. `status` is always `NEW` on create; unknown fields are ignored.

**Pipeline** (`crm.constants.js`): one step forward, or `LOST` from any open stage. `WON`/`LOST` are final. Anything
else → `409 INVALID_STATUS_TRANSITION` with `details.allowed`. Concurrent edits → `409 LEAD_CHANGED`.

**Score** (recomputed on every write, same as the client's `calculateLeadScore`): base 40, +20 mobile, +15 email not
on gmail/yahoo, +10 company, +15 while `QUALIFIED`, max 100.

## Not built yet

- Rate limiting per IP and per phone/email, and Turnstile CAPTCHA, on `POST /` (rules.md §11). There is no
  rate-limit middleware in the project yet.
- `POST /:ref/convert` (needs `identity` customers), CSV export, UTM attribution, `lead.*` events via the outbox
  (they are logged for now), soft delete endpoint, audit log.

Full spec: [docs/backend/modules.md §3.5](../../../../docs/backend/modules.md). Layer rules: [backend/README.md](../../../README.md).
