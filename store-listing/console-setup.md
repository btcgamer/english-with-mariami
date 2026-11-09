# Play Console setup draft

Confirmed: free download; all 12 grades; auto-renewing periods 1/3/6/12 months. Developer reports verified account.

Suggested product ID (not created): mariami_all_grades
Suggested base plans (not created): monthly, quarterly, half-yearly, yearly.
USD reference prices: 2.50, 6.70, 15.78, 31.56 per corresponding billing period. Display Google's localized prices, not these draft strings, in the app.

In Play Console create/select the app for com.englishwithmariami.academy and choose free download. Check whether the package already exists before creating it. Set up the merchant/payments profile if needed. In the subscriptions section, prepare the product/base plans and supported countries; leave them as drafts until purchase integration and test validation are complete. Do not create a second app or replace an existing upload key to work around a mismatch.

No trial or introductory offer is configured. A new upload identity and signed internal-test AAB/APK have been prepared for this first upload. Do not enable a production rollout. Native billing checkout and server verification code are implemented, but live backend deployment, content access enforcement and live purchase testing are not complete. Review monetization.md and release-status.md for remaining development and submission requirements.
