import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import os from 'node:os';
import {validResource} from '../supabase/functions/_shared/paid-course.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const API='https://api.supabase.com/v1/projects/vtdhvsfqhwesxtwmduew/database/query';
const hex=value=>Buffer.from(value,'utf8').toString('hex');
export function upsertSQL(record){
 if(!validResource(record?.resource)||!record.payload||typeof record.payload!=='object'||Array.isArray(record.payload))throw Error('Invalid private course record');
 // Hex encoding keeps quotes, backslashes and all Unicode out of SQL syntax.
 return `insert into public.paid_course_materials(resource,payload) values(convert_from(decode('${hex(record.resource)}','hex'),'UTF8'),convert_from(decode('${hex(JSON.stringify(record.payload))}','hex'),'UTF8')::jsonb) on conflict(resource) do update set payload=excluded.payload,updated_at=now();`;
}
async function main(){
 const token=process.env.SUPABASE_MANAGEMENT_TOKEN;
 if(!token||/[\r\n]/.test(token))throw Error('Supply SUPABASE_MANAGEMENT_TOKEN securely before importing.');
 const folder=path.resolve(process.argv[2]||path.join(root,'.private-course-export'));
 const file=path.join(folder,'course-materials.jsonl');
 if(fs.statSync(file).size>32*1024*1024)throw Error('Private course export exceeds the supported import size.');
 const bytes=fs.readFileSync(file),manifest=JSON.parse(fs.readFileSync(path.join(folder,'manifest.json'),'utf8'));
 if(crypto.createHash('sha256').update(bytes).digest('hex')!==manifest.sha256)throw Error('Export integrity check failed.');
 const records=bytes.toString('utf8').trim().split('\n').map(JSON.parse);
 if(records.length!==manifest.records||new Set(records.map(r=>r.resource)).size!==records.length)throw Error('Export record count or uniqueness check failed.');
 const queries=records.map(upsertSQL); // Validate the complete import before any writes.
 const directory=fs.mkdtempSync(path.join(os.tmpdir(),'mariami-content-'));
 function query(sql,readOnly){
  const input=path.join(directory,'query.json'),output=path.join(directory,'response.json');
  fs.writeFileSync(input,JSON.stringify({query:sql,read_only:readOnly}),{mode:0o600});
  const result=spawnSync('curl',['--silent','--show-error','--max-time','120','--config','-','--url',API,'--request','POST','--data-binary','@'+input,'--output',output,'--write-out','%{http_code}'],{
   encoding:'utf8',input:'header = '+JSON.stringify('Authorization: Bearer '+token)+'\nheader = "Content-Type: application/json"\n'
  });
  if(result.status!==0||Number(result.stdout)<200||Number(result.stdout)>=300)throw Error('Supabase content import request failed; no activation performed. Rerunning the same export is safe.');
  return JSON.parse(fs.readFileSync(output,'utf8'));
 }
 try{
  const rows=query("select c.relrowsecurity as protected, has_table_privilege('anon',c.oid,'SELECT') as anon_read, has_table_privilege('authenticated',c.oid,'SELECT') as user_read from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='paid_course_materials' and c.relkind='r'",true);
  if(rows.length!==1||rows[0].protected!==true||rows[0].anon_read!==false||rows[0].user_read!==false)throw Error('Private table protection was not confirmed. Apply/review the private-course migration before import.');
  for(let i=0;i<queries.length;i++){
   query(queries[i],false);
   console.log('Imported private resource '+(i+1)+'/'+queries.length);
  }
  const rowsAfter=query('select resource from public.paid_course_materials',true);
  const found=new Set(rowsAfter.map(row=>row.resource));
  if(records.some(row=>!found.has(row.resource)))throw Error('Import readback failed; activation remains blocked.');
  console.log('Private course import verified. This command does not enable billing or change public content delivery.');
 }finally{fs.rmSync(directory,{recursive:true,force:true});}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)main().catch(error=>{console.error(error.message);process.exitCode=1;});
