# CRM module

Leads from every website form and the sales pipeline (NEW → CONTACTED → QUALIFIED → PROPOSAL → NEGOTIATION → WON / LOST).

- **Mounted at:** `/api/v1/leads`
- **Build phase:** 1
- **Collections:** `leads` (with attribution), `lead_activities`
- **Frontend that will call it:** `features/crm/leadStore.js`, `features/leads/leadForms.js`, `features/admin/*`

## Endpoints (relative to the mount path)

| Method  | Path          | Access         | What it does                                                                                   |
| ------- | ------------- | -------------- | ---------------------------------------------------------------------------------------------- |
| `POST`  | `/`           | public         | Record a website enquiry. Returns `{ ref, createdAt }` only (201 new, 200 replayed `ref`)      |
| `GET`   | `/`           | `leads:read`   | List, newest first. `?status=&city=&source=&assignedTo=&q=&limit=&cursor=` → `meta.nextCursor` |
| `GET`   | `/stats`      | `leads:read`   | `{ total, byStatus, bySource }`                                                                |
| `GET`   | `/export.csv` | `leads:export` | CSV download: the list filters (no paging) plus `?from=&to=` on created date                   |
| `GET`   | `/:ref`       | `leads:read`   | One lead plus its `activities` timeline                                                        |
| `PATCH` | `/:ref`       | `leads:write`  | Any of `{ status, assignedTo (null unassigns), note }`                                         |

**Staff access:** `Authorization: Bearer <access token>` from `/auth` with the permission above — see
`identity/README.md`; `leads:export` is SALES_MANAGER and SUPER_ADMIN only. The timeline records the user's ref as
`actor`. During the switch-over a request without `Authorization` may send `x-admin-key: <ADMIN_API_KEY>` instead
(full access; missing/wrong key → `401 ADMIN_KEY_INVALID`, not configured → `503 ADMIN_AUTH_NOT_CONFIGURED`).

**Lead fields** match the client lead object: `name` (required), `mobile` and/or `email` (at least one), `city`,
`service`, `company`, `notes` (visitor's message), `source`. The client's `id` is the `ref` (`VD-…`); sending it makes
the submission idempotent. `status` is always `NEW` on create; unknown fields are ignored.

**Pipeline** (`crm.constants.js`): one step forward, or `LOST` from any open stage. `WON`/`LOST` are final. Anything
else → `409 INVALID_STATUS_TRANSITION` with `details.allowed`. Concurrent edits → `409 LEAD_CHANGED`.

**Score** (recomputed on every write, same as the client's `calculateLeadScore`): base 40, +20 mobile, +15 email not
on gmail/yahoo, +10 company, +15 while `QUALIFIED`, max 100.

## Protecting the public form (rules.md §11)

1. **Per IP:** 10 submissions a minute → `429 RATE_LIMITED`.
2. **CAPTCHA:** with `TURNSTILE_SECRET_KEY` set, the form must send its Cloudflare Turnstile token in the
   `cf-turnstile-response` header or a `captchaToken` field → otherwise `400 CAPTCHA_REQUIRED` / `CAPTCHA_FAILED`;
   Cloudflare unreachable → `503 CAPTCHA_UNAVAILABLE` (the client queues and retries). Unset = off.
3. **Per contact:** 3 new enquiries an hour per mobile (matched on the last 10 digits, any format) or email →
   `429 TOO_MANY_ENQUIRIES`. Replaying a known `ref` is never limited.

## Attribution (PRD §60)

`POST /` may send `attribution: { firstTouch, lastTouch }`, each with `source`, `medium`, `campaign`, `term`,
`content` (the `utm_*` values), `gclid`, `fbclid`, `referrer`, `landingPage` and `at` (ISO time) — all optional. The
client keeps the first touch from the first visit and sends the current one as the last touch. `referrer` and
`landingPage` are stored without query string or hash (those can carry personal data). Staff see it on the lead and
in the export.

## Export

`/export.csv` streams one row per lead, newest first: ref, created at, contact fields, status, score, assignee,
message, and first/last-touch source/medium/campaign. UTF-8 with BOM (Excel shows ₹ and Indian names correctly);
cells a spreadsheet would treat as formulas (`=`, `+`, `-`, `@` …) start with an apostrophe. `Cache-Control:
no-store`; each export is logged with its row count and who ran it.

## Events (outbox, ADR-008)

`lead.created` — published in the same transaction as the new lead and its activity, with `entity: { type: 'lead',
ref }` and `payload: { source }` (no contact details; handlers read the lead with `getLead`). Not published for a
replayed `ref` or a refused enquiry. Handled today by notifications (visitor confirmation, sales alert).

## Not built yet

`POST /:ref/convert` (needs customer accounts), `lead.status_changed` / `lead.assigned` events (logged for now),
soft delete endpoint, audit log.

Full spec: [docs/backend/modules.md §3.5](../../../../docs/backend/modules.md). Layer rules: [backend/README.md](../../../README.md).
