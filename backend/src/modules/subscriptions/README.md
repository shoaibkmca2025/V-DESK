# Subscriptions module

Service activation (payment + KYC + ops sign-off), agreements, renewals, grace periods, suspension and cancellation
(modules.md §3.9, PRD §49, §76).

- **Mounted at:** `/api/v1/subscriptions`
- **Build phase:** 2–3
- **Collections:** `subscriptions`, `agreements`, `renewals` (+ shared `audit_log`, `domain_events`)
- **Reads (public APIs only):** orders `getOrder` (paid?), kyc `getApplicationSummary` (approved? whose?)
- **Worker job:** `subscriptions.lifecycle` every 60 s (src/jobs.js)
- **Frontend that will call it:** `features/portal/customerPortal.js`

## Endpoints (relative to the mount path)

| Method | Path                                  | Access                        | What it does                                                       |
| ------ | ------------------------------------- | ----------------------------- | ------------------------------------------------------------------ |
| `GET`  | `/mine`                               | customer                      | The signed-in customer's subscriptions                             |
| `GET`  | `/`                                   | `subscriptions:read`          | Staff list, `?status=&customerId=&cursor=&limit=`                  |
| `POST` | `/`                                   | `subscriptions:write`         | `{ orderRef, kycRef, graceDays }` → PENDING_ACTIVATION (one/order) |
| `GET`  | `/:ref`                               | owner / `subscriptions:read`  | Subscription + agreements + renewals                               |
| `POST` | `/:ref/renew`                         | owner / `subscriptions:write` | Renewal quote for the next period (201 new, 200 existing)          |
| `POST` | `/:ref/activate`                      | `subscriptions:activate`      | First activation, or lifts a staff suspension                      |
| `POST` | `/:ref/suspend`                       | `subscriptions:write`         | `{ reason }` → SUSPENDED                                           |
| `POST` | `/:ref/cancel`                        | `subscriptions:write`         | `{ reason }` → CANCELLED (final); voids open renewal quotes        |
| `POST` | `/:ref/renewals/:renewalRef/apply`    | `subscriptions:write`         | `{ orderRef }` of a PAID order → next period + agreement           |
| `POST` | `/:ref/agreements/:agreementRef/sign` | `subscriptions:write`         | Records an offline signature (no e-sign provider yet)              |

Permissions: `subscriptions:read` → OPS_ADMIN, FINANCE; `subscriptions:write` and `subscriptions:activate` →
OPS_ADMIN. Staff routes need a signed-in user (JWT + MFA); the legacy `x-admin-key` is refused (401).

## Lifecycle

```
PENDING_ACTIVATION ──activate (order PAID ∧ KYC APPROVED for the same customer)──► ACTIVE   [service.activated]
ACTIVE ──period ends (job)──► GRACE ──graceEndsAt (job)──► SUSPENDED (by system)   [grace_started, suspended]
ACTIVE / GRACE ──ops suspend──► SUSPENDED (by staff) ──ops activate──► ACTIVE / GRACE   [suspended, reinstated]
ACTIVE / GRACE / SUSPENDED ──apply paid renewal──► ACTIVE, next period   [subscription.renewed]
any ──ops cancel──► CANCELLED (final)   [subscription.cancelled]
```

- **Activation** reads the order's status from orders and the KYC application's status and owner from kyc at that
  moment. Bodies are strict — no status, price or "paid" flag can be sent.
- **Periods** are calendar months in Asia/Kolkata (`subscriptions.time.js`), `monthly` = 1, `annual` = 12 (the
  order's tenure). Each period gets one agreement (unique per period).
- **Renewals:** one per period (unique). The price is the last period's frozen price. Applying needs a PAID order not
  used by any subscription or renewal; the next period continues from the current end, or starts now if the
  subscription had lapsed (suspended by the system). A staff suspension stays in place.
- **Reminders** (`subscription.renewal_reminder_due`, payload `{ daysBefore, period, periodEnd }`) at T-30, T-7, T-1:
  each period remembers the smallest offset already sent, so a reminder is never repeated, and after a worker outage
  only the most urgent one is sent.
- **Concurrency/retries:** every change is a version-conditional update + audit entry + outbox event in one
  transaction. Repeating activate / suspend / cancel / sign / apply returns the current state without new events;
  concurrent activations or applies change it once.
- **Privacy:** customers never see `customerId`, staff reasons, the history or who acted; events carry refs, offsets
  and amounts only.

## Not built / blocked

- **Payments:** orders cannot record a payment yet (provider undecided, memory.md §6), so nothing can be PAID today:
  activation and renewal application correctly answer `409 PAYMENT_NOT_CONFIRMED`. They work unchanged once orders
  sets PAID from a verified gateway payment. Renewal orders: orders only takes quotes/bookings as sources, so ops
  create a fresh quote → order for a renewal; linking an order to the right customer is an ops check today (orders
  hold no customer).
- **Customer sign-in:** `/mine`, the customer `GET /:ref` and `/renew` answer 503 `CUSTOMER_AUTH_NOT_AVAILABLE`.
- **Grace period length** is not documented — ops set `graceDays` (0–90) per subscription. **Automatic cancellation**
  after suspension is not documented, so ops cancel explicitly.
- **Re-pricing renewals** at current rates needs pricing to re-price a stored quote item (not exposed); renewals use
  the frozen last price.
- **Agreement documents:** metadata only — no PDF generation or e-sign provider (memory.md §6).
- **Notifications** for reminders and status changes: no handlers yet (no customer contact until customer sign-in,
  template wording is the owner's).
