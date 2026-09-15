# V-DESK — Business Infrastructure & Workspace Platform

React + Vite frontend for **V-DESK Workspace & Consulting LLP**. Uses the client-approved colour palette
(navy / gold / teal) with a simplified, easy-to-scan page layout built from shared `components/ui` blocks.

## Quick start

```bash
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
    ui/                    simple-UI building blocks: Section, Button, SearchHero, SplitHero, Plans, Steps,
                           CityGrid, FeatureCards, Testimonials, StatsRow, CtaBand, DocumentChecklist
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
docs/                      PRD & blueprint
_archive/                  original static site, backups, one-off scripts, screenshots (reference only)
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
  `37-simple-ui.css` holds the `.ui-*` component styles and colour tokens (`--ui-navy`, `--ui-gold`, `--ui-teal`, …).
- **Page layout pattern:** hero with one message → plans/options → what's included → steps → cities → FAQ → CTA.
  Compose new pages from `src/components/ui` rather than one-off inline styles.
- **Markup:** `src/pages/<page>/sections/*.jsx` for page content, `src/components/` for shared chrome/modals.
- **Navigation:** `src/config/navigation.js`.
- **Data / pricing:** `src/data/*.js`.
- **Images:** `public/assets/` — reference them with `asset('assets/…')` from `lib/assets.js`.

## Data

There is no backend yet. Leads (CRM) and search telemetry are stored in the browser's `localStorage`
(`VDESK_LEADS`, `VDESK_TELEMETRY_LOG`), the same as the original site. Payments and KYC are simulated in the
UI. The `features/*` modules are the integration points when an API is added.

## Deployment

Static hosting of `dist/` with an SPA fallback to `index.html`:

- **GitHub Pages:** `.github/workflows/deploy-pages.yml` builds with `VITE_BASE_PATH=/<repo>/` and copies
  `index.html` to `404.html` for deep links.
- **Netlify / Vercel / any static host:** build with `npm run build`, serve `dist/`, rewrite all routes to
  `/index.html`. Set `VITE_BASE_PATH` only when hosting under a sub-path.

Old URLs (`/virtual-office.html`, …) redirect to the new routes.
