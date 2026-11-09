# Web, installed PWA and desktop subscriptions

## Current status

The website/PWA has a hosted card-checkout integration prepared for **Lemon Squeezy**. It is a candidate provider, not an activated merchant account. No real transaction, payout, provider onboarding or production backend deployment has been completed. The designated academy administrator remains **datogringo@gmail.com**; this change does not grant that role on the live database.

The owner accepts transaction commissions **only if there is no upfront or fixed monthly charge**. Current provider fees, Georgian individual-seller eligibility, product approval and payout availability could not be verified: the official pricing and country-support pages were denied by this environment's network policy. The official JavaScript SDK 4.0.0 types were inspected for API structure only. SDK types and mocked tests do not verify fees, merchant approval or real payment behavior. Do not enable charges based on this implementation alone.

The PWA installs from the existing HTTPS website in supporting Android and desktop browsers; distributing it this way does not require a Google Play listing. Browser installation does not remove hosting, payment-provider or other operating costs. Google Play distribution remains a separate optional path.

## Exact base prices

| Plan | Recurring period | Full-period USD price |
| --- | --- | --- |
| monthly | 1 month | $2.50 |
| quarterly | 3 months | $6.70 |
| half-yearly | 6 months | $15.78 |
| yearly | 1 year / 12 months | $31.56 |

All plans cover grades 1–12. No trials, setup fees, pay-what-you-want, usage charging or discounts are configured. Provider/tax currency conversion and applicable taxes must be disclosed by hosted checkout before confirmation; proceeds after commissions differ from these base prices. Do not promise worldwide availability until the provider confirms supported buyer countries and payment methods.

## Owner's first step

Open **https://app.lemonsqueezy.com/** and use the intended owner account **datogringo@gmail.com**. Ask the provider to confirm that a Georgian individual selling this educational digital subscription is eligible, that an appropriate Georgian payout method is supported, and that the selected service has no signup/upfront or fixed monthly charge. Complete identity and payout verification only in the provider's own dashboard. Do not send identity documents, card/bank details, passwords or API keys in chat or commit them to the repository. If approval or the fee condition fails, keep checkout disabled and choose another eligible provider.

## Backend deployment

1. Review the actual Supabase project and existing schema first. Back up data. Apply `supabase/migrations/202611100003_web_subscriptions.sql` using a trusted project administrator. Its tables/RPC are service-role only. The existing designated-admin migration is an independent operation requiring an already verified account; do not blindly run all migrations against an unknown production schema.
2. Deploy `web-subscription`, `web-payment-hook`, the updated `play-subscription`, and `paid-course` from this checkout. Supabase provides `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` server-side. `verify_jwt=false` in config is deliberate: user endpoints call Supabase Auth; the callback verifies the raw-body provider HMAC instead. Never remove these checks or expose the service role key to browsers.
3. Follow `store-listing/private-content-deployment.md`: import private course materials and deploy the `PRIVATE_COURSES=1` web build to the actual HTTPS website. Confirm signed-out and expired users cannot fetch paid resources and no public runtime fallback exists. Previously public files and Git history may remain accessible; this build cannot retroactively make published copies secret.
4. Set server secrets/variables securely in Supabase Edge Functions. Never use public `config.js` for these values. Start with the disabled flags below. Cloud development proxy secret placeholders are not raw credentials that can be copied into Supabase.
5. Configure a provider webhook to `https://vtdhvsfqhwesxtwmduew.supabase.co/functions/v1/web-payment-hook`, using a strong private signing secret matching `LEMON_WEBHOOK_SECRET`. Subscribe to **order_refunded**, **subscription_created**, **subscription_updated**, **subscription_cancelled**, **subscription_resumed**, **subscription_expired**, **subscription_paused**, **subscription_unpaused**, **subscription_payment_success**, **subscription_payment_recovered**, **subscription_payment_failed**, **subscription_payment_refunded**. The gateway must permit provider POSTs without an application JWT; HMAC verification remains mandatory. Check actual delivery and retries in the provider dashboard.
6. Create four distinct recurring provider variants in a USD store with the exact prices/periods above. The server rechecks the store, variant and price API before creating a checkout; mismatched prices, setup fees, trials, currencies or unsupported price shapes fail closed. Live compatibility of the provider's deprecated variant fields must be confirmed during test-mode acceptance; do not weaken checks to bypass a configuration failure.

Server-only values (placeholders describe requirements, not usable credentials):

```text
WEB_BILLING_ENABLED=false
WEB_PROVIDER_TERMS_CONFIRMED=false
WEB_PRIVATE_CONTENT_READY=false
WEB_PAYMENT_MODE=test
LEMON_API_KEY=<private provider API key>
LEMON_WEBHOOK_SECRET=<private raw-body signing secret>
LEMON_STORE_ID=<numeric store ID>
LEMON_VARIANT_MONTHLY=<numeric variant ID>
LEMON_VARIANT_QUARTERLY=<numeric variant ID>
LEMON_VARIANT_HALF_YEARLY=<numeric variant ID>
LEMON_VARIANT_YEARLY=<numeric variant ID>
PLAY_BILLING_ENABLED=false
```

`WEB_PROVIDER_TERMS_CONFIRMED=true` records operator confirmation of eligibility, payout and the user's no-fixed-fee condition; code cannot establish those commercial facts. `WEB_PRIVATE_CONTENT_READY=true` records verified deployment of private content. `WEB_BILLING_ENABLED=true` permits new checkouts only when both gates and all provider configuration are valid. Keep existing provider settings and hooks running when pausing sales: setting only `WEB_BILLING_ENABLED=false` preserves access rechecks, refunds and cancellation management.

## Test mode and production acceptance

Use a staging Supabase project/site and test-mode provider objects. Only a trusted Auth administrator may set **protected app metadata** `mariami_payment_tester: true` for designated test accounts. A user-editable profile/metadata flag is insufficient. Test-mode purchases must never grant ordinary learners access. Do not use the admin-bypass account to validate subscriber access.

Before enabling test checkouts, confirm commercial terms and private delivery, then set all three gates true in staging. Exercise all four periods using the provider's documented test cards. No real card number is needed in chat. Verify initial purchase, server callback binding, private lessons, second-device same-account access, renewal, cancellation through the hosted portal, expiry, failed/recovered payment, full initial-order refund, full renewal-invoice refund, partial refund, replayed/reordered callbacks and wrong-account rejection. A return URL or client success message must never open access. Test concurrent browser tabs/old checkout links and reconcile any duplicate provider subscriptions before release; the UI suppresses repeated clicks and the server refuses known existing subscriptions, but hosted links are not a global transaction lock.

Switch production to **live** keys/variants and `WEB_PAYMENT_MODE=live`, initially with new checkout disabled. Verify production private delivery, seller approval, current fees and public privacy/terms/support, configure the live webhook, and conduct an owner-approved real purchase/refund acceptance test before opening general sales. There is no automatic live enablement in source control.

## Operation and limits

- Browser, installed PWA and desktop use the same signed-in account, hosted checkout and cancellation portal. Google Play purchases retain their own native billing/management path.
- Active access is rechecked with the provider server API. A stored expiry or browser URL is not sufficient. A provider outage fails closed.
- Only signed callbacks can bind a new subscription to a server-created account/plan intent. The database enforces ownership, test/live isolation, replay protection and snapshot/refund ordering in one transaction.
- Fully refunded records block access even if provider status still says active. Partial refunds leave the paid period intact. Provider callbacks must actually be delivered; monitor failures/retries. A scheduled reconciliation job and alerting are not deployed.
- Existing unpaid/refunded subscriptions retain the cancellation link and cannot initiate a second subscription through this page. Do not delete a learning account before cancelling ongoing renewal. An operational account-deletion workflow still needs to be verified.
- No advertising SDK or card-entry fields are added to the academy.

## Local verification

```bash
npm run test:web-billing
npm run test:billing
npm run test:content
PRIVATE_COURSES=1 npm run web:prepare
node scripts/audit-private-build.mjs
```

Browser QA: `qa/web-subscription.spec.js`, `qa/play-subscription.spec.js`, `qa/private-course-build.spec.js`. These use synthetic accounts/provider fixtures and cannot establish real merchant/payment acceptance. Migration checks were also run against an isolated PGlite PostgreSQL engine for privileges, RLS, replay, ownership and refund ordering.

Official references requiring current confirmation:

- https://www.lemonsqueezy.com/pricing
- https://docs.lemonsqueezy.com/help/getting-started/supported-countries
- https://docs.lemonsqueezy.com/api/checkouts/create-checkout
- https://docs.lemonsqueezy.com/help/webhooks
