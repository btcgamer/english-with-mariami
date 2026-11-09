const {test,expect}=require('playwright/test');
const BASE='http://127.0.0.1:4173';
async function setup(page,{enabled=true,active=false,admin=false,blocked=false,hasSubscription=active,signedIn=true,returned=false,unsafe=false,delay=0}={}){
 await page.route('**/pwa.js*',r=>r.fulfill({body:''}));
 await page.route('https://cdn.jsdelivr.net/**',r=>r.fulfill({body:''}));
 await page.addInitScript(({signedIn})=>{
  const user={id:'11111111-1111-4111-8111-111111111111'};
  window.__ENGLISH_MARIAMI_SUPABASE_CLIENT={auth:{getSession:async()=>({data:{session:signedIn?{user,access_token:'test-web-session'}:null}})}};
 },{signedIn});
 const requests=[];
 await page.route('**/functions/v1/web-subscription',async r=>{
  const body=r.request().postDataJSON();requests.push(body);
  expect(r.request().headers().authorization).toBe('Bearer test-web-session');
  if(body.action==='status')return r.fulfill({contentType:'application/json',body:JSON.stringify({ready:true,active,webReady:enabled,source:'web',hasWebSubscription:hasSubscription,webPurchaseBlocked:blocked,...(admin?{access:'admin'}:{})})});
  if(delay)await new Promise(resolve=>setTimeout(resolve,delay));
  await r.fulfill({contentType:'application/json',body:JSON.stringify({url:unsafe?'https://evil.example.test/checkout/buy/test':body.action==='portal'?'https://store.lemonsqueezy.com/billing/test':'https://store.lemonsqueezy.com/checkout/buy/test'})});
 });
 await page.route('https://store.lemonsqueezy.com/**',r=>r.fulfill({contentType:'text/html',body:'<title>Hosted provider test fixture</title><p>Hosted checkout test fixture</p>'}));
 await page.goto(BASE+'/subscriptions.html'+(returned?'?checkout=returned&paid=true':''));
 return requests;
}
test('Web and mobile PWA show the four exact full-period prices with usable layout',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await setup(page);
 await expect(page.locator('[data-price]')).toHaveText(['$2.50','$6.70','$15.78','$31.56']);
 for(const button of await page.locator('[data-plan]').all())await expect(button).toBeEnabled();
 await expect(page.locator('#manage-play-subscription')).toBeHidden();
 await expect(page.locator('#subscription-renewal-terms')).not.toContainText('Google Play');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('Disabled provider leaves all web purchases disabled',async({page})=>{
 const requests=await setup(page,{enabled:false});
 await expect(page.locator('#subscription-status')).toContainText('ჯერ არ არის ჩართული');
 for(const button of await page.locator('[data-plan]').all())await expect(button).toBeDisabled();
 expect(requests.filter(r=>r.action==='checkout')).toHaveLength(0);
});
test('Checkout sends only selected plan and opens the hosted provider',async({page})=>{
 const requests=await setup(page);
 await page.locator('[data-plan="yearly"]').click();
 await expect(page).toHaveURL('https://store.lemonsqueezy.com/checkout/buy/test');
 expect(requests.filter(r=>r.action==='checkout')).toEqual([{action:'checkout',plan:'yearly'}]);
});
test('Rapid repeated clicks issue only one checkout request',async({page})=>{
 const requests=await setup(page,{delay:250});
 await expect(page.locator('[data-plan="monthly"]')).toBeEnabled();
 await page.evaluate(()=>{const b=document.querySelector('[data-plan="monthly"]');b.click();b.click();b.click()});
 await expect(page).toHaveURL('https://store.lemonsqueezy.com/checkout/buy/test');
 expect(requests.filter(r=>r.action==='checkout')).toHaveLength(1);
});
test('Return URL flags cannot open access or mark a purchase paid',async({page})=>{
 const requests=await setup(page,{returned:true});
 await expect(page.locator('#subscription-status')).toContainText('დაელოდე სერვერის დადასტურებას');
 expect(requests).toEqual([{action:'status'}]);
 await expect(page.locator('#manage-web-subscription')).toBeHidden();
});
test('Invalid provider URL keeps the user on the academy origin',async({page})=>{
 await setup(page,{unsafe:true});
 await page.locator('[data-plan="monthly"]').click();
 await expect(page.locator('#subscription-status')).toContainText('უსაფრთხო მისამართი ვერ დადასტურდა');
 expect(new URL(page.url()).origin).toBe(BASE);
});
test('An inactive refundable or failed subscription still offers cancellation, not another charge',async({page})=>{
 const requests=await setup(page,{active:false,blocked:true,hasSubscription:true});
 for(const button of await page.locator('[data-plan]').all())await expect(button).toBeDisabled();
 await page.locator('#manage-web-subscription').click();
 await expect(page).toHaveURL('https://store.lemonsqueezy.com/billing/test');
 expect(requests.filter(r=>r.action==='portal')).toHaveLength(1);
});
test('Server-verified admin is offered no purchase',async({page})=>{
 await setup(page,{active:true,admin:true});
 await expect(page.locator('.plans')).toBeHidden();
 await expect(page.locator('#subscription-status')).toContainText('ადმინისტრატორის წვდომა დადასტურებულია');
});
test('Signed-out visitors must sign in before any request to payment service',async({page})=>{
 const requests=await setup(page,{signedIn:false});
 await expect(page.locator('#subscription-sign-in')).toBeVisible({timeout:12000});
 expect(requests).toHaveLength(0);
 for(const button of await page.locator('[data-plan]').all())await expect(button).toBeDisabled();
});
