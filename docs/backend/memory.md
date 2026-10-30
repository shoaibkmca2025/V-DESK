# V-DESK Backend — Project Memory

Living record of decisions, context and constraints that are **not** derivable from the code. Read this before
starting any backend work; append to it whenever a decision is made. Newest entries at the bottom of each section.

## 1. Product context (fixed)

- V-DESK Workspace & Consulting LLP (LLPIN AAY-9842), HQ Nashik. Products: virtual office (GST/MCA), coworking, private
  cabins, meeting rooms, company registration, GST/compliance. Market: India. Model: B2B/B2C/enterprise.
- Core journey: Discover → Search → Configure → Compare → Quote → KYC → Pay → Activate → Manage → Renew → Expand.
- North Star metric: **Activated Business Accounts** = payment + KYC + service activation completed.
- Design benchmarks: EchoSpaces (VO structure), Awfis (configuration), WeWork (positioning). Do not copy UI.
- PRD v2.0 lives in `docs/`; blueprint v1.0 in `docs/vdesk-blueprint-v1.0.md`.

## 2. Decisions (ADR summary)

| # | Date | Decision | Why | Status |
|---|---|---|---|---|
| ADR-001 | 2026-09-15 | Frontend restructured from static HTML to React 19 + Vite; **UI pixel-identical**, verified by DOM+screenshot diff | Client approved the design; only code structure was in scope | done |
| ADR-002 | 2026-09-15 | Backend deferred; site ships frontend-only with localStorage for leads/telemetry | Owner request ("currently only frontend") | active |
| ADR-003 | 2026-09-15 | Backend stack: Node 22 / Express 5 / MongoDB / Redis / BullMQ / Razorpay / S3 (see `modules.md` §1) | PRD §67 recommends PostgreSQL; MongoDB chosen for document-shaped catalog and team familiarity with MERN. Revisit if reporting needs heavy joins → add warehouse export rather than switching OLTP DB | superseded in part — the database is PostgreSQL since ADR-010 (PRD §67 was right); Redis/BullMQ deferred by ADR-008 |
| ADR-004 | 2026-09-15 | Money stored as integer paise; GST computed at final line | Avoid float drift on invoices | planned |
| ADR-005 | 2026-09-15 | Domain events via transactional outbox, not direct queue publish | Payment/booking events must never be lost | done (ADR-008) |
| ADR-006 | 2026-09-15 | API field names mirror existing `src/features/*` objects | Switch-over is transport-only; no client data-model rewrite | planned |
| ADR-007 | 2026-10-08 | Pricing is paise-exact: intermediate amounts (discounts, GST) are kept exact and rounded **once, at the final total**; the API does **not** copy the client's per-step rupee rounding | Owner-approved; rules.md §13 and invoice reconciliation to the paisa. Totals can differ from today's client by under ₹1 (e.g. Nashik annual VO + GST + mail: client ₹21,501, API ₹21,500.54); the frontend shows API totals at switch-over | active |
| ADR-008 | 2026-10-12 | **MongoDB is the queue, the outbox and the job store; no Redis / BullMQ for now.** Outbox = `domain_events` written in the same transaction as the change, delivered by a worker process (`npm run worker`) to idempotent handlers (at least once, 8 attempts, DEAD after). Background queues (notifications) claim items with a lease. The datastore is PostgreSQL since ADR-010, which has transactions everywhere, so the replica-set requirement and the "outbox writes are not atomic locally" warning are gone | One datastore to run, back up and secure; the volumes are small (leads, bookings, messages per day, not per second); the patterns were already in the code (notifications lease queue, booking unique-index slots). **Bring in Redis when any of these happens:** more than one API instance (in-memory rate limits stop being shared), job throughput needs sub-second latency or > ~50 jobs/s, many cron-style jobs need exact scheduling, or a cache is needed for the catalog bundle | active |
| ADR-009 | 2026-10-27 | **Customers sign in with a phone OTP; they are not staff users.** Own `customers` table, own token type (`typ: customer`), own refresh cookie (`vd_crt`, path `/api/v1/auth/customer`). The verified mobile number is the account, so one request → verify pair both registers and signs in; a first verify needs a name. Holding a meeting room needs that session, and the booking takes the name, number and email from the account, never from the request | Rooms are real inventory held against a real person; the client already asked for a mobile + OTP, and keeping customers out of `users` means a portal sign-in can never reach a staff permission. Codes are stored as a peppered hash, 5 minutes, single use, 5 wrong tries, 5 sends per 30 min per number | active |
| ADR-010 | 2026-10-30 | **PostgreSQL (Neon) replaces MongoDB.** One table per former collection, same names and same API field names (repositories alias `created_at AS "createdAt"`); jsonb only where a value was genuinely a sub-document (frozen price breakdowns, status history, attribution touches). Schema lives in `backend/migrations/*.sql`, applied by `npm run migrate`; tests run against a real PostgreSQL (embedded, migrated template cloned per test file). No TTL indexes — the worker purges expired rows hourly (`shared/jobs/purge.js`) | Owner decision (database on Neon, 2026-10-30). What changed for the better: transactions are now available everywhere, so the outbox is always atomic and ADR-008's standalone caveat is gone; queue claims use `SELECT … FOR UPDATE SKIP LOCKED`; CHECK constraints are tested against the JS constants (`test/schema.test.js`). What to watch: the booking rollback stays a compensating write (not a transaction) because the booking must be visible to the Idempotency-Key lookup before its hours are reserved | active — supersedes the MongoDB half of ADR-003 and ADR-008 |
| ADR-011 | 2026-10-30 | **The site and the API both run on Cloudflare Workers; Neon is reached through Hyperdrive.** The API is the same Express app, handed to the Workers lifecycle by `httpServerHandler` (`src/cloudflare/entry.js`); background jobs run on cron triggers (every minute for the outbox and the message queue, hourly for the row purge) instead of the worker process's 1-second loop. Two things had to change to fit the runtime: password hashing moved from the native `argon2` addon to pure-JS argon2id (`@noble/hashes`) in the same PHC format, because Workers cannot load native addons and cannot compile WebAssembly at runtime; and the access log is now ours (`shared/middleware/httpLogger.js`) because `pino-http` reads pino internals that the Workers bundle does not expose | Owner decision (deploy both on Cloudflare, 2026-10-30). **Consequences to know:** staff password sign-in needs the Workers **Paid** plan — an argon2id hash costs ~460 ms of CPU and the free plan allows 10 ms, so `/auth/login` fails intermittently with Cloudflare 1102; every other route is I/O-bound and fits the free plan. Hyperdrive query caching must stay **disabled** (a read right after a write was served stale: "ask for a code first" immediately after asking for one). `NODE_ENV=production` must be set as a Worker var or the API hands out OTP codes and drops `Secure` from cookies. Rate limits are per isolate rather than per API instance, so they are weaker than on a server — move to Cloudflare's rate-limiting binding if that starts to matter | active |

## 3. Frontend integration points (what the backend must satisfy)

| Client module | Today | API target | Notes |
|---|---|---|---|
| `features/crm/leadStore.js` | localStorage `VDESK_LEADS` | `POST/GET/PATCH /leads` | client generates `VD-…` ids; accept them idempotently |
| `features/analytics/telemetry.js` | localStorage `VDESK_TELEMETRY_LOG` (200 events) | `POST /analytics/events` | fire-and-forget; keep local copy for admin offline view |
| `features/catalog/catalogStore.js` | bundled `src/data/*` | `GET /catalog` | bundled data stays as fallback |
| `features/search/*` | client-side `parseSearchIntent` | `GET /search` | share the parser; server adds ranking/synonyms |
| `features/quote/*`, `virtualOffice/voConfigurator.js` | in-memory | `POST /pricing/quote-preview`, `/quotes` | pricing rules must reproduce current numbers (see §4) |
| `features/meetingRooms/roomBooking.js` | in-memory 10-min timer | `/bookings/hold` + expiry job | hold TTL 599 s in UI |
| `features/checkout/*` | simulated | Razorpay intent + webhook | invoice split CGST/SGST 9 %+9 % today |
| `features/kyc/kyc.js` | toast only | `/kyc` + signed uploads | never store docs in localStorage (PRD §47) |
| `features/portal/customerPortal.js` | static demo data | `/me/*` | customer auth exists (ADR-009): the portal reads `/auth/customer/me` and `/bookings/mine`; subscriptions, documents and invoices are still sample data |
| `features/admin/*` | reads leadStore | admin endpoints + RBAC | admin key/JWT via `x-admin-key` → Bearer later |

## 4. Business numbers currently hard-coded in the client (must move to `pricing_rules`)

- VO add-ons: GST compliance +₹350/mo, mail forwarding +₹299/mo, meeting credits +₹999/mo, incorporation +₹2,999 one-time
- Annual discount 20 %; GST 18 %
- City adjustments: Nashik 0, Pune +200, Mumbai +750, Delhi +550, Bangalore +500, Hyderabad +350, Gurgaon +650, Noida +250
- Meeting rooms: duration discount 10 % ≥4 h, 20 % ≥8 h; hold 10 min
- Enterprise: ₹7,999/desk base; bulk rebate 5/15/25/35 % at <50/50/100/200 desks
- Lead score: base 40, +20 phone, +15 corporate email, +10 company, +15 QUALIFIED
- Wizard bundle: ≥3 services → 15 % off
- Demo customers/leads (Zenith D2C, Patel & Associates, Artisan Commerce, Acme Tech) are **fixtures**, not real data

## 5. Constraints & gotchas

- Owner (Vaibhav) designs the UI; backend must not require markup changes. Any new UI (login, portal views) is a design task first.
- Old static URLs (`/virtual-office.html` …) are redirected client-side; the server SPA fallback must also serve `index.html` for them.
- WhatsApp number `+91 98765 43210` and emails in the codebase are placeholders — confirm real numbers before wiring messaging.
- Trust claims (“100 % GST approval”, “2,400 reviews”) must be admin-substantiated before they are served from the CMS (PRD §22).
- `_archive/legacy-static-site/` is the visual regression reference; do not delete until the client signs off on the React build.
- Windows dev machines: `npm run dev:pg` starts a throwaway PostgreSQL (downloaded binaries, no Docker), migrates it and runs the API plus worker in one process. `npm run dev` with `DATABASE_URL` set works against Neon directly.

## 6. Open questions (assign an owner, close with a decision)

| Question | Owner | Due |
|---|---|---|
| Razorpay vs Cashfree as primary? Merchant account status? | Owner | Phase 2 start |
| Customer login: phone OTP only, or email+password too? | Owner / design | Phase 2 |
| E-sign provider for agreements (Leegality / DocuSign / none for MVP)? | Owner | Phase 2 |
| GSTIN and invoice series format required by the CA | Finance | Phase 2 |
| Which cities are live at launch (catalog has 10)? | Ops | Phase 1 |
| Data retention period for rejected KYC files | Compliance | Phase 2 |

## 7. Glossary

APOB/PPOB — additional/principal place of business (GST) · ARN — GST application reference number · NOC — landlord no-objection certificate · SPICe+ — MCA incorporation form · MRR/ARR — monthly/annual recurring revenue · Hold — temporary room reservation before payment

## 8. Session log

- **2026-09-15** — Static site → React/Vite restructure completed and verified (22 page/viewport diffs, ≤0.14 % pixels). Express/Mongo backend prototype built (12 integration tests passing) then removed on owner request; this plan captures it for when the backend phase starts.
- **2026-10-06** — `crm` leads module built. Decisions not covered by the plan: client `id` is stored/returned as `ref`;
  public `POST /leads` returns only `{ ref, createdAt }` so replaying a known ref cannot read another visitor's
  details; pipeline allows one step forward or `LOST` from open stages (`WON`/`LOST` final) — the admin board's
  "click to advance" wraps WON → NEW and its status dropdown sets any status, so both need adjusting at switch-over;
  score keeps the client's "+15 only while QUALIFIED" behaviour; staff notes go to `lead_activities`, the visitor's
  message stays in `notes`. Rate limiting/CAPTCHA deferred until shared middleware exists.
- **2026-10-07** — `search` module built (public `GET /search`, `/suggest`, `/popular`; staff synonyms list, redirect
  and config CRUD behind `x-admin-key`). Decisions (owner-approved): **no MongoDB text index in Phase 1** — search
  reads centres/workspaces/cities through catalog's public service and filters/ranks in memory (catalog is ~20 rows;
  Atlas Search in Phase 4); business services are a search-owned `search_services` collection seeded from
  `frontend/src/data/services.js` (`startingPrice` → `starting_price_paise`, other fields unchanged); synonyms are
  GET-only and seeded empty; `search_config` holds keyed entries (`promotedCentres`, `popularSearches`) instead of a
  separate `popular_searches` collection, seeded with the client /search page chips; centres in results get the
  client's fixed capacity 10 but `rating`/`reviews` are `null` instead of the client's invented 4.9 / 160+n (frontend
  must handle null at switch-over). Implementation choices: intent parsing is a line-for-line port of the client
  (quirks kept); result prices are `price_month_paise` while the `maxPrice` filter stays in rupees (as catalog);
  no `maxPrice` = no price cap (the two client screens default to 15 000 and 75 000 and will send their own); results
  use catalog `ref`s where the client used `id`; redirects match the exact normalised query before synonyms and only
  accept site-relative targets; zero results relax capacity → type → city (never price).
- **2026-10-08** — `identity`, `analytics` and `pricing` built. Decisions not covered by the plan:
  - **identity:** staff only (customer OTP stays Phase 2 / open question); no public `/register` — staff are created
    by a SUPER_ADMIN (`/auth/users`) or `scripts/create-admin.js`. MFA is mandatory for *every* staff role (rules.md
    §19 says "admin accounts"; all staff can see customer data). Sign-in is two-step: password → 5-min MFA token →
    TOTP code; TOTP is RFC 6238 on `node:crypto`, secrets AES-256-GCM sealed with a separate `MFA_ENCRYPTION_KEY`
    and stored on the user (no `mfa_secrets` collection). Access JWT 15 min (HS256, `jose`), refresh 7 days, rotating,
    family revoked on reuse after a 10 s grace (parallel tabs). One lockout counter for passwords and codes (5 → 15
    min). Every request reloads the user so disable/demote is immediate. Permissions map lives in
    `identity.constants.js`; `requireStaff(permission)` now guards crm and search staff routes and still accepts
    `x-admin-key` (full access) until the admin console signs in — remove it then.
  - **refresh cookie:** `SameSite=Strict` (rules.md §19) means the site and API must be on the same registrable
    domain (e.g. `vdesk.in` + `api.vdesk.in`); a `*.pages.dev` site calling another domain would never send it.
  - **rate limiting:** shared in-memory per-IP limiter (off under `NODE_ENV=test`) on sign-in, refresh, `POST /leads`,
    analytics ingest and pricing writes. Needs `TRUST_PROXY` behind Cloudflare, and Redis once there is more than one
    API instance. Per-phone/email limits and CAPTCHA still pending for `/leads`.
  - **analytics:** regular collection, not time-series (unique dedupe key needed for safe retries); 13-month TTL; KPIs
    and funnel aggregated on read, no `kpi_daily` yet; funnel counts events (no client session id). PII stripped and
    masked server-side. Lead and revenue KPIs stay with crm / orders, not client-reported events.
  - **pricing:** money in paise, rates in basis points; paise-exact per ADR-007 (discount and GST kept exact via
    `shared/lib/money.js`, one half-up rounding at the total, lines allocated from it so they reconcile), so
    figures can differ from the client's whole-rupee rounding by < ₹1 — the client shows API figures after
    switch-over. Defaults in code mirror the frontend (drift test reads `frontend/src`); staff overrides replace a
    whole rule key. Products: virtual office (annual 20 % applies to the whole subtotal incl. incorporation, as the
    client does), meeting rooms (by room format name, not catalog workspace), enterprise desks, wizard bundle
    (treated as GST-inclusive because the wizard says "All-Inclusive" — **confirm with the owner**). The
    lease-vs-V-DESK ROI calculator stays client-side (an estimate, not a price). Quotes: server-generated unguessable
    `VDQ-` refs (the client's `VDQ-YYYY-NNNN` is guessable and the link shows name + company), `Idempotency-Key`
    required, line items embedded and frozen, 14-day validity with expiry read-time (no job yet), customer may
    VIEW/ACCEPT/REJECT via the link. PDF deferred until the job queue exists.
- **2026-10-08 (integration)** — a parallel local pricing build (`backup/pricing-quote-preview`, rule-per-document
  model, VO only) was superseded by the more complete remote module; only `shared/lib/money.js` (+ tests) and ADR-007 were
  kept. The remote engine originally rounded discount and GST on their own lines; `summarise()` now follows ADR-007:
  exact net and GST, one rounding at the total; discount = subtotal − rounded net, GST = total − taxable (GST-inclusive
  bundle: taxable carved out of the rounded total). Totals for today's whole-rupee prices are unchanged; odd-paise
  rule overrides can differ from per-line rounding by ±1 paisa. Quotes already stored keep their frozen breakdown.
- **2026-10-11** — `booking` built (meeting rooms only). Decisions (owner-approved): rooms are booked by catalog
  `centreRef` + room format name from pricing's `meeting_room` rule (not catalog workspaces); one-hour slots
  09:00–20:00 Asia/Kolkata; confirmation is staff-only (`bookings:write`) until orders confirms on a verified payment —
  no payment is recorded or implied; guests book with validated contact details (name + Indian mobile required).
  Implementation choices: **no Redis / job queue** — overlaps are stopped by a unique index on `booking_slots`
  (centre, room, date, hour), one document per hour; a hold inserts the booking (claims the Idempotency-Key) then its
  hours, and on a clash or error deletes what it inserted (compensating rollback; local/test Mongo is standalone, so
  no transactions). Expiry is read-time plus a TTL index; lapsed hold slots are also deleted before each insert so
  they never block. Confirm claims the booking (HELD → CONFIRMED while unexpired) before making slots permanent; a
  hold missing any hour is cancelled by `system`. Customers may cancel only holds; staff cancel confirmed bookings
  (no refund). The public view and pass carry no guest details (the client's pass shows the host name from its own
  form state). Bookable window today … +90 days; attendees ≤ the room's seats; ≤ 3 live holds per mobile. Roles:
  `bookings:read` OPS_ADMIN + SALES_MANAGER, `bookings:write` OPS_ADMIN — SALES_EXEC left out so its permission set
  is unchanged. Frontend switch-over: send `date` as YYYY-MM-DD and `startTime` HH:00 instead of the slot label,
  display API totals (₹1,885.64 vs the client's ₹1,885), and use the API ref instead of `BK-` + timestamp.
- **2026-10-11 (review)** — booking correctness fixes before push: confirmation now makes slots permanent *before*
  `HELD → CONFIRMED` (it used to flip the status first, so a crash in between left a CONFIRMED booking whose slots
  then expired — a double-booking risk — and a pass could be issued for a booking without secured hours). A slot
  now blocks its hour only while its booking is live (not CANCELLED/EXPIRED/lapsed/missing), so a crash between a
  status change and the slot clean-up cannot block hours forever. A replayed Idempotency-Key whose original is still
  reserving gets `409 IDEMPOTENCY_KEY_IN_PROGRESS` instead of a ref that might be rolled back. Acting on a lapsed hold
  always answers `HOLD_EXPIRED`.
- **2026-10-11 (review 2)** — accepted limitation, not fixed: if the process dies after saving a hold's booking but
  before reserving all its hours (and before rollback), replays of that Idempotency-Key get `409
  IDEMPOTENCY_KEY_IN_PROGRESS` until the hold lapses (≤ 600 s; `details.expiresAt` now says when), then replay as
  `EXPIRED` permanently. No duplicates are possible and the hours it inserted are blocked only for that window. Early
  takeover/cleanup was rejected: a crashed request is indistinguishable from a slow one (e.g. a Mongo failover), and
  taking over risks two writers on one booking's slots or two answers for one key. Revisit if real traffic shows it
  (e.g. with multi-document transactions on Atlas, which would make the hold atomic and remove the state entirely).
- **2026-10-11** — gaps filled in finished modules:
  - **catalog staff endpoints** (`/catalog/admin/*`, new `catalog:manage` → OPS_ADMIN): refs continue the seeded
    numbering per city/centre code (`CTR-NSK-003`, `WS-MUM-004`) and are never reused (deleted ones count); new city
    refs are `CITY-<SLUG>` (not a 3-letter code). A centre's city and a workspace's centre are fixed at creation;
    renaming a city rewrites the copied `city` name on its centres and workspaces. `active:false` = hidden from the
    public API; DELETE = soft delete, refused while children exist. Image upload waits for the storage integration.
  - **crm:** CSV export behind a new `leads:export` permission (SALES_MANAGER only — bulk contact data); formula
    injection guarded, UTF-8 BOM for Excel, each export logged. UTM attribution stored as `attribution.firstTouch /
    lastTouch` on the lead (no separate `campaigns` collection yet); referrer/landing URLs stored without query
    strings. Per-contact limit 3 / hour per mobile (last 10 digits) or email — also protects strangers from being
    spammed once notifications send WhatsApp confirmations. Turnstile CAPTCHA is wired but **off until
    `TURNSTILE_SECRET_KEY` is set and the website sends tokens**; it fails closed (503) if Cloudflare is down.
  - Still blocked: quote PDF + expiry job (job queue), catalog images (storage), lead → customer conversion
    (customer accounts), GA4 forwarding (owner's GA4 keys).
- **2026-10-11** — `orders` foundation built; **payments and invoices deliberately not built** — the provider
  ("Razorpay vs Cashfree, merchant account") and "GSTIN and invoice series format" are still open (§6), no credentials
  exist, and an invoice follows a payment. Doc conflicts noted, not resolved: modules.md gives the series
  `INV-2026-27-000123` while §6 says the format is unconfirmed; the frontend invoice shows GSTIN `27AAYFV9842K1Z5` /
  SAC `997212`, which are treated as unconfirmed like the other placeholders (§5). **No order lifecycle was
  documented**, so the minimum was used — `PENDING_PAYMENT → PAID | CANCELLED | EXPIRED` — **confirm with the owner**.
  Other choices to confirm: quotes must be ACCEPTED (the customer accepts on the share link first) and still within
  `validUntil`; bookings must be HELD; an open booking order expires with the hold and is cancelled by the system if
  the booking is cancelled, expires or is confirmed by staff (paid offline). Orders store no customer details (the
  source holds them) and write only to `orders`, so no cross-module compensation exists. One open order per source
  (partial unique index); a second attempt gets 409 `ORDER_ALREADY_OPEN` with the open order's ref. `orders:read`
  → OPS_ADMIN, SALES_MANAGER, FINANCE. When payments land, the payment intent must re-check the source (the hold
  is only 10 min) and booking needs its `PAYMENT_PENDING` state.
- **2026-10-11** — `notifications` v1 foundation built; **nothing is sent yet**. Blocked, not worked around:
  (1) no provider — email "Resend / SES" undecided, no WhatsApp BSP, no credentials, and sender numbers/emails
  are placeholders (§5), so only the provider contract + a fake exist; (2) no event bus/outbox (ADR-005) — crm
  does **not** call `notify()` directly, because rules.md §4 requires events for cross-module side effects, so the
  Phase 1 lead confirmation and sales alert wait for the event bus; (3) no job queue — `processDueNotifications()`
  exists for a worker but nothing schedules it. Choices: the log doubles as a durable queue (Mongo, lease-based
  claims, 60 s lease, claim token), retries 1/5/30 min with max 4 attempts, unknown provider errors count as
  transient, ACCEPTED (not DELIVERED) is the success state, templates are plain text only, rendered content is
  cleared once final, staff see masked recipients and no content. Crash between provider acceptance and recording
  → retried with the same provider idempotency key (at-least-once for providers without one). Template keys are
  never reused. Roles: `notifications:manage` OPS_ADMIN + CONTENT, `notifications:read` OPS_ADMIN. The message
  wording for the lead confirmation / sales alert is not documented — **owner/content to write them as templates**.
- **2026-10-12** — background worker, event outbox and transactions built (ADR-008). Choices: tests share one
  single-node replica set (vitest `globalSetup`) with a database per test file — this also fixed the local flakiness
  where 25+ in-memory servers starting at once timed out; `dev:memory` runs a replica set plus the worker in-process;
  a standalone local `mongod` still works for development with a startup warning (writes and events not atomic),
  production refuses it. First flow wired: crm saves the lead, its activity and `lead.created` in one transaction;
  notifications handles it by queuing `lead.confirmation.email` / `lead.confirmation.whatsapp` to the visitor and
  `lead.sales_alert` to `SALES_ALERT_EMAIL` — **only once staff create those templates** (wording is the owner's), and
  only with variables the lead actually has (`name`, `ref` always; `service`, `city`, `company` when given). Nothing
  is sent until a messaging provider is chosen; the worker's sender job is added automatically when one is configured
  in `src/jobs.js`. Event payloads carry refs only — handlers read details through the owning module's service.
- **2026-10-12** — `cms` built. Decisions: one `content_entries` collection for all types (faqs, testimonials,
  guides, legal, trust-claims, seo) with a `draft` and a `published` copy, optimistic versions and an append-only
  `content_revisions` log, instead of seven collections — they share one workflow. Public shapes equal the
  frontend data files (FAQ items stay `[question, answer]` pairs). Legal HTML is sanitised server-side with
  `sanitize-html` (new dependency) because the frontend renders it as HTML. Trust claims need `content:approve`
  (SUPER_ADMIN) **and** an evidence note to publish; the seed creates the homepage figures as unapproved drafts.
  `blog_posts` from the plan = the existing resource guides; banners / homepage sections not built (no data source
  yet). `sitemap.xml` is generated from catalog + search services + published content and needs `SITE_URL` — the
  site domain is still an owner decision. search gained a read-only `listServices()` export for it.
- **2026-10-27** — customer sign-in and registration built (ADR-009), and meeting-room holds moved behind it.
  Decisions: the mobile number is the account, so request → verify both registers and signs in and there is no
  separate `/register` endpoint to keep in step; a first verify needs a name, which is why `/auth/otp/request`
  answers `isNewAccount` (the sign-in form asks for the name only then). Customers live in their own table with
  their own token type and cookie, so a portal session can never reach a staff permission — and a staff token is
  refused on portal routes. Codes: 6 digits, 5 minutes, single use, hashed with a pepper, 5 wrong tries, and per
  number 1 send / 30 s and 5 per 30 min on top of the per-IP limit. The code is checked **before** the name is
  required, so someone who typed the right code is never sent back to a dead one. Delivery goes through
  notifications' `customer.otp` template — until staff write it, nothing is sent, and outside production the API
  returns the code so local and test sign-in work without an SMS provider. `POST /bookings/hold` now needs that
  session and takes the name, mobile and email from the account: the request schema drops them, so a booking can
  never be made in someone else's name. A booking records `customerRef`, which is what `GET /bookings/mine` and
  the portal read. Still open: the OTP's rendered text sits in the notifications queue in the clear (it has to, to
  be sendable) — if that becomes a concern, store the variables instead and render in the sender.
- **2026-10-30** — MongoDB → PostgreSQL on Neon (ADR-010), owner's decision. One table per collection, same names,
  and the repositories alias columns back to the API's field names, so services, mappers, controllers and the API
  contract did not change; jsonb only where a value was genuinely a sub-document. What the move improved: real
  transactions everywhere (ADR-008's "writes and their events are not atomic locally" warning is gone), queue
  claims via `SELECT … FOR UPDATE SKIP LOCKED`, partial unique indexes expressing the rules exactly ("one open
  order per source", "one live entry per (type, key)"), a generated column for the per-mobile hold cap, and CHECK
  constraints that `test/schema.test.js` compares against the JS constants so the two cannot drift. What needed a
  decision: there are no TTL indexes, so the worker purges expired rows hourly (`shared/jobs/purge.js`) — nothing
  depends on it for correctness, since every expired row is already refused on read; the two queue tables and the
  lead timeline use counting keys, because rows written in the same statement share a timestamp and uuids have no
  order; `updated_at` is kept current by one trigger per table rather than by every UPDATE remembering it. Tests
  run against a real PostgreSQL: `globalSetup` migrates a template database once and each test file clones it
  (`CREATE DATABASE … TEMPLATE`), which is why 33 files still finish in about a minute. Bugs the suite caught
  during the port, both now covered: a four-column search clause only substituted its first parameter, and the
  notification queue claimed rows in an undefined order when two fell due in the same millisecond.
- **2026-10-30** — deployed: site and API on Cloudflare Workers, database on Neon (ADR-011), both on
  `*.shoaibk-mca2024.workers.dev` until a domain is attached; the runbook is `docs/deployment.md`. Four
  things only showed up against the real runtime, and each one is now written down where it bit:
  (1) reading the Hyperdrive binding mints a credential, which Workers forbid at module scope — the
  connection string is handed to `config/db.js` as a function it calls on first use; (2) Hyperdrive caches
  SELECTs by default, which broke read-your-writes (a customer asked for an OTP and was then told to ask
  for one) — caching is off on the `vdesk-neon` config and must stay off; (3) without `NODE_ENV=production`
  as a var, the deployed API answered `/auth/otp/request` with the code it was meant to text and left
  `Secure` off the refresh cookies; (4) an argon2id hash costs ~460 ms of CPU, and Workers free allows
  10 ms, so staff sign-in needs the Paid plan — the customer journey (OTP sign-in, catalog, search,
  booking, quotes, leads) is I/O-bound and fine either way. A Worker also cannot hold the 1-second job
  loop, so the outbox is delivered by a per-minute cron: a lead confirmation now leaves within a minute
  rather than a second, and `npm run worker` on any always-on host still works against the same database
  if that needs to be faster. Verified on the deployment: health, readiness through Hyperdrive, the public
  catalog, customer registration and sign-in, the booking gate, holding a room, `/bookings/mine`, session
  refresh and sign-out (`scripts/smoke.mjs`, 16/16), and a real lead whose `lead.created` event was
  delivered to both notification handlers by the cron 36 s later.
