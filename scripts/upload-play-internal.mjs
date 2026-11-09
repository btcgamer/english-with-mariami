// Upload only to a draft on the INTERNAL test track. Never starts a production rollout.
// Requires a scoped Android Publisher OAuth bearer binding supplied securely at runtime.
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const token = process.env.PLAY_PUBLISHER_ACCESS_TOKEN;
if (!token) throw new Error('Missing PLAY_PUBLISHER_ACCESS_TOKEN; supply it securely in environment settings, not in chat.');
if (/[\r\n]/.test(token)) throw new Error('Invalid publisher authorization binding.');
const bundle = path.resolve(process.argv[2] || 'android/app/build/outputs/bundle/release/app-release.aab');
if (!statSync(bundle).isFile()) throw new Error('Signed AAB file is missing.');
const signer = process.env.JAVA_HOME ? path.join(process.env.JAVA_HOME, 'bin', process.platform === 'win32' ? 'jarsigner.exe' : 'jarsigner') : 'jarsigner';
const verified = spawnSync(signer, ['-J-Duser.language=en','-J-Duser.country=US','-verify',bundle], { encoding:'utf8' });
if (verified.status !== 0 || !/jar verified\./i.test(verified.stdout || '')) throw new Error('AAB signature could not be verified; refusing upload.');
const directory = mkdtempSync(path.join(tmpdir(), 'mariami-play-upload-'));
const base = 'https://androidpublisher.googleapis.com/androidpublisher/v3/applications/com.englishwithmariami.academy/edits';
let edit;
function request(url, method, body, media = false) {
  if (new URL(url).hostname !== 'androidpublisher.googleapis.com') throw new Error('Unexpected publishing destination.');
  const output = path.join(directory, 'response.json');
  const args = ['--silent','--show-error','--max-time','180','--config','-','--request',method,'--url',url,'--output',output,'--write-out','%{http_code}'];
  const headers = ['Authorization: Bearer ' + token, 'Content-Type: ' + (media ? 'application/octet-stream' : 'application/json')];
  if (media) args.push('--data-binary', '@' + bundle);
  else if (body !== undefined) {
    const input = path.join(directory, 'request.json');
    writeFileSync(input, JSON.stringify(body), {mode:0o600}); args.push('--data-binary','@' + input);
  }
  // Credentials go through stdin, never command-line arguments or logs.
  const result = spawnSync('curl',args,{input:headers.map(h=>'header = '+JSON.stringify(h)).join('\n')+'\n',encoding:'utf8'});
  if (result.status !== 0) throw new Error('Google Play network request failed; no publication confirmed.');
  const status = Number(result.stdout);
  if (status < 200 || status >= 300) throw new Error('Google Play publishing request rejected (HTTP ' + status + ').');
  const text = readFileSync(output,'utf8'); return text ? JSON.parse(text) : {};
}
try {
  edit = request(base,'POST',{}).id;
  if (!/^[A-Za-z0-9_-]+$/.test(edit || '')) throw new Error('Google Play did not return a valid edit ID.');
  const upload = 'https://androidpublisher.googleapis.com/upload/androidpublisher/v3/applications/com.englishwithmariami.academy/edits/' + edit + '/bundles?uploadType=media';
  const uploaded = request(upload,'POST',undefined,true);
  const version = Number(uploaded.versionCode);
  if (!Number.isInteger(version) || version < 1) throw new Error('Uploaded bundle version was not confirmed.');
  request(base+'/'+edit+'/tracks/internal','PUT',{track:'internal',releases:[{name:'Internal test '+version,versionCodes:[String(version)],status:'draft'}]});
  request(base+'/'+edit+':validate','POST');
  request(base+'/'+edit+':commit?changesNotSentForReview=true','POST');
  edit = undefined;
  console.log('AAB uploaded and saved as a draft on the internal testing track; version '+version+'. No production rollout started.');
} finally {
  if (edit) {
    try { request(base+'/'+edit,'DELETE'); } catch { /* Do not expose server responses or credentials. */ }
  }
  rmSync(directory,{recursive:true,force:true});
}
