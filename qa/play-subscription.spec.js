const {test,expect} = require('playwright/test');
const BASE='http://127.0.0.1:4173';
async function setup(page,{native=true,backend=true,active=false,admin=false}={}){
  await page.route('**/pwa.js*',r=>r.fulfill({body:''}));
  await page.route('**/functions/v1/web-subscription',r=>r.fulfill({status:503,contentType:'application/json',body:'{"error":"WEB_PAYMENT_NOT_CONFIGURED"}'}));
  await page.route('https://cdn.jsdelivr.net/**',r=>r.fulfill({body:''}));
  await page.addInitScript(({native})=>{
    const user={id:'9de081b3-4263-49f4-a0cf-e67dd494bc84'};
    window.__ENGLISH_MARIAMI_SUPABASE_CLIENT={auth:{getSession:async()=>({data:{session:{user,access_token:'test-session-only'}}})}};
    window.testPurchases=[];window.testRestores=[];
    if(native)window.Capacitor={Plugins:{MariamiBilling:{
      addListener:async(name,listener)=>{window.testPurchaseEvent=listener},
      getPlans:async()=>({plans:['monthly','quarterly','half-yearly','yearly'].map((id,i)=>({id,price:['₹190.00','₹670.00','₹1,578.00','₹3,156.00'][i]}))}),
      purchase:async(params)=>{window.testPurchases.push(params)},restore:async()=>({purchases:window.testRestores})
    }}};
  },{native});
  const requests=[];
  await page.route('**/functions/v1/play-subscription',async route=>{
    const body=route.request().postDataJSON();requests.push(body);
    await route.fulfill({status:backend?200:503,contentType:'application/json',body:JSON.stringify(backend?{ready:true,active,expiresAt:null,...(admin?{access:'admin'}:{})}:{error:'BILLING_NOT_CONFIGURED'})});
  });
  await page.goto(BASE+'/subscriptions.html');
  return requests;
}
test('Web reference prices are exact and cannot initiate a charge',async({page})=>{
  const requests=await setup(page,{native:false});
  await expect(page.locator('[data-price]')).toHaveText(['$2.50','$6.70','$15.78','$31.56']);
  for(const button of await page.locator('[data-plan]').all())await expect(button).toBeDisabled();
  expect(requests).toHaveLength(0);
  await page.setViewportSize({width:390,height:844});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('Unavailable verifier keeps every purchase disabled',async({page})=>{
  await setup(page,{backend:false});
  await expect(page.locator('#subscription-status')).toContainText('ჯერ მიუწვდომელია');
  for(const button of await page.locator('[data-plan]').all())await expect(button).toBeDisabled();
  expect(await page.evaluate(()=>window.testPurchases)).toEqual([]);
});
test('Native checkout shows Play localized prices and binds purchase to hashed account',async({page})=>{
  await setup(page);
  await expect(page.locator('[data-price="monthly"]')).toHaveText('₹190.00');
  await page.locator('[data-plan="monthly"]').click();
  await expect.poll(()=>page.evaluate(()=>window.testPurchases.length)).toBe(1);
  const [purchase]=await page.evaluate(()=>window.testPurchases);
  expect(purchase.plan).toBe('monthly');expect(purchase.account).toMatch(/^[a-f0-9]{64}$/);
  await page.evaluate(()=>window.testPurchaseEvent({code:1,purchases:[]}));
  await expect(page.locator('#subscription-status')).toHaveText('გადახდა გაუქმებულია.');
  await expect(page.locator('[data-plan="monthly"]')).toBeEnabled();
});
test('Pending purchase is not verified or treated as paid access',async({page})=>{
  const requests=await setup(page);
  await expect(page.locator('[data-plan="monthly"]')).toBeEnabled();
  await page.evaluate(()=>window.testPurchaseEvent({code:0,purchases:[{state:2,token:'pending-test-token'}]}));
  await expect(page.locator('#subscription-status')).toContainText('გადახდა მოლოდინშია');
  expect(requests.some(r=>r.action==='verify')).toBe(false);
});
test('Client purchase success alone never unlocks access',async({page})=>{
  const requests=await setup(page);
  await expect(page.locator('[data-plan="monthly"]')).toBeEnabled();
  await page.evaluate(()=>window.testPurchaseEvent({code:0,purchases:[{state:1,token:'test-purchase-token'}]}));
  await expect.poll(()=>requests.some(r=>r.action==='verify')).toBe(true);
  await expect(page.locator('#subscription-status')).toContainText('აირჩიე სასურველი პერიოდი');
  await expect(page.locator('[data-plan="monthly"]')).toBeEnabled();
});
test('Restoration verifies tokens and checks account status with backend',async({page})=>{
  const requests=await setup(page);
  await expect(page.locator('#restore-purchases')).toBeEnabled();
  await page.evaluate(()=>{window.testRestores=[{state:1,token:'test-restore-token'}]});
  await page.locator('#restore-purchases').click();
  await expect.poll(()=>requests.some(r=>r.action==='verify'&&r.token==='test-restore-token')).toBe(true);
  await expect(page.locator('#restore-purchases')).toBeEnabled();
});
test('A verified existing subscriber cannot be charged again by this page',async({page})=>{
  await setup(page,{active:true});
  await expect(page.locator('#subscription-status')).toContainText('წვდომა დადასტურებულია');
  for(const button of await page.locator('[data-plan]').all())await expect(button).toBeDisabled();
});

test('A server-verified admin is not offered a purchase or restore action',async({page})=>{
  await setup(page,{active:true,admin:true});
  await expect(page.locator('#subscription-status')).toContainText('ადმინისტრატორის წვდომა დადასტურებულია');
  await expect(page.locator('.plans')).toBeHidden();
  await expect(page.locator('#restore-purchases')).toBeDisabled();
  expect(await page.evaluate(()=>window.testPurchases)).toEqual([]);
});
