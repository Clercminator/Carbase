# AUTOINDEX

Frontend for an independent automotive market-intelligence platform for Chile. The current implementation includes the acquisition landing page, vehicle-market search workflow, and a responsive analysis report.

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

`vercel.json` includes the SPA rewrite required for `/analysis` and future client-side routes.

## Current scope

- `/`: landing page, product-video slot, quick actions, and market search.
- `/analysis`: sample analysis report populated from the search selections.
- Data shown in the analysis is demonstrative and should be replaced by backend/API results when the data service is available.
