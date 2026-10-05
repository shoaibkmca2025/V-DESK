# integrations

Wrappers around third-party services. One file per provider, each exposing a small interface plus a fake
implementation for tests (`docs/backend/rules.md` rule 6):

| File (planned) | Provider                           | Used by                 |
| -------------- | ---------------------------------- | ----------------------- |
| `razorpay.js`  | Razorpay payments + webhooks       | orders                  |
| `storage.js`   | AWS S3 / Cloudflare R2 signed URLs | kyc, catalog images     |
| `email.js`     | Resend / SES                       | notifications           |
| `whatsapp.js`  | WhatsApp Business API              | notifications, crm      |
| `sms.js`       | MSG91 (OTP, transactional)         | identity, notifications |

Modules call these through their service layer only. API keys come from `src/config/env.js`.
