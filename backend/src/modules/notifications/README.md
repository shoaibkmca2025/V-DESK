# Notifications module

Templated email, WhatsApp and SMS messages: templates, a durable queue, and a sender with bounded retries.
**v1 is a foundation: nothing is sent to anyone yet.** No real provider is connected, nothing queues messages
automatically (no event bus), and nothing runs the sender on a schedule (no job queue). See "Not built / blocked".

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

**Calling `notify()` from another module:** cross-module side effects must go through domain events and the outbox
(rules.md §4, ADR-005), which don't exist yet. Until they do, no module calls `notify()`; the lead confirmation and
sales alert (phases.md Phase 1) are wired when the event bus lands.

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
| Lead confirmation + sales alert actually being sent     | The event bus + outbox (ADR-005) so crm can emit `lead.created`; the message wording (not documented — staff write it as templates); a provider                              |
| Running `processDueNotifications` on a schedule         | The job queue (BullMQ + Redis, rules.md §28) — not built                                                                                                                     |
| Delivery receipts (`DELIVERED`), provider webhooks      | Real providers                                                                                                                                                               |
| `POST /webhooks/whatsapp` (inbound → lead threading)    | Notifications v2 (phases.md Phase 3) and a WhatsApp provider                                                                                                                 |
| Templates managed in the CMS, retention job for the log | Phase 3 CMS; a data-retention decision                                                                                                                                       |
