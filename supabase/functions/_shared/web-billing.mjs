export const WEB_PLANS=Object.freeze({monthly:{cents:250,months:1},quarterly:{cents:670,months:3},'half-yearly':{cents:1578,months:6},yearly:{cents:3156,months:12}});
const keys={monthly:'LEMON_VARIANT_MONTHLY',quarterly:'LEMON_VARIANT_QUARTERLY','half-yearly':'LEMON_VARIANT_HALF_YEARLY',yearly:'LEMON_VARIANT_YEARLY'};
export const webMode=env=>env.WEB_PAYMENT_MODE==='test';
export function webProviderConfigured(env){
 const ids=Object.values(keys).map(k=>String(env[k]||''));
 return ['test','live'].includes(env.WEB_PAYMENT_MODE)&&!!env.LEMON_API_KEY&&/^\d+$/.test(env.LEMON_STORE_ID||'')&&ids.every(id=>/^\d+$/.test(id))&&new Set(ids).size===4;
}
export function webConfigured(env){return env.WEB_BILLING_ENABLED==='true'&&env.WEB_PROVIDER_TERMS_CONFIRMED==='true'&&env.WEB_PRIVATE_CONTENT_READY==='true'&&webProviderConfigured(env);}
export function planVariant(env,plan){return keys[plan]?String(env[keys[plan]]||''):null;}
export function variantPlan(env,id){return Object.keys(keys).find(plan=>planVariant(env,plan)===String(id));}
export function safePaymentURL(value,kind='checkout'){
 try{const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password&&(url.hostname==='lemonsqueezy.com'||url.hostname.endsWith('.lemonsqueezy.com'))&&(kind!=='checkout'||url.pathname.startsWith('/checkout/'));}catch{return false;}
}
export async function lemonAPI(env,path,fetcher=fetch,method='GET',body){
 if(!/^\/(stores|variants|prices|checkouts|subscriptions|subscription-invoices|orders)(?:[/?][A-Za-z0-9_?=&%\[\].-]*)?$/.test(path))throw Error('INVALID_PROVIDER_PATH');
 const response=await fetcher('https://api.lemonsqueezy.com/v1'+path,{method,headers:{Authorization:'Bearer '+env.LEMON_API_KEY,Accept:'application/vnd.api+json','Content-Type':'application/vnd.api+json'},...(body?{body:JSON.stringify(body)}:{})});
 if(!response.ok)throw Error('PAYMENT_PROVIDER_UNAVAILABLE');
 return response.json();
}
export async function restAPI(env,path,fetcher=fetch,method='GET',body,prefer){
 const response=await fetcher(env.SUPABASE_URL+'/rest/v1/'+path,{method,headers:{apikey:env.SUPABASE_SERVICE_ROLE_KEY,Authorization:'Bearer '+env.SUPABASE_SERVICE_ROLE_KEY,'Content-Type':'application/json',...(prefer?{Prefer:prefer}:{})},...(body?{body:JSON.stringify(body)}:{})});
 if(!response.ok)throw Error('PAYMENT_STORAGE_UNAVAILABLE');
 const text=await response.text();return text?JSON.parse(text):null;
}
export function inspectWebSubscription(env,object,now=Date.now()){
 const a=object?.attributes,plan=variantPlan(env,a?.variant_id);
 if(object?.type!=='subscriptions'||!/^\d+$/.test(String(object.id))||!a||String(a.store_id)!==String(env.LEMON_STORE_ID)||a.test_mode!==webMode(env)||!plan)throw Error('SUBSCRIPTION_MISMATCH');
 const expiry=Date.parse(a.status==='cancelled'?a.ends_at:a.renews_at);
 const active=['active','cancelled'].includes(a.status)&&!a.pause&&Number.isFinite(expiry)&&expiry>now;
 return {plan,active,expiresAt:Number.isFinite(expiry)?new Date(expiry).toISOString():null,status:a.status,updatedAt:a.updated_at};
}
export async function webEntitlement(env,user,fetcher=fetch){
 if(!webProviderConfigured(env))return {ready:false,active:false,expiresAt:null};
 if(webMode(env)&&user.app_metadata?.mariami_payment_tester!==true)return {ready:false,active:false,expiresAt:null};
 const rows=await restAPI(env,'web_subscriptions?select=provider_subscription_id,blocked,test_mode&user_id=eq.'+encodeURIComponent(user.id),fetcher);
 let expiresAt=null,portal=null,purchaseBlocked=false;
 for(const row of rows){
  if(row.test_mode!==webMode(env))continue;
  const object=(await lemonAPI(env,'/subscriptions/'+encodeURIComponent(row.provider_subscription_id),fetcher)).data;
  const verified=inspectWebSubscription(env,object);
  if(verified.status!=='expired')purchaseBlocked=true;
  const link=object.attributes.urls?.customer_portal;
  if(!portal&&safePaymentURL(link,'portal'))portal=link;
  if(verified.active&&!row.blocked&&(!expiresAt||verified.expiresAt>expiresAt))expiresAt=verified.expiresAt;
 }
 return {ready:true,active:!!expiresAt,expiresAt,portal,purchaseBlocked};
}
export async function validateCheckoutPlan(env,plan,fetcher=fetch){
 if(!WEB_PLANS[plan])throw Error('INVALID_PLAN');
 const variant=planVariant(env,plan),expected=WEB_PLANS[plan];
 const store=(await lemonAPI(env,'/stores/'+env.LEMON_STORE_ID,fetcher)).data;
 if(store?.type!=='stores'||String(store.id)!==String(env.LEMON_STORE_ID)||store.attributes?.currency!=='USD')throw Error('STORE_CURRENCY_MISMATCH');
 const object=(await lemonAPI(env,'/variants/'+variant,fetcher)).data,a=object?.attributes;
 const annual=plan==='yearly',unit=annual?'year':'month',quantity=annual?1:expected.months;
 if(object?.type!=='variants'||String(object.id)!==variant||!a||!['published','pending'].includes(a.status)||a.test_mode!==webMode(env)||a.is_subscription!==true||a.price!==expected.cents||a.interval!==unit||a.interval_count!==quantity||a.has_free_trial!==false||a.pay_what_you_want!==false)throw Error('PLAN_CONFIGURATION_MISMATCH');
 const prices=(await lemonAPI(env,'/prices?filter%5Bvariant_id%5D='+variant,fetcher)).data;
 if(!Array.isArray(prices)||prices.length!==1)throw Error('PLAN_CONFIGURATION_MISMATCH');
 const price=prices[0].attributes;
 if(String(price?.variant_id)!==variant||price.category!=='subscription'||price.scheme!=='standard'||price.unit_price!==expected.cents||price.usage_aggregation!==null||price.setup_fee_enabled!==false||Number(price.setup_fee||0)!==0||price.renewal_interval_unit!==unit||price.renewal_interval_quantity!==quantity||price.trial_interval_unit!==null||Number(price.trial_interval_quantity||0)!==0)throw Error('PLAN_CONFIGURATION_MISMATCH');
 return variant;
}
const origins=new Set(['https://englishwithmariami.com.ge','https://www.englishwithmariami.com.ge','https://localhost','http://localhost:4173','http://127.0.0.1:4173','http://127.0.0.1:4174']);
export function webCheckoutHandler({env,fetcher=fetch,statusHandler}){
 return async request=>{
  const headers={'Content-Type':'application/json','Cache-Control':'no-store',Vary:'Origin','Access-Control-Allow-Headers':'authorization,apikey,content-type,x-client-info','Access-Control-Allow-Methods':'POST, OPTIONS'};
  const origin=request.headers.get('Origin');if(origins.has(origin))headers['Access-Control-Allow-Origin']=origin;
  const reply=(status,body)=>Response.json(body,{status,headers});
  if(origin&&!origins.has(origin))return reply(403,{error:'ORIGIN_NOT_ALLOWED'});
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
  if(request.method!=='POST')return reply(405,{error:'METHOD_NOT_ALLOWED'});
  if(!env.SUPABASE_URL||!env.SUPABASE_SERVICE_ROLE_KEY)return reply(503,{error:'WEB_PAYMENT_NOT_CONFIGURED'});
  const auth=request.headers.get('Authorization');if(!auth?.startsWith('Bearer '))return reply(401,{error:'SIGN_IN_REQUIRED'});
  try{
   const body=await request.json();if(!['status','checkout','portal'].includes(body?.action))return reply(400,{error:'INVALID_REQUEST'});
   if(body.action==='status')return statusHandler(new Request(request.url,{method:'POST',headers:request.headers,body:'{"action":"status"}'}));
   const identity=await fetcher(env.SUPABASE_URL+'/auth/v1/user',{headers:{apikey:env.SUPABASE_SERVICE_ROLE_KEY,Authorization:auth}});
   if(!identity.ok)return reply(401,{error:'SIGN_IN_REQUIRED'});
   const user=await identity.json();if(!user.id||!user.email)return reply(401,{error:'SIGN_IN_REQUIRED'});
   const profiles=await restAPI(env,'profiles?select=role&user_id=eq.'+encodeURIComponent(user.id),fetcher);
   if(profiles.length!==1||!['student','parent','teacher','admin'].includes(profiles[0].role))return reply(403,{error:'ACCOUNT_PROFILE_REQUIRED'});
   if(user.app_metadata?.mariami_admin===true&&profiles[0].role==='admin')return reply(409,{error:'ADMIN_DOES_NOT_NEED_PAYMENT'});
   if(!webProviderConfigured(env)||(body.action==='checkout'&&!webConfigured(env)))return reply(503,{error:'WEB_PAYMENT_NOT_CONFIGURED'});
   if(webMode(env)&&user.app_metadata?.mariami_payment_tester!==true)return reply(403,{error:'TEST_ACCOUNT_REQUIRED'});
   const state=await webEntitlement(env,user,fetcher);
   if(body.action==='portal')return state.portal?reply(200,{url:state.portal}):reply(404,{error:'SUBSCRIPTION_NOT_FOUND'});
   if(state.active||state.purchaseBlocked)return reply(409,{error:'SUBSCRIPTION_ALREADY_EXISTS'});
   const unified=await statusHandler(new Request(request.url,{method:'POST',headers:request.headers,body:'{"action":"status"}'}));
   if(!unified.ok)throw Error('ENTITLEMENT_CHECK_UNAVAILABLE');
   if((await unified.json()).active===true)return reply(409,{error:'SUBSCRIPTION_ALREADY_ACTIVE'});
   if(!Object.hasOwn(WEB_PLANS,body.plan))return reply(400,{error:'INVALID_PLAN'});
   const variant=await validateCheckoutPlan(env,body.plan,fetcher);
   const intent=crypto.randomUUID(),expires=new Date(Date.now()+30*60*1000).toISOString();
   await restAPI(env,'web_checkout_intents',fetcher,'POST',{id:intent,user_id:user.id,plan:body.plan,variant_id:variant,test_mode:webMode(env),expires_at:expires});
   const checkout=(await lemonAPI(env,'/checkouts',fetcher,'POST',{data:{type:'checkouts',attributes:{
    custom_price:WEB_PLANS[body.plan].cents,test_mode:webMode(env),expires_at:expires,
    product_options:{enabled_variants:[Number(variant)],redirect_url:'https://englishwithmariami.com.ge/subscriptions.html?checkout=returned'},
    checkout_options:{embed:false,discount:false,skip_trial:true,subscription_preview:true},
    checkout_data:{email:user.email,custom:{account_id:user.id,checkout_intent:intent},variant_quantities:[{variant_id:Number(variant),quantity:1}]}
   },relationships:{store:{data:{type:'stores',id:String(env.LEMON_STORE_ID)}},variant:{data:{type:'variants',id:variant}}}}})).data;
   if(!safePaymentURL(checkout?.attributes?.url))throw Error('INVALID_CHECKOUT_URL');
   return reply(200,{url:checkout.attributes.url});
  }catch(error){
   if(error instanceof SyntaxError)return reply(400,{error:'INVALID_REQUEST'});
   return reply(503,{error:'WEB_PAYMENT_UNAVAILABLE'});
  }
 };
}
