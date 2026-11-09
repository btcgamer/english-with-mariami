import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
function run(command, args, cwd = root) {
  const result = spawnSync(command, args, {cwd, stdio:'inherit', env:process.env});
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
run(process.execPath, ['scripts/configure-android-release.mjs']);
run(process.execPath, ['scripts/android-runtime-preflight.mjs']);
run(process.execPath, ['node_modules/@capacitor/assets/bin/capacitor-assets','generate','--android','--assetPath','assets','--iconBackgroundColor','#050814','--iconBackgroundColorDark','#03050c','--splashBackgroundColor','#050814','--splashBackgroundColorDark','#03050c']);
run(process.execPath, ['scripts/prepare-web.mjs']);
run(process.execPath, ['node_modules/@capacitor/cli/bin/capacitor','sync','android']);
if (process.platform === 'win32') run('cmd.exe',['/d','/c','gradlew.bat bundleRelease assembleRelease --console=plain'],path.join(root,'android'));
else run('bash',['./gradlew','bundleRelease','assembleRelease','--console=plain'],path.join(root,'android'));
console.log('Signed release: android/app/build/outputs/bundle/release/app-release.aab');
