# reweb

A Next.js 14 (app router, TypeScript) project scaffold for a small analysis app.

## Overview

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Purpose:** Lightweight app with an analysis API route and simple UI pages (Home, Result).

## Quick Start

Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

## Available Scripts

- `npm run dev` — Run the development server
- `npm run build` — Build for production
- `npm run start` — Start the production server (after build)

Check `package.json` for other scripts your project may define.

## Project Structure (key files)

- `app/` — Next.js app router pages and layout
  - `app/page.tsx` — Root page
  - `app/layout.tsx` — App layout
  - `app/api/analyze/route.ts` — API route for analysis
  - `app/Home/page.tsx` — Home page
  - `app/Result/` — Result page
- `components/` — React UI components
- `helpers/validation.ts` — Input validation helpers
- `lib/` — Project libraries and utilities
- `middleware/` — Middleware (if used)
- `errorHanlder.ts` — Global error helper (note: filename has a typo in the repo)
- `public/` — Static assets

## Notes & Recommendations

- The repo currently contains `errorHanlder.ts` (typo). Consider renaming to `errorHandler.ts` and updating imports.
- Keep API routes in `app/api/` to follow Next.js conventions.

## Deploy

This project can be deployed on Vercel for seamless Next.js support. Alternatively, build and run on any Node.js host that supports Next.js.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Open a PR with a clear description of changes

## Contact

For questions or help, open an issue or contact the project owner.
