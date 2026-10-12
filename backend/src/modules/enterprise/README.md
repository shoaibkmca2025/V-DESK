# Enterprise module

Multi-user company accounts, team bookings, bulk RFPs, custom price books, consolidated billing and reports
(modules.md §3.13, phases.md Phase 4, PRD §63, §75).

- **Mounted at:** `/api/v1/enterprise`
- **Build phase:** 4
- **Collections:** `organisations`, `organisation_members`, `organisation_links`, `enterprise_rfps`, `price_books`
  (+ shared `audit_log`, `domain_events`)
- **Reads (public APIs only):** booking `getBooking`, orders `getOrder`, pricing `previewItem` / `getEffectiveRules` /
  `priceItem`
- **Frontend that will call it:** `features/enterprise/enterpriseSuite.js` (RFP form; the portal later)

## Endpoints (relative to the mount path)

| Method   | Path                                      | Access                                        | What it does                                                |
| -------- | ----------------------------------------- | --------------------------------------------- | ----------------------------------------------------------- |
| `POST`   | `/rfps`                                   | public (rate limit, CAPTCHA, Idempotency-Key) | `{ company, contact, desks, months, cities }` → receipt     |
| `GET`    | `/rfps`, `/rfps/:ref`                     | `enterprise:read`                             | RFPs with contact details (staff only)                      |
| `PATCH`  | `/rfps/:ref/status`                       | `enterprise:manage`                           | `{ status }` along the pipeline                             |
| `GET`    | `/me/organisations`                       | customer                                      | My organisations and my role in each                        |
| `GET`    | `/organisations`                          | `enterprise:read`                             | Staff list (cursor pagination)                              |
| `POST`   | `/organisations`                          | `enterprise:manage`                           | `{ name, gstin?, billingEmail?, ownerCustomerId? }`         |
| `GET`    | `/organisations/:ref`                     | `enterprise:read` / member `org:read`         | Organisation (+ members for staff and `org:members`)        |
| `PATCH`  | `/organisations/:ref`                     | `enterprise:manage`                           | `{ name?, gstin?, billingEmail? }`                          |
| `DELETE` | `/organisations/:ref`                     | `enterprise:manage`                           | Soft delete; refused while it has members                   |
| `POST`   | `/organisations/:ref/members`             | `enterprise:manage` / member `org:members`    | `{ customerId, role }`                                      |
| `PATCH`  | `/organisations/:ref/members/:customerId` | `enterprise:manage` / member `org:members`    | `{ role }`                                                  |
| `DELETE` | `/organisations/:ref/members/:customerId` | `enterprise:manage` / member `org:members`    | Removes the member                                          |
| `GET`    | `/organisations/:ref/bookings`            | `enterprise:read` / member `org:read`         | Team bookings with their current state                      |
| `POST`   | `/organisations/:ref/bookings`            | `enterprise:manage` / member `org:book`       | `{ bookingRef, memberCustomerId? }`                         |
| `POST`   | `/organisations/:ref/orders`              | `enterprise:manage`                           | `{ orderRef }` — bill the order to the organisation         |
| `GET`    | `/organisations/:ref/billing`             | `enterprise:read` / member `org:billing`      | Statement `?from=&to=`: lines + totals (paise)              |
| `GET`    | `/organisations/:ref/billing.csv`         | `enterprise:read`                             | The statement as CSV (formula-safe)                         |
| `GET`    | `/organisations/:ref/price-books`         | `enterprise:read`                             | All versions, newest first                                  |
| `POST`   | `/organisations/:ref/price-books`         | `enterprise:pricing`                          | New version `{ enterprise_desks, note?, expectedVersion? }` |
| `GET`    | `/organisations/:ref/price-preview`       | `enterprise:read` / member `org:billing`      | `?desks=&months=` priced with the active price book         |
| `GET`    | `/organisations/:ref/report`              | `enterprise:read` / member `org:billing`      | Members by role, team bookings, billing totals              |

Staff permissions: `enterprise:read` → OPS_ADMIN, SALES_MANAGER, FINANCE; `enterprise:manage` → OPS_ADMIN,
SALES_MANAGER; `enterprise:pricing` → FINANCE. Staff routes need a signed-in user; the legacy `x-admin-key` is refused.

Organisation roles (`ORG_PERMISSIONS` in enterprise.constants.js): `org:read` and `org:book` → OWNER, ADMIN, MEMBER;
`org:members` and `org:billing` → OWNER, ADMIN; `org:owners` (grant/remove OWNER) → OWNER.

## Rules

- **Multi-user:** a customer sees an organisation only as a member (non-members get 404); what they can do depends on
  their organisation role, checked in the service. MEMBERs see their own role, not the member list. An organisation
  always keeps an OWNER (`409 LAST_OWNER`); membership changes serialise on the organisation, so two concurrent
  demotions can't both pass that check.
- **RFP pipeline** mirrors crm's: SUBMITTED → UNDER_REVIEW → PROPOSAL_SENT → WON, or LOST from any open stage;
  WON/LOST final. The estimate is priced by pricing's engine at standard rates — the client's figures are ignored.
  The public receipt (`{ ref, status, createdAt }`) never contains contact details; events carry no PII.
- **Team bookings / billing:** a booking or order is attributed to at most one organisation, after checking it exists
  through its own module. Members (`org:book`) can attribute bookings to themselves only; ADMINs/OWNERs to any
  member. Billing links are staff-only.
- **Price books** replace pricing's `enterprise_desks` rule (`{ desk_month_paise, bulk_discounts }`) for one
  organisation. Versions are append-only with optimistic locking (`expectedVersion`, `409 PRICE_BOOK_CHANGED`) and
  priced by pricing's engine (ADR-007 rounding).
- Every change commits with its audit entry and outbox event (`enterprise.organisation_created`, `member_added`,
  `member_role_changed`, `member_removed`, `record_linked`, `price_book_updated`, `rfp_submitted`,
  `rfp_status_changed`).

## Not built / blocked

- **Customer sign-in:** every member route answers 503 `CUSTOMER_AUTH_NOT_AVAILABLE` for customers until identity has
  a verified customer principal; staff routes work today.
- **Consolidated GST invoices:** invoices are blocked with payments (memory.md §6). The billing statement is a
  statement of orders, not a tax invoice.
- **Price books in checkout:** quotes and orders are priced by pricing's standard rules; applying an organisation's
  price book to a stored quote needs pricing to accept a rule override (a pricing change, not made here). Today the
  price book drives `price-preview` for proposals.
- **Team bookings are attribution:** bookings are made through the booking module (guest holds); linking a booking
  ref an unrelated guest made is possible for a member who knows the ref — bookings will carry a customer id once
  customer sign-in exists, and the link should then check it.
- **RFP → organisation conversion** and notification handlers for enterprise events: not specified, not built.
