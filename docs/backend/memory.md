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
