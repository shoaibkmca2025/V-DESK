# Orders module

Orders for quotes and meeting-room bookings — the provider-independent foundation of checkout. **Payments and GST
invoices are not implemented yet** (see "Blocked" below); nothing in this module records or implies a payment.

- **Mounted at:** `/api/v1/orders`
- **Build phase:** 2
- **Collections:** `orders` (frozen price breakdown embedded; no customer details). `payments`, `invoices` and
  `refunds` are not created until their requirements are confirmed.
- **Reads (via `pricing/index.js`, `booking/index.js`):** `getQuote`, `getBooking` — status, frozen price breakdown and
  deadline. No other module's data is written.
- **Frontend that will call it:** `features/checkout/checkout.js` (today it simulates payment), later
  `features/checkout/taxInvoice.js`

## Endpoints (relative to the mount path)

| Method | Path           | Access                | What it does                                                                |
| ------ | -------------- | --------------------- | --------------------------------------------------------------------------- |
| `POST` | `/`            | public (rate-limited) | `{ source: { type: "quote" \| "booking", ref } }` + `Idempotency-Key` → 201 |
| `GET`  | `/:ref`        | public (order ref)    | The order                                                                   |
| `POST` | `/:ref/cancel` | public (order ref)    | Abandon an unpaid order                                                     |
| `GET`  | `/`            | `orders:read`         | Staff list with status history. `?status=&sourceType=&cursor=&limit=`       |

`orders:read` = OPS_ADMIN, SALES_MANAGER, FINANCE (SUPER_ADMIN and the legacy `x-admin-key` too).

### Order (public view)

```jsonc
{ "ref": "ORD-MUZIV7ZQ88IWKNTX", "status": "PENDING_PAYMENT",
  "source": { "type": "booking", "ref": "BK-…" },
  "description": "Conference Room (8 Pax) — V-DESK Headquarters — College Road", "tenure": "2 Hours",
  "currency": "INR", "total_paise": 188564,
  "pricing": { "currency": "INR", "lines": […], "subtotal_paise": 159800, "discount": null, "taxable_paise": 159800,
               "gst": { "rate_bp": 1800, "amount_paise": 28764, "inclusive": false }, "total_paise": 188564 },
  "expiresAt": "…", "createdAt": "…", "updatedAt": "…" }
```

No names, contact details, `_id` or idempotency data — orders store no customer details at all (they live on the
quote / booking). Staff see the `history` timeline as well.

## Rules

- **Sources:** a quote must be `ACCEPTED` and within `validUntil` (`409 SOURCE_NOT_PAYABLE` / `409 QUOTE_EXPIRED`); a
  booking must be `HELD` (`409 SOURCE_NOT_PAYABLE`). Unknown refs → `404 QUOTE_NOT_FOUND` / `BOOKING_NOT_FOUND`.
- **Price:** the source's server-computed breakdown is copied and frozen (ADR-007, paise). Before it is stored it must
  reconcile to the paisa — lines = subtotal, subtotal − discount + GST = total (or taxable + GST = total when GST is
  included) — or the request fails with `500 PRICING_INCONSISTENT`. Client-sent amounts are dropped; later rule
  changes never alter an order.
- **Idempotency** (rules.md §10): `Idempotency-Key` is required. Same key + same body → `200` with the original order;
  different body → `409 IDEMPOTENCY_KEY_REUSED`; parallel requests with one key create one order.
- **One open order per purchase:** a partial unique index allows one `PENDING_PAYMENT` order per quote / booking.
  Another attempt (any key, including in parallel) → `409 ORDER_ALREADY_OPEN` with `details.ref` of the open order.
  Once it is cancelled or expired a new order can be created.
- **Statuses** (`ORDER_TRANSITIONS`): `PENDING_PAYMENT → PAID | CANCELLED | EXPIRED`; the others are final. Illegal moves
  → `409 INVALID_STATUS_TRANSITION`. **No endpoint sets `PAID`** — only a verified gateway payment will.
- **Deadline:** an open order reads `EXPIRED` from the quote's `validUntil` or the booking hold's `expiresAt`. If its
  booking is no longer `HELD` (cancelled, expired, or confirmed by staff) the system cancels it (`reason:
SOURCE_UNAVAILABLE`). Both are saved, with conditional writes, whenever the order is read, cancelled, or a new
  order for its source is attempted (there is no job queue).
- **Cancel:** open → `CANCELLED`; repeating is a no-op; an expired order → `409 ORDER_EXPIRED`; a paid one → `409
INVALID_STATUS_TRANSITION`. Cancelling an order does not touch its booking (the hold lapses on its own).
- **Consistency:** creating, cancelling or expiring an order writes only the order, so there is no cross-module
  partial failure to compensate; source state is re-read through the public services, never stored.
- **Logs** carry order refs, source refs, totals and staff refs — never customer details.

## Blocked (not implemented)

| What                                                                                      | Waiting for                                                                                                                                                                                                                        |
| ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST /payments/intent`, `POST /webhooks/razorpay`, `payments` collection, `PAID`         | Owner decision "Razorpay vs Cashfree as primary? Merchant account status?" (memory.md §6) and sandbox credentials                                                                                                                  |
| `GET /invoices/:no`, invoice numbering, CGST/SGST vs IGST, `invoices` collection          | Finance: "GSTIN and invoice series format required by the CA" (memory.md §6); supplier GSTIN/state per centre; collecting the customer's billing name, GSTIN and place of supply. Also needs payments (an invoice follows payment) |
| `GET /invoices/:no/pdf`                                                                   | Invoices, plus the job queue (rules.md §28)                                                                                                                                                                                        |
| Refunds, `booking` `PAYMENT_PENDING`, confirming a booking on payment, `payment.*` events | Payments; the event bus / outbox (ADR-005)                                                                                                                                                                                         |
| Virtual-office orders without a quote, customer accounts on orders                        | Customer auth (phases.md Phase 2 week 4)                                                                                                                                                                                           |
