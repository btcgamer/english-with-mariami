import {test} from 'node:test';
import assert from 'node:assert/strict';
import {webCheckoutHandler,webEntitlement,webConfigured,inspectWebSubscription,safePaymentURL,WEB_PLANS} from '../supabase/functions/_shared/web-billing.mjs';
import {subscriptionHandler} from '../supabase/functions/_shared/play.mjs';
import {webHookHandler} from '../supabase/functions/_shared/web-hook.mjs';
import {paidCourseHandler} from '../supabase/functions/_shared/paid-course.mjs';
const userId='11111111-1111-4111-8111-111111111111',intent='22222222-2222-4222-8222-222222222222';
const env={SUPABASE_URL:'https://project.example.test',SUPABASE_SERVICE_ROLE_KEY:'test-service-key',WEB_BILLING_ENABLED:'true',WEB_PROVIDER_TERMS_CONFIRMED:'true',WEB_PRIVATE_CONTENT_READY:'true',WEB_PAYMENT_MODE:'test',LEMON_API_KEY:'test-api-key',LEMON_WEBHOOK_SECRET:'test-webhook-secret',LEMON_STORE_ID:'1',LEMON_VARIANT_MONTHLY:'101',LEMON_VARIANT_QUARTERLY:'102',LEMON_VARIANT_HALF_YEARLY:'103',LEMON_VARIANT_YEARLY:'104'};
const json=(v,status=200)=>Response.json(v,{status});
const subscription=(patch={})=>({type:'subscriptions',id:'500',attributes:{store_id:1,order_id:700,variant_id:101,status:'active',renews_at:'2099-01-01T00:00:00Z',ends_at:null,pause:null,updated_at:'2026-11-10T10:00:00Z',test_mode:true,urls:{customer_portal:'https://store.lemonsqueezy.com/billing/test'},...patch}});
function harness(options={}){
 const calls=[];
 const configuration={...env,...options.env};
 const fetcher=async(url,request={})=>{
  calls.push({url,request});
  if(url.endsWith('/auth/v1/user'))return json({id:userId,email:'learner@example.test',app_metadata:options.admin?{mariami_admin:true}:{mariami_payment_tester:options.tester!==false},user_metadata:{role:'admin'}},options.authStatus||200);
  if(url.includes('/rest/v1/profiles?'))return json([{role:options.admin?'admin':'student'}]);
  if(url.includes('/rest/v1/web_subscriptions?'))return json(options.rows||[]);
  if(url.includes('/rest/v1/web_checkout_intents?'))return json(options.intents||[{user_id:userId,test_mode:true,variant_id:'101',plan:'monthly'}]);
  if(url.endsWith('/rest/v1/web_checkout_intents'))return new Response(null,{status:201});
  if(url.includes('/rest/v1/rpc/apply_web_subscription_event'))return json(true);
  if(url.includes('/rest/v1/paid_course_materials?'))return json([{payload:{grade:1,lessons:[{id:'protected-test-lesson'}]}}]);
  if(url.includes('/v1/stores/'))return json({data:{type:'stores',id:'1',attributes:{currency:options.currency||'USD'}}});
  if(url.includes('/v1/variants/')){
   const id=url.split('/').pop(),index=Number(id)-101,plan=Object.keys(WEB_PLANS)[index],p=WEB_PLANS[plan];
   return json({data:{type:'variants',id,attributes:{status:'published',test_mode:true,is_subscription:true,price:options.price||p.cents,interval:index===3?'year':'month',interval_count:index===3?1:p.months,has_free_trial:false,pay_what_you_want:false}}});
  }
  if(url.includes('/v1/prices?')){
   const id=new URL(url).searchParams.get('filter[variant_id]'),index=Number(id)-101,p=Object.values(WEB_PLANS)[index];
   return json({data:[{attributes:{variant_id:Number(id),category:'subscription',scheme:'standard',unit_price:p.cents,usage_aggregation:null,setup_fee_enabled:!!options.setupFee,setup_fee:options.setupFee?100:0,renewal_interval_unit:index===3?'year':'month',renewal_interval_quantity:index===3?1:p.months,trial_interval_unit:null,trial_interval_quantity:null}}]});
  }
  if(url.endsWith('/v1/checkouts'))return json({data:{type:'checkouts',id:'50',attributes:{url:options.checkoutURL||'https://store.lemonsqueezy.com/checkout/buy/test'}}});
  if(url.includes('/v1/subscriptions/'))return json({data:options.subscription||subscription()});
  if(url.includes('/v1/subscriptions?'))return json({data:[subscription()]});
  if(url.includes('/v1/orders/'))return json({data:{type:'orders',id:'700',attributes:{store_id:1,status:options.partial?'paid':'refunded',refunded:true,refunded_at:'2026-11-10T11:00:00Z',test_mode:true}}});
  if(url.includes('/v1/subscription-invoices/'))return json({data:{type:'subscription-invoices',id:'600',attributes:{store_id:1,subscription_id:500,status:options.refunded?'refunded':'paid',refunded:!!options.refunded,test_mode:true,created_at:'2026-11-10T09:00:00Z',updated_at:'2026-11-10T11:00:00Z'}}});
  throw Error('Unexpected URL');
 };
 return {env:configuration,fetcher,calls,handler:webCheckoutHandler({env:configuration,fetcher,statusHandler:subscriptionHandler({env:configuration,fetcher})})};
}
function request(body,auth=true){return new Request('https://functions.example.test',{method:'POST',headers:{Origin:'https://localhost','Content-Type':'application/json',...(auth?{Authorization:'Bearer test-user-token'}:{})},body:JSON.stringify(body)});}
test('Exact USD prices and period mapping are server-owned',()=>assert.deepEqual(Object.values(WEB_PLANS).map(p=>[p.months,p.cents]),[[1,250],[3,670],[6,1578],[12,3156]]));
test('No new checkout is configured until operator has confirmed no-fixed-fee terms',()=>{
 assert.equal(webConfigured(env),true);assert.equal(webConfigured({...env,WEB_PROVIDER_TERMS_CONFIRMED:'false'}),false);
 assert.equal(webConfigured({...env,WEB_PRIVATE_CONTENT_READY:'false'}),false);
 assert.equal(webConfigured({...env,LEMON_VARIANT_YEARLY:'101'}),false);
});
for(const [plan,price] of Object.entries(WEB_PLANS))test(`Checkout ${plan} binds authenticated account and exact recurring price`,async()=>{
 const h=harness();const result=await h.handler(request({action:'checkout',plan,user_id:'attacker',price:1}));
 assert.equal(result.status,200);assert.equal((await result.json()).url,'https://store.lemonsqueezy.com/checkout/buy/test');
 const body=JSON.parse(h.calls.find(c=>c.url.endsWith('/v1/checkouts')).request.body).data;
 assert.equal(body.attributes.custom_price,price.cents);assert.equal(body.attributes.checkout_data.custom.account_id,userId);
 assert.equal(body.attributes.checkout_data.email,'learner@example.test');assert.equal(body.attributes.checkout_options.skip_trial,true);
 assert.equal(body.attributes.checkout_options.discount,false);assert.equal(body.attributes.checkout_data.variant_quantities[0].quantity,1);
});
test('No checkout can charge before auth, eligibility, price and setup-fee checks pass',async()=>{
 for(const options of [{authStatus:401},{tester:false},{price:1},{setupFee:true},{currency:'GEL'},{env:{WEB_PROVIDER_TERMS_CONFIRMED:'false'}},{env:{WEB_BILLING_ENABLED:'false'}}]){
  const h=harness(options),result=await h.handler(request({action:'checkout',plan:'monthly'}));
  assert.notEqual(result.status,200);assert.equal(h.calls.some(c=>c.url.endsWith('/v1/checkouts')),false);
 }
 const h=harness();assert.equal((await h.handler(request({action:'checkout',plan:'monthly'},false))).status,401);
});
test('Admin and already-active members are not sent to another charge',async()=>{
 for(const options of [{admin:true},{rows:[{provider_subscription_id:'500',blocked:false,test_mode:true}]}]){
  const h=harness(options);assert.equal((await h.handler(request({action:'checkout',plan:'monthly'}))).status,409);
  assert.equal(h.calls.some(c=>c.url.endsWith('/v1/checkouts')),false);
 }
});
test('Payment and portal URLs are restricted to official HTTPS provider domains',()=>{
 for(const url of ['javascript:alert(1)','https://lemonsqueezy.com.evil.test/checkout/buy/1','https://user:pass@store.lemonsqueezy.com/checkout/buy/1','http://store.lemonsqueezy.com/checkout/buy/1'])assert.equal(safePaymentURL(url),false);
 assert.equal(safePaymentURL('https://store.lemonsqueezy.com/checkout/buy/1'),true);
});
test('An unexpected provider checkout URL is never forwarded to the user',async()=>{
 const h=harness({checkoutURL:'https://evil.example.test'});assert.equal((await h.handler(request({action:'checkout',plan:'monthly'}))).status,503);
});
test('Browser-return flags and user-edited roles cannot activate access',async()=>{
 const h=harness();const result=await h.handler(request({action:'status',paid:true,role:'admin',plan:'yearly'}));
 assert.equal((await result.json()).active,false);
});
for(const state of ['expired','paused','past_due','unpaid','on_trial'])test(`Provider state ${state} is not paid access`,()=>assert.equal(inspectWebSubscription(env,subscription({status:state})).active,false));
test('Cancelled paid access lasts only until the confirmed expiry',()=>{
 assert.equal(inspectWebSubscription(env,subscription({status:'cancelled',ends_at:'2099-01-01T00:00:00Z'})).active,true);
 assert.equal(inspectWebSubscription(env,subscription({status:'cancelled',ends_at:'2000-01-01T00:00:00Z'})).active,false);
});
test('Live/test/store/variant mismatches cannot grant access',()=>{
 for(const patch of [{test_mode:false},{store_id:999},{variant_id:999}])assert.throws(()=>inspectWebSubscription(env,subscription(patch)));
});
test('A test purchase cannot grant access to a normal learner',async()=>{
 const h=harness({tester:false,rows:[{provider_subscription_id:'500',test_mode:true,blocked:false}]});
 const result=await webEntitlement(h.env,{id:userId,app_metadata:{}},h.fetcher);assert.equal(result.active,false);
});
test('Refund-blocked records stay blocked even if provider status is still active',async()=>{
 const h=harness({rows:[{provider_subscription_id:'500',test_mode:true,blocked:true}]});
 const state=await webEntitlement(h.env,{id:userId,app_metadata:{mariami_payment_tester:true}},h.fetcher);assert.equal(state.active,false);
});
test('Disabling new checkouts still permits current access and cancellation portal',async()=>{
 const h=harness({env:{WEB_BILLING_ENABLED:'false'},rows:[{provider_subscription_id:'500',test_mode:true,blocked:false}]});
 const status=await (await h.handler(request({action:'status'}))).json();assert.equal(status.active,true);assert.equal(status.webReady,false);
 assert.equal((await h.handler(request({action:'portal'}))).status,200);
});
async function signed(body,secret=env.LEMON_WEBHOOK_SECRET){
 const text=JSON.stringify(body),bytes=new TextEncoder().encode(text);
 const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 const signature=[...new Uint8Array(await crypto.subtle.sign('HMAC',key,bytes))].map(n=>n.toString(16).padStart(2,'0')).join('');
 return new Request('https://functions.example.test',{method:'POST',headers:{'X-Signature':signature,'X-Event-Name':body.meta.event_name},body:text});
}
const event=(name='subscription_created')=>({meta:{event_name:name,custom_data:{checkout_intent:intent,account_id:userId}},data:{type:name.startsWith('subscription_payment_')?'subscription-invoices':'subscriptions',id:name.startsWith('subscription_payment_')?'600':'500'}});
test('Unsigned or forged callbacks cannot call the database/provider',async()=>{
 const h=harness(),hook=webHookHandler(h);
 assert.equal((await hook(await signed(event(),'incorrect-key'))).status,401);
 assert.equal(h.calls.length,0);
});
test('Signed creation binds only a server-issued checkout intent to the account',async()=>{
 const h=harness(),hook=webHookHandler(h);assert.equal((await hook(await signed(event()))).status,200);
 const body=JSON.parse(h.calls.find(c=>c.url.includes('rpc/apply_web_subscription_event')).request.body);
 assert.equal(body.p_user_id,userId);assert.equal(body.p_intent_id,intent);assert.equal(body.p_plan,'monthly');assert.match(body.p_event_hash,/^[a-f0-9]{64}$/);
});
test('Callbacks cannot reassign a purchase through mismatched custom account metadata',async()=>{
 const h=harness({intents:[{user_id:'other-user',test_mode:true}]}),hook=webHookHandler(h);
 assert.equal((await hook(await signed(event()))).status,403);assert.equal(h.calls.some(c=>c.url.includes('/rpc/')),false);
});
test('Provider API mode/store mismatches reject even correctly signed event bodies',async()=>{
 const h=harness({subscription:subscription({test_mode:false})}),hook=webHookHandler(h);
 assert.notEqual((await hook(await signed(event()))).status,200);assert.equal(h.calls.some(c=>c.url.includes('/rpc/')),false);
});
test('Full refunds are recorded even when new checkouts are disabled',async()=>{
 const h=harness({env:{WEB_BILLING_ENABLED:'false'},refunded:true,rows:[{user_id:userId,test_mode:true}]}),hook=webHookHandler(h);
 assert.equal((await hook(await signed(event('subscription_payment_refunded')))).status,200);
 const body=JSON.parse(h.calls.find(c=>c.url.includes('/rpc/')).request.body);assert.equal(body.p_refunded,true);assert.equal(body.p_billing_at,'2026-11-10T11:00:00Z');
});
test('The webhook uses current provider state instead of trusting stale event snapshots',async()=>{
 const h=harness({subscription:subscription({status:'expired',ends_at:'2000-01-01T00:00:00Z'})}),hook=webHookHandler(h);
 const body=event();body.data.attributes={status:'active',renews_at:'2099-01-01T00:00:00Z'};
 assert.equal((await hook(await signed(body))).status,200);
 assert.equal(JSON.parse(h.calls.find(c=>c.url.includes('/rpc/')).request.body).p_status,'expired');
});
test('An unpaid or fully-refunded recurring subscription cannot trigger another checkout',async()=>{
 for(const patch of [{status:'unpaid'},{status:'active'}]){
  const h=harness({subscription:subscription(patch),rows:[{provider_subscription_id:'500',test_mode:true,blocked:true}]});
  assert.equal((await h.handler(request({action:'checkout',plan:'monthly'}))).status,409);
  const state=await (await h.handler(request({action:'status'}))).json();
  assert.equal(state.active,false);assert.equal(state.hasWebSubscription,true);assert.equal(state.webPurchaseBlocked,true);
  assert.equal((await h.handler(request({action:'portal'}))).status,200);
 }
});
test('Full initial order refunds are associated through verified provider order IDs',async()=>{
 const h=harness({rows:[{user_id:userId,test_mode:true}]}),hook=webHookHandler(h);
 const body={meta:{event_name:'order_refunded'},data:{type:'orders',id:'700'}};
 assert.equal((await hook(await signed(body))).status,200);
 const saved=JSON.parse(h.calls.find(c=>c.url.includes('/rpc/')).request.body);
 assert.equal(saved.p_refunded,true);assert.equal(saved.p_subscription_id,'500');
});
test('Partial initial order refunds do not revoke the entire paid period',async()=>{
 const h=harness({partial:true,rows:[{user_id:userId,test_mode:true}]}),hook=webHookHandler(h);
 assert.equal((await hook(await signed({meta:{event_name:'order_refunded'},data:{type:'orders',id:'700'}}))).status,200);
 assert.equal(h.calls.some(c=>c.url.includes('/rpc/')),false);
});
test('New subscription bindings must match the intent period and variant',async()=>{
 const h=harness({intents:[{user_id:userId,test_mode:true,plan:'yearly',variant_id:'104'}]});
 assert.equal((await webHookHandler(h)(await signed(event()))).status,403);
 assert.equal(h.calls.some(c=>c.url.includes('/rpc/')),false);
});
test('Private course delivery uses web entitlement with Google billing disabled',async()=>{
 for(const options of [
  {rows:[{provider_subscription_id:'500',test_mode:true,blocked:false}],expected:200},
  {rows:[{provider_subscription_id:'500',test_mode:true,blocked:true}],expected:403},
  {rows:[{provider_subscription_id:'500',test_mode:true,blocked:false}],subscription:subscription({status:'unpaid'}),expected:403},
  {rows:[],expected:403}
 ]){
  const h=harness(options),handler=paidCourseHandler(h);
  const response=await handler(request({resource:'supplementary/grade1.json'}));
  assert.equal(response.status,options.expected);
  assert.equal(h.calls.filter(c=>c.url.includes('/paid_course_materials?')).length,options.expected===200?1:0);
 }
});
test('A late success callback uses invoice creation time, never a later metadata update',async()=>{
 const h=harness({rows:[{user_id:userId,test_mode:true}]}),hook=webHookHandler(h);
 assert.equal((await hook(await signed(event('subscription_payment_success')))).status,200);
 const body=JSON.parse(h.calls.find(c=>c.url.includes('/rpc/')).request.body);
 assert.equal(body.p_refunded,false);assert.equal(body.p_billing_at,'2026-11-10T09:00:00Z');
});
