# CF Pages Expense Tracker

This is a minimal expense tracker scaffold for Cloudflare Pages (Functions + D1).

Features
- Add / list expenses (amount stored as integer cents)
- Categories with CRUD (basic)
- Monthly budgets per category
- Simple React + Vite frontend and Pages Functions backend

Quick start
1. Clone the repo and install dependencies:

   npm install

2. Create a Cloudflare Pages project and a D1 database.
3. In the Pages project, add a D1 binding named `DB` that points to your D1 database under Functions > Variables & bindings.
4. Deploy the site to Pages. After deploy, visit `/init_db` once to create tables and seed categories.

Local development
- The frontend can be run locally with `npm run dev` (Vite).
- To test Functions with D1 locally, use Wrangler (wrangler dev) and bind your D1 database.

Notes
- Amounts are stored as integer cents to avoid floating point issues.
- This scaffold is single-user (no auth). Add Cloudflare Access or JWT for multi-user support.

