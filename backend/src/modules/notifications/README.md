# Notifications module

Templated email, WhatsApp and SMS messages: templates, a durable queue, and a sender with bounded retries.
**Nothing is sent to anyone yet: no real provider is connected.** The rest of the path works: a new lead's
`lead.created` event queues its messages (once staff create the templates), and the worker's sender job starts as soon
as a provider is configured in `src/jobs.js`. See "Not built / blocked".

- **Mounted at:** `/api/v1/notifications` (staff only)
- **Build phase:** 1 (v1) · 3 (v2)
- **Collections:** `notification_templates`, `notification_log` (the log is also the outgoing queue)
- **Integrations:** `src/integrations/messaging.js` — the provider contract (`send()`, `MessagingError`) and a
  deterministic fake. Real adapters (`email.js`, `whatsapp.js`, `sms.js`) are not written.

## Public interface (`index.js`)

```js
import { notify, processDueNotifications, CHANNELS } from '../notifications/index.js';

// Queue one message. Validates and renders now; stores it PENDING; never calls a provider (rules.md §28).
const { notification, created } = await notify({
  templateKey: 'lead.confirmation',
  to: 'priya@zenith.in', // email, or an Indian mobile for whatsapp / sms (normalised to +91XXXXXXXXXX)
  variables: { name: 'Priya', service: 'Virtual Office' },
  dedupeKey: 'lead.created:VD-MUM-8921:confirmation', // same key → same notification, never a second message
});
// notification = { ref: 'NTF-…', status: 'PENDING', channel: 'email', templateKey: 'lead.confirmation' }

// Send what is due (for a background worker): only channels with a provider are touched.
await processDueNotifications({ providers: { email: emailProvider }, limit: 20 });
// → { accepted, retry, failed, lost }
```

Errors (`AppError`, stable codes): `VALIDATION_FAILED`, `TEMPLATE_NOT_FOUND` (404), `TEMPLATE_INACTIVE` (409),
`INVALID_RECIPIENT` (400), `INVALID_TEMPLATE_VARIABLES` (400), `DEDUPE_KEY_REUSED` (409).

**Other modules don't call `notify()`** — cross-module side effects go through domain events (rules.md §4,
ADR-005/008). The owning module publishes an event; `notifications.events.js` subscribes to it and queues the
message with `notifyIfConfigured()`, which skips (and logs) when the template doesn't exist yet or needs a value the
event's record doesn't have. See `src/shared/events/README.md`.

## Messages wired to events

| Event          | Template key                 | To                   | Variables available                                         |
| -------------- | ---------------------------- | -------------------- | ----------------------------------------------------------- |
| `lead.created` | `lead.confirmation.email`    | the visitor's email  | `name`, `ref` always; `service`, `city`, `company` if given |
| `lead.created` | `lead.confirmation.whatsapp` | the visitor's mobile | same                                                        |
| `lead.created` | `lead.sales_alert`           | `SALES_ALERT_EMAIL`  | same, plus `source`, `score`, `mobile`, `email` (if given)  |

Each is queued only after staff create the template (`POST /templates`, wording from the owner) and only for leads
that have every variable the template uses — so keep confirmation templates to `name` and `ref` unless a lead without
a city should get no message. Dedupe keys are `lead.created:<ref>:confirmation:<channel>` and
`lead.created:<ref>:sales_alert`, so a redelivered event never queues twice.

## Endpoints (relative to the mount path)

| Method   | Path              | Access                 | What it does                                                          |
| -------- | ----------------- | ---------------------- | --------------------------------------------------------------------- |
| `GET`    | `/templates`      | `notifications:manage` | All templates                                                         |
| `POST`   | `/templates`      | `notifications:manage` | Create (below) → 201. Keys are never reused, even after delete        |
| `GET`    | `/templates/:key` | `notifications:manage` | One template                                                          |
| `PATCH`  | `/templates/:key` | `notifications:manage` | Replace content; send the `version` you loaded (stale → 409)          |
| `DELETE` | `/templates/:key` | `notifications:manage` | Soft delete → 204                                                     |
| `GET`    | `/`               | `notifications:read`   | Delivery log, masked. `?status=&channel=&templateKey=&cursor=&limit=` |

`notifications:manage` = OPS_ADMIN, CONTENT; `notifications:read` = OPS_ADMIN (SUPER_ADMIN and the legacy
`x-admin-key` too). There is deliberately **no HTTP endpoint that queues or sends a message**.

```jsonc
// POST /templates
{
  "key": "lead.confirmation",
  "channel": "email", // email | whatsapp | sms
  "subject": "We received your enquiry, {{ name }}", // email only
  "body": "Hi {{name}}, thanks for asking about {{service}}.",
  "variables": ["name", "service"],
  "transactional": true,
  "active": true,
}
```

## Templates

- **Plain text on every channel** (no HTML), so a value can't inject markup.
- Placeholders are `{{ name }}`; the declared `variables` must match the placeholders exactly; malformed placeholders
  are refused. SMS templates must be `transactional` (PRD §50).
- Rendering is one pass, so a value containing `{{ … }}` is inserted literally. Values must be text or numbers,
  1–500 characters; control characters and newlines become spaces. Missing or unknown variables → 400.
- Each notification records the template `version` it was rendered from; edits use optimistic versioning.

## Delivery

| Status     | Meaning                                                                         |
| ---------- | ------------------------------------------------------------------------------- |
| `PENDING`  | Queued, or waiting for a retry (`nextAttemptAt`)                                |
| `SENDING`  | Claimed by a worker (lease 60 s)                                                |
| `ACCEPTED` | The provider **accepted** it — not proof of delivery (no delivery receipts yet) |
| `FAILED`   | Permanent provider error, or transient errors on all 4 attempts                 |

- **One sender at a time:** a worker claims a notification with an atomic update, a 60 s lease and a claim token;
  parallel workers never send the same one, and a worker whose lease ran out can't overwrite a newer claim.
  The lease is measured from the moment of each claim (the clock is re-read per claim), so slow sends earlier in a
  run can't leave a later claim with an already-expired lease.
- **Idempotency:** `dedupeKey` + a hash of template key, recipient (as given) and variables (key order ignored).
  Same key and same request → the original notification; same key, different request → `409 DEDUPE_KEY_REUSED`.
  The recipient is compared as given, so `Priya@x.in` and `priya@x.in` under one key count as different requests.
- **Retries:** transient errors (timeouts, 429, 5xx — or any unknown error) retry after 1 min, 5 min, 30 min; at most
  4 attempts in total, then `FAILED`. Permanent errors (`MessagingError` with `transient: false`) fail at once.
- **Crash safety:** if a worker dies mid-send, the lease runs out and another worker retries with the **same**
  provider idempotency key (the `NTF-` ref). Providers that honour idempotency keys won't deliver twice; for ones that
  don't, delivery is at-least-once. A notification reclaimed after its last attempt is `FAILED` without sending.
- **Channels without a provider** are never claimed; their notifications stay `PENDING` until one is configured.
- **Privacy:** rendered subject/body are cleared when a notification reaches `ACCEPTED` or `FAILED`. Staff see
  masked recipients (`p***@zenith.in`, `*********3210`) and never message content. Logs carry refs, template keys,
  channels, attempt numbers and error codes only — no recipients, content or provider error text.

## Not built / blocked

| What                                                    | Waiting for                                                                                                                                                                  |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Real providers (`email.js`, `whatsapp.js`, `sms.js`)    | Vendor decisions (email "Resend / SES"; WhatsApp BSP; SMS MSG91 per the plan), credentials, confirmed sender numbers/addresses (memory.md §5: current ones are placeholders) |
| Lead confirmation + sales alert actually being sent     | The message wording (owner/content — create the three templates above) and a provider. The event and queueing are wired                                                      |
| Booking / quote / order / payment messages              | Which messages exist and their wording (not documented). `booking.*` and `quote.*` events are published now; `payment.*` waits for payments                                  |
| Delivery receipts (`DELIVERED`), provider webhooks      | Real providers                                                                                                                                                               |
| `POST /webhooks/whatsapp` (inbound → lead threading)    | Notifications v2 (phases.md Phase 3) and a WhatsApp provider                                                                                                                 |
| Templates managed in the CMS, retention job for the log | Phase 3 CMS; a data-retention decision                                                                                                                                       |
