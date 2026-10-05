# V-DESK — Business Infrastructure & Workspace Platform

Website and platform for **V-DESK Workspace & Consulting LLP**: virtual offices, coworking, meeting rooms,
company registration and GST/compliance services for startups and SMEs.

## Repository layout

```
V-DESK/
  frontend/      React 19 + Vite web app (live on Vercel) — see frontend/README.md
  backend/       Node.js + Express + MongoDB API (foundation in place, modules to be built) — see backend/README.md
  docs/          PRD, website blueprint, backend plan (docs/backend/*.md)
  _archive/      original static site, backups, one-off scripts, screenshots (reference only)
  .github/       CI (build + test frontend and backend) and GitHub Pages deploy workflows
```

Stack: **MERN** — MongoDB, Express, React, Node.js.

## Quick start

```bash
# frontend
cd frontend
npm install
npm run dev        # http://localhost:5173
npm test

# backend (needs MongoDB, or use `npm run dev:memory`)
cd backend
npm install
cp .env.example .env
npm run dev        # http://localhost:5000/health
npm test
```

Requires Node 22.12+ (Node 22 LTS recommended).

## Deployment

- **Vercel (frontend):** in the Vercel project settings set **Root Directory** to `frontend`. Framework preset Vite,
  build command `npm run build`, output directory `dist`.
- **GitHub Pages:** `.github/workflows/deploy-pages.yml` builds `frontend/` and publishes `frontend/dist`.
