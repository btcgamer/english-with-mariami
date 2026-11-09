const {test,expect}=require('playwright/test');
const fs=require('fs'),path=require('path'),vm=require('vm');
const BASE='http://127.0.0.1:4174';
function gradeData(grade){const sandbox={window:{}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../shared/mariami-grammar-listening/grade-'+grade+'.js'),'utf8'),sandbox);return sandbox.window.MARIAMI_GRAMMAR_LISTENING[grade]}
async function setup(page,allowed=true){
 await page.route('https://cdn.jsdelivr.net/**',r=>r.fulfill({body:''}));
 await page.route(/\/shared\/(magic-me-v10-pending|magic-me|magic-me-v10-academy)\.js/,r=>r.fulfill({body:''}));
 await page.addInitScript(()=>{
  const user={id:'private-content-test-user',user_metadata:{}};
  window.__ENGLISH_MARIAMI_SUPABASE_CLIENT={auth:{getSession:async()=>({data:{session:{user,access_token:'test-only-private-session'}}}),getUser:async()=>({data:{user}})},from:()=>({select(){return this},eq(){return this},maybeSingle:async()=>({data:{user_id:user.id,role:'student',grade:2}})})};
 });
 const requests=[],publicRequests=[];
 await page.route('**/functions/v1/paid-course',async r=>{
  expect(r.request().headers().authorization).toBe('Bearer test-only-private-session');
  const {resource}=r.request().postDataJSON();requests.push(resource);
  if(!allowed)return r.fulfill({status:403,contentType:'application/json',body:'{"error":"SUBSCRIPTION_REQUIRED"}'});
  const match=/supplementary\/grade(\d+)\.json/.exec(resource);
  const content=match?gradeData(Number(match[1])):JSON.parse(fs.readFileSync(path.join(__dirname,'..',resource),'utf8'));
  return r.fulfill({contentType:'application/json',body:JSON.stringify({resource,content})});
 });
 page.on('request',r=>{if(/\/shared\/mariami-grammar-listening\/grade-\d+\.js|\/curriculum\/grade\d+-world\d+\.json/.test(r.url()))publicRequests.push(r.url())});
 return {requests,publicRequests};
}
test('Private academy loads authorized lessons only through the authenticated endpoint',async({page})=>{
 const tracked=await setup(page);
 await page.goto(BASE+'/academy.html?grade=2');
 await expect(page.locator('#lesson-content')).toBeVisible();
 expect(tracked.requests).toContain('supplementary/grade2.json');expect(tracked.publicRequests).toEqual([]);
 expect(await page.evaluate(()=>window.EWM_PRIVATE_COURSES)).toBe(true);
});
test('Rejected access cannot fall back to public curriculum files',async({page})=>{
 const tracked=await setup(page,false);
 await page.goto(BASE+'/academy.html?grade=2');
 await expect(page.locator('#error')).toContainText('მოქმედი გამოწერაა საჭირო');
 expect(tracked.requests).toContain('supplementary/grade2.json');
 await expect(page.locator('#lesson-content')).toBeHidden();expect(tracked.publicRequests).toEqual([]);
});
test('Private build omits paid data and redirects the old grade runtime',async({page,request})=>{
 for(const file of ['/shared/mariami-grammar-listening/grade-2.js','/curriculum/grade9-world1.json','/shared/academy-grade-core.js'])expect((await request.get(BASE+file)).status()).toBe(404);
 const tracked=await setup(page);
 await page.goto(BASE+'/grade5/index.html');
 await expect(page.locator('#grade')).toHaveValue('5');await expect(page.locator('#lesson-content')).toBeVisible();
 expect(new URL(page.url()).pathname).toBe('/academy.html');expect(tracked.requests).toContain('supplementary/grade5.json');
});
test('Private advanced world loader uses the verified endpoint',async({page})=>{
 const tracked=await setup(page);
 await page.goto(BASE+'/advanced-academy.html?grade=9');
 await expect(page.locator('[data-curriculum-missions] .magic-mission-card')).toHaveCount(20);
 expect(tracked.requests).toContain('curriculum/grade9-world1.json');expect(tracked.publicRequests).toEqual([]);
});
