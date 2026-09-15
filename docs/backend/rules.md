# V-DESK Backend — Engineering Rules

Non-negotiable unless an ADR in `docs/backend/adr/` says otherwise. CI enforces what it can; reviewers enforce the rest.

## 1. Architecture

1. One bounded context per module folder. A module exports its **service** and **events** only; its models are private.
2. Controllers contain no business logic: validate → call service → shape response.
3. Services are framework-free (no `req`/`res`), so they can be unit-tested and reused by jobs.
4. Cross-module side effects go through domain events + the outbox, never direct calls that mutate another module's data.
5. Every state machine (lead, booking, quote, payment, KYC, subscription) is a single explicit transition table; illegal transitions return `409 CONFLICT`.
6. Integrations (payments, messaging, storage) sit behind an interface with a fake implementation used in tests.

## 2. API

7. Every endpoint has a zod request schema and a documented response schema; the OpenAPI spec is generated from them and committed.
8. Envelope: `{ data }` / `{ error: { code, message, details?, requestId } }`. Never leak stack traces or Mongo errors.
9. Error codes are stable strings (`LEAD_NOT_FOUND`, `HOLD_EXPIRED`), not sentences; messages may change, codes may not.
10. Creating money or inventory records requires an `Idempotency-Key`; replays return the original result.
11. Public write endpoints (`/leads`, `/bookings/hold`, `/kyc`) are rate-limited per IP **and** per phone/email, and CAPTCHA-verified.
12. Breaking changes → new major version path. Additive only within `/v1`.

## 3. Data

13. Money is an integer in paise. Never `Number` floats for currency; never round before the final total.
14. Timestamps stored in UTC; business-day logic uses `Asia/Kolkata`.
15. Every collection has `createdAt`, `updatedAt`, and a human `ref` (`VD-`, `BK-`, `VDQ-`, `INV-`) used in URLs and support conversations. `_id` never leaves the API.
16. Deletes are soft (`deletedAt`) for anything a customer or finance can reference. Hard deletes only via retention jobs.
17. Indexes are declared in the schema and reviewed with the query that needs them; no unindexed query on collections expected to exceed 100k docs.
18. Migrations are forward-only scripts in `scripts/migrations/` with an `applied_migrations` record.

## 4. Security (PRD §70)

19. Passwords: argon2id. Admin accounts: TOTP MFA mandatory. Sessions: 15-min JWT + rotating refresh cookie (`httpOnly`, `Secure`, `SameSite=Strict`).
20. RBAC is enforced in middleware from a single permission map; services assert permissions again for defence in depth.
21. PII/KYC data never appears in logs, error messages, analytics events or URLs. Documents live only in encrypted object storage; the DB stores metadata.
22. Signed URLs expire in ≤ 15 min (upload) / ≤ 5 min (download) and are single-purpose.
23. Webhooks verify signatures before parsing the body; unsigned requests are dropped and counted.
24. Secrets come from the environment/secret manager only; `.env` files are never committed; CI blocks on leaked-secret scan.
25. Dependencies: `npm audit` high/critical fails CI; lockfile committed; renovate weekly.
26. Audit log (append-only) records who/what/when for every admin mutation and every KYC/payment read.

## 5. Reliability

27. Handlers must be idempotent or guarded; jobs must be safe to retry (BullMQ default 3 attempts, exponential backoff).
28. Long or external work (email, WhatsApp, PDF, gateway calls) never runs inside a request — enqueue it.
29. Timeouts on every outbound call (default 5 s), circuit-break payment/messaging providers.
30. Graceful shutdown: stop accepting, drain in-flight, close queues, then DB.
31. `/health` is cheap; `/ready` checks dependencies. Deploys wait on `/ready`.

## 6. Testing

32. Unit tests for every service function with branches; integration tests per endpoint with `mongodb-memory-server` + supertest; contract tests against the OpenAPI spec.
33. Coverage gate: 80 % lines on `modules/**/*.service.js`; no gate on controllers/routes (covered by integration).
34. Every bug fix ships with a regression test.
35. Payment and booking flows have end-to-end tests against provider sandboxes, run nightly.

## 7. Code style & workflow

36. ESLint (`eslint:recommended` + `import` + `security`) and Prettier run in pre-commit and CI; zero warnings.
37. Conventional Commits; PR title = squash commit message.
38. PR checklist: schema updated · OpenAPI regenerated · tests added · logs/metrics added · runbook touched if operational behaviour changed · no PII in logs.
39. Files ≤ 400 lines; functions ≤ 50 lines; if you need more, split the module.
40. Comments explain *why*, not *what*. Public services have a one-paragraph JSDoc.
41. Feature flags for any behaviour the frontend switches over from localStorage; flags are removed within one phase of going 100 %.

## 8. Frontend contract

42. Field names in API payloads match the existing `src/features/*` objects (`mobile`, `service`, `source`, `vo_price`, …) so the switch-over is a transport change, not a data-model change.
43. The client keeps working when the API is unreachable for read-only pages (bundled catalog fallback) and queues form submissions for retry; the API must accept caller-supplied `ref`s idempotently to support that.
