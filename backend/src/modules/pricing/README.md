# Pricing module

Pricing engine, quotes and the rules behind them (PRD §41, §55). Integer paise and basis points throughout
(1800 bp = 18 %).

- **Mounted at:** `/api/v1/pricing`
- **Build phase:** 1 (preview) · 2 (quotes)
- **Collections:** `pricing_rules` (staff overrides), `quotes` (line items embedded, frozen at creation)
- **Reads (via `catalog/index.js`):** centres, for virtual office prices
- **Frontend that will call it:** `features/virtualOffice/voConfigurator.js`, `features/quote/*`,
  `pages/account/QuotePage.jsx`, `features/meetingRooms/roomBooking.js`, `features/enterprise/enterpriseSuite.js`,
  `features/wizard/setupWizard.js`

## Endpoints (relative to the mount path)

| Method   | Path                  | Access                | What it does                                                      |
| -------- | --------------------- | --------------------- | ----------------------------------------------------------------- |
| `POST`   | `/quote-preview`      | public (rate-limited) | An item (below) → priced breakdown; nothing stored                |
| `POST`   | `/quotes`             | public (rate-limited) | `{ name, company?, item }` + `Idempotency-Key` header → 201 quote |
| `GET`    | `/quotes/:ref`        | public (share link)   | The quote                                                         |
| `PATCH`  | `/quotes/:ref/status` | public (share link)   | `{ status: "VIEWED" \| "ACCEPTED" \| "REJECTED" }`                |
| `GET`    | `/quotes`             | `quotes:read`         | Staff list with status history. `?status=&cursor=&limit=`         |
| `GET`    | `/rules`              | `quotes:read`         | Effective rules per key, with `source: default \| custom`         |
| `PUT`    | `/rules/:key`         | `pricing:manage`      | `{ value }` — a complete value for `tax`, `virtual_office`, …     |
| `DELETE` | `/rules/:key`         | `pricing:manage`      | Drop the override; the key falls back to its default              |

### Items

```jsonc
{ "product": "virtual_office", "centreRef": "CTR-NSK-001", "tenure": "annual",          // or "monthly"
  "purpose": "GST Registration", "addons": { "gst": true, "mail": true, "meetingCredits": false, "incorporation": false } }
{ "product": "meeting_room", "room": "Conference Room", "hours": 2 }                     // 1–12 hours
{ "product": "enterprise_desks", "desks": 50, "months": 12 }                             // months default 12
{ "product": "bundle", "services": ["virtual-office", "gst-registration", "company-incorporation"] }
```

### Breakdown (preview, and `pricing` on a quote)

```jsonc
{ "product": "virtual_office", "label": "Nashik Virtual Office Platform", "tenure": "12 Months",
  "rate_month_paise": 124900, "currency": "INR",
  "lines": [{ "code": "vo_base", "label": "…", "quantity": 12, "unit_paise": 124900, "amount_paise": 1498800 }, …],
  "subtotal_paise": 2277600,
  "discount": { "label": "Annual commitment discount", "rate_bp": 2000, "amount_paise": 455520 },   // or null
  "taxable_paise": 1822080,
  "gst": { "rate_bp": 1800, "amount_paise": 327974, "inclusive": false },
  "total_paise": 2150054 }
```

## How prices are worked out (`pricing.engine.js`)

| Product            | Formula                                                                                                                            |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `virtual_office`   | (centre `vo_price` + city adjustment + monthly add-ons) × months + incorporation; −20 % on the whole subtotal if annual; +18 % GST |
| `meeting_room`     | hourly rate × hours; −10 % from 4 h, −20 % from 8 h; +18 % GST                                                                     |
| `enterprise_desks` | ₹7,999 × desks × months; −5 / 15 / 25 / 35 % from 1 / 50 / 100 / 200 desks; +18 % GST                                              |
| `bundle`           | sum of fixed service prices; −15 % from 3 services; **GST included** (the wizard says "All-Inclusive")                             |

- **Rounding (ADR-007):** paise-exact. Discount and GST are kept exact (`shared/lib/money.js`) and only the total is
  rounded (half-up, once). The lines are allocated from that total: discount = subtotal − rounded net, GST = total −
  taxable (for the GST-inclusive bundle, taxable = total ÷ 1.18), so they always add up. The client rounds discount and
  GST to whole rupees per step, so its figures can be up to ₹1 different (e.g. ₹21,501 vs ₹21,500.54). After switch-over the
  client shows the API's figures.
- **Defaults** (`DEFAULT_PRICING_RULES`) are today's frontend numbers. `pricing.engine.test.js` reads
  `frontend/src` and fails if they drift apart — change both, or override in the DB.
- **Overrides replace a whole key** (no partial merge), validated per key; quotes already issued keep their prices.

## Quotes

- **Refs** look like `VDQ-MUZIV7ZQ88IWKNTX`: the ref _is_ the share link, so it carries 8 random characters.
- **Idempotency** (rules.md §10): `Idempotency-Key` is required. The same key with the same body → `200` with the original
  quote; with a different body → `409 IDEMPOTENCY_KEY_REUSED`.
- **Statuses:** `SENT → VIEWED → ACCEPTED | REJECTED`, any open status → `EXPIRED`
  (`QUOTE_TRANSITIONS`). Repeating the current status is a no-op; `VIEWED` only records the first open of a `SENT`
  quote. Illegal moves → `409 INVALID_STATUS_TRANSITION`.
- **Validity:** 14 days. An open quote past `validUntil` reads as `EXPIRED`; accepting it → `409 QUOTE_EXPIRED` and the
  status is saved. There is no expiry job yet, so a staff `?status=SENT` list can include quotes that read as `EXPIRED`.
- **Public view** has no email, phone or internal fields; staff get the `history` timeline as well.

## Not built yet

Quote PDF (`GET /quotes/:ref/pdf` — needs a PDF library and the job queue, rules.md §28), staff-drafted quotes
(`DRAFT`), expiry job, lead ↔ quote link, coworking / private-office pricing (the client has only the ROI estimator).
