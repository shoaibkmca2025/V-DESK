# Booking module

Meeting-room bookings: hourly availability, the 10-minute hold, staff confirmation, cancellation and the visitor
pass (PRD §34–35).

- **Mounted at:** `/api/v1/bookings`
- **Build phase:** 2
- **Collections:** `bookings` (price breakdown and guest details embedded), `booking_slots` (one document per
  reserved room-hour; replaces the planned `availability_slots` / `holds`)
- **Reads (via `catalog/index.js`, `pricing/index.js`):** the centre; the room formats and the price
- **Frontend that will call it:** `features/meetingRooms/roomBooking.js`, `features/bookings/bookingStore.js`

## Endpoints (relative to the mount path)

| Method  | Path            | Access                | What it does                                                                          |
| ------- | --------------- | --------------------- | ------------------------------------------------------------------------------------- |
| `GET`   | `/availability` | public (rate-limited) | `?centreRef=&room=&date=YYYY-MM-DD` → the 11 one-hour slots with `available`          |
| `POST`  | `/hold`         | public (rate-limited) | Hold body (below) + `Idempotency-Key` header → 201 `HELD` booking                     |
| `GET`   | `/:ref`         | public (booking ref)  | The booking, without contact details                                                  |
| `POST`  | `/:ref/cancel`  | public (booking ref)  | Release a hold. Confirmed bookings → `409 CANCELLATION_REQUIRES_STAFF`                |
| `GET`   | `/:ref/pass`    | public (booking ref)  | Visitor pass (`qr` text to encode) — `CONFIRMED` / `CHECKED_IN` only                  |
| `GET`   | `/`             | `bookings:read`       | Staff list with guest details and history. `?status=&centreRef=&date=&cursor=&limit=` |
| `POST`  | `/:ref/confirm` | `bookings:write`      | Confirm a live hold (staff-only until orders confirms on a verified payment)          |
| `PATCH` | `/:ref/status`  | `bookings:write`      | `{ status: "CHECKED_IN" \| "COMPLETED" \| "CANCELLED" }`                              |

`bookings:read` = OPS_ADMIN, SALES_MANAGER; `bookings:write` = OPS_ADMIN (SUPER_ADMIN has both; the legacy
`x-admin-key` still has full access until it is retired).

### Hold body

```jsonc
{
  "centreRef": "CTR-NSK-001",
  "room": "Conference Room", // a room format from pricing's meeting_room rule
  "date": "2026-10-12",
  "startTime": "14:00", // IST, on the hour
  "duration": 2,
  "attendees": 6, // hours; attendees ≤ the room's seats
  "customer": { "name": "…", "company": "…", "mobile": "98765 43210", "email": "…" },
} // company/email optional
```

Any `totalAmount`, `pricing` or `state` the client sends is dropped. The response carries `ref`, `status`, `hub`,
`room`, `date`, `startTime`, `endTime`, `slot` (`"02:00 PM - 04:00 PM"`, as the client shows it), `duration`,
`attendees`, `startsAt` / `endsAt` (UTC), `expiresAt` and `pricing` — the pricing engine's `meeting_room`
breakdown (paise, ADR-007), frozen at hold time.

## Rules

- **Schedule:** one-hour slots, first 09:00, last ending 20:00, Asia/Kolkata (fixed +05:30). The start must be in the
  future and the date within today … today + 90 days (IST). Errors: `OUTSIDE_OPENING_HOURS`, `SLOT_IN_PAST`,
  `DATE_OUT_OF_RANGE`, `UNKNOWN_ROOM`, `ATTENDEES_EXCEED_CAPACITY`, `ROOMS_NOT_OFFERED` (centre lacks
  "Meeting Rooms" or is `unavailable`), `CENTRE_NOT_FOUND`.
- **Refs** look like `BK-MUZIV7ZQ88IWKNTX`: the ref is the customer's only key to the booking, so it carries 8 random
  characters. The public view and the pass never include name, company, mobile or email; staff see them.
- **No overlaps:** `booking_slots` has a unique index on (centreRef, room, date, hour). A hold inserts its booking,
  then its hours in order; if an hour is taken it deletes the hours it inserted and the booking and answers
  `409 SLOT_UNAVAILABLE` (with the clashing `taken` hours). Rollback is compensating, not a transaction — the local
  and test MongoDB are standalone servers.
- **A slot blocks its hour only while its booking does.** Slots of a lapsed hold, a `CANCELLED` / `EXPIRED`
  booking or a booking that no longer exists are ignored by availability and deleted before the next insert on
  those hours (a lapsed hold is saved as `EXPIRED` first). A crash between a status change and the slot clean-up
  therefore never leaves an hour blocked; a TTL index on `booking_slots.expiresAt` also cleans lapsed hold slots.
- **Holds** last 600 s and read as `EXPIRED` the moment they lapse. Cancelling, confirming or changing a lapsed hold
  saves `EXPIRED` and always answers `409 HOLD_EXPIRED`.
- **Idempotency** (rules.md §10): `Idempotency-Key` is required. Same key + same body → `200` with the original
  booking (no new booking or slots); different body → `409 IDEMPOTENCY_KEY_REUSED`; while the original request is
  still reserving its hours → `409 IDEMPOTENCY_KEY_IN_PROGRESS` (retry shortly) — a replay is never handed a ref
  that could still be rolled back. A hold refused for a clash can be retried with the same key.
- **Abuse limits:** per-IP limits (10 holds/min, 120 availability reads/min, 60 ref reads/min) and at most 3
  unexpired holds per mobile (`429 TOO_MANY_HOLDS`).
- **Statuses** (`BOOKING_TRANSITIONS`): `HELD → CONFIRMED | CANCELLED | EXPIRED`, `CONFIRMED → CHECKED_IN | CANCELLED`,
  `CHECKED_IN → COMPLETED`. Illegal moves → `409 INVALID_STATUS_TRANSITION`; repeating the current status is a
  no-op. Confirming makes every hour permanent **first** (only hours whose hold hasn't lapsed), counts them, and
  only then moves `HELD → CONFIRMED`; if any hour is missing the system ends the hold (`EXPIRED` if it lapsed, else
  `CANCELLED`). So a `CONFIRMED` booking — and its pass — always has all its hours, and a crash mid-confirmation leaves
  a `HELD` booking that frees its hours when it lapses. Cancelling frees the hours; completed bookings keep them.
- **No payment is implied.** Confirmation is a staff action; nothing here records a payment.
- **Logs** carry booking/centre refs, room, duration, total and staff refs — never guest details.

## Not built yet

`PAYMENT_PENDING` and confirmation on a verified payment (orders module), refunds and the
requested → approved → refunded cancellation flow, CAPTCHA on `/hold`, notifications (`booking.*` events — no event
bus yet), check-in time windows, per-centre room inventory (every meeting-room centre offers every format; the
centre's `meetingCapacity` text is not enforced), workspace (non-meeting-room) bookings, staff edits to a booking.
