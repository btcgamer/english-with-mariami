import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
function run(command, args, cwd = root) {
  const result = spawnSync(command, args, { cwd, stdio: 'inherit', env: process.env });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
run(process.execPath, ['scripts/android-runtime-preflight.mjs']);
run(process.execPath, ['scripts/prepare-web.mjs']);
run(process.execPath, ['node_modules/@capacitor/cli/bin/capacitor', 'sync', 'android']);
if (process.platform === 'win32') {
  run('cmd.exe', ['/d', '/c', 'gradlew.bat assembleDebug --console=plain'], path.join(root, 'android'));
} else {
  run('bash', ['./gradlew', 'assembleDebug', '--console=plain'], path.join(root, 'android'));
}
console.log('APK: android/app/build/outputs/apk/debug/app-debug.apk');
