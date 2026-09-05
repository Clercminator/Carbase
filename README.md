# AUTOINDEX

Frontend for an independent automotive market-intelligence platform for Chile. The current implementation connects a public Deal Check, an explainable analysis report, and a professional terminal demonstration.

## Local development

```powershell
npm install
npm run dev
```

Open `http://localhost:5173`.

## Production checks

```powershell
npm run verify
npm run test:e2e
npm run preview
```

`npm run verify` runs ESLint, the Vitest scenario suite and the production build. Playwright covers the public analysis journey, consent and recovery states, conversion actions, terminal keyboard interactions, legal routes, responsive overflow and automated Axe checks on the primary public pages.

## Deploying to Vercel

Import the GitHub repository into Vercel. The project uses the Vite defaults:

- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`

`vercel.json` includes the SPA rewrite required for client-side routes.

## Current scope

- `/`: landing page with a subtle automotive background, product-video slot, quick actions, and the three-method analysis intake.
- `/deal-check`: public analysis flow using a publication link, license plate, or vehicle filters.
- `/analysis/demo-evaluacion`: explainable sample report with comparable selection, adjustments, confidence and disclosures.
- `/terminal`: professional demo workspace with functional views for appraisals, inventory, market liquidity, monitoring, alerts and data governance.
- `/methodology`: trust, methodology, data governance and limitations.
- `/privacy`: demonstrative privacy and data-treatment behavior, clearly marked for legal review.
- `/terms`: limitations and conditions of the current demonstration.
- Unknown routes render an explicit recovery page instead of silently returning the homepage.

All displayed market values are demonstrative and must be replaced by backend/API results. The planned integration boundary and longitudinal data entities are documented in [`docs/data-contract.md`](docs/data-contract.md).

The professional terminal currently represents an authenticated state but does not implement production authentication. Organization isolation, roles and access control belong in the backend integration phase.

## Frontend demo behavior

- Terminal additions, outcomes, tracking rules and alerts persist locally in the browser using a versioned demo store.
- CSV export produces downloadable files. The inventory importer reads a selected CSV and reports the detected row count without sending data anywhere.
- Search, filters, drawers, modals, status controls and the responsive terminal navigation are interactive without a backend.
- Clearing the browser's site data resets the local demonstration state.

No local value should be treated as a production record. Authentication, server-side persistence, live scraping feeds and valuation-engine responses remain explicit integration points.

## Demonstrative analysis states

The frontend can render high, medium and low confidence estimates as well as processing, insufficient-data, unavailable-publication and service-error states. These fixtures prevent the future API integration from treating every request as a successful valuation. Shared demo URLs contain only the scenario identifier and never place a patent or contact field in the URL.

GitHub Actions runs verification and Chromium end-to-end checks on pushes to `main` and pull requests.
