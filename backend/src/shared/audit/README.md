# audit — the append-only audit trail

`audit_log` (rules.md §26, logs.md §2): one entry per staff/customer/system action on a sensitive record, written in
the same transaction as the change; reads of KYC data are recorded too.

```js
import { auditEntry, recordAudit } from '../../shared/audit/audit.js';

await withTransaction(async (session) => {
  // … the change, with { session } …
  await recordAudit(
    [
      auditEntry(actor, context, now, {
        action: 'kyc.document.rejected',
        entityType: 'kyc_document',
        entityRef,
        scopeRef,
        before,
        after,
      }),
    ],
    { session },
  );
});
```

- Refs and statuses only: never personal data, document contents or free-text reasons.
- The model refuses updates and deletes. Retention: 7 years (logs.md §1), via a future retention job.
- Not built yet: the `GET /audit?entityRef=` endpoint for SUPER_ADMIN (logs.md §2).
