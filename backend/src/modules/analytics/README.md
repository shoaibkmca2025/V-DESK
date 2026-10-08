# Analytics module

Website telemetry, KPIs and the conversion funnel (PRD §17, §59, §77).

- **Mounted at:** `/api/v1/analytics`
- **Build phase:** 1
- **Collections:** `analytics_events` (13-month TTL)
- **Frontend that will call it:** `features/analytics/telemetry.js` (ingest), admin telemetry tab and dashboard (reads)

## Endpoints (relative to the mount path)

| Method | Path             | Access                | What it does                                                             |
| ------ | ---------------- | --------------------- | ------------------------------------------------------------------------ |
| `POST` | `/events`        | public (rate-limited) | `{ events: [...] }`, 1–50 per batch → `202 { accepted, duplicates }`     |
| `GET`  | `/events`        | `analytics:read`      | Event stream, newest first. `?type=&cursor=&limit=` (limit ≤ 200)        |
| `GET`  | `/kpis?range=`   | `analytics:read`      | Searches, no-result rate, top / zero-result queries, devices, conversion |
| `GET`  | `/funnel?range=` | `analytics:read`      | Search → result → quote → checkout → KYC → payment step counts           |

`range` is `24h`, `7d` (default), `30d` or `90d`.

### Event shape (what `trackSearchEvent` already builds)

```jsonc
{
  "id": "EVT-mu2e5o7y",
  "type": "search_submitted",
  "data": { "query": "coworking in pune" },
  "device": "Mobile",
  "timestamp": "2026-10-08T10:15:00.000Z",
}
```

`type` is `snake_case`; `id`, `data`, `device` and `timestamp` are optional. The stream returns the same fields plus
`ref` (server id) and `receivedAt`.

## Rules worth knowing

- **Fire-and-forget:** a batch never fails because some events were already stored. Identical content (id, type,
  device, timestamp, data) is stored once, so retries and repeats are counted as `duplicates`.
- **`sendBeacon` works:** the route also accepts a JSON string with `Content-Type: text/plain`, which is what
  `navigator.sendBeacon` sends cross-origin without a preflight.
- **No PII is stored** (rules.md §21, `analytics.privacy.js`): keys like `name`, `email`, `mobile`, `fileName`, `pan`
  are dropped at any depth; emails, 10+-digit numbers and PANs in free text become `[email]` / `[number]` / `[pan]`.
  Payloads are capped (depth 3, 200-char strings, 20-item arrays, 2 KB).
- **Clocks:** a `timestamp` more than 5 min in the future or 7 days in the past is replaced by the receive time.
  Unknown `device` values are stored as `Unknown`.
- **Counted in events, not visitors:** the client sends no session id, so funnel rates are indicative. `fromPrevious` /
  `fromStart` are `null` when the step they divide by is 0.
- **Leads and revenue are not here:** lead counts come from `GET /leads/stats`; revenue will come from `orders`.

## Not built yet

`kpi_daily` rollup (KPIs aggregate on read — fine at current volume), GA4 Measurement Protocol forwarding, per-session
funnels (needs a client session id).
