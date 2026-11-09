import fs from 'node:fs';
import path from 'node:path';
const out=path.resolve('www');
function absent(file){if(fs.existsSync(path.join(out,file)))throw Error('Paid material or legacy loader remains in build: '+file)}
if(!fs.readFileSync(path.join(out,'config.js'),'utf8').startsWith('window.EWM_PRIVATE_COURSES=true;'))throw Error('Release must use the private-course build. Set PRIVATE_COURSES=1.');
for(let grade=1;grade<=12;grade++){
 absent(`shared/mariami-grammar-listening/grade-${grade}.js`);
 for(let world=1;world<=10;world++)absent(`curriculum/grade${grade}-world${world}.json`);
 const page=fs.readFileSync(path.join(out,`grade${grade}/index.html`),'utf8');
 if(!page.includes('location.replace')||!page.includes('academy.html?grade='+grade))throw Error('Legacy grade route was not replaced: '+grade);
}
for(const file of ['shared/academy-grade-core.js','curriculum.js','supabase','setup-windows','.private-course-export'])absent(file);
if(!fs.existsSync(path.join(out,'shared/private-course-client.js')))throw Error('Authenticated content loader is missing.');
console.log('Private course release audit passed. This does not establish backend deployment or payment acceptance.');
