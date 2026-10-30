# V-DESK — Business Infrastructure & Workspace Platform

React + Vite frontend for **V-DESK Workspace & Consulting LLP**. Uses the client-approved colour palette
(navy / gold / teal) with a simplified, easy-to-scan page layout built from shared `components/ui` blocks.

## Quick start

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
npm run build      # production bundle in dist/
npm run preview    # serve dist/ locally
npm test           # unit tests (vitest)
```

Requires Node 20.19+.

## Project structure

```
index.html                 HTML shell (meta tags, fonts, JSON-LD, manifest)
public/
  assets/                  logos, photography, hero video, PWA icons
  manifest.webmanifest     PWA manifest
  sw.js                    service worker (registered in production builds only)
src/
  main.jsx                 app bootstrap
  app/
    router.jsx             routes (+ redirects from the old *.html URLs)
    RootLayout.jsx         per-route page reset, scroll restoration
  config/
    pages.js               route → title / description / body class
    navigation.js          header, mobile drawer and footer link structure
  layouts/SiteLayout.jsx   header + drawer + page + footer + all global modals
  components/
    ui/                    design-system blocks: Section, Button, SearchHero, SplitHero, Plans, Steps,
                           CityGrid, CityStrip, FeatureCards, Testimonials, StatsRow, CtaBand,
                           Comparison, AcceptedFor, DocumentChecklist
    layout/                SiteHeader, MobileDrawer, SiteFooter, docks, banners
    modals/                one component per dialog (quote, booking, KYC, checkout, …)
    sections/              sections shared by several pages (VO configurator, solution finder, KYC docs)
  pages/<page>/            one folder per route: <Page>.jsx + sections/*.jsx
  components/page/         building blocks for the extended pages (PageHero, SectionHeader, FaqAccordion, LeadCard, …)
  components/cards/        CentreCard, WorkspaceCard (React versions of the approved cards)
  features/<feature>/      behaviour (plain JS, one folder per feature)
    pageRuntime.js         initialises every widget after a page renders
    templateActions.js     actions reachable from HTML-string widgets (data-action)
  data/                    catalog: locations, workspaces, testimonials, pricing rules, constants
  hooks/                   usePageDocument, usePageRuntime, useScrollRestoration
  lib/                     pageScope (listener cleanup), actions, html escaping, storage, assets
  styles/                  design system split into ordered partials (index.css imports them)
  __tests__/               unit tests
../docs/                   PRD & blueprint
../_archive/               original static site, backups, one-off scripts, screenshots (reference only)
```

## Routes

| Route | Page |
|---|---|
| `/` | Home |
| `/virtual-office`, `/coworking-spaces`, `/meeting-rooms`, `/pricing`, `/company-registration`, `/contact` | Product pages (approved design) |
| `/services`, `/services/:slug` | Services index + virtual-office / gst-registration / company-registration landing pages |
| `/locations`, `/locations/:city`, `/locations/:city/:product` | Directory, city hub, city × product (e.g. `/locations/mumbai/virtual-office`) |
| `/workspaces/:city` | Filterable workspace marketplace per city |
| `/search?q=` | Universal search results with intent, filters, zero-result recovery |
| `/resources`, `/resources/:slug`, `/faqs` | Knowledge centre, guide, FAQs |
| `/legal/privacy`, `/legal/terms`, `/legal/refund-policy`, `/legal/compliance` | Legal documents |
| `/login`, `/register`, `/kyc`, `/checkout`, `/bookings`, `/quote/:ref` | Account & transaction flows |
| `/portal`, `/admin` | Client portal, admin console |

Content for the data-driven pages lives in `src/data/` (`services.js`, `cities.js`, `guides.js`, `faqs.js`).

## How pages work

Each route renders `SiteLayout` with a page component. The page is plain JSX converted from the approved
HTML; interactive behaviour lives in `src/features/*` and is wired by `features/pageRuntime.js` inside a
*page scope* (`lib/pageScope.js`) so listeners, observers and timers are torn down on navigation — every
page starts fresh, exactly like the original multi-page site.

Widgets that render lists (location cards, CRM tables, portal tabs, command palette) build HTML strings and
use `data-action="…"` attributes (see `lib/html.js` → `action()`), dispatched by `lib/actions.js`.

## Editing the design

- **Styles:** `src/styles/*.css`. The partials are imported in cascade order by `src/styles/index.css`;
  add new rules in a new partial at the end or in the relevant existing one — do not reorder imports.
  `37-simple-ui.css` is the design system: colour tokens (`--ui-navy`, `--ui-gold`, `--ui-teal`, …), an 8pt
  spacing scale, type ramp, elevation and motion tokens, plus every `.ui-*` component. It follows Apple's
  Human Interface Guidelines for legibility (17px body, no weights under 400), materials (the header is a
  translucent control layer over opaque content), motion (short, purposeful, disabled under
  `prefers-reduced-motion`) and accessibility (WCAG AA contrast, 44px minimum control size, visible focus).
- **Page layout pattern:** hero with one message → plans/options → what's included → steps → cities → FAQ → CTA.
  Compose new pages from `src/components/ui` rather than one-off inline styles.
- **Markup:** `src/pages/<page>/sections/*.jsx` for page content, `src/components/` for shared chrome/modals.
- **Navigation:** `src/config/navigation.js`.
- **Data / pricing:** `src/data/*.js`.
- **Images:** `public/assets/` — reference them with `asset('assets/…')` from `lib/assets.js`.

## Data

There is no backend yet (it will live in `../backend/`). Leads (CRM) and search telemetry are stored in the browser's `localStorage`
(`VDESK_LEADS`, `VDESK_TELEMETRY_LOG`), the same as the original site. Payments and KYC are simulated in the
UI. The `features/*` modules are the integration points when an API is added.

## Deployment

Static hosting of `dist/` with an SPA fallback to `index.html`:

- **GitHub Pages:** `.github/workflows/deploy-pages.yml` builds with `VITE_BASE_PATH=/<repo>/` and copies
  `index.html` to `404.html` for deep links.
- **Netlify / Vercel / any static host:** build with `npm run build`, serve `dist/`, rewrite all routes to
  `/index.html`. Set `VITE_BASE_PATH` only when hosting under a sub-path.

Old URLs (`/virtual-office.html`, …) redirect to the new routes.

## Connecting to the API

The site runs on its built-in local data by default. Point it at the backend by setting `VITE_API_URL` at
build time — it is baked into the bundle, and must end in `/api/v1`:

```bash
VITE_API_URL=http://localhost:5000/api/v1 npm run build                            # a local API
VITE_API_URL=https://vdesk-api.shoaibk-mca2024.workers.dev/api/v1 npm run build    # the deployment
```

## Deploying

The site is a static-asset Worker on Cloudflare (`wrangler.jsonc`, SPA fallback so deep links survive a
refresh). Build with the API URL above, then:

```bash
npx wrangler deploy      # https://vdesk.shoaibk-mca2024.workers.dev
```

The API only accepts browser calls from the origins in its `CORS_ORIGINS`, so a new site domain has to be
added there **before** the site starts calling from it. Full runbook: `docs/deployment.md`.

`src/lib/api.js` is the single client: it adds the JSON headers, sends the staff refresh cookie,
applies a timeout, and turns the API's `{ error: { code, message } }` envelope into an `ApiError`.
`isApiEnabled()` is false when `VITE_API_URL` is unset, so each caller keeps its local behaviour.

Connected so far:

| Flow | Call | Fallback when the API is unreachable |
|---|---|---|
| Enquiry forms (`addLead`) | `POST /leads` | the enquiry stays in localStorage, unsynced |
| Telemetry (`trackSearchEvent`) | `POST /analytics/events` (batched, beacon on unload) | kept in the local log only |
| Catalog (centres, workspaces) | `GET /catalog` | the data the site was built with, in `src/data/` |
| Search results | `GET /search` | the in-browser search over the bundled catalog |
| Quote enquiries | `POST /pricing/quotes` | the enquiry is still recorded as a lead |
| Meeting-room holds | `POST /bookings/hold` | the scheduler's own ten-minute simulation |
| Staff console (`/admin`) | `/auth/*`, `/leads`, `/leads/stats`, `/leads/export.csv` | the enquiries in this browser |

Each client lives beside the feature it serves (`features/<feature>/<name>Api.js`) and returns `null`
rather than throwing when there is no API, so every caller keeps its local behaviour.

Staff sign in at `/admin` with their own account (password + authenticator code); the token is held
in `sessionStorage` for that tab only. The console shows the controls that account is allowed to
use — a role without `leads:write` sees statuses as badges rather than dropdowns.

The backend's `CORS_ORIGINS` must list the site's origin, or the browser blocks the call.

## Fluid layer (how the interface responds)

`src/styles/38-fluid.css` and `src/features/layout/drawerGesture.js` own behaviour rather than looks:

- **Response.** Controls show their pressed state on pointer-down, not on release; hover styles are
  behind `@media (hover: hover)` so they don't stick after a tap on a phone.
- **Direct manipulation.** The mobile drawer tracks the finger one-to-one from wherever it was
  grabbed, resists past its open edge, and on release projects where the flick was heading and
  springs there carrying that velocity — so a short fast swipe closes it and a slow drag springs back.
  Grabbing the panel mid-flight picks it up at its current position and speed.
- **Springs, not fixed durations.** `src/lib/spring.js` exposes `animateSpring` (Apple's damping +
  response parameters, interruptible, velocity-aware), `project()` for momentum, `rubberband()` for
  soft edges, and a velocity tracker. Reach for these for anything a finger can touch.
- **Materials.** Dialogs only composite their blur while they are open; the sticky header fades its
  edge into the content instead of drawing a divider.
- **Restraint.** A phone shows at most two layers of floating controls (the bottom dock and the page's
  action bar); the desktop-only widgets are hidden there.
- **Preferences.** `prefers-reduced-motion`, `prefers-reduced-transparency` and `prefers-contrast`
  each have a designed fallback, not a missing feature.
