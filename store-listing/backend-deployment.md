# Purchase verification deployment (not applied)

The native Android plugin (`MariamiBillingPlugin.java`) uses Google Play Billing 8.3.0. Native checkout uses store-returned localized full-period prices, cancellation/pending handling and purchase restoration. The browser, installed PWA and desktop now have a separate hosted web-checkout implementation, disabled until provider and private-delivery prerequisites are complete. See [WEB-PAYMENTS.md](../WEB-PAYMENTS.md). Google Play registration is optional for the PWA distribution path.

The Supabase edge function in `supabase/functions/play-subscription` verifies bearer tokens against Supabase Auth, binds Play purchases to the hash of that authenticated user's ID, calls subscriptionsv2, acknowledges eligible purchases, refuses other users' tokens and rechecks stored tokens for status. It does not trust localStorage or client purchase success. Purchase tokens are in a table with RLS and no anon/authenticated-user grants. Server code and migrations are excluded from the web/native asset bundle.

## Required configuration

1. Review/apply `supabase/migrations/202611090001_play_purchase_tokens.sql` to the correct Supabase project; do not reset existing data.
2. Deploy `play-subscription` with the project's CLI/config. Gateway JWT verification is off for this function because the handler verifies every request with Supabase Auth. Do not remove that authentication check.
3. Configure the server-only `GOOGLE_PLAY_SERVICE_ACCOUNT_EMAIL` and `GOOGLE_PLAY_PRIVATE_KEY` securely in Supabase Edge Function secrets. Grant the service account the app-specific Google Play Developer API permissions needed to view/manage subscriptions and acknowledge purchases. Never place its credentials in the app or a public repository. Standard Supabase URL/service-role variables must be available in the function runtime.
4. Keep `PLAY_BILLING_ENABLED` absent or `false` initially. Until configured the verifier returns 503 and checkout stays disabled. Enable only after content protection and internal-testing configuration are ready. The native plugin alone is not proof that purchases work.
5. In Play Console create `mariami_all_grades` with the four auto-renewing base plans in console-setup.md. Set exact supplied USD prices and review localized prices/taxes/countries. Do not add trials or mark yearly as discounted.
6. Upload the signed AAB to internal testing and install it through Google Play for license-tester purchases. A sideloaded APK alone cannot validate Play purchase behavior.

## Private content implementation

A private content table, authenticated paid-course endpoint and content export/import commands are now prepared. See `private-content-deployment.md`. Private client/build mode has also been implemented and tested. Source and local tests do not establish a live deployment; the public site has not yet switched to that build.

## Still required before production charging

The existing course JS/JSON is public and bundled. The new verification endpoint returns current subscription status but does not by itself restrict those files or change existing lesson/progress RLS. Do not claim subscription-only content protection. Deploy and verify the new private course store/endpoint and private client build, and review actual existing Supabase schema/policies before enabling charges. The private build deliberately requires online verification. Preserve legitimate existing teacher/admin access deliberately.

Status requests recheck Google instead of relying on cached expiry. Real-time Developer Notifications, scheduled reconciliation and refund/revocation integration with any future persistent entitlements still need configuration/implementation. Live device tests must cover renewal, restore, cancellation, pending purchase, account hold, expired/refunded/revoked access and second-device sign-in. No credentials or remote schema access were available here to apply these steps.

Account deletion initiation and a functioning deletion backend/operational process, Data safety/Families declarations, app-review access, real-device store screenshots and public policy URLs also remain. Update declarations for purchase history and tokens. A browser screenshot with mocked authentication is not proof of a real purchase or account operation.

Validation here: 18 server-verification tests, 7 checkout-browser tests, 6 portal-navigation tests and the existing 7 progress tests passed. One progress test initially timed out during a concurrent Android build and passed when rerun with a longer deadline. These tests use synthetic accounts/purchases and are separate from live device/Google Play verification.
