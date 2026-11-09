# Google Play submission preparation

Package: com.englishwithmariami.academy
Current private staging version: 1.0.5 (code 6), requiring the private backend. User confirmed no previous AAB upload.
Target API: 36. Minimum Android: 7.0/API 24.

## Prepared

- Debug APK built and signature verified previously.
- Signed release AAB and APK prepared with a newly generated upload identity for the first upload; keep the private key backup separate from store materials.
- Homepage portals and legacy grades.html now route to the current academy with the selected range. Legacy service-worker style injection removed.
- Google Play Billing 8.3.0 native checkout/restore, localized plan prices and a Supabase Google verification function implemented. Live purchase acceptance is unverified.
- Georgian store description draft and monthly subscription implementation requirements.
- Web packaging excludes QA directories, test specs, hidden files, build scripts and non-web source files. Web 3D model formats are retained.

- Designated administrator: datogringo@gmail.com; verified-account SQL migration prepared and tested locally, not applied to production.

- Private course endpoint, RLS store, export/import commands and private client/build mode implemented and tested. Not deployed to the live website/backend.

## Required before submission

- Confirmed USD 31.56 annual model with 1/3/6/12-month periods. Access scope confirmed: all grades (1–12).
- Public website provided: https://englishwithmariami.com.ge/index.html; verify privacy/support content on the deployed site.
- Latest shared Console screen shows Individual account registration; verification is not confirmed. Merchant/payments setup, subscription country availability and any testing requirements must still be checked in Play Console.
- Live site verification was blocked by environment egress policy (proxy 403).
- Deploy/configure the purchase verifier, enforce paid content access server-side and complete live Play Billing tests. Keep PLAY_BILLING_ENABLED disabled until these are complete.
- Keep the new upload key and its credentials private and backed up. Enable Play App Signing for the first upload. The signed candidate is for internal testing, not production acceptance.
- Support email razmadze467@gmail.com has been added to privacy.html. Confirm operator details and publish the policy at an accessible public HTTPS address. Email contact alone does not complete account-deletion requirements.
- Implement account deletion initiation in the app and public deletion-request page. Confirm backend deletion and retention behavior.
- Confirm actual Supabase tables/SDK data flows before completing Data safety; include account identifiers, email, grade, progress and any other data actually processed. Do not guess form answers.
- Complete Families/target-audience, content rating, ads and app-access declarations. The app includes grades for children; the selected audience must reflect that.
- Provide Play reviewers working access securely through Play Console, including subscription-gated content when required.
- Capture accurate screenshots from the release app on a device, produce approved launcher/store icon and feature graphic; verify artwork rights. Browser QA screenshots with mocked accounts are not store-ready evidence.
- Test installation, login/logout, account recovery/deletion, lessons, audio, purchases, restored access, offline/error behavior, back navigation and updates on physical devices.

Official references (not retrievable in this environment because support.google.com was denied; check the current Console guidance):
- https://support.google.com/googleplay/android-developer/answer/6334373
- https://support.google.com/googleplay/android-developer/answer/14151465
- https://support.google.com/googleplay/android-developer/answer/13327111

No Play Console upload or publication has been performed. A new private upload key was generated outside the checkout for this first upload and is backed up separately. Its credentials are not in the app or the public preparation package.
