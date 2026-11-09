import {lemonAPI,restAPI,inspectWebSubscription,webProviderConfigured,webMode} from './web-billing.mjs';
import {sha256} from './play.mjs';
const events=new Set(['order_refunded','subscription_created','subscription_updated','subscription_cancelled','subscription_resumed','subscription_expired','subscription_paused','subscription_unpaused','subscription_payment_success','subscription_payment_recovered','subscription_payment_failed','subscription_payment_refunded']);
export async function validSignature(bytes,signature,secret){
 if(!/^[a-f0-9]{64}$/i.test(signature||'')||!secret)return false;
 const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['verify']);
 const expected=Uint8Array.from(signature.match(/../g),s=>parseInt(s,16));
 return crypto.subtle.verify('HMAC',key,expected,bytes);
}
export function webHookHandler({env,fetcher=fetch}){
 return async request=>{
  const reply=(status,error)=>Response.json(error?{error}:{received:true},{status,headers:{'Cache-Control':'no-store'}});
  if(request.method!=='POST')return reply(405,'METHOD_NOT_ALLOWED');
  if(!webProviderConfigured(env)||!env.LEMON_WEBHOOK_SECRET)return reply(503,'WEB_PAYMENT_NOT_CONFIGURED');
  try{
   const chunks=[];let size=0;const reader=request.body?.getReader();if(!reader)return reply(400,'EMPTY_EVENT');
   while(true){const next=await reader.read();if(next.done)break;size+=next.value.length;if(size>262144){await reader.cancel();return reply(413,'EVENT_TOO_LARGE');}chunks.push(next.value);}
   const bytes=new Uint8Array(size);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length;}
   if(!await validSignature(bytes,request.headers.get('X-Signature'),env.LEMON_WEBHOOK_SECRET))return reply(401,'INVALID_SIGNATURE');
   const text=new TextDecoder().decode(bytes),body=JSON.parse(text),event=body.meta?.event_name;
   if(request.headers.get('X-Event-Name')&&request.headers.get('X-Event-Name')!==event)return reply(400,'EVENT_MISMATCH');
   if(!events.has(event))return reply(200);
   const invoiceEvent=event.startsWith('subscription_payment_');
   let id,invoice=null,order=null;
   if(invoiceEvent){
    if(body.data?.type!=='subscription-invoices'||!/^\d+$/.test(String(body.data.id)))return reply(400,'INVALID_EVENT');
    const data=(await lemonAPI(env,'/subscription-invoices/'+body.data.id,fetcher)).data;
    if(data?.type!=='subscription-invoices'||String(data.id)!==String(body.data.id))return reply(400,'INVALID_EVENT');
    invoice=data.attributes;
    if(!invoice||String(invoice.store_id)!==String(env.LEMON_STORE_ID)||invoice.test_mode!==webMode(env))return reply(400,'MODE_OR_STORE_MISMATCH');
    id=String(invoice.subscription_id);
   }else if(event==='order_refunded'){
    if(body.data?.type!=='orders'||!/^\d+$/.test(String(body.data.id)))return reply(400,'INVALID_EVENT');
    const data=(await lemonAPI(env,'/orders/'+body.data.id,fetcher)).data;
    if(data?.type!=='orders'||String(data.id)!==String(body.data.id))return reply(400,'INVALID_EVENT');
    order=data.attributes;
    if(!order||String(order.store_id)!==String(env.LEMON_STORE_ID)||order.test_mode!==webMode(env))return reply(400,'MODE_OR_STORE_MISMATCH');
    if(order.status!=='refunded')return reply(200); // Partial refunds do not revoke the full period.
    const subscriptions=(await lemonAPI(env,'/subscriptions?filter%5Border_id%5D='+body.data.id,fetcher)).data;
    if(!Array.isArray(subscriptions))throw Error('INVALID_ORDER_SUBSCRIPTIONS');
    if(subscriptions.length===0)return reply(200); // A non-subscription purchase in this store.
    if(subscriptions.length!==1)throw Error('AMBIGUOUS_ORDER');
    id=String(subscriptions[0].id);
   }else{if(body.data?.type!=='subscriptions')return reply(400,'INVALID_EVENT');id=String(body.data.id);}
   if(!/^\d+$/.test(id))return reply(400,'INVALID_EVENT');
   const object=(await lemonAPI(env,'/subscriptions/'+id,fetcher)).data;
   if(String(object?.id)!==id||(order&&String(object?.attributes?.order_id)!==String(body.data.id)))return reply(400,'INVALID_EVENT');
   const checked=inspectWebSubscription(env,object);
   if(!Number.isFinite(Date.parse(checked.updatedAt)))return reply(400,'INVALID_EVENT');
   const rows=await restAPI(env,'web_subscriptions?select=user_id,test_mode&provider_subscription_id=eq.'+id,fetcher);
   let user, intent=null;
   if(rows.length===1){user=rows[0].user_id;if(rows[0].test_mode!==webMode(env))return reply(400,'MODE_OR_STORE_MISMATCH');}
   else{
    intent=body.meta?.custom_data?.checkout_intent;
    if(!/^[a-f0-9-]{36}$/i.test(intent||''))return reply(409,'CHECKOUT_BINDING_REQUIRED');
    const intents=await restAPI(env,'web_checkout_intents?select=user_id,test_mode,variant_id,plan&id=eq.'+encodeURIComponent(intent),fetcher);
    if(intents.length!==1||intents[0].test_mode!==webMode(env)||intents[0].user_id!==body.meta?.custom_data?.account_id||intents[0].plan!==checked.plan||String(intents[0].variant_id)!==String(object.attributes.variant_id))return reply(403,'CHECKOUT_ACCOUNT_MISMATCH');
    user=intents[0].user_id;
   }
   let refunded=null,billingAt=null;
   if(invoice){
    if(invoice.status==='refunded')refunded=true;
    else if(['subscription_payment_success','subscription_payment_recovered'].includes(event)&&invoice.status==='paid'&&invoice.refunded===false)refunded=false;
    // An old paid invoice's later metadata update must never undo a newer refund.
    if(refunded!==null){billingAt=refunded?(invoice.refunded_at||invoice.updated_at):invoice.created_at;if(!Number.isFinite(Date.parse(billingAt)))return reply(400,'INVALID_EVENT');}
   }
   if(order){refunded=true;billingAt=order.refunded_at||order.updated_at;if(!Number.isFinite(Date.parse(billingAt)))return reply(400,'INVALID_EVENT');}
   await restAPI(env,'rpc/apply_web_subscription_event',fetcher,'POST',{
    p_event_hash:await sha256(text),p_subscription_id:id,p_user_id:user,p_plan:checked.plan,p_variant_id:String(object.attributes.variant_id),
    p_status:checked.status,p_valid_until:checked.expiresAt,p_provider_updated_at:checked.updatedAt,p_test_mode:webMode(env),
    p_intent_id:intent,p_billing_at:billingAt,p_refunded:refunded
   });
   return reply(200);
  }catch(error){return reply(error instanceof SyntaxError?400:503,'WEB_EVENT_NOT_APPLIED');}
 };
}
