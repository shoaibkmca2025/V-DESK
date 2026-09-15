# V-DESK Backend — Module Architecture

Status: Planning · Owner: Backend team · Source of truth for scope: `docs/vdesk-blueprint-v1.0.md` + PRD v2.0

## 1. Stack decision

| Concern | Choice | Why |
|---|---|---|
| Runtime | Node 22 LTS, ESM | Same language as the client; long-term support |
| Framework | Express 5 | Async error propagation built in, minimal, well understood |
| Database | MongoDB 7 + Mongoose 9 | Document model fits catalog/lead/booking shapes; easy multi-city expansion |
| Validation | Zod 4 | Single schema per endpoint, reused for OpenAPI generation |
| Auth | JWT (access 15 min) + rotating refresh token (httpOnly cookie), bcrypt/argon2 | Stateless API, RBAC per PRD §69, admin MFA (TOTP) per §70 |
| Queue | BullMQ + Redis | Notifications, renewals, hold expiry, webhooks must not block requests |
| Storage | S3-compatible (AWS S3 / Cloudflare R2) | KYC files with SSE encryption + signed URLs (PRD §70) |
| Payments | Razorpay (primary) / Cashfree (fallback adapter) | PRD §67 |
| Search | MongoDB text index (MVP) → Atlas Search / OpenSearch at scale | PRD §21 |
| Messaging | Email (Resend/SES), WhatsApp Business API, SMS (MSG91) | PRD §50–51 |
| Observability | pino logs, OpenTelemetry traces, Prometheus metrics, Sentry | see `logs.md` |
| Infra | Docker, GitHub Actions, MongoDB Atlas, Redis (Upstash/ElastiCache) | reproducible environments |

## 2. Repository layout

```
server/
  src/
    app.js                    express app factory (no listen) — testable
    server.js                 bootstrap: db, redis, queues, listen, graceful shutdown
    config/                   env schema (zod-validated), db, redis, storage, payments
    modules/<module>/         one folder per bounded context (below)
      <module>.routes.js      HTTP surface only
      <module>.controller.js  request → service → response
      <module>.service.js     business rules (pure where possible)
      <module>.model.js       mongoose schema(s)
      <module>.schemas.js     zod request/response schemas
      <module>.events.js      domain events emitted / consumed
      <module>.test.js        unit + integration tests
    shared/
      middleware/             auth, rbac, validate, rateLimit, requestId, errorHandler
      events/                 in-process event bus + outbox publisher
      jobs/                   BullMQ queue definitions + workers
      lib/                    money (paise integers), refs, dates (Asia/Kolkata), pagination
      errors/                 HttpError hierarchy
    integrations/             razorpay, cashfree, whatsapp, email, sms, s3 adapters (interface + impl)
  scripts/                    seed, migrate, backfill
  test/                       e2e (supertest + mongodb-memory-server), fixtures
  openapi/                    generated spec + Redoc page
```

Rule of thumb: **modules talk to each other through services and domain events, never by importing another module's model.**

## 3. Modules (bounded contexts)

Each module lists: purpose, owned collections, HTTP surface, events, and the frontend feature that consumes it (`src/features/*`).

### 3.1 `identity` — users, auth, RBAC
- **Collections:** `users`, `refresh_tokens`, `organizations`, `mfa_secrets`
- **Roles (PRD §69):** `SUPER_ADMIN`, `OPS_ADMIN`, `SALES_MANAGER`, `SALES_EXEC`, `FINANCE`, `COMPLIANCE`, `CONTENT`, `CUSTOMER`
- **HTTP:** `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `POST /auth/otp/request|verify` (phone OTP for customers), `POST /auth/mfa/enroll|verify` (admins), `GET /me`
- **Events:** `user.registered`, `user.phone_verified`
- **Frontend:** portal login (to be designed), admin console guard

### 3.2 `catalog` — cities, centres, workspaces, inventory
- **Collections:** `cities`, `localities`, `centres` (Location), `workspaces`, `amenities`, `workspace_types`
- **HTTP (public):** `GET /catalog` (bundle), `GET /cities`, `GET /centres?city=`, `GET /workspaces?city=&type=&capacity=&maxPrice=`
- **HTTP (ops):** CRUD on centres/workspaces, availability calendar, image upload (signed PUT)
- **Events:** `catalog.updated` (invalidates CDN cache)
- **Frontend:** `features/catalog/catalogStore.js`, `locations`, `marketplace`, `discovery`

### 3.3 `search` — universal search & intent
- **Owns:** text indexes on centres/workspaces/services, `search_synonyms`, `search_redirects`, `popular_searches`, `search_config` (admin-managed, PRD §20)
- **HTTP:** `GET /search?q=`, `GET /search/suggest?q=`, admin CRUD on config
- **Logic:** `parseSearchIntent` (shared with client) → filters → ranking (promoted centres first) → zero-result recommendations (PRD §16)
- **Frontend:** `features/search/universalSearch.js`, `commandPalette`

### 3.4 `pricing` — pricing engine & quotes
- **Collections:** `pricing_rules` (base, location adjustment, add-ons, discounts, tax), `quotes`, `quote_items`
- **Formula (PRD §55):** base + location adj + product + add-ons − discount + GST 18% → all amounts in **paise integers**
- **HTTP:** `POST /pricing/quote-preview` (stateless calc), `POST /quotes`, `GET /quotes/:ref`, `PATCH /quotes/:ref/status` (Draft→Sent→Viewed→Accepted/Expired/Rejected), `GET /quotes/:ref/pdf`
- **Events:** `quote.sent`, `quote.accepted`, `quote.expired` (cron)
- **Frontend:** `virtualOffice/voConfigurator.js`, `quote/quoteProposal.js`, `pricing/costCalculator.js`

### 3.5 `crm` — leads & pipeline
- **Collections:** `leads`, `lead_activities`, `campaigns`
- **Pipeline (PRD §42):** NEW → CONTACTED → QUALIFIED → PROPOSAL → NEGOTIATION → WON/LOST
- **Scoring (PRD §44):** rule table stored in DB, recomputed on every write
- **Attribution (PRD §60):** first-touch + last-touch UTM persisted from first form submit through conversion
- **HTTP:** `POST /leads` (public, rate-limited, CAPTCHA), `GET /leads` (sales), `PATCH /leads/:ref` (status/assign/note), `GET /leads/stats`, `POST /leads/:ref/convert` → creates customer
- **Events:** `lead.created`, `lead.status_changed`, `lead.converted`
- **Frontend:** `crm/leadStore.js`, `leads/leadForms.js`, `admin/*`

### 3.6 `booking` — meeting rooms & workspaces
- **Collections:** `bookings`, `availability_slots`, `holds`
- **State machine (PRD §35):** available → hold (TTL 10 min, Redis lock) → payment_pending → confirmed → checked_in → completed; cancellation: requested → approved → refunded
- **HTTP:** `GET /availability?workspaceId=&date=`, `POST /bookings/hold`, `POST /bookings/:ref/confirm`, `POST /bookings/:ref/cancel`, `GET /bookings/:ref/pass` (QR)
- **Events:** `booking.held`, `booking.hold_expired` (delayed job), `booking.confirmed`, `booking.cancelled`
- **Frontend:** `meetingRooms/roomBooking.js`

### 3.7 `orders` — orders, payments, invoices
- **Collections:** `orders`, `payments`, `invoices`, `refunds`
- **HTTP:** `POST /orders` (from quote/booking), `POST /payments/intent` (creates gateway order), `POST /webhooks/razorpay` (signature-verified, idempotent), `GET /invoices/:no`, `GET /invoices/:no/pdf`
- **Invoice:** sequential per financial year (`INV-2026-27-000123`), CGST/SGST or IGST by place of supply, GSTIN on record
- **Events:** `payment.succeeded`, `payment.failed`, `invoice.issued`, `refund.processed`
- **Frontend:** `checkout/checkout.js`, `checkout/taxInvoice.js`

### 3.8 `kyc` — documents & verification
- **Collections:** `kyc_applications`, `documents` (metadata only; files in S3 with SSE-KMS)
- **Flow (PRD §46–47):** OTP-verified → upload via signed URL → UNDER_REVIEW → APPROVED/REJECTED (reason mandatory) → audit trail
- **HTTP:** `POST /kyc`, `POST /kyc/:ref/documents/upload-url`, `PATCH /kyc/:ref/documents/:id/review` (compliance), `GET /kyc/:ref`
- **Events:** `kyc.submitted`, `kyc.approved`, `kyc.rejected`
- **Frontend:** `kyc/kyc.js`

### 3.9 `subscriptions` — services, activation, renewals
- **Collections:** `subscriptions`, `agreements`, `renewals`
- **Activation rule (North Star, PRD §76):** payment.succeeded ∧ kyc.approved ∧ ops activates → `service.activated`
- **Renewal (PRD §49):** reminders at T-30/T-7/T-1, renewal quote, grace period, suspension, cancellation — all cron-driven
- **HTTP:** `GET /me/subscriptions`, `POST /subscriptions/:ref/renew`, ops `POST /subscriptions/:ref/activate|suspend`
- **Frontend:** `portal/customerPortal.js`

### 3.10 `notifications` — email / WhatsApp / SMS
- **Collections:** `notification_templates`, `notification_log`
- Consumes every domain event above and renders templates; SMS restricted to transactional (PRD §50)
- WhatsApp inbound webhooks attach conversations to leads (PRD §51)
- **HTTP:** admin template CRUD, `POST /webhooks/whatsapp`

### 3.11 `analytics` — telemetry & KPIs
- **Collections:** `events` (time-series collection), materialised `kpi_daily`
- **HTTP:** `POST /analytics/events` (batch, fire-and-forget), `GET /analytics/kpis?range=`, `GET /analytics/funnel`
- Also forwards to GA4 Measurement Protocol server-side (PRD §67)
- **Frontend:** `analytics/telemetry.js`

### 3.12 `cms` — content & SEO
- **Collections:** `pages`, `faqs`, `testimonials`, `blog_posts`, `banners`, `seo_meta`, `trust_claims` (admin-substantiated, PRD §22)
- **HTTP:** public `GET /content/:slug`, admin CRUD with draft/publish, `GET /sitemap.xml`
- **Frontend:** `content/legal.js`, testimonials, knowledge section

### 3.13 `enterprise` (P2) — organisations, team bookings, central billing
- Multi-user orgs, bulk RFPs, custom price books, consolidated invoices, reporting exports
- **Frontend:** `enterprise/enterpriseSuite.js`

### 3.14 `platform` — cross-cutting
- request id, structured logging, rate limiting, CAPTCHA (Turnstile), audit log (`audit_log` append-only), health/readiness, OpenAPI, feature flags

## 4. Domain events (contract)

```
{ id, type, occurredAt, actor: { type: user|system, id }, entity: { type, ref }, payload, version: 1 }
```
Published through a transactional **outbox** collection and relayed to BullMQ so a crash between DB write and publish cannot lose an event.

## 5. Data ownership matrix

| Collection | Owner module | Readers |
|---|---|---|
| users, organizations | identity | all (via service) |
| centres, workspaces | catalog | search, pricing, booking |
| leads | crm | analytics, notifications |
| quotes, pricing_rules | pricing | orders |
| bookings | booking | orders, subscriptions |
| orders, payments, invoices | orders | subscriptions, analytics |
| kyc_applications, documents | kyc | subscriptions |
| subscriptions, agreements | subscriptions | portal, notifications |
| events | analytics | admin |

## 6. API conventions

- Base path `/api/v1`, JSON only, `Content-Type: application/json; charset=utf-8`
- Response envelope: `{ data, meta? }` on success; `{ error: { code, message, details?, requestId } }` on failure
- Pagination: cursor-based (`?cursor=&limit=`), max 100
- Money: integers in paise; currency `INR`
- Time: ISO-8601 UTC in transport; business days computed in `Asia/Kolkata`
- Idempotency: `Idempotency-Key` header on all `POST` that create money/booking records
- Versioning: URL major version; additive changes only within a version
