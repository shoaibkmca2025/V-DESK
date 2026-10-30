# V-DESK Backend

REST API for the V-DESK platform: **Node.js 22 + Express 5 + PostgreSQL** (Neon in every deployed
environment — ADR-010). The React frontend is in `../frontend`.

**Status: foundation + first modules.** The server, config, database connection, error handling, logging, tests and the
folder/layer structure are in place. Implemented: `catalog` (public read API), `search` (universal search + admin
config), `crm` (leads + pipeline), `identity` (staff sign-in with MFA, roles), `analytics` (telemetry, KPIs, funnel),
`pricing` (quote preview, quotes, pricing rules), `booking` (meeting-room availability, holds, staff confirmation) and
`orders` (order foundation — payments and invoices still blocked) and `notifications` (templates, queue, sender, and
the lead confirmation / sales alert via events — no real messaging provider yet) and `cms` (FAQs, testimonials,
guides, legal pages, trust claims, SEO, sitemap — draft → publish). Platform: background worker,
transactional event outbox (ADR-008) and customer sign-in by phone OTP (ADR-009). The other 3 modules are
empty skeletons waiting for their code.

## Quick start

```bash
cd backend
npm install
cp .env.example .env     # put your DATABASE_URL in it (Neon, or a local PostgreSQL)
npm run migrate          # applies migrations/*.sql — run this before the first start, and after every pull
npm run dev              # API on http://localhost:5000 (restarts on file changes)
npm run dev:worker       # background worker, in a second terminal (events, notifications, purge)
npm run dev:pg           # API + worker + a throwaway PostgreSQL in one process (nothing to install, migrates itself)
npm test                 # vitest + supertest against a real PostgreSQL (downloaded binaries, no Docker)
npm run lint             # eslint
npm run format           # prettier
npm run totp -- <secret> # current sign-in code for a test account's MFA secret (instead of a phone app)
node scripts/smoke.mjs   # end-to-end check against a running API (API=https://… for a deployment)
```

Requires Node 22.12+ (Node 22 LTS recommended). Check it's up: `GET /health` → `{ "data": { "status": "ok" } }`,
`GET /ready` → also confirms the database connection.

### Two processes, one database (ADR-008, ADR-010)

- **API** (`npm start`) answers requests; **worker** (`npm run worker`) delivers outbox events, sends queued
  messages and purges expired rows. Production runs both — the worker can be scaled to several copies safely,
  because every claim takes one row with `FOR UPDATE SKIP LOCKED` and a lease. Without a worker, events and
  messages just wait.
- **The schema is the migrations.** `migrations/*.sql` are numbered, applied once each (recorded in
  `schema_migrations`), and immutable after that: change the schema by adding the next file. `npm run migrate`
  applies what is pending; `npm run migrate -- --status` lists both sides.
- **Use Neon's pooled connection string** (the `-pooler` host) in `DATABASE_URL`, so each API instance's own small
  pool sits behind Neon's. `DATABASE_POOL_MAX` (default 10) caps it.
- A hold's rollback is a compensating write rather than a transaction, on purpose — the booking has to be visible
  to the Idempotency-Key lookup before its hours are reserved (`src/modules/booking/README.md`).

### Manual testing (Thunder Client)

`thunder-client/` holds a collection (every implemented endpoint plus error cases) and a `V-DESK Local` environment.
Import both in Thunder Client, then:

1. In `.env` set `ADMIN_API_KEY=vdesk-local-admin-key-123` (the environment's `adminKey`) and any two 32+ character
   values for `JWT_SECRET` and `MFA_ENCRYPTION_KEY` (local only).
2. Seed the catalog: `node --env-file-if-exists=.env scripts/seed-catalog.js` (after `npm run migrate`). For a
   `dev:pg` database, seed it over HTTP instead: `API=http://127.0.0.1:5000 KEY=<admin key> node scripts/seed-over-api.mjs`.
3. Run the lead requests in order — status moves one step at a time and `WON`/`LOST` are final. To replay the
   pipeline, change `leadRef` in the environment (e.g. `VD-TEST-0002`).
4. Staff sign-in (folder `5. Auth`): create the super admin → login → copy `mfaToken` into the environment → enroll →
   copy `secret` into `totpSecret` → `npm run totp -- <secret>` → paste the code into "MFA verify" within 30 s → copy
   `accessToken` into the environment. Requests in later folders use `Bearer {{accessToken}}` (valid 15 minutes).
5. Quotes: "Create quote" needs a fresh `Idempotency-Key` for each new quote; copy the returned `ref` into `quoteRef`.

## Folder structure

```
backend/
├── src/
│   ├── app.js               Express app: security headers, CORS, JSON, logging, routes, error handler
│   ├── server.js            starts the API: connects PostgreSQL, listens, shuts down cleanly
│   ├── worker.js            starts the background worker (jobs.js); events.js registers event handlers
│   ├── jobs.js              the background jobs (like routes.js for the worker)
│   ├── routes.js            /health, /ready and where every module is mounted under /api/v1
│   ├── config/              env.js (validated settings), db.js (PostgreSQL pool)
│   ├── modules/             one folder per business feature (13), see table below
│   ├── shared/
│   │   ├── middleware/      requestId, httpLogger, validate, errorHandler, rateLimit, requireAdminKey
│   │   ├── errors/          AppError + helpers (badRequest, notFound, conflict, …)
│   │   ├── lib/             logger (pino), pagination, refs, money, csv, transactions; shared helpers go here
│   │   ├── events/          transactional outbox + event bus (publish / subscribe / dispatch)
│   │   └── jobs/            job runner + row purge used by the worker (no Redis — ADR-008)
│   └── integrations/        turnstile, messaging contract + fake; Razorpay, S3, email, WhatsApp, SMS to come
├── scripts/                 dev-memory, seed-catalog, seed-search, seed-content, create-admin, totp; later migrations
├── thunder-client/          Thunder Client collection + local environment for manual API testing
└── test/                    globalSetup + db.js (shared in-memory replica set), platform tests
```

| Module          | Mounted at              | Phase | What it does                            |
| --------------- | ----------------------- | ----- | --------------------------------------- |
| `identity`      | `/api/v1/auth`          | 1–2   | users, login, OTP, roles, admin MFA     |
| `catalog`       | `/api/v1/catalog`       | 1     | cities, centres, workspaces             |
| `search`        | `/api/v1/search`        | 1     | universal search                        |
| `crm`           | `/api/v1/leads`         | 1     | website leads, sales pipeline           |
| `pricing`       | `/api/v1/pricing`       | 1–2   | price calculation, quotes               |
| `booking`       | `/api/v1/bookings`      | 2     | meeting-room bookings and holds         |
| `orders`        | `/api/v1/orders`        | 2     | orders, Razorpay payments, GST invoices |
| `kyc`           | `/api/v1/kyc`           | 2     | document upload and verification        |
| `subscriptions` | `/api/v1/subscriptions` | 2–3   | activation, renewals                    |
| `notifications` | `/api/v1/notifications` | 1–3   | email, WhatsApp, SMS                    |
| `analytics`     | `/api/v1/analytics`     | 1     | telemetry, KPIs                         |
| `cms`           | `/api/v1/content`       | 3     | FAQs, testimonials, blog, SEO           |
| `enterprise`    | `/api/v1/enterprise`    | 4     | multi-user company accounts             |

Each module's `README.md` lists its collections, planned endpoints and the frontend code that will call it.
Build order and acceptance criteria: [`docs/backend/phases.md`](../docs/backend/phases.md).

## Layers inside a module

Every module has the same files. A request flows top to bottom; each layer only calls the one below it.

```
<module>.routes.js       URL + middleware → controller            router.post('/', validate({ body }), controller.create)
<module>.validation.js   zod schemas for body / query / params     used by validate(); parsed values land on req.validated
<module>.controller.js   req → service → res                       no business rules, no database
<module>.service.js      business rules                            no req/res, no SQL — easy to unit-test
<module>.repository.js   database queries                          the only file that uses the model
(tables)                 migrations/*.sql — the repository owns the SQL
index.js                 what the module exports (its router; later its service/events)
```

Add these when a module needs them:

| File                    | When                                                                             |
| ----------------------- | -------------------------------------------------------------------------------- |
| `<module>.constants.js` | statuses, state-machine transition tables, fixed numbers                         |
| `<module>.events.js`    | names of events the module publishes (`lead.created`, …)                         |
| `<module>.mapper.js`    | converting a database document to the API response (hide `_id`, internal fields) |
| `<module>.test.js`      | unit tests for the service + API tests with supertest (use `test/db.js`)         |

**Rules that matter most** (full list in [`docs/backend/rules.md`](../docs/backend/rules.md)):

- A module never imports another module's model or repository. It uses the other module's service (via its
  `index.js`) or reacts to its events.
- Responses: `{ data, meta? }` on success. Errors: throw `AppError` (or `badRequest` / `notFound` / `conflict`)
  and the error handler sends `{ error: { code, message, details?, requestId } }`. Express 5 catches errors from
  `async` handlers automatically, so no try/catch or asyncHandler is needed in controllers.
- Error `code`s are stable strings like `LEAD_NOT_FOUND`; the frontend relies on them.
- Money is stored as integer **paise**, never decimals. Times are stored in UTC.
- Records get a human `ref` (`VD-…`, `BK-…`, `INV-…`) used in URLs; the surrogate `id` never leaves the API.
- Never log personal data (phone, email, PAN, Aadhaar, OTPs). The logger redacts common fields; don't work around it.
- New settings go in `src/config/env.js` and `.env.example`, never `process.env` elsewhere.

## Building a module (checklist)

1. Read the module's `README.md` and its section in `docs/backend/modules.md`.
2. `model.js` → schema with `timestamps`, `ref`, `deletedAt`, indexes.
3. `repository.js` → the queries the service needs.
4. `service.js` → business rules; throw `AppError`s with clear codes.
5. `validation.js` → zod schema per endpoint.
6. `controller.js` + `routes.js` → wire it up (the router is already mounted in `src/routes.js`).
7. `<module>.test.js` → tests; `npm test` and `npm run lint` must pass.
8. Switch the matching `frontend/src/features/*` file from localStorage to the API.

## Environment variables

| Name                   | Default                                               | Purpose                                                                                   |
| ---------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `NODE_ENV`             | `development`                                         | `development` / `test` / `production`                                                     |
| `PORT`                 | `5000`                                                | HTTP port                                                                                 |
| `DATABASE_URL`         | `postgresql://postgres:postgres@127.0.0.1:5432/vdesk` | PostgreSQL connection string — Neon's **pooled** (`-pooler`) host in staging/production   |
| `DATABASE_POOL_MAX`    | `10`                                                  | connections this instance keeps, behind Neon's own pooler                                 |
| `CORS_ORIGINS`         | `http://localhost:5173`                               | comma-separated frontend URLs allowed to call the API                                     |
| `LOG_LEVEL`            | `info`                                                | `fatal` … `trace`, or `silent`                                                            |
| `ADMIN_API_KEY`        | _(unset)_                                             | temporary staff key (`x-admin-key` header), ≥ 16 chars; unset → staff endpoints 503       |
| `JWT_SECRET`           | _(unset)_                                             | signs staff access tokens, ≥ 32 chars; unset → `/auth` answers 503                        |
| `MFA_ENCRYPTION_KEY`   | _(unset)_                                             | encrypts staff TOTP secrets at rest, ≥ 32 chars; keep it separate from `JWT_SECRET`       |
| `TRUST_PROXY`          | `0`                                                   | proxies in front of the API (e.g. `1` behind Cloudflare) so rate limits see real IPs      |
| `TURNSTILE_SECRET_KEY` | _(unset)_                                             | Cloudflare Turnstile secret; set → `POST /leads` needs a CAPTCHA token, unset → check off |
| `SALES_ALERT_EMAIL`    | _(unset)_                                             | inbox for new-lead alerts (template `lead.sales_alert`); unset → no alert queued          |
| `SITE_URL`             | _(unset)_                                             | public site address, e.g. `https://vdesk.in`, for `sitemap.xml`; unset → sitemap 503      |

## Deploying

The API runs on Cloudflare Workers against Neon, through Hyperdrive (ADR-011). The runbook — secrets, the
Hyperdrive rules, cron triggers, domains and how to check a deployment — is **`docs/deployment.md`**.

```bash
npx wrangler deploy                                  # the API
API=https://vdesk-api.shoaibk-mca2024.workers.dev node scripts/smoke.mjs
npx wrangler tail --name vdesk-api                   # live logs, cron runs included
```

Two things to know before relying on it:

- **Staff password sign-in needs the Workers Paid plan.** An argon2id hash costs ~460 ms of CPU and the
  free plan allows 10 ms per request, so `/auth/login` fails intermittently with Cloudflare error 1102.
  Everything else — the customer OTP sign-in, catalog, search, booking, quotes, leads, cron — is I/O-bound
  and runs fine on the free plan.
- **The jobs run on cron, not in a loop**: outbox events and queued messages go out within a minute rather
  than within a second. `npm run worker` on an always-on host against the same database still works if that
  needs to be faster — the two cannot collide.

## Running a local API for frontend work

```bash
npm run dev:pg                 # API + worker + a throwaway PostgreSQL, migrated, nothing to install
node scripts/seed-over-api.mjs # fills the catalog through the staff endpoints (re-runnable)
node scripts/smoke.mjs         # checks the whole flow end to end against it
```

`dev:pg` downloads a real PostgreSQL the first time, starts it on a spare port, applies the
migrations and runs the API plus the worker in one process. Data is thrown away when it stops, unless
you pass `KEEP_DATA=1`. To work against Neon instead, put its `DATABASE_URL` in `.env` and use
`npm run dev`.

`seed-over-api.mjs` posts the frontend's bundled catalog to `/catalog/admin/*` rather than writing to
the database directly, so it works against any environment you have a staff key for, and doubles as a
live check of those endpoints. Set `API` and `KEY` to point it elsewhere.
