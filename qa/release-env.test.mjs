import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtempSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
const validator=path.resolve('scripts/configure-android-release.mjs');
const original=readFileSync('android/app/build.gradle','utf8');
function check(overrides={}){
 const directory=mkdtempSync(path.join(tmpdir(),'release-env-'));
 const key=path.join(directory,'test-only.p12');writeFileSync(key,'not a real key');
 try{return spawnSync(process.execPath,[validator],{encoding:'utf8',env:{...process.env,ANDROID_KEYSTORE_PATH:key,ANDROID_KEYSTORE_PASSWORD:'test-only-password',ANDROID_KEY_PASSWORD:'test-only-password',ANDROID_KEY_ALIAS:'test-only-alias',ANDROID_VERSION_CODE:'2',ANDROID_VERSION_NAME:'1.0.1',...overrides}})}
 finally{rmSync(directory,{recursive:true,force:true})}
}
for(const code of ['0','-1','2147483648','2\nextra-gradle-source'])test('Reject invalid version code '+JSON.stringify(code),()=>assert.notEqual(check({ANDROID_VERSION_CODE:code}).status,0));
test('Version names cannot inject tracked Gradle source',()=>{
 const result=check({ANDROID_VERSION_NAME:'1.0"\nmalicious-source'});assert.notEqual(result.status,0);
 assert.equal(readFileSync('android/app/build.gradle','utf8'),original);
});
test('Valid environment does not modify source or print credentials',()=>{
 const result=check();assert.equal(result.status,0);
 assert.equal(readFileSync('android/app/build.gradle','utf8'),original);
 assert.equal((result.stdout+result.stderr).includes('test-only-password'),false);
});
