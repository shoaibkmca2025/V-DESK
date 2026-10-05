# Orders module

Orders, Razorpay payments, GST invoices (CGST/SGST or IGST) and refunds.

- **Mounted at:** `/api/v1/orders`
- **Build phase:** 2
- **Collections:** `orders`, `payments`, `invoices`, `refunds`
- **Frontend that will call it:** `features/checkout/checkout.js`, `features/checkout/taxInvoice.js`

## Planned endpoints (relative to the mount path)

- POST /
- POST /payments/intent
- POST /webhooks/razorpay (signature-verified)
- GET /invoices/:no
- GET /invoices/:no/pdf

Full spec: [docs/backend/modules.md §3.7](../../../../docs/backend/modules.md). Layer rules: [backend/README.md](../../../README.md).
