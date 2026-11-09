# Designated administrator

User-confirmed corrected email: datogringo@gmail.com. This supersedes the earlier mistyped designation. Existing administrators are not automatically demoted.

`supabase/migrations/202611090002_designated_admin.sql` promotes only the existing, email-confirmed Auth account with that exact email and its existing profile. It aborts if the account is absent/unconfirmed, duplicated, or the profile is absent/duplicated. It changes the designated profile's role and adds the protected mariami_admin flag to that account's Auth app metadata, preserving existing metadata. It does not demote other admins. Apply it using a trusted database administrator to the intended Supabase project, then verify the returned email/role.

This SQL has been prepared but has NOT been applied to a live database here. Browser owner presentation now also requires the admin profile role; an email string alone does not grant server access. Existing authorization still depends on the real profiles-table policies. Those policies must prevent students from editing role fields; they could not be inspected from this session.

The purchase verifier returns admin access only after verifying the Supabase bearer token and querying the authenticated user's role from the database AND requiring the protected mariami_admin flag from the Auth server's app metadata. Client-supplied email/role fields are ignored. Admins do not need to buy a subscription, including while ordinary purchases are disabled. Google billing configuration is still required for regular learners.

Live deployment still needs Supabase administrative authorization, Google Play API authorization, configured subscription products, content authorization and acceptance tests. No actual admin assignment or live payment activation is claimed until those operations are applied and verified.

Secure environment requirements were saved as draft bindings: SUPABASE_MANAGEMENT_TOKEN (Supabase Management API) and PLAY_PUBLISHER_ACCESS_TOKEN (Android Publisher OAuth scope). Values have not been supplied. These are network bearer bindings, not browser passwords. Network additions and credential binding changes must be reviewed/saved in environment settings and published before reuse; saving the draft alone does not activate them.

After publishing access is configured, `npm run android:upload-internal -- /path/to/signed.aab` can upload and validate the bundle in an internal-track draft. It never rolls out to production. This uploader has been syntax-checked and its missing-credential guard checked; live Google API execution is unverified.

## Windows alternative — no cloud settings needed for the admin step

`setup-windows/START-ADMIN.cmd` starts a local Python setup program from its own folder. On standard Windows Python installs it opens a password-entry window; there is a hidden console-input fallback if Tk was omitted. The user pastes their PAT locally, not in chat. The program checks the exact Supabase project, checks the migration's SHA-256, applies only the designated-admin migration and independently reads the role/protected flag back. It never writes the token to disk or includes it in command arguments. Project mismatch, changed SQL, missing/unconfirmed accounts and unsuccessful verification cannot produce a success message.

Request logic was tested with 9 synthetic transport tests, and the migration with 7 PostgreSQL scenarios. The Windows GUI/launcher itself was not exercised on a physical Windows machine here. Live database execution requires the owner's valid token and project permissions. This helper does not deploy subscription functions, create Google credentials, enforce paid content access or publish a Play release.
