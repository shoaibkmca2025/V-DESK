# V-DESK Backend — Logging, Observability & Operations

## 1. Logging

### Format
Structured JSON via **pino**, one line per event, stdout only (the platform ships it).

```json
{
  "level": "info", "time": "2026-09-15T08:12:36.500Z", "service": "vdesk-api", "env": "prod", "version": "2.3.1",
  "requestId": "req_01J8…", "traceId": "…", "userId": "usr_…", "role": "SALES_EXEC",
  "module": "crm", "event": "lead.status_changed", "leadRef": "VD-MU2E5O7Y", "from": "NEW", "to": "QUALIFIED",
  "durationMs": 12, "msg": "lead status changed"
}
```

### Levels
| Level | Use |
|---|---|
| `fatal` | process cannot continue (bad config, DB unreachable at boot) |
| `error` | request failed with 5xx, job exhausted retries, webhook signature invalid |
| `warn` | 4xx worth attention (rate limit hit, hold expired, gateway retry), degraded dependency |
| `info` | every request (access log), every domain event, every job start/finish, deploy/boot |
| `debug` | payload shapes, cache hits, query plans — off in prod |

### Rules
- Always include `requestId` (from `X-Request-Id` or generated) and, inside jobs, the originating `requestId` of the event.
- Log **refs, not documents**. Never log: passwords, tokens, OTPs, Aadhaar/PAN numbers, card data, document URLs, full phone/email (mask: `98*****234`, `p***@zenith.com`).
- Access log fields: `method`, `path` (route template, not raw URL), `status`, `durationMs`, `ip` (truncated /24), `ua`, `bytesOut`.
- Errors log `err.code`, `err.message`, `err.stack` (stack only ≤ `warn` in prod for expected errors).
- Redaction list is enforced centrally in the pino config (`redact: ['req.headers.authorization', '*.password', '*.otp', '*.aadhaar', '*.pan', …]`).

### Retention
| Store | Hot | Cold |
|---|---|---|
| App logs | 14 days searchable | 90 days archived (S3, Glacier) |
| Audit log (Mongo, append-only) | 7 years (statutory) | — |
| Notification log | 1 year | — |
| Analytics events | 13 months hot | warehouse indefinitely |

## 2. Audit log

Separate from app logs; it is a **product feature** (PRD §70).

```
audit_log { at, actorId, actorRole, action, entityType, entityRef, before?, after?, ip, requestId }
```
Written synchronously in the same transaction as: any admin mutation, status transitions on leads/quotes/bookings/payments/KYC/subscriptions, every KYC document read, every refund. Exposed to `SUPER_ADMIN` via `GET /audit?entityRef=`.

## 3. Metrics (Prometheus, `/metrics` on an internal port)

| Metric | Type | Labels |
|---|---|---|
| `http_request_duration_seconds` | histogram | route, method, status |
| `http_requests_total` | counter | route, method, status |
| `job_duration_seconds` / `job_failures_total` | histogram / counter | queue, name |
| `outbox_lag_seconds` | gauge | — |
| `booking_holds_active` | gauge | centre |
| `payment_webhooks_total` | counter | provider, result |
| `lead_created_total` | counter | source |
| `service_activated_total` (North Star) | counter | product |
| `db_query_duration_seconds` | histogram | collection, op |

SLOs: availability 99.9 % monthly; API p95 < 500 ms; search p95 < 300 ms; webhook processing < 30 s; hold-expiry job drift < 15 s.

## 4. Tracing

OpenTelemetry auto-instrumentation (http, express, mongoose, ioredis, bullmq). `traceId` propagated into logs and outgoing requests (`traceparent`). Sampling 10 % in prod, 100 % for errors and for `/payments/*`.

## 5. Alerting

| Alert | Condition | Severity | Page? |
|---|---|---|---|
| API down | `/ready` failing 2 min | P1 | yes |
| Error rate | 5xx > 2 % over 5 min | P1 | yes |
| Payment webhooks failing | `result=error` > 3 in 10 min | P1 | yes |
| Outbox lag | > 60 s | P2 | business hours |
| Job dead-letter | any DLQ entry | P2 | business hours |
| Latency | p95 > SLO for 15 min | P3 | ticket |
| Cert / secret expiry | < 14 days | P3 | ticket |

Channels: PagerDuty (P1), Slack `#vdesk-ops` (all), weekly digest email.

## 6. Runbooks (one file each under `docs/backend/runbooks/`)

- `payment-webhook-replay.md` — verify signature log, replay from gateway dashboard, reconcile with `scripts/reconcile-payments.js`
- `stuck-booking-hold.md` — inspect Redis key `hold:{workspace}:{slot}`, release, notify customer
- `kyc-document-access.md` — how to grant/revoke, how to prove access in audit log
- `restore-from-backup.md` — Atlas point-in-time restore, verify counts, rotate secrets
- `rotate-secrets.md` — JWT keys (dual-key rollover), gateway keys, S3 credentials
- `incident-template.md` — timeline, impact, root cause, actions, owners

## 7. Change log (append newest first)

| Date | Version | Change | Author |
|---|---|---|---|
| 2026-09-15 | plan v1 | Backend plan authored (`modules.md`, `phases.md`, `rules.md`, `logs.md`, `memory.md`). Frontend restructured to React + Vite; backend deferred. | — |
