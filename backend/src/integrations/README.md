# integrations

Wrappers around third-party services. One file per provider, each exposing a small interface plus a fake
implementation for tests (`docs/backend/rules.md` rule 6):

| File (planned)         | Provider                                                  | Used by                                                       |
| ---------------------- | --------------------------------------------------------- | ------------------------------------------------------------- |
| `razorpay.js`          | Razorpay payments + webhooks                              | orders                                                        |
| `storage.js` (built)   | Storage contract + memory dev/test adapter (no S3/R2 yet) | kyc; catalog images later                                     |
| `messaging.js` (built) | Provider contract + fake (no vendor)                      | notifications — real adapters below must implement it         |
| `email.js`             | Resend / SES                                              | notifications                                                 |
| `whatsapp.js`          | WhatsApp Business API                                     | notifications, crm                                            |
| `sms.js`               | MSG91 (OTP, transactional)                                | identity, notifications                                       |
| `turnstile.js` (built) | Cloudflare Turnstile CAPTCHA check                        | crm (`POST /leads`) via `shared/middleware/requireCaptcha.js` |

Modules call these through their service layer only. API keys come from `src/config/env.js`.
