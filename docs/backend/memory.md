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
| ADR-003 | 2026-09-15 | Backend stack: Node 22 / Express 5 / MongoDB / Redis / BullMQ / Razorpay / S3 (see `modules.md` §1) | PRD §67 recommends PostgreSQL; MongoDB chosen for document-shaped catalog and team familiarity with MERN. Revisit if reporting needs heavy joins → add warehouse export rather than switching OLTP DB | planned |
| ADR-004 | 2026-09-15 | Money stored as integer paise; GST computed at final line | Avoid float drift on invoices | planned |
| ADR-005 | 2026-09-15 | Domain events via transactional outbox, not direct queue publish | Payment/booking events must never be lost | planned |
| ADR-006 | 2026-09-15 | API field names mirror existing `src/features/*` objects | Switch-over is transport-only; no client data-model rewrite | planned |
| ADR-007 | 2026-10-08 | Pricing is paise-exact: intermediate amounts (discounts, GST) are kept exact and rounded **once, at the final total**; the API does **not** copy the client's per-step rupee rounding | Owner-approved; rules.md §13 and invoice reconciliation to the paisa. Totals can differ from today's client by under ₹1 (e.g. Nashik annual VO + GST + mail: client ₹21,501, API ₹21,500.54); the frontend shows API totals at switch-over | active |

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
| `features/portal/customerPortal.js` | static demo data | `/me/*` | needs customer auth first |
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
- Windows dev machines: use `npm run dev:memory`-style in-memory Mongo for local work if Docker/Mongo is unavailable.

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
