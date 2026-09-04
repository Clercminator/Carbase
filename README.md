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

- `/`: landing page, product-video slot, quick actions, and the three-method analysis intake.
- `/deal-check`: public analysis flow using a publication link, license plate, or vehicle filters.
- `/analysis/demo-evaluacion`: explainable sample report with comparable selection, adjustments, confidence and disclosures.
- `/terminal`: professional demo workspace for appraisals, inventory, market liquidity, monitoring and alerts.
- `/methodology`: trust, methodology, data governance and limitations.

All displayed market values are demonstrative and must be replaced by backend/API results. The planned integration boundary and longitudinal data entities are documented in [`docs/data-contract.md`](docs/data-contract.md).

The professional terminal currently represents an authenticated state but does not implement production authentication. Organization isolation, roles and access control belong in the backend integration phase.
