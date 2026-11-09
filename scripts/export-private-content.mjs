import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const output=path.resolve(process.argv[2]||path.join(root,'.private-course-export'));
if(output===root||!path.basename(output).startsWith('.private-course-export'))throw new Error('Output folder name must start with .private-course-export to keep it out of web bundles.');
fs.mkdirSync(output,{recursive:true,mode:0o700});
const records=[];
for(let grade=1;grade<=12;grade++){
 const source=fs.readFileSync(path.join(root,'shared/mariami-grammar-listening',`grade-${grade}.js`),'utf8');
 const sandbox={window:{}};
 vm.runInNewContext(source,sandbox,{timeout:2000,contextCodeGeneration:{strings:false,wasm:false}});
 const payload=JSON.parse(JSON.stringify(sandbox.window.MARIAMI_GRAMMAR_LISTENING?.[grade]));
 if(payload.grade!==grade||!Array.isArray(payload.lessons)||payload.lessons.length!==126)throw new Error('Invalid supplementary grade '+grade);
 records.push({resource:`supplementary/grade${grade}.json`,payload});
}
for(const file of fs.readdirSync(path.join(root,'curriculum')).sort()){
 const match=/^grade([1-9]|1[0-2])-world([1-9]|10)\.json$/.exec(file);
 if(!match)continue;
 const payload=JSON.parse(fs.readFileSync(path.join(root,'curriculum',file),'utf8'));
 if(Number(payload.grade)!==Number(match[1])||Number(payload.world)!==Number(match[2]))throw new Error('Content metadata mismatch: '+file);
 records.push({resource:'curriculum/'+file,payload});
}
const data=records.map(record=>JSON.stringify(record)).join('\n')+'\n';
fs.writeFileSync(path.join(output,'course-materials.jsonl'),data,{mode:0o600});
fs.writeFileSync(path.join(output,'manifest.json'),JSON.stringify({records:records.length,supplementaryGrades:12,sha256:crypto.createHash('sha256').update(data).digest('hex')},null,2)+'\n',{mode:0o600});
console.log(`Exported ${records.length} course resources to ${output}. No upload or access activation performed.`);
