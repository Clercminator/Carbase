# Carbase

Carbase is an automotive market-intelligence product for Chile, built to help people evaluate a purchase or sale and help professionals manage recurring vehicle decisions. Its interface connects a simple public analysis flow with a more detailed professional workspace.

The current application combines an interactive market-data demonstration with Supabase authentication. Market figures, valuations, monitoring events and confidence scores are illustrative. Live market analysis, recurring billing and organization-wide records are not implemented. One-time commerce is implemented locally behind a launch gate, with remote setup and provider validation pending. This document describes the product, its construction and the reasons behind its design.

## Users, payment and access

The commercial model is a proposal, reflected in the frontend catalog in `src/data/pricingPlans.js`. All proposed prices are CLP including IVA. A gated first implementation now provides guest card checkout, server-side purchase records and pack credits; production payments remain disabled pending real report delivery and provider acceptance tests. Monthly subscriptions remain planned.

| Expected user | Intended offer | What they would see and use | Why this level of access fits |
| --- | --- | --- | --- |
| Curious visitor or occasional researcher | Explora, free and without a card | A limited preview with an indicative price range, confidence, coverage and limitations; public methodology and privacy pages | Lets people understand the value before committing to a purchase |
| Individual buyer or seller evaluating one vehicle | Informe individual, proposed $4,990 once | One complete report with selected comparable evidence, an explanation of relevant adjustments, negotiation references and a planned download | Vehicle purchases and sales are occasional, so a report is more appropriate than a subscription |
| Buyer comparing several options | Compara 3, proposed $11,990 once | Three complete analyses, with proposed credits valid for 90 days | Supports a short shopping process at a lower total cost than three single reports |
| Independent appraiser or professional buyer | Profesional, proposed $29,990 per month | 30 complete analyses per month, one user, up to 20 tracked listings, market terminal and CSV export | Recurring decisions benefit from monitoring and a working history |
| Automotora team | Automotora, proposed $79,990 per month | 150 analyses per month, three users within one organization, up to 100 inventory vehicles and 100 tracked listings, alerts and CSV export | Shared inventory and repeated buying and selling justify a team subscription |

Confidence, material limitations and insufficient-data notices remain visible at every tier. Paid value comes from report depth, volume and workflow tools. It does not include access to proprietary formulas, source acquisition processes, source contracts or another customer's business records. The full public sample demonstrates the paid report format; it is not an unlimited free production report service.

The commercial access model allows guest report/pack purchases through private email links, with optional claiming into a verified individual account. Team records will belong to an organization. A team administrator would manage membership and the subscription; authorized colleagues would work with the organization's shared allowance and permitted records. Visitors and unrelated organizations would have no access to private reports, acquisition costs, margins or inventory records. These organization roles and permissions are planned, not current functionality. Any future service-operator access would be limited to an authorized support or operational purpose; there is no operator console today.

Today, visitors can use the public analysis demo and sample report without signing in. Any signed-in user can explore every terminal demo view for free, regardless of plan. Supabase manages account access; a React route guard redirects unauthenticated terminal visitors to sign-in and preserves their destination. That guard is not server-side data authorization or a billing entitlement system. Future commercial access depends on server-verified purchases, report ownership and organization membership.

The proposed credit model charges for successfully delivered analyses with sufficient information. Reopening an existing report would be free; generating a new analysis against updated information would use another credit. Prices, allowances and terms remain proposals because live delivery costs and customer demand have not yet been validated. [Pricing and payments](docs/pricing-and-payments.md) records the broader commercial proposal.

## Product structure

| Surface | Current purpose |
| --- | --- |
| `/` and `/deal-check` | Introduce the product and accept a publication link, license plate or vehicle description for a demonstration |
| `/analysis/:analysisId` | Present a sample recommendation, selected comparables, explanatory adjustments, confidence and next actions |
| `/terminal/:view` | Provide authenticated demo views for summary, appraisals, market, inventory, tracking, alerts and data information |
| `/auth` | Support registration, sign-in, email-confirmation callbacks, password recovery and sign-out |
| `/pricing` | Explain proposed personal and business plans, with demo links and paid offers marked as upcoming |
| `/methodology`, `/privacy` and `/terms` | Explain the approach, actual data handling and the limits of the demonstration |

Unknown routes have a dedicated recovery page. The public navigation connects analysis, market, distributor and methodology destinations. The terminal has its own contextual navigation and local search because professional users work repeatedly across records and views.

## How it was built and why

The frontend uses React, Vite and React Router. Shared layout and form components keep the public journey consistent, while terminal views group denser professional tasks in one workspace. Responsive CSS preserves the restrained, Spanish-language market-terminal presentation across desktop and mobile. Lucide icons support recognizable actions without introducing a separate illustration system.

Scenario fixtures separate report rendering from the eventual valuation service. They cover high, medium and low confidence, processing, insufficient information, unavailable publications and service errors. This makes uncertainty and recovery part of the product instead of assuming every request produces a price. Selected report evidence explains a result to the customer without documenting the engine's full implementation. The integration boundary and planned data entities are described in [the data contract](docs/data-contract.md).

Supabase Auth handles identity rather than a custom password system. The browser receives the public project URL and publishable key; database passwords and secret keys are not exposed by the Vite configuration. Email delivery still depends on the provider's production configuration. Authentication integration does not imply that market data or business records are stored in Supabase.

The terminal uses a versioned local demo store keyed by the signed-in user ID. This allows users to explore additions, outcomes, tracking and alerts across reloads without a market backend. It is convenience storage on one device, not a secure shared business database. The CSV importer reads a file locally and reports its detected row count; CSV exports download demo records. Neither feature provides server-side synchronization.

Analysis inputs live in browser session storage. Saved analysis references use browser-local storage without account scoping and contain scenario identifiers rather than license plates or contact information. Shared demo URLs also omit those inputs. The plate flow asks for explicit authorization, and the inspection form demonstrates consent without submitting contact information to an inspector. Signing out ends account access but does not erase locally saved demo data or delete the account.

Vercel serves the built frontend, and `vercel.json` routes direct page requests through the single-page application. ESLint, Vitest, the production build and Chromium Playwright journeys provide validation through the repository's verification pipeline and GitHub Actions. Browser coverage includes desktop and mobile flows, authentication with mocked provider responses, pricing interactions, recovery states, keyboard access, route identity, overflow and automated accessibility checks. Mocked authentication checks do not establish live email delivery or backend authorization.

## Trust and disclosure

The public methodology page explains the broad process: review information, compare similar vehicles and present a contextual result with clear limits. The terminal's Datos view explains how to interpret the product, without publishing a source register, licensing inventory, internal readiness scores or operational controls. Customer-facing transparency focuses on what a result means and how reliable it is.

The privacy page describes actual account processing, browser storage, plate authorization and the demonstrative inspection flow. It distinguishes today's behavior from future services. Responsible use is explained through concrete behavior rather than unsupported security or regulatory claims. Commercial privacy contacts, retention terms and request mechanisms remain incomplete and are identified as such.

The current scope still excludes live data acquisition and valuation, server-side record persistence, organization permissions, payment reconciliation, enforceable allowances, paid report delivery and inspection-provider submission. The interface demonstrates these product directions where applicable; it does not establish that those services are operational.

Mercado Pago production credentials are configured locally. Vite maps only `MERCADOPAGO_PUBLIC_KEY` to the browser; `MERCADOPAGO_ACCESS_TOKEN` and `MERCADOPAGO_CLIENT_SECRET` remain private. A read-only account check returned HTTP 200 for Chile on September 7, 2026. Payment processing, subscription lifecycle, webhook verification and the server-side credit ledger are still pending; this configuration does not enable charges. Set a separate `MERCADOPAGO_WEBHOOK_SECRET` when configuring notifications. Local `.env` values are not automatically deployed to Vercel.


## Commerce implementation and setup

Guest checkout is `/checkout?plan=report&report=<prepared-report-id>` (or `plan=pack`). `/purchase/:id` provides payment status, private downloads and pack redemption. `/account` shows purchase history, prices paid, PDFs and verified-email claiming of earlier guest purchases. Guest purchases do not require an account; claimed purchases require their owner's session.

Vercel Node functions and the Vite local middleware share `server/commerce.js`. The backend verifies Mercado Pago notifications, checks the merchant/currency/amount/order, records payment state and grants credits idempotently. Google Workspace SMTP delivers real PDF attachments from `davidclerc@imrtech.xyz`. Payment and delivery states are separate. Monthly billing, real valuation/PDF generation and fiscal documents remain outside this phase.

`COMMERCE_ENABLED=false` keeps charges disabled until database setup, actual prepared reports, SMTP authentication, deployed configuration and provider tests are complete. Only the Mercado Pago public key belongs in the frontend. Server secrets must never use a `VITE_` prefix. Local `.env` is not uploaded to Vercel.

Run `npm run commerce:setup` after adding the Supabase Session pooler URL as `SUPABASE_DATABASE_URL`, then `npm run commerce:check`. The remote commerce schema and private storage bucket are installed; the migration script verifies TLS using the bundled official Supabase root CA. The readiness command prints only names/status and verifies SMTP without sending mail. See [commerce operations](docs/commerce-operations.md) for exact routes, configuration, trusted report registration and delivery/reconciliation scheduling.

## App name

Change `APP_NAME` in [`src/config/brand.js`](src/config/brand.js) to rename the app. Navigation, page metadata, HTML/Open Graph titles, purchase-email display names and subjects, and report filenames derive from it. Rebuild and deploy after changing it. Legacy browser-storage keys keep their original identifiers to preserve existing demo records.
