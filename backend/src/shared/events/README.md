# events — the transactional outbox

How modules react to each other without calling each other (rules.md §4, ADR-005, ADR-008).

```
crm.service ──(one transaction)──► leads + domain_events
                                         │  worker: dispatchDueEvents() every second
                                         ▼
                      notifications.events.js handlers ──► notify() ──► notification_log ──► provider
```

| File              | What                                                                                   |
| ----------------- | -------------------------------------------------------------------------------------- |
| `events.model.js` | `domain_events`: the event (modules.md §4 shape) plus its delivery record              |
| `bus.js`          | `publish(event, { session })`, `subscribe(type, name, handler)`, `dispatchDueEvents()` |
| `src/events.js`   | imports every module's `<module>.events.js`, so the worker knows all handlers          |
| `src/jobs.js`     | the worker job that runs `dispatchDueEvents()`                                         |

## Publishing (the module that owns the change)

```js
import { publish } from '../../shared/events/bus.js';
import { withTransaction } from '../../shared/lib/transactions.js';

await withTransaction(async (session) => {
  const lead = await repo.insertLead(data, { session }); // every write in here takes { session }
  await publish(
    { type: 'lead.created', entity: { type: 'lead', ref: lead.ref }, actor: { type: 'public' } },
    { session },
  );
});
```

- The event is saved **if and only if** the change is. Never publish after the transaction, and never call another
  module or an HTTP API inside it (the driver may re-run the function on a transient error).
- `type` is `entity.past_tense` (`lead.created`, `booking.confirmed`, `payment.succeeded`).
- `payload` stays small and **free of personal data** — refs and codes. Handlers fetch details through the owning
  module's service, so they see current data and the outbox holds no PII.

## Event catalog

| Event                                                            | Published by    | Payload (refs/codes only)             | Handled by                                 |
| ---------------------------------------------------------------- | --------------- | ------------------------------------- | ------------------------------------------ |
| `lead.created`                                                   | crm             | `source`                              | notifications (confirmations, sales alert) |
| `lead.status_changed`                                            | crm             | `from`, `to`                          | —                                          |
| `booking.held`                                                   | booking         | `centreRef`, `expiresAt`              | —                                          |
| `booking.confirmed`, `booking.cancelled`, `booking.hold_expired` | booking         | `from`, `centreRef`                   | —                                          |
| `quote.sent`                                                     | pricing         | `productType`                         | —                                          |
| `quote.accepted`, `quote.expired`                                | pricing         | `from`, `productType`                 | —                                          |
| `catalog.updated`                                                | catalog (staff) | `action`, `fields` (names only)       | —                                          |
| `kyc.submitted`, `kyc.approved`, `kyc.rejected`                  | kyc             | see `modules/kyc/README.md`           | —                                          |
| `subscription.*`, `service.activated`                            | subscriptions   | see `modules/subscriptions/README.md` | —                                          |
| `enterprise.*`                                                   | enterprise      | see `modules/enterprise/README.md`    | —                                          |

Expiry events (`booking.hold_expired`, `quote.expired`) are published when the expired status is **saved** — by
the next action on the record or by the worker jobs `booking.expire_holds` / `pricing.expire_quotes` — not at the
instant a record starts to _read_ as expired. Not published yet (blocked): `payment.*`, `invoice.issued`,
`refund.processed` (payments), `lead.converted` and `user.*` (customer accounts).

## Handling (the module that reacts)

In `src/modules/<module>/<module>.events.js`, then add one import line to `src/events.js`:

```js
subscribe('lead.created', 'notifications.lead_confirmation', async (event) => { … });
```

- **At least once:** a handler can run again (crash, lease timeout, a sibling handler failing). Make it idempotent —
  e.g. `notify()` with a `dedupeKey` built from the event's entity.
- **Throw to retry** (10 s, 1 min, 5 min, 15 min, 1 h, 3 h, 6 h); after 8 attempts the event is `DEAD`. **Return** when
  the event needs no action or a retry can't help (missing template, record deleted) — log why.
- Handlers of one event are tracked separately (`handled`), so a retry only re-runs the ones that failed.
- The handler `name` is what's recorded — renaming it re-runs that handler for undelivered events.
- No ordering guarantee between events.

## Operations

- `DONE` events are deleted after 30 days (TTL on `expireAt`). `DEAD` events stay, with `lastError: { handler, code }`
  — find them with `db.domain_events.find({ status: 'DEAD' })`; set `status: 'PENDING', nextAttemptAt: new Date()` to
  retry after fixing the cause. (A staff endpoint for this can come with the admin console.)
- Several workers can run at once: each event is claimed with an atomic update and a 60 s lease.
- Needs a replica set for the transaction (Atlas is one). On a standalone local `mongod` the API still runs, but the
  write and its event are not atomic — see backend/README.md.
