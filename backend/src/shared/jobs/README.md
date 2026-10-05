# shared/jobs

Background jobs (BullMQ + Redis): emails/WhatsApp, renewal reminders, meeting-room hold expiry, payment
webhook retries. Anything slow or external runs here, never inside a request (`docs/backend/rules.md` section 5).

Added when the notifications or booking module starts; requires `REDIS_URL` in `src/config/env.js`.
