#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const fail = [];
const ok = [];
const read = (p) => {
  const f = path.join(root, p);
  if (!fs.existsSync(f)) { fail.push('missing: ' + p); return ''; }
  ok.push('exists: ' + p);
  return fs.readFileSync(f, 'utf8');
};
const must = (text, pattern, label) => {
  if (!pattern.test(text)) fail.push('check failed: ' + label);
  else ok.push('check passed: ' + label);
};

const index = read('index.html');
const pwa = read('pwa.js');
const config = read('config.js');
const core = read('shared/academy-grade-core.js');
const cap = read('capacitor.config.ts');
const manifest = read('manifest.webmanifest');
const prepareWeb = read('scripts/prepare-web.mjs');
const mobile = read('mobile-app.css');
const pwaMobile = read('pwa-mobile.css');

must(index, /<meta[^>]+name=["']viewport["'][^>]*content=["'][^"']*width=device-width/i, 'mobile viewport meta');
must(index, /config\.js(?:\?[^"']*)?["']/i, 'Supabase config loaded by entry page');
must(config, /SUPABASE_URL\s*=\s*['"]https:\/\/[^'"]+\.supabase\.co['"]/i, 'Supabase URL format');
must(config, /SUPABASE_PUBLISHABLE_KEY\s*=\s*['"]sb_publishable_[^'"]+['"]/i, 'Supabase publishable key format');
must(config, /createClient\s*\(/, 'Supabase client initialization');
must(pwa, /Capacitor|capacitor:/i, 'native Capacitor guard');
must(pwa, /serviceWorker\.register\(['"]\/sw\.js/i, 'browser service worker registration');
must(core, /from\(['"]lessons['"]\)/, 'lesson database loading');
must(core, /from\(['"]lesson_words['"]\)/, 'vocabulary database loading');
must(core, /from\(['"]lesson_quizzes['"]\)/, 'quiz database loading');
must(core, /lesson_progress/, 'lesson progress sync');
must(core, /academy_reward_state/, 'reward state sync');
must(cap, /appId:\s*['"]com\.englishwithmariami\.academy['"]/, 'Capacitor package ID');
must(cap, /webDir:\s*['"]www['"]/, 'Capacitor webDir');
must(cap, /allowMixedContent:\s*false/, 'mixed-content disabled');
must(manifest, /"start_url"\s*:\s*"\/index\.html"/, 'PWA start URL');
must(manifest, /"display"\s*:\s*"standalone"/, 'PWA standalone display');
must(prepareWeb, /exclude|node_modules|\.github|android/i, 'web bundle excludes native/build-only directories');
must(mobile, /touch-action|safe-area|min-height:\s*46px/i, 'mobile interaction hardening');
must(pwaMobile, /100dvh|safe-area|font-size:\s*16px|48px/i, 'PWA mobile hardening');

for (let grade = 1; grade <= 12; grade++) {
  const candidates = [`grade${grade}/index.html`, `grade${grade}.html`];
  const found = candidates.find(p => fs.existsSync(path.join(root, p)));
  if (!found) fail.push(`grade route missing: Grade ${grade}`);
  else ok.push(`grade route present: Grade ${grade} -> ${found}`);
}

const requiredRuntime = [
  'shared/academy-grade-core.js',
  'shared/mission-completion-3.js',
  'shared/mission-completion-3.css',
  'pwa.js',
  'sw.js',
  'manifest.webmanifest',
  'capacitor.config.ts'
];
for (const p of requiredRuntime) read(p);

const leakedSecretPattern = /service_role|sb_secret_/i;
if (leakedSecretPattern.test(config)) fail.push('possible server-side Supabase secret in config.js');
else ok.push('no service-role/sb_secret marker in config.js');

if (fail.length) {
  console.error('ANDROID RUNTIME PREFLIGHT: FAIL');
  for (const item of fail) console.error('✗ ' + item);
  process.exit(1);
}
console.log('ANDROID RUNTIME PREFLIGHT: PASS');
console.log(`Checks passed: ${ok.length}`);
for (const item of ok) console.log('✓ ' + item);
