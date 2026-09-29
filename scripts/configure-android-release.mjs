import fs from 'node:fs';

const file = 'android/app/build.gradle';
if (!fs.existsSync(file)) throw new Error('android/app/build.gradle not found');

const required = ['ANDROID_KEYSTORE_PATH','ANDROID_KEYSTORE_PASSWORD','ANDROID_KEY_ALIAS','ANDROID_KEY_PASSWORD','ANDROID_VERSION_CODE','ANDROID_VERSION_NAME'];
for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing required environment variable: ${key}`);
}

let s = fs.readFileSync(file, 'utf8');

if (!/signingConfigs\\s*\\{[\\s\\S]*?release\\s*\\{/.test(s)) {
  const signing = `signingConfigs {
        release {
            storeFile file(System.getenv('ANDROID_KEYSTORE_PATH'))
            storePassword System.getenv('ANDROID_KEYSTORE_PASSWORD')
            keyAlias System.getenv('ANDROID_KEY_ALIAS')
            keyPassword System.getenv('ANDROID_KEY_PASSWORD')
        }
    }

    `;
  s = s.replace(/(buildTypes\\s*\\{)/, signing + '$1');
}

const defaultConfigMatch = s.match(/defaultConfig\\s*\\{[\\s\\S]*?\\n    \\}/);
if (!defaultConfigMatch) throw new Error('defaultConfig block not found');

let dc = defaultConfigMatch[0];
dc = dc.replace(/versionCode\\s+[^\\n]+/, `versionCode ${process.env.ANDROID_VERSION_CODE}`);
dc = dc.replace(/versionName\\s+[^\\n]+/, `versionName "${process.env.ANDROID_VERSION_NAME}"`);
s = s.replace(defaultConfigMatch[0], dc);

s = s.replace(/(release\\s*\\{)(?![\\s\\S]*?signingConfig)/, '$1\\n            signingConfig signingConfigs.release');
fs.writeFileSync(file, s);

if (!/signingConfig\\s+signingConfigs\\.release/.test(s)) throw new Error('Release signing config was not applied');
console.log(`Android release configured: version ${process.env.ANDROID_VERSION_NAME} (${process.env.ANDROID_VERSION_CODE})`);
