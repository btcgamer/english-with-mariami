# Private course delivery — prepared, not activated

New server components:
- `202611100001_private_course_materials.sql` creates an isolated JSONB content store with RLS and no PUBLIC/anon/authenticated privileges. Service-role operations are server-only.
- `paid-course` authenticates every material request through the existing verification handler. Unpaid, expired, unconfigured or unverified accounts cannot read material through this endpoint. Trusted admins use the same protected role/metadata checks. Content responses use no-store.
- Requests accept only supported grade/world resource keys, never arbitrary paths or SQL.

Local checks: 35 Node tests passed across purchase verification, release validation, protected-content requests and import SQL encoding. PostgreSQL checks imported/read 102 resources as service_role, denied anon/authenticated read/write, kept RLS denial after a deliberately simulated accidental SELECT grant and rejected invalid resource paths.

Preparation:
1. `npm run content:export` produces 102 resource records plus an integrity manifest in `.private-course-export/`. The export is ignored by Git and excluded from web bundles.
2. With authorized database management access, apply/review the private content migration in the intended project. It does not alter existing lessons/progress policies blindly.
3. With SUPABASE_MANAGEMENT_TOKEN supplied securely, `npm run content:import` checks private table protections and export integrity before upserting resources into the fixed project. Payloads are hex-encoded to avoid SQL interpolation. Imports are idempotent and verified by resource readback. The importer is prepared but has NOT been executed against a live project here.
4. Deploy paid-course and play-subscription with the required server-only credentials.

Private client/build mode:
- `PRIVATE_COURSES=1 npm run web:prepare` routes the academy and advanced world loaders through the authenticated endpoint. Rejected access has no public-file fallback.
- Paid grade JS/world JSON are omitted, and legacy grade/lesson pages redirect to the current academy. The older grade-core fallback module is omitted.
- Release builds require `audit-private-build.mjs`; the release workflow uses private mode by default. Public development mode remains available separately.
- The internal uploader also inspects the signed bundle and rejects old public-content bundles. `--verify-only` checks it without credentials or network calls.
- The private website must be deployed from generated www output. Publishing repository-root source directly still exposes historical/public data and does not activate private mode. APK mode is generated during the signed release build.
- Private delivery requires an online server check. No offline paid-content access is promised.

Validation: 4 browser tests passed for authorized delivery, rejected access without fallback, omitted public data/legacy redirects and advanced world loading. Existing public-mode progress checks also passed. These use synthetic sessions/material responses and do not establish live backend or purchase acceptance.

Production remains BLOCKED:
- Deploy the migrations and functions, import the private course catalog and verify the live role/content policies using authorized project access.
- Deploy the private website build and the new private Android release; current public-site deployment has not been switched. Previously published source/data cannot be made secret retroactively.
- Configure Play products, install from the internal track and complete license-tester purchases, renewals, cancellation, pending/expired/refunded access and restoration on a real device.
- Complete the remaining store declarations and account deletion requirements.

No live database migration/import, private-course deployment, real purchase or production rollout has been performed here. PLAY_BILLING_ENABLED must remain disabled until these gates are passed.
