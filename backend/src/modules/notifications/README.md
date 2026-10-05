# Notifications module

Email, WhatsApp and SMS sent in reaction to events from other modules.

- **Mounted at:** `/api/v1/notifications`
- **Build phase:** 1 (v1) · 3 (v2)
- **Collections:** `notification_templates`, `notification_log`
- **Frontend that will call it:** — (no direct UI; triggered by other modules)

## Planned endpoints (relative to the mount path)

- admin: CRUD on templates
- POST /webhooks/whatsapp

Full spec: [docs/backend/modules.md §3.10](../../../../docs/backend/modules.md). Layer rules: [backend/README.md](../../../README.md).
