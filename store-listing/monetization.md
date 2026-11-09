# Confirmed commercial model

- Free download with subscriptions; 1, 3, 6 and 12-month periods confirmed.
- Worldwide intent; use only countries supported for this developer's merchant account and subscriptions in Play Console.
- Confirmed: USD 31.56 per year, with independently renewable 1/3/6/12-month plans. Proposed period prices: USD 2.50 / 6.70 / 15.78 / 31.56. See pricing-ka.md.
- Public website: https://englishwithmariami.com.ge/index.html
- Public support email: razmadze467@gmail.com.
- Access scope confirmed: all grades (1–12).
- Latest shared Play Console screen shows new Individual account registration under datogringo@gmail.com; completion/verification is not yet confirmed.
- No trial or introductory offer has been authorized.
- Explicit user requirement: no advertisements or advertising SDKs. Do not label longer plans as discounted: the supplied period prices are not cheaper per month.

## Required implementation before selling access

Native Google Play Billing 8.3.0 checkout/restore and a server-side Google verification function are now implemented and covered by offline tests. They have NOT been deployed or tested against live Play purchases. Paid content access enforcement, event-driven entitlement reconciliation and production acceptance testing remain required. Do not enable live plans or PLAY_BILLING_ENABLED before these are ready.

Configure the subscription and selected auto-renewing base plans in Play Console after the price/access decision. Display the localized price and billing period returned by Play Billing; do not hard-code currency conversions. Show auto-renewal terms, what is included, cancellation information, privacy policy and terms before purchase. Keep sign-in/account association clear and include purchase restoration.

Use the current supported Billing Library through a maintained Capacitor-compatible plugin or native Android implementation. Send purchase tokens to an authenticated backend. Verify package/product/account and subscription status with the Google Play Developer API. Acknowledge purchases and derive entitlements from verified server state. Handle renewals, pending/cancelled purchases, expiry, refunds, revocation, grace periods, account hold and restored purchases. Process Real-time Developer Notifications idempotently and recheck current status with Google's API. Never unlock paid lessons using only localStorage or a client-reported purchase result.

Keep service-account credentials server-side. Do not put credentials in the application, GitHub, or chat. Account deletion must have an in-app initiation route and public web route; explain subscription cancellation separately.

Before production, run license-tester purchases on a Play-installed internal-test build, including renewals, cancellation, restore, second-device sign-in and expired access. Define free content before enabling any access gate so existing authorized users are not silently locked out.
