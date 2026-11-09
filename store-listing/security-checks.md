# Security and advertising checks

User requirement: no advertisements. The application must not introduce ad SDKs or ad placements.

Performed for the current prepared web bundle: case-insensitive scan for AdMob, AdSense, DoubleClick, Google syndication/analytics and Facebook Audience Network identifiers. No matches found. This is a bounded static scan, not a full network/SDK audit. Android app dependency declarations and manifest were also checked for common ad-library identifiers with no matches.

npm audit --omit=dev completed successfully and reported zero known vulnerabilities in the production dependency audit. This excludes development dependencies, native dependencies, vendored web scripts and dynamically loaded CDN libraries; it does not detect all malware or guarantee security.

No antivirus engine is installed in this environment; a malware scan was not performed. No claim of absolute virus-free certification is made. The existing debug APK signature was verified during its build. The current internal-test release AAB/APK are signed with a new upload identity; verify the final generated artifacts before upload. This is not production acceptance.

Google Play Billing 8.3.0 native checkout and a server verification function were subsequently added. No advertising SDK was added. Native billing and live purchases require separate acceptance testing. Before production, verify the signed final artifact, current dependencies and external scripts and test the released app with Play Protect/device tooling. Keep production signing credentials private.
