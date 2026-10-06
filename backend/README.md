# V-DESK Backend

REST API for the V-DESK platform: **Node.js 22 + Express 5 + MongoDB (Mongoose)**, the M-E-N of MERN
(the React frontend is in `../frontend`).

**Status: foundation + first modules.** The server, config, database connection, error handling, logging, tests and the
folder/layer structure are in place. `catalog` (public read API) and `crm` (leads + pipeline) are implemented; the
other 11 modules are empty skeletons waiting for their code.

## Quick start

```bash
cd backend
npm install
cp .env.example .env     # adjust if your MongoDB is not on localhost
npm run dev              # http://localhost:5000 (restarts on file changes; needs MongoDB running)
npm run dev:memory       # same, with a throwaway in-memory MongoDB (no install needed, data not saved)
npm test                 # vitest + supertest + in-memory MongoDB
npm run lint             # eslint
npm run format           # prettier
```

Requires Node 22.12+ (Node 22 LTS recommended). Check it's up: `GET /health` → `{ "data": { "status": "ok" } }`,
`GET /ready` → also confirms the database connection.

### Manual testing (Thunder Client)

`thunder-client/` holds a collection (every implemented endpoint plus error cases) and a `V-DESK Local` environment.
Import both in Thunder Client, then:

1. Set `ADMIN_API_KEY=vdesk-local-admin-key-123` in `.env` (local only — the environment's `adminKey` uses it).
2. Seed the catalog: `node --env-file-if-exists=.env scripts/seed-catalog.js` (against `npm run dev`; the
   `dev:memory` database can't be seeded, so the catalog stays empty there).
3. Run the lead requests in order — status moves one step at a time and `WON`/`LOST` are final. To replay the
   pipeline, change `leadRef` in the environment (e.g. `VD-TEST-0002`).

## Folder structure

```
backend/
├── src/
│   ├── app.js               Express app: security headers, CORS, JSON, logging, routes, error handler
│   ├── server.js            starts the app: connects MongoDB, listens, shuts down cleanly
│   ├── routes.js            /health, /ready and where every module is mounted under /api/v1
│   ├── config/              env.js (validated settings), db.js (MongoDB connection)
│   ├── modules/             one folder per business feature (13), see table below
│   ├── shared/
│   │   ├── middleware/      requestId, httpLogger, validate, errorHandler
│   │   ├── errors/          AppError + helpers (badRequest, notFound, conflict, …)
│   │   ├── lib/             logger (pino); shared helpers go here
│   │   ├── events/          domain events between modules (to be added)
│   │   └── jobs/            background jobs with BullMQ + Redis (to be added)
│   └── integrations/        Razorpay, S3, email, WhatsApp, SMS wrappers (to be added)
├── scripts/                 dev-memory.js, seed-catalog.js; later migrations
├── thunder-client/          Thunder Client collection + local environment for manual API testing
└── test/                    db.js (in-memory MongoDB helper), app.test.js (platform tests)
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
<module>.service.js      business rules                            no req/res, no Mongoose — easy to unit-test
<module>.repository.js   database queries                          the only file that uses the model
<module>.model.js        Mongoose schema + indexes
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
- Records get a human `ref` (`VD-…`, `BK-…`, `INV-…`) used in URLs; MongoDB `_id` never leaves the API.
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

| Name            | Default                           | Purpose                                                                             |
| --------------- | --------------------------------- | ----------------------------------------------------------------------------------- |
| `NODE_ENV`      | `development`                     | `development` / `test` / `production`                                               |
| `PORT`          | `5000`                            | HTTP port                                                                           |
| `MONGODB_URI`   | `mongodb://127.0.0.1:27017/vdesk` | MongoDB connection string (Atlas in staging/production)                             |
| `CORS_ORIGINS`  | `http://localhost:5173`           | comma-separated frontend URLs allowed to call the API                               |
| `LOG_LEVEL`     | `info`                            | `fatal` … `trace`, or `silent`                                                      |
| `ADMIN_API_KEY` | _(unset)_                         | temporary staff key (`x-admin-key` header), ≥ 16 chars; unset → staff endpoints 503 |
