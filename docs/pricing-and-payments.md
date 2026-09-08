# Pricing and payments proposal

Working proposal · 2026-09-07. Not approved production pricing. `/pricing` exposes the proposal and demonstration links; a first one-time commerce implementation is now present but gated pending provider acceptance testing and real prepared reports. See [commerce operations](commerce-operations.md).

## Launch catalog

All amounts are CLP including IVA. `src/data/pricingPlans.js` is the frontend catalog; the server owns authoritative one-time prices and the Profesional subscription amount.

| Plan | Gross price | Allowance | Term |
| --- | ---: | --- | --- |
| Explora | 0 | Demonstration now; proposed limited preview at launch | No card |
| Informe individual | 4,990 | 1 complete analysis | Credit valid 90 days |
| Compara 3 | 11,990 | 3 complete analyses | Credits valid 90 days |
| Profesional | 29,990/month | 30 analyses, 1 user, 20 tracked listings | Monthly; credits do not roll over |
| Automotora | 79,990/month | 150 analyses, 3 users, 100 inventory vehicles, 100 tracked listings | Monthly; shared organization allowance |

A complete analysis includes comparable evidence, adjustments, confidence, and negotiation references. Paid downloadable reports, live monitoring, shared organizations, and billing require implementation. Current terminal CSV export and local demo storage are not those services.

An analysis consumes credit only on successful delivery with sufficient evidence. Reopening an existing report is free; regenerating against updated inputs/data consumes another credit. Reserve and finalize credits atomically, release reservations after failure, and prevent duplicate consumption on retries. No automatic overage charges. Offer a pack or next-cycle reset on exhaustion. Permit cancellation of the next renewal with access through the paid term. Exact refund rules and final commercial terms must be completed before taking payments.

## Why these plans

Consumers shop episodically: start with a single report and a pack instead of forcing a subscription. The pack saves 2,980 versus three singles (19.9%). Professionals need repeated analysis and monitoring; cap usage because data acquisition and refresh costs are unknown. Avoid unlimited plans, annual commitments, unverified best-seller badges, and a fixed enterprise price before learning usage. Larger teams need a scoped quotation once a sales channel exists.

The free production preview should show an indicative range, confidence and coverage; full comparables, adjustments and downloadable evidence distinguish the paid report. The currently public full sample remains a sample. Coverage gating must happen before purchase where possible; confidence and limitations must never be hidden behind a premium tier.

Research checked 2026-09-07:

- [Vendicar](https://vendicar.cl/) lists Starter at 1.5 UF + IVA/month with 3 users, 20 vehicles, and limited daily valuation/comparison queries. It includes broader operational software, so this is an adjacent benchmark, not a like-for-like valuation service. Profesional gives solo users a lower entry point; Automotora must prove value in analysis rather than promise ERP breadth.
- [Autofact](https://www.autofact.cl/) separates vehicle history and valuation products. Do not imply our market analysis replaces legal history, official certificates, or inspection. A stable current report price was not verified; the proposed 4,990 is a price hypothesis, not a claimed competitor discount.
- [Autored](https://autored.cl/) provides professional market and automotive workflow capabilities; no verified public price was found in this pass.

Validate with 5-10 professional pilots and consumer purchase intent. Track preview-to-paid conversion, pack mix, repeat purchase, paid retention, allowance utilization, insufficient-data rate, data freshness, refresh cost and support burden. Do not interpret demo clicks as purchases.

## Unit economics to validate

Mercado Pago's [Chile checkout page](https://www.mercadopago.cl/herramientas-para-vender/check-out) advertises a general 3.19% + IVA rate in the search-indexed page. Direct retrieval returned 403. Actual account terms, settlement speed, payment method, installments and subscription pricing must be checked in the account simulator before use; this is a sensitivity assumption, not a verified merchant quote.

Illustrative conservative cash calculation: gross / 1.19 minus gross * 0.0319 * 1.19. It reserves output VAT and subtracts the fee including fee VAT; it excludes possible input VAT recovery and is not accounting advice. Rounded pesos:

| Plan | Gross | Net sales before fees | Assumed fee incl. VAT | Remaining before delivery costs | Per included report at full use |
| --- | ---: | ---: | ---: | ---: | ---: |
| Single | 4,990 | 4,193 | 189 | 4,004 | 4,004 |
| Pack | 11,990 | 10,076 | 455 | 9,621 | 3,207 |
| Profesional | 29,990 | 25,202 | 1,138 | 24,064 | 802 |
| Automotora | 79,990 | 67,218 | 3,036 | 64,182 | 428 |

For a 70% contribution target against net sales under these assumptions, the total variable delivery-cost budget is: 0.30 * (gross / 1.19) - gross * 0.0319 * 1.19. That allows about 214 CLP/report on Profesional and 114 CLP/report on Automotora at full utilization, BEFORE allocating tracking, hosting and support. Those limits are demanding: confirm licensed data costs and monitoring cadence before finalizing allowances. No profitability claim is made. Fiscal setup and document issuance must be confirmed with the business accountant.

## Payment recommendation

Start with Mercado Pago, since the business account already exists.

- One-time reports/packs: [Checkout Bricks](https://www.mercadopago.cl/developers/es/docs/checkout-bricks/overview), using Payment Brick and server-side payment processing. Configure only supported Chilean payment methods.
- Recurring monthly plans: [Subscriptions](https://www.mercadopago.cl/developers/es/docs/subscriptions/overview), using Card Payment Brick for card tokenization and the Subscriptions API on the server for recurring billing, cancellation, retries, and cycle reconciliation. Bricks supplies the frontend; it does not replace subscription lifecycle management. See the [Mercado Pago SDK clarification](https://github.com/mercadopago/sdk-js/discussions/182).
- Later alternative: [Transbank Webpay Plus](https://publico.transbank.cl/productos-y-servicios/soluciones-para-ventas-internet/webpay-plus) for one-time card payments. Quote actual merchant rates. Evaluate Oneclick separately if adding recurring charges; do not assume it supplies subscription lifecycle management. Prioritize this only if customer demand or conversion/fee evidence warrants the integration cost.

## Implementation status

The first implementation uses Payment Brick with card payments (credit/debit, one installment), server-authoritative prices, verified payment notifications, private purchases, atomic pack credits, verified-email guest claiming, PDF downloads and Google Workspace SMTP delivery. Guest checkout starts from an already prepared real report; a pack delivers that report plus two additional credits. Account creation is optional for these purchases.

Profesional now has a gated Card Payment Brick and Subscriptions API implementation. Automotora remains proposed. Wallet payments are not enabled in the first card-only release. Production credentials were verified with a read-only Chile-account check; no charge was created. Rotation of the webhook secret exposed in the screenshot has not been confirmed.

See [commerce operations](commerce-operations.md) for implemented routes, environment configuration, deployment blockers and remaining validation. The remote commerce migration and private report bucket are installed; SMTP authentication is verified. No paid product should be launched until real data and delivery, measured costs, provider tests and commercial terms have been validated.
