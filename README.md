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
npm run preview
```

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

All displayed market values are demonstrative and must be replaced by backend/API results. The planned integration boundary and longitudinal data entities are documented in [`docs/data-contract.md`](docs/data-contract.md).

The professional terminal currently represents an authenticated state but does not implement production authentication. Organization isolation, roles and access control belong in the backend integration phase.

## Frontend demo behavior

- Terminal additions, outcomes, tracking rules and alerts persist locally in the browser using a versioned demo store.
- CSV export produces downloadable files. The inventory importer reads a selected CSV and reports the detected row count without sending data anywhere.
- Search, filters, drawers, modals, status controls and the responsive terminal navigation are interactive without a backend.
- Clearing the browser's site data resets the local demonstration state.

No local value should be treated as a production record. Authentication, server-side persistence, live scraping feeds and valuation-engine responses remain explicit integration points.
