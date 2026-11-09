import {test} from 'node:test';
import assert from 'node:assert/strict';
import {paidCourseHandler,validResource} from '../supabase/functions/_shared/paid-course.mjs';
const env={SUPABASE_URL:'https://project.example.test',SUPABASE_SERVICE_ROLE_KEY:'test-server-only-key'};
const request=body=>new Request('https://functions.example.test/paid-course',{method:'POST',headers:{Authorization:'Bearer test-only-session','Content-Type':'application/json',Origin:'https://localhost'},body:JSON.stringify(body)});
const allowed=async()=>Response.json({ready:true,active:true},{headers:{'Access-Control-Allow-Origin':'https://localhost','Cache-Control':'no-store'}});
test('Private material never reaches an unverified or expired account',async()=>{
 for(const [status,body] of [[401,{error:'SIGN_IN_REQUIRED'}],[503,{error:'BILLING_NOT_CONFIGURED'}],[200,{ready:true,active:false}],[200,{ready:true,active:'true'}]]){
  let reads=0;
  const handler=paidCourseHandler({env,authorize:async()=>Response.json(body,{status}),fetcher:async()=>{reads++;throw Error('Unexpected content access')}});
  const result=await handler(request({resource:'supplementary/grade1.json'}));
  assert.equal(result.status,status===200?403:status);assert.equal(reads,0);
 }
});
test('Default authorization rejects missing bearer tokens and unexpected origins',async()=>{
 const handler=paidCourseHandler({env,fetcher:async()=>{throw Error('Unexpected network request')}});
 const noBearer=new Request('https://functions.example.test',{method:'POST',headers:{Origin:'https://localhost'},body:'{}'});
 assert.equal((await handler(noBearer)).status,401);
 const foreign=new Request('https://functions.example.test',{method:'POST',headers:{Origin:'https://untrusted.example.test'},body:'{}'});
 assert.equal((await handler(foreign)).status,403);
});
test('Only supported grade/world resource keys are accepted',()=>{
 for(const path of ['supplementary/grade1.json','supplementary/grade12.json','curriculum/grade9-world10.json'])assert.equal(validResource(path),true);
 for(const path of ['../config.js','curriculum/../secrets.json','supplementary/grade13.json','curriculum/grade1-world11.json','curriculum/grade1-world1.json&select=*',null,{},'https://example.test'])assert.equal(validResource(path),false);
});
test('A verified subscriber receives only the requested resource with no-store',async()=>{
 let calls=0;
 const handler=paidCourseHandler({env,authorize:allowed,fetcher:async(url,options)=>{
  calls++;assert.equal(url,env.SUPABASE_URL+'/rest/v1/paid_course_materials?select=payload&resource=eq.supplementary%2Fgrade2.json');
  assert.equal(options.headers.apikey,env.SUPABASE_SERVICE_ROLE_KEY);
  return Response.json([{payload:{grade:2,lessons:[{id:'test-lesson'}]}}]);
 }});
 const result=await handler(request({resource:'supplementary/grade2.json'}));
 assert.equal(result.status,200);assert.equal(result.headers.get('Cache-Control'),'no-store');
 assert.equal(result.headers.get('Access-Control-Allow-Origin'),'https://localhost');
 assert.deepEqual(await result.json(),{resource:'supplementary/grade2.json',content:{grade:2,lessons:[{id:'test-lesson'}]}});assert.equal(calls,1);
});
test('Bad paths and oversized requests never read the private content store',async()=>{
 let reads=0;const handler=paidCourseHandler({env,authorize:allowed,fetcher:()=>{reads++;throw Error('Unexpected read')}});
 for(const resource of ['../secrets','x'.repeat(3000),'supplementary/grade0.json'])assert.equal((await handler(request({resource}))).status,400);
 assert.equal((await handler(request(null))).status,400);assert.equal(reads,0);
});
test('Storage errors and invalid data cannot expose credentials',async()=>{
 for(const storage of [()=>Response.json([]),()=>Response.json([{payload:[]}]),()=>Response.json({error:'private'}, {status:500}),()=>{throw Error(env.SUPABASE_SERVICE_ROLE_KEY)}]){
  const handler=paidCourseHandler({env,authorize:allowed,fetcher:storage});const result=await handler(request({resource:'curriculum/grade1-world1.json'}));
  assert.ok([404,503].includes(result.status));assert.equal((await result.text()).includes(env.SUPABASE_SERVICE_ROLE_KEY),false);
 }
});

test('Import SQL encodes content instead of interpolating executable text',async()=>{
 const {upsertSQL}=await import('../scripts/import-private-content.mjs');
 const payload={grade:1,text:"ქართული '); drop table important; -- \\n"};
 const sql=upsertSQL({resource:'supplementary/grade1.json',payload});
 assert.equal(sql.includes('drop table'),false);assert.equal(sql.includes('ქართული'),false);
 assert.ok(sql.includes(Buffer.from(JSON.stringify(payload)).toString('hex')));
 assert.throws(()=>upsertSQL({resource:'../secrets',payload}),/Invalid/);
});
