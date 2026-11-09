const {test,expect}=require('playwright/test');
const BASE='http://127.0.0.1:4173';
for(const [name,role,trusted,verifiedEmail,verifiedId,expected] of [
 ['confirmed designated admin','admin',true,'datogringi@gmail.com','admin-test-user',true],
 ['student with matching email','student',true,'datogringi@gmail.com','admin-test-user',false],
 ['profile admin without protected metadata','admin',false,'datogringi@gmail.com','admin-test-user',false],
 ['earlier different email','admin',true,'datogringo@gmail.com','admin-test-user',false],
 ['mismatched server identity','admin',true,'datogringi@gmail.com','another-user',false]
])test(`Owner presentation requires verified admin identity: ${name}`,async({page})=>{
 await page.route('https://cdn.jsdelivr.net/**',r=>r.fulfill({body:''}));
 await page.route(/\/shared\/(magic-me-v10-pending|magic-me|magic-me-v10-academy)\.js/,r=>r.fulfill({body:''}));
 await page.route('**/magicme-studio/vendor/three.module.js',r=>r.fulfill({body:'throw Error("Owner tests use static artwork")'}));
 await page.addInitScript(({role,trusted,verifiedEmail,verifiedId})=>{
  const cached={id:'admin-test-user',email:'datogringi@gmail.com',user_metadata:{role:'admin'}};
  const verified={id:verifiedId,email:verifiedEmail,app_metadata:{mariami_admin:trusted}};
  window.__ENGLISH_MARIAMI_SUPABASE_CLIENT={auth:{getSession:async()=>({data:{session:{user:cached}}}),getUser:async()=>({data:{user:verified}})},from:()=>({select(){return this},eq(){return this},maybeSingle:async()=>({data:{user_id:cached.id,role,grade:2}})})};
 },{role,trusted,verifiedEmail,verifiedId});
 await page.goto(BASE+'/academy.html?grade=2');
 await expect(page.locator('html')).toHaveClass(/mariami-auth-ready/);
 expect(await page.evaluate(()=>window.MARIAMI_MAGIC_ME_CONTEXT.isOwner)).toBe(expected);
});
