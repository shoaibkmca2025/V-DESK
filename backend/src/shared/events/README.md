# shared/events

Domain events let modules react to each other without importing each other's code
(for example: `lead.created` -> notifications sends a WhatsApp confirmation).

To be added with the first module that needs it:

- `eventBus.js` - `publish(type, { entity, payload })` / `subscribe(type, handler)`
- transactional outbox for payment and booking events (ADR-005 in `docs/backend/memory.md`)

Event shape: see `docs/backend/modules.md` section 4.
