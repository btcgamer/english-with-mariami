import fs from 'node:fs';
import path from 'node:path';

const file = path.join(process.cwd(), 'android', 'variables.gradle');
if(!fs.existsSync(file)) throw new Error('android/variables.gradle not found');
let s=fs.readFileSync(file,'utf8');
s=s.replace(/compileSdkVersion\s*=\s*\d+/g,'compileSdkVersion = 36');
s=s.replace(/targetSdkVersion\s*=\s*\d+/g,'targetSdkVersion = 36');
s=s.replace(/targetSdk\s*=\s*\d+/g,'targetSdk = 36');
fs.writeFileSync(file,s);
if(!/compileSdkVersion\s*=\s*36/.test(s) || !/targetSdkVersion\s*=\s*36/.test(s)){
  throw new Error('Could not set Android API 36');
}
console.log('Android API target: 36');
