# KYC module

KYC applications, document upload through signed URLs, and compliance review (PRD §46–47, modules.md §3.8). Files
go straight from the browser to object storage; the database stores metadata only.

- **Mounted at:** `/api/v1/kyc`
- **Build phase:** 2
- **Collections:** `kyc_applications`, `documents` (+ the shared append-only `audit_log`)
- **Events published:** `kyc.submitted`, `kyc.approved`, `kyc.rejected` (outbox, same transaction as the change)
- **Frontend that will call it:** `features/kyc/kyc.js`, `pages/account/KycPage.jsx`
- **Needs:** customer sign-in from identity (**blocked**, see below) and a storage provider (`STORAGE_DRIVER`; only
  the development/test `memory` adapter exists).

## Endpoints (relative to the mount path)

| Method  | Path                               | Access                        | What it does                                                            |
| ------- | ---------------------------------- | ----------------------------- | ----------------------------------------------------------------------- |
| `POST`  | `/`                                | customer                      | Opens a `DRAFT` application → 201. One open application per customer    |
| `POST`  | `/:ref/documents/upload-url`       | customer (owner)              | `{ type, contentType, sizeBytes }` → document metadata + signed PUT     |
| `POST`  | `/:ref/submit`                     | customer (owner)              | `{ consent: true }` → verifies uploads, `UNDER_REVIEW`, `kyc.submitted` |
| `GET`   | `/:ref`                            | customer (owner) / `kyc:read` | Application + safe document metadata; every read is audited             |
| `PATCH` | `/:ref/documents/:id/review`       | `kyc:review`                  | `{ decision: 'APPROVE' }` or `{ decision: 'REJECT', reason }`           |
| `POST`  | `/:ref/documents/:id/download-url` | `kyc:read`                    | ≤ 5-minute signed GET so a reviewer can see the file; audited           |

`:id` is the document's `DOC-…` ref. `submit` and `download-url` were added to the four planned endpoints: the API never
sees an upload land (it goes straight to storage), so something must check the files and capture consent before
review, and reviewers need a way to look at a file without signed URLs appearing in ordinary reads.

## Workflow

```
DRAFT ──submit──► UNDER_REVIEW ──all documents approved──► APPROVED (final, kyc.approved)
  ▲                    │
  │                    └──any document rejected──► ACTION_REQUIRED (kyc.rejected per rejection)
  └───────── (customer replaces the rejected file) ──submit──┘   (back to UNDER_REVIEW, kyc.submitted)
```

- **Documents:** `pan`, `aadhaar`, `bank`, `photo` required; `incorporation`, `signature` optional — the frontend's
  list. PDF / JPEG / PNG only, 1 byte – 5 MB (also the frontend's rules).
- **Document states:** `UPLOAD_PENDING` (URL issued) → `UPLOADED` (verified at submit) → `APPROVED` | `REJECTED`. A
  new upload for a type replaces a pending or rejected document (the old one is soft-deleted); approved documents and
  ones waiting for review can't be replaced (`409 DOCUMENT_ALREADY_APPROVED` / `DOCUMENT_AWAITING_REVIEW`).
- **Submit** checks: consent, every required type present, nothing still rejected, and every new file found in
  storage with exactly the declared size and content type **and** the right file signature (`%PDF-`, JPEG `FF D8 FF`,
  PNG header). Otherwise `409 DOCUMENTS_MISSING`, `DOCUMENT_REJECTED`, `DOCUMENT_NOT_UPLOADED` or
  `DOCUMENT_UPLOAD_INVALID`, and nothing changes.
- **Review** works on `UPLOADED` documents while the application is `UNDER_REVIEW` or `ACTION_REQUIRED` (so staff can
  keep approving the rest while the customer fixes a rejection). Rejection needs a 5–500 character reason, which the
  customer sees. Repeating the same decision is a no-op (200, no new event); a different decision on a reviewed
  document is `409 DOCUMENT_ALREADY_REVIEWED`.
- **Concurrency:** every change bumps the application's `version` inside its transaction, so parallel changes to one
  application serialise (parallel uploads all succeed; two simultaneous final approvals publish `kyc.approved` once).
  A change that raced and lost answers `409 KYC_APPLICATION_CHANGED`.

## Privacy and security

- Responses never contain Mongo `_id`, storage keys, signed URLs (except the one-off upload/download responses, sent
  with `Cache-Control: no-store`) or file contents. Customers don't see `customerId` or who reviewed.
- Object keys are generated server-side (`kyc/<application>/<doc>-<uuid>.<ext>`, extension from the validated content
  type); client storage keys and file names are refused (strict bodies) and file names are never stored.
- Another customer's application answers 404, not 403, so refs can't be probed.
- Logs, events and audit entries carry refs, types and statuses only — never rejection reasons, file data or personal
  data. `kyc.rejected` carries `{ documentRef, documentType }`; handlers read the reason through this module.
- Every change (in the change's transaction) and every read / download URL is recorded in the shared append-only
  `audit_log` (src/shared/audit; logs.md §2: who, role, action, entity, before/after status, ip, requestId).
- Permissions `kyc:read` and `kyc:review` → COMPLIANCE (SUPER_ADMIN implicitly), checked again in the service. Staff
  must be signed in (JWT + MFA): **the legacy `x-admin-key` is refused (401)** — it is not a named person and holds
  every permission, so it must never read or decide identity documents.
- **No swap after submit:** a signed upload URL cannot be revoked, so storage adapters must issue single-use URLs
  (S3/R2: sign `If-None-Match: *`; the memory adapter refuses a second upload), submit records the verified object's
  etag, and approval and download re-check it (`409 DOCUMENT_UPLOAD_CHANGED`; the reviewer can still reject).

## Blocked / not built

- **Customer sign-in (blocks every customer route).** Identity has no customer principal (phone OTP is Phase 2 and
  an open question in memory.md §6). identity's `resolveCustomer` (`identity.customer.js`) therefore fails closed: `POST /`, `upload-url`, `submit` and a
  customer `GET /:ref` answer **503 `CUSTOMER_AUTH_NOT_AVAILABLE`**. Replace `resolveCustomer` with identity's
  verified customer (`{ id }`) when it ships; nothing else changes. Staff routes work today.
- **Real storage provider.** No S3 / R2 adapter: provider, bucket, SSE-KMS key and credentials are undecided and the
  AWS SDK isn't a dependency. `STORAGE_DRIVER=memory` gives an in-process adapter for development/tests whose
  `memory-storage://` URLs can't receive real uploads; production never uses it and answers **503
  `STORAGE_NOT_CONFIGURED`**. A real adapter must implement the contract in `src/integrations/storage.js` (signed URLs
  binding content type and length, encryption at rest).
- **Virus scanning** (phases.md "virus scan hook on upload") — needs the real provider; would run before `UPLOADED`.
- **Notifications** for `kyc.*` events — no handler yet: the message wording is the owner's and there is no customer
  contact to send to until customer sign-in exists. Add handlers in `notifications.events.js` then.
- **Review queue** (staff list of applications waiting for review), retention of rejected/replaced files (open
  question in memory.md §6), CAPTCHA on `POST /kyc` (rules.md §11; moot until customers can sign in).
