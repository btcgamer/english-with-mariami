# English with Mariami — Google Play Release Checklist

## Current Android foundation
- Application ID: `com.englishwithmariami.academy`
- App name: `English with Mariami`
- Capacitor Android is configured.
- Android CI prepares Android API 36 and builds an unsigned release AAB.
- Web assets are copied into `www/` by `npm run web:prepare`.

## Required before production upload
1. Create the app in Google Play Console with the exact application ID.
2. Use a private upload keystore. Never commit a keystore or passwords to GitHub. Enable Google Play App Signing.
3. Set a production version name and a new Android version code for every upload.
4. Deploy `privacy.html` to a public HTTPS URL and replace its placeholder support/contact section.
5. Complete the Play Console Data safety form from the actual production Supabase schema and enabled SDKs.
6. Complete target-audience/Families declarations accurately because the academy includes Grades 1–12.
7. Prepare store listing assets: app icon, feature graphic, phone screenshots, optional tablet screenshots, short/full descriptions and support details.
8. Test the signed AAB on physical Android devices: login/logout, Grade 1–12 routing, lesson completion, server progress, audio/TTS, poor network, Android back navigation, orientation, fresh install and update.
9. Verify that no QA mock logic, test accounts or development-only endpoints are shipped in the production bundle.

## Important
The repository is **Android-build ready**, but not yet **Google Play submission ready**. Production signing, public privacy/support URL, Play Console declarations/listing assets, and final physical-device acceptance testing remain.
