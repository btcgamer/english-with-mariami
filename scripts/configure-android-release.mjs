import fs from 'node:fs';

// Validate only: build.gradle reads environment values directly during the release build.
// Never interpolate secrets or unvalidated version strings into tracked Gradle source.
const required = ['ANDROID_KEYSTORE_PATH','ANDROID_KEYSTORE_PASSWORD','ANDROID_KEY_ALIAS','ANDROID_KEY_PASSWORD','ANDROID_VERSION_CODE','ANDROID_VERSION_NAME'];
for (const key of required) if (!process.env[key]) throw new Error(`Missing required environment variable: ${key}`);
const code = process.env.ANDROID_VERSION_CODE;
if (!/^[1-9][0-9]{0,9}$/.test(code) || Number(code) > 2100000000) throw new Error('ANDROID_VERSION_CODE is invalid');
if (!/^[0-9]+\.[0-9]+(?:\.[0-9]+)?(?:[.-][0-9A-Za-z.-]+)?$/.test(process.env.ANDROID_VERSION_NAME)) throw new Error('ANDROID_VERSION_NAME is invalid');
if (!fs.statSync(process.env.ANDROID_KEYSTORE_PATH).isFile()) throw new Error('Upload keystore file is missing');
console.log('Release environment validated; tracked build files unchanged.');
