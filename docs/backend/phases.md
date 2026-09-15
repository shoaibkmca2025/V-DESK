# V-DESK Backend — Delivery Phases

Each phase ends with: green CI, OpenAPI updated, staging deploy, demo against the real frontend, and the
matching `src/features/*` module switched from localStorage to the API behind a feature flag.

Estimates assume 1–2 backend engineers. Durations are working weeks.

---

## Phase 0 — Foundation (1 week)

**Goal:** a deployable, observable, empty API.

- Repo `server/` per `modules.md` §2; Express 5 app factory; zod-validated env
- MongoDB Atlas (dev/staging/prod projects), Redis, S3 bucket with SSE
- Middleware: request id, pino logger, helmet, CORS allow-list, rate limit, error handler
- `GET /health` (liveness), `GET /ready` (db + redis ping)
- Docker image, GitHub Actions: lint → unit → integration (mongodb-memory-server) → build → deploy staging
- OpenAPI skeleton served at `/docs`
- Seed script loading `src/data/*` catalog into MongoDB

**Exit criteria:** staging URL returns `/health`; CI green; on-call runbook stub in `logs.md`.

---

## Phase 1 — MVP conversion backend (3 weeks) · PRD P0 (§72)

**Goal:** every website form and search hits the API; sales works from the admin console.

| Week | Deliverables |
|---|---|
| 1 | `catalog` read APIs + admin CRUD; `search` (`/search`, `/suggest`, synonyms, redirects, popular) |
| 2 | `crm` leads (create with CAPTCHA + attribution, list/filter, status, assign, notes, scoring), CSV export, `analytics` event ingest |
| 3 | `identity` for staff (login, JWT, RBAC, MFA), `notifications` v1 (email + WhatsApp lead confirmation, sales alert), `pricing/quote-preview` |

**Frontend switch-over:** `crm/leadStore.js`, `analytics/telemetry.js`, `catalog/catalogStore.js`, `search/universalSearch.js`, `admin/*`.

**Exit criteria (PRD §79 acceptance):** search routes to landing pages; zero-result recommendations served by API; admin can manage search config; leads visible in pipeline within 1 s of submit; p95 API < 500 ms; search < 300 ms.

---

## Phase 2 — Transaction platform (4 weeks) · PRD P1 (§73)

**Goal:** money moves. Quote → KYC → pay → activate.

| Week | Deliverables |
|---|---|
| 1 | `pricing` rules engine + quotes (statuses, PDF, share link), `booking` availability + hold with Redis TTL + expiry job |
| 2 | `orders` + Razorpay intent/webhook (signature check, idempotency, retries), invoice numbering, CGST/SGST/IGST, PDF |
| 3 | `kyc` OTP, signed uploads, review queue, rejection reasons, audit; virus scan hook on upload |
| 4 | `subscriptions` activation rule, agreement generation (e-sign placeholder), customer auth (phone OTP), portal read APIs |

**Frontend switch-over:** `quote/*`, `meetingRooms/roomBooking.js`, `checkout/*`, `kyc/kyc.js`, `portal/customerPortal.js`, `virtualOffice/voConfigurator.js`.

**Exit criteria (PRD §80–81):** end-to-end VO purchase and meeting-room booking on staging with Razorpay test mode; webhook replay is safe; invoice totals reconcile to the paisa; North Star event `service.activated` recorded.

---

## Phase 3 — Customer platform & retention (3 weeks) · PRD P1 (§74)

- Portal: services, orders, documents (signed GET), agreements, invoices, notifications centre
- Renewal engine: reminders T-30/7/1, renewal quotes, grace/suspension cron, 1-click renew
- Cross-sell rules (PRD §61) evaluated on lifecycle stage; surfaced via `GET /me/recommendations`
- Notifications v2: templates in CMS, WhatsApp inbound → lead threading, SMS transactional only
- CMS: homepage sections, FAQs, testimonials, banners, trust claims, SEO meta, sitemap

**Exit criteria:** renewal rate and churn KPIs computable from data; content edits require no deploy (PRD §56).

---

## Phase 4 — Scale & enterprise (4 weeks) · PRD P2 (§75)

- `enterprise`: organisations, multi-user, team bookings, bulk RFP, custom price books, consolidated billing, reports
- Search migration to Atlas Search/OpenSearch with ranking & promoted centres
- Analytics warehouse export (BigQuery/ClickHouse), funnel dashboards (PRD §77–78)
- Performance: CDN for catalog bundle, read replicas, cache tiers
- Security hardening: pen test, SOC-style audit log review, data retention jobs (PRD §70)

---

## Cross-phase tracks

| Track | Cadence |
|---|---|
| Security review | every phase end + before any payments change |
| Load test (k6) | Phase 1 end, Phase 2 end, quarterly |
| Backup/restore drill | monthly |
| Dependency updates | weekly automated PR |
| Docs (OpenAPI, runbooks, ADRs) | in the same PR as the code |

## Risk register

| Risk | Mitigation |
|---|---|
| Payment webhook lost/duplicated | outbox + idempotency keys + reconciliation cron against gateway |
| Hold race conditions on popular rooms | Redis `SET NX PX` lock per slot; DB unique index on (workspace, slot) |
| KYC data breach | SSE-KMS, short-lived signed URLs, no PII in logs, access audit |
| Scope creep from PRD breadth | phase gates; anything not in the phase's acceptance list goes to backlog |
| Frontend/backed contract drift | OpenAPI-generated client types; contract tests in CI |
