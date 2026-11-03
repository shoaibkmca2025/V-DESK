# Deploying V-DESK

Three things run in production: the **site** (Cloudflare Workers, static assets), the **API** (Cloudflare
Workers, the Express app) and the **database** (Neon PostgreSQL). ADR-010 and ADR-011 in
`docs/backend/memory.md` record why.

| Piece    | Where                                            | Deployed from | URL                                           |
| -------- | ------------------------------------------------ | ------------- | --------------------------------------------- |
| Site     | Cloudflare Workers (`assets`, SPA fallback)      | `frontend/`   | https://vdesk.shoaibk-mca2024.workers.dev     |
| API      | Cloudflare Workers (`nodejs_compat`, cron)       | `backend/`    | https://vdesk-api.shoaibk-mca2024.workers.dev |
| Database | Neon, project `vdesk` (`super-recipe-64885215`), Singapore | `backend/migrations/` | — |
| Pooling  | Cloudflare Hyperdrive `vdesk-neon`               | —             | binding `HYPERDRIVE`                          |

## Before anything: one plan decision

**Staff password sign-in needs the Workers Paid plan.** Hashing a password with argon2id costs about half a
second of CPU — that is the whole point of a password hash — and the Workers **free** plan allows 10 ms of
CPU per request, so `/auth/login`, `/auth/users` and `/auth/password` fail intermittently with Cloudflare
error 1102 (served as a 503). Everything else fits comfortably: the customer OTP sign-in, booking, catalog,
search, quotes, leads and the cron jobs are all I/O-bound.

Workers Paid ($5/month) raises the limit to 30 s of CPU, which settles it. Until then, treat the admin
console as unavailable on this deployment; the public site and the customer portal work.

## The database

```bash
cd backend
npm run migrate                 # applies migrations/*.sql, once each
npm run migrate -- --status      # what is applied, what is pending
```

`DATABASE_URL` for a **Node** host (or local work against Neon) is Neon's **pooled** connection string — the
`-pooler` host. The Worker does not use `DATABASE_URL`: it gets its connection from the Hyperdrive binding,
which is configured with Neon's **direct** (non-pooled) host, because Hyperdrive does the pooling itself.

Hyperdrive **query caching must stay disabled** for this API (`wrangler hyperdrive update <id>
--caching-disabled`). With caching on, a read right after a write can be served from the cache: a customer
would ask for an OTP and then be told no code was ever requested. The whole data layer assumes
read-your-writes.

Seeding a fresh database:

```bash
node --env-file-if-exists=.env scripts/seed-catalog.js        # cities, centres, workspaces
node --env-file-if-exists=.env scripts/seed-search.js         # services, popular searches
node --env-file-if-exists=backend/.env scripts/seed-content.js  # FAQs, testimonials, guides, legal (from repo root)
# or, against any environment you have a staff key for, over HTTP:
API=https://vdesk-api.shoaibk-mca2024.workers.dev KEY=<admin key> node scripts/seed-over-api.mjs
```

## The API

```bash
cd backend
npx wrangler secret bulk secrets.json   # JWT_SECRET, MFA_ENCRYPTION_KEY, ADMIN_API_KEY (≥32, ≥32, ≥16 chars)
npx wrangler deploy
node scripts/smoke.mjs                  # API=https://… to check a deployment end to end
```

`wrangler.jsonc` holds everything else: the Hyperdrive binding, the cron triggers, and the vars
(`NODE_ENV`, `LOG_LEVEL`, `TRUST_PROXY`, `SITE_URL`, `CORS_ORIGINS`). Two of those matter more than they
look:

- **`NODE_ENV=production`** — without it the API answers `/auth/otp/request` with the code it was supposed
  to text, and leaves `Secure` off the refresh cookies.
- **`CORS_ORIGINS`** — must list the site's exact origin, or the browser blocks every call. It carries
  credentials (the refresh cookie), so a wildcard is not an option.

The secrets are set once per Worker and are not in the repository. To rotate: `wrangler secret put
JWT_SECRET` (every staff session ends), `wrangler secret put MFA_ENCRYPTION_KEY` (**only with a plan to
re-enrol every authenticator** — existing TOTP secrets are encrypted with it).

### Background jobs

On a server the worker process loops every second (`npm run worker`). On Workers it is cron:

| Trigger     | Runs                                                        |
| ----------- | ----------------------------------------------------------- |
| `* * * * *` | outbox delivery, and the message queue once a provider exists |
| `0 * * * *` | the row purge (what MongoDB's TTL indexes used to do)        |

So an event — a lead confirmation, a sales alert — goes out **within a minute** rather than within a
second. If that ever needs to be faster, run `npm run worker` on any always-on host against the same
database; the two cannot collide, because every claim takes one row with `FOR UPDATE SKIP LOCKED`.

## The site

```bash
cd frontend
npm run cf:deploy        # = npm run build && npx wrangler deploy
```

`VITE_API_URL` is baked into the bundle at build time. It lives in **`frontend/.env.production`** (committed),
which every production build reads and which takes priority over a personal `.env.local`. The build refuses
to finish unless the address is a public `https` URL ending in `/api/v1` (`scripts/check-api-url.js`).

Why: on 30 Oct 2026 the site was built with `http://127.0.0.1:5080/api/v1` from a developer's `.env.local`.
Every API call then failed in visitors' browsers and leads, bookings and staff sign-in quietly fell back to
browser-only storage — the site looked fine while nothing reached the database. Redeployed with the right
address on 3 Nov 2026. Never keep a `.env.production.local`; it would override the committed file. Check it
landed:

```bash
grep -ro "vdesk-api[^\"']*" dist/assets/*.js | head -1
```

## Moving to a real domain

1. Add the zone to the Cloudflare account, then give each Worker a route: `vdesk.in/*` for the site,
   `api.vdesk.in/*` for the API (`wrangler.jsonc` → `routes`).
2. Set the API's `SITE_URL` and `CORS_ORIGINS` to the new site origin, and deploy it.
3. Change `VITE_API_URL` in `frontend/.env.production` to `https://api.vdesk.in/api/v1`, commit, and
   redeploy the site (`npm run cf:deploy`).

Order matters: the API has to accept the new origin before the site starts calling from it.

## Checking a deployment

```bash
curl https://vdesk-api.shoaibk-mca2024.workers.dev/health   # the Worker is up
curl https://vdesk-api.shoaibk-mca2024.workers.dev/ready    # …and Neon answers through Hyperdrive
API=https://vdesk-api.shoaibk-mca2024.workers.dev node backend/scripts/smoke.mjs
npx wrangler tail --name vdesk-api                          # live logs, including cron runs
```

`smoke.mjs` skips the sign-in half against a production API, because that deliberately no longer returns
the OTP code; it still proves health, readiness, the catalog, and that holding a room without a session is
refused.
