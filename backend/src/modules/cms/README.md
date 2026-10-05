# CMS module

Editable content: pages, FAQs, testimonials, blog, banners, SEO metadata, trust claims.

- **Mounted at:** `/api/v1/content`
- **Build phase:** 3
- **Collections:** `pages`, `faqs`, `testimonials`, `blog_posts`, `banners`, `seo_meta`, `trust_claims`
- **Frontend that will call it:** `content/legal.js`, `data/faqs.js`, `features/testimonials/*`

## Planned endpoints (relative to the mount path)

- GET /:slug
- admin: CRUD with draft / publish
- GET /sitemap.xml

Full spec: [docs/backend/modules.md §3.12](../../../../docs/backend/modules.md). Layer rules: [backend/README.md](../../../README.md).
