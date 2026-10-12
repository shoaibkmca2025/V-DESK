# CMS module

Editable site content with a draft → publish workflow, so content changes need no deploy (PRD §56): FAQs,
testimonials, resource guides, legal pages, trust claims and SEO text — plus `sitemap.xml`.

- **Mounted at:** `/api/v1/content`
- **Build phase:** 3
- **Collections:** `content_entries` (every type; `draft` + `published` copy), `content_revisions` (every publish)
- **Reads (via `catalog/index.js`, `search/index.js`):** cities and services, for the sitemap
- **Frontend that will call it:** `data/faqs.js`, `data/testimonials.js`, `data/guides.js`, `content/legal.js`
  (replaced by the API), page `meta` (SEO overrides), the homepage / dock figures (trust claims)
- **Seed:** `node --env-file-if-exists=backend/.env backend/scripts/seed-content.js` — today's frontend content,
  published; trust claims as drafts only

## Content types

The type is part of the URL. Public shapes equal the frontend objects they replace (rules.md §42).

| Type           | Key                                        | Public shape                                                                |
| -------------- | ------------------------------------------ | --------------------------------------------------------------------------- |
| `faqs`         | group id (`virtual-office`)                | `{ id, title, icon, items: [[question, answer], …] }` — FAQ_GROUPS          |
| `testimonials` | slug (`priya-kulkarni`)                    | `{ key, quote, name, role, location }`                                      |
| `guides`       | slug                                       | `{ slug, title, category, readTime, date, excerpt, sections: [[h, text]] }` |
| `legal`        | `privacy`, `terms`, `refund`, `compliance` | `{ key, title, content (HTML), lastUpdated }`                               |
| `trust-claims` | slug (`businesses-served`)                 | `{ key, value: "10,000+", label }` — never the `evidence`                   |
| `seo`          | page path (`/virtual-office`)              | `{ path, title, description, noindex }`                                     |

## Public endpoints

| Method | Path           | What it does                                                            |
| ------ | -------------- | ----------------------------------------------------------------------- |
| `GET`  | `/:type`       | Published entries in order; guides newest first, `?category=GST`        |
| `GET`  | `/:type/:key`  | One published entry, else `404 CONTENT_NOT_FOUND`                       |
| `GET`  | `/seo?path=`   | The page's SEO override, or `null` (the page keeps its own title)       |
| `GET`  | `/sitemap.xml` | Every public page; needs `SITE_URL` (else `503 SITEMAP_NOT_CONFIGURED`) |

Content responses are `Cache-Control: public, max-age=300` with an ETag, so a published change is live within
5 minutes and unchanged content costs a `304`.

## Staff endpoints — `/admin/*`, permission `content:manage` (OPS_ADMIN, CONTENT)

| Method   | Path                          | What it does                                                                |
| -------- | ----------------------------- | --------------------------------------------------------------------------- |
| `GET`    | `/admin/:type`                | All entries with `draft`, `published`, `version`, `hasUnpublishedChanges`   |
| `GET`    | `/admin/:type/:key`           | One entry                                                                   |
| `PUT`    | `/admin/:type/:key`           | `{ data, order? }` creates (201); `{ data, version, order? }` saves a draft |
| `POST`   | `/admin/:type/:key/publish`   | `{ version }` — publishes that draft exactly                                |
| `POST`   | `/admin/:type/:key/unpublish` | Takes it off the site; the draft stays                                      |
| `DELETE` | `/admin/:type/:key`           | Soft delete → 204 (the key can be created again)                            |
| `GET`    | `/admin/:type/:key/revisions` | What was published, when, by whom — newest first                            |

SEO keys are paths, so URL-encode them: `PUT /admin/seo/%2Fvirtual-office`.

## Rules worth knowing

- **Draft vs live:** saving never changes the site; only `publish` does, copying the draft at the `version` the editor
  reviewed. Saves need the loaded `version` too — a stale one is `409 CONTENT_CHANGED` (with the current version), so
  two editors can't overwrite each other. Publishing and its revision record are one transaction.
- **Whole values:** `data` replaces the draft completely and is checked per type (`cms.validation.js`); unknown fields
  are `400`.
- **Legal HTML is sanitised on save** — the frontend renders it as HTML. Allowed: `h2–h4 p ul ol li strong em b i br`
  and `a href` (https/mailto). Scripts, styles, event handlers, images, iframes and `javascript:` links are removed;
  if nothing is left → `400 CONTENT_EMPTY`.
- **Trust claims** (memory.md §5, PRD §22): anyone with `content:manage` drafts them, but publishing needs
  `content:approve` (SUPER_ADMIN; `403 APPROVAL_REQUIRED`) **and** an `evidence` note (`400 EVIDENCE_REQUIRED`). Edits
  after approval wait for a new approval. The seed creates today's homepage figures (10,000+ businesses, 4.9★,
  2,400+ reviews, 100% approval support, 24 hrs, 10+ cities) as unapproved drafts — the site keeps its hard-coded
  figures until the frontend switches over and claims are approved.
- **Sitemap:** static pages, `/locations/<city>` + its four product pages, `/workspaces/<city>`, `/services/<slug>`,
  published guides (with `lastmod`) and legal pages; any path with a published SEO `noindex` is left out.
- **Logs** carry types, keys, versions and actors — never content.

## Not built yet

Homepage sections and banners (the homepage is hand-built JSX with no data source to move yet), notification
templates in the CMS (they live in notifications for now), image upload (storage integration), scheduled publishing,
restoring an old revision in one click (copy its `data` into a draft for now).

Full spec: [docs/backend/modules.md §3.12](../../../../docs/backend/modules.md). Layer rules: [backend/README.md](../../../README.md).
