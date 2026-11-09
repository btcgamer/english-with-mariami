# Android test application

Build the current website and local design changes into an installable debug APK:

```sh
npm ci
npm run android:apk
```

Prerequisites: Node.js 22 or newer, a full Java 21 JDK (including `javac`), and Android SDK Platform 36 and Build Tools 36.0.0. Set `ANDROID_HOME` to the SDK directory or configure `android/local.properties` locally. On Windows, Android Studio can install the SDK and provide a JDK. The build script runs from the repository root even when called from another directory.

Output: `android/app/build/outputs/apk/debug/app-debug.apk`.

Copy the APK to an Android 7.0+ device and open it to install. If Android requests permission, allow installation for the app opening this file. This is a debug-signed test build, not a Play Store release. Future updates must use the same signing key. Existing installations signed with a different key cannot be upgraded directly.

The application bundles the site and opens without running a localhost server. Authentication and server-backed lessons/progress still require Internet access and a valid account. Device launch and live account operations must be checked on an Android device; a successful build alone does not verify them.

The existing `npm run android:build` command builds a release AAB. Publishing and production signing remain separate steps.
