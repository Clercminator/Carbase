# Commerce operations

## What is implemented

- Vite local API and Vercel Node functions share `server/commerce.js`.
- Guest checkout for single reports (4,990 CLP) and packs (11,990 CLP). Payment Brick accepts credit/debit cards in one installment. The backend always loads price from the order, never from the browser amount.
- Orders bind the buyer session when present; guest access uses an HMAC capability in an emailed URL fragment, removed from the browser URL and kept in sessionStorage. Tokens are never query parameters or stored in the database. Guest access lasts 90 days from creation. A verified account can claim its email's guest purchases; after claiming, guest capabilities stop working and login is required.
- Mercado Pago `/v1/payments` with one fixed idempotency key per order. An atomic `pending -> submitted` reservation prevents duplicate submission. Uncertain submissions must be reconciled, not blindly charged again. Rejected/cancelled purchases require a new checkout; submitted orders older than 30 minutes are not resubmitted.
- Payment notifications are HMAC checked, and their payment is fetched from Mercado Pago. Collector, order reference, currency, amount and update timestamp are validated. SQL locks serialize status changes. Duplicates and older notifications cannot regrant credits; refunds and chargebacks revoke downloads and unused credits. Partial refunds conservatively revoke fulfillment pending operator review. PDFs already emailed cannot be recalled.
- Successful payment consumes one credit for the initial, already prepared report. Pack redemption is atomic and idempotent per report; failures do not consume credit. Remaining credits expire 90 days after approval; existing report downloads remain available to the authenticated owner while the asset is retained.
- A private Supabase storage bucket holds report PDFs. All commerce tables have RLS and no browser-role grants. Only the server's service-role client accesses them. RPCs are revoked from public/anon/authenticated.
- Google Workspace SMTP sends the real PDF as an attachment and a purchase-management link, with total paid and tax-inclusive wording. Delivery records are separate from payment status. The UI says whether the message was handed to SMTP, not whether it reached the recipient's inbox.
- `/account` provides history (latest 100 orders), amounts paid, credit balance, downloads and explicit claiming of previous guest purchases. No invented subscription status is shown.

## Required local and deployed configuration

Use `.env.example` as a variable-name reference. Never commit actual values.

| Variable | Purpose |
| --- | --- |
| `SUPABASE_PROJECT_ID` or `SUPABASE_URL` | Supabase project |
| `SUPABASE_SECRET_KEY` | Server-only database/storage access |
| `SUPABASE_DATABASE_URL` | Session pooler connection for migrations; copy from Connect, including correctly encoded password |
| `MERCADOPAGO_PUBLIC_KEY` | Public Bricks initialization |
| `MERCADOPAGO_ACCESS_TOKEN` | Server payment API access |
| `MERCADOPAGO_COLLECTOR_ID` | Expected merchant ID; obtained with read-only `/users/me` |
| `MERCADOPAGO_WEBHOOK_SECRET` | Notification signature secret; rotate the exposed screenshot value |
| `ORDER_ACCESS_SECRET` | Independent random 32+ byte secret for guest access; changing it invalidates existing guest links |
| `CRON_SECRET` | Authentication for reconciliation/delivery job |
| `SMTP_USER` | `davidclerc@imrtech.xyz` |
| `SMTP_PASS` | Google app password, if account policy allows; not the normal Google password |
| `EMAIL_FROM` | `Carbase <davidclerc@imrtech.xyz>` |
| `APP_URL` | Canonical HTTPS site origin |
| `COMMERCE_ENABLED` | Explicit `true` only after all launch checks; defaults to disabled |

Google Workspace delivery uses `smtp.gmail.com:465` over TLS. If app passwords are unavailable, configure OAuth or an approved Workspace relay before enabling sales; OAuth is not implemented here. Follow [Google's app SMTP guidance](https://support.google.com/a/answer/176600) and [app-password prerequisites](https://support.google.com/mail/answer/185833). Supabase Auth email settings are separate from purchase-delivery SMTP.

## Setup and verification

```powershell
npm run commerce:setup
npm run commerce:check
npm run verify
npm run test:e2e
```

Setup uses a transaction and checksum-tracked migration, installs tables/RPCs, and creates/verifies the private `paid-reports` bucket. TLS verification remains enabled. The Session pooler URL is configured and the remote schema/private bucket are installed. The migration script includes the official Supabase root CA to verify TLS. SMTP authentication has passed without sending mail. The readiness command prints only missing names and availability, never credentials, and uses SMTP verify without sending a message.

Before enabling a prepared report, have the data pipeline create a reviewed, actual PDF. This phase integrates delivery of that PDF; it does not implement the live valuation engine or generate a real report from demo fixtures. A trusted operator can register a real report:

```powershell
node scripts/register-report.js "C:\path\to\real-report.pdf" "Informe de mercado" --verified
```

The command uploads a private PDF (max 8 MB), registers a report available for purchase for 24 hours, and prints checkout URLs for single/pack. The `--verified` flag is an operator attestation, not an automatic data-quality check. Do not register demonstrations as saleable reports. The future trusted pipeline should populate the same table after actual quality/coverage validation. Browser requests cannot create or alter these assets.

## Deployment and notifications

Scheduler update: Supabase Cron is now installed as `carbase-commerce-recovery`, running every five minutes. It calls the existing Vercel worker when submitted or approved orders exist; empty queues skip the HTTP call. The URL and bearer credential are stored in Supabase Vault. No Edge Function or Vercel Cron is required. Free-project pauses still stop scheduling.

- Install or refresh the job and Vault values: `npm run commerce:scheduler`.
- Inspect cron runs and HTTP results: `npm run commerce:scheduler -- check`.
- Exercise the real worker immediately: `npm run commerce:scheduler -- probe`. This processes existing work and can deliver queued emails.
- Pause this job: `npm run commerce:scheduler -- pause`.

Re-run installation after changing `APP_URL` or `CRON_SECRET`, matching the deployed worker. Installation replaces the named job without duplicating it. The private dispatcher is unavailable to browser roles. Request and cron metadata for this job are pruned after seven days; pg_net HTTP responses have shorter retention. Cron success means a request was queued: also inspect HTTP status and the worker's `failed` count.

The initial live network probe returned HTTP 200 with zero reconciliations, emails or failures against an empty database. No charge was made. The user reports the production webhook URL is configured. Event selection, rotated-secret confirmation and provider test transactions remain launch checks. Profesional monthly billing is implemented behind a separate launch gate; see the subscription operations below.

No hosting plan was upgraded. Vercel Hobby's non-commercial-use restriction still applies independently of payment enablement. Supabase Free retains its pause, storage and backup limitations.

Deploy the Node functions as well as the Vite assets. Copy the needed environment values to Vercel; local `.env` is not uploaded automatically. Use an isolated test project/configuration for provider test purchases. The API routes are kept ahead of the SPA fallback.

Set Mercado Pago's production webhook URL to:

`https://carbase-ten.vercel.app/api/webhooks/mercadopago`

Only configure it after this endpoint is deployed. Enable payment events (`payment`, shown as Pagos/legacy in the supplied screen) for this implementation. It uses `/v1/payments`, not the Orders API. Enable Planes y suscripciones as well after deploying the Profesional handlers. They process subscription_preapproval and subscription_authorized_payment. Shared plan-template notifications are acknowledged without granting credits; this integration uses subscriptions without shared provider plans. Leave shipping, delivery and other unrelated topics disabled. See [provider webhook documentation](https://www.mercadopago.cl/developers/es/docs/your-integrations/notifications/webhooks).

A valid payment webhook persists the result before attempting email. Failed email attempts request a retry. The installed scheduler sends GET requests to `/api/commerce?action=jobs` with `Authorization: Bearer <CRON_SECRET>`. The explicit installation command and monitoring instructions are above. The worker handles small batches to fit serverless time limits. It reconciles submitted and approved payments in round-robin order using a last-checked timestamp and attempts up to two outstanding PDF deliveries per run. Monitor backlog and scale the worker before higher volume.

SMTP does not offer exactly-once delivery. A process crash after SMTP acceptance but before recording success can cause a duplicate email. Database payment/credit operations remain idempotent. A delivery lease avoids normal concurrent sends; crashed leases expire after ten minutes. The stable Message-ID helps investigate duplicates but is not a guaranteed deduplication mechanism. Monitor bounces in the sender mailbox; bounce webhooks are not implemented.

If payment creation times out before returning its ID, the job searches by the order reference; if none or multiple are found, leave it submitted and investigate. Do not automatically issue another charge. The job also checks approved payments to catch missing refund/chargeback notifications. At higher volume, move reconciliation and email to a dedicated queue; monitor the full-sweep delay.

## Launch checklist and boundaries

- Install the remote schema/private bucket and verify browser roles cannot read or mutate commerce records.
- Confirm secret rotation, SMTP authentication, deployed environment values, and scheduler operation.
- Test provider-supported approved/rejected/pending flows, signed notifications, duplicate/out-of-order delivery, refund/chargeback handling and recovery from network failures in an isolated environment. Local tests mock the provider and SMTP; they are not provider certification.
- Verify actual PDF contents/layout and successful delivery to a controlled mailbox before public sales. No production payments or emails have been sent in this work.
- Complete commercial/refund/privacy terms and fiscal receipt/invoice handling. The email describes the purchase; it is not an automatically issued Chilean tax document.
- Publish a real report entry flow after the trusted live-data pipeline exists. The public pricing page still clearly labels plans upcoming; a checkout URL alone is not a launched product.
- Automotora organizations, automatic valuation/PDF generation, wallet checkout, fiscal documents and bounce processing are outside this release.

## Test evidence

The unit/API tests exercise signature tampering, guest isolation and expiry, claimed-account ownership, price tampering, deferred payment retries, verified-email claiming and default-disabled checkout. PostgreSQL-compatible PGlite tests execute the actual migration and exercise duplicated approval, refunds, atomic pack limits, access grants and rate limiting. Browser tests use a simulated Bricks SDK/payment service for guest checkout, private downloads, account history and login routing on desktop/mobile. Production network validation remains outstanding.

The Session pooler URL is for migrations only. Runtime commerce uses Supabase HTTPS/PostgREST and Storage. See [Supabase connection guidance](https://supabase.com/docs/guides/database/connecting-to-postgres).

Deployment preparation: required production runtime variables are stored in Vercel; private credentials use its secret type. Database connection/password variables remain local to migrations. `COMMERCE_ENABLED=false` is retained. The app name is defined in `src/config/brand.js`; email sender display names and PDF filenames use it too.


## Profesional subscription operations

The separate SUBSCRIPTIONS_ENABLED flag defaults to false and also requires COMMERCE_ENABLED=true. Do not enable either production gate during mocked tests. Profesional requires a verified account and explicit recurring-payment consent: 29,990 CLP including IVA, 30 prepared reports per paid monthly period, one user, no rollover or automatic overages. Live publication tracking and valuations remain demonstrations and are disclosed separately on checkout.

Card Payment Brick tokenizes the card; the server creates a preapproval with a fixed monthly CLP amount. It persists a local reference before calling the provider, enforces one non-cancelled subscription per account, and never blindly retries an uncertain creation. No raw card data or card token is stored. If a creation remains uncertain, reconciliation searches the provider using the local reference and payer email, validates the exact match and requires manual review for absent/ambiguous or truncated results. Do not delete uncertain rows just to let a buyer try again.

Authorizing a subscription grants no credits. Each provider invoice is linked to its preapproval and fetched payment; merchant, reference, amount and currency are checked. Only an approved payment grants that invoice's 30 credits. Cycle expiry is the invoice debit date plus one calendar month in UTC (month-end clamped). Late approvals do not extend an old cycle; future cycles cannot be redeemed early. Invoice and cycle uniqueness plus row locks prevent duplicate grants. Rejected-payment retries can replace an unsettled payment, while settled or refunded cycles cannot be silently replaced. Partial refunds and chargebacks revoke that cycle's downloads and remaining credits.

Mi cuenta shows monthly authorizations separately from paid purchases. Cancellation persists an intent before contacting Mercado Pago; failures remain visible and are retried. Confirmed cancellation does not shorten paid-order expiry or remove purchase history. A renewal already in progress at cancellation requires provider reconciliation; cancellation is not an automatic refund.

The carbase-subscription-recovery scheduler runs every five minutes, offset two minutes from report delivery, and calls action=subscriptionJobs. It checks one subscription and one paginated invoice per run with a persistent cursor. Cancelled subscriptions remain in reconciliation for late refunds. This intentionally small worker is for pilot traffic: full reconciliation latency grows with subscriptions and invoice history. Inspect both cron execution and HTTP response failed counts; scale to a queue and add alerts before higher volume. Run commerce:scheduler after the deployed handler supports the action. Its check, pause and probe modes cover both jobs.

The migration runner verifies checksums and applies all ordered migration files, including 202609080001_subscriptions.sql. The original one-time migration remains immutable.

### Provider test boundary

Store actual secrets only in ignored .env.test.local. The committed .env.example must contain placeholders. The explicit test credential checker reads ONLY .env.test.local, never production fallbacks: node scripts/check-mercadopago-test.js. A TEST-prefixed business-app token is different from a separate test-seller application; subscription validation still needs test-seller app credentials and a test buyer. No production subscription should be created to work around missing test setup.

Reference: Mercado Pago Subscriptions API (preapproval, authorized_payments and v1/payments), and its Card Payment Brick integration. Automated tests use simulated provider and SMTP responses plus the actual SQL on PGlite; they are not evidence that Mercado Pago has accepted the integration.
