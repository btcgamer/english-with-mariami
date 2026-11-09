import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inspectSubscription, sha256, subscriptionHandler, googleAccessToken, PRODUCT } from '../supabase/functions/_shared/play.mjs';
const user = '9de081b3-4263-49f4-a0cf-e67dd494bc84';
const token = 'test-purchase-token-not-real';
async function purchase(state = 'SUBSCRIPTION_STATE_ACTIVE', extra = {}) {
  return { subscriptionState: state, externalAccountIdentifiers: { obfuscatedExternalAccountId: await sha256(user) },
    acknowledgementState: 'ACKNOWLEDGEMENT_STATE_PENDING',
    lineItems: [{ productId: PRODUCT, expiryTime: '2099-01-01T00:00:00Z', offerDetails: { basePlanId: 'monthly' }, autoRenewingPlan: { autoRenewEnabled: true } }], ...extra };
}
for (const state of ['SUBSCRIPTION_STATE_ACTIVE','SUBSCRIPTION_STATE_IN_GRACE_PERIOD','SUBSCRIPTION_STATE_CANCELED']) {
  test(`${state} retains access until expiry`, async () => assert.equal((await inspectSubscription(await purchase(state), user)).active, true));
}
for (const state of ['SUBSCRIPTION_STATE_EXPIRED','SUBSCRIPTION_STATE_PAUSED','SUBSCRIPTION_STATE_ON_HOLD','SUBSCRIPTION_STATE_PENDING']) {
  test(`${state} never grants access`, async () => assert.equal((await inspectSubscription(await purchase(state), user)).active, false));
}
test('Ownership is bound to the server-authenticated account', async () => {
  await assert.rejects(inspectSubscription(await purchase(), 'another-account'), /PURCHASE_ACCOUNT_MISMATCH/);
});
test('Missing ownership, expired dates and unexpected products/plans fail closed', async () => {
  await assert.rejects(inspectSubscription(await purchase('SUBSCRIPTION_STATE_ACTIVE', {externalAccountIdentifiers:{}}), user));
  for (const patch of [{expiryTime:'2000-01-01T00:00:00Z'},{expiryTime:'invalid'},{productId:'other-product'},{offerDetails:{basePlanId:'unknown'}},{autoRenewingPlan:null}]) {
    const data = await purchase(); Object.assign(data.lineItems[0], patch);
    assert.equal((await inspectSubscription(data,user)).active,false);
  }
});
const env = { PLAY_BILLING_ENABLED:'true', SUPABASE_URL:'https://supabase.example.test', SUPABASE_SERVICE_ROLE_KEY:'test-only-key', GOOGLE_PLAY_SERVICE_ACCOUNT_EMAIL:'test@example.test', GOOGLE_PLAY_PRIVATE_KEY:'test-only-key' };
const request = (body, authorization='Bearer test-only-session') => new Request('https://functions.example.test', { method:'POST', headers:{Authorization:authorization,'Content-Type':'application/json',Origin:'https://localhost'},body:JSON.stringify(body) });
const response = (body,status=200) => Response.json(body,{status});
function harness({data, acknowledgementFails=false, identityStatus=200, owner=user, tokens=[], role='student', profileStatus=200, overrides={}, trustedAdmin=false}={}) {
  const calls=[];
  const handler=subscriptionHandler({env:{...env,...overrides},accessToken:async()=>'test-only-oauth',fetcher:async(url,options={})=>{
    calls.push({url,options});
    if(url.endsWith('/auth/v1/user'))return response({id:user,app_metadata:trustedAdmin?{mariami_admin:true}:{},user_metadata:{role:'admin',mariami_admin:true}},identityStatus);
    if(url.includes('/rest/v1/profiles?'))return response([{role}],profileStatus);
    if(url.includes('subscriptionsv2'))return response(data||await purchase());
    if(url.endsWith(':acknowledge'))return acknowledgementFails?response({},500):new Response(null,{status:204});
    if(url.includes('token_hash=eq.'))return response(owner?[{user_id:owner}]:[]);
    if(url.includes('play_purchase_tokens'))return options.method==='POST'?new Response(null,{status:201}):response(tokens.map(purchase_token=>({purchase_token})));
    throw Error('Unexpected URL: '+url);
  }});
  return {handler,calls};
}
test('Unconfigured billing cannot open a verification path', async()=>{
  const handler=subscriptionHandler({env:{},fetcher:()=>{throw Error('No request allowed')}});
  assert.equal((await handler(request({action:'status'}))).status,503);
});
test('User authentication is verified with Auth rather than trusting the caller JWT payload',async()=>{
  const {handler,calls}=harness({identityStatus:401});
  assert.equal((await handler(request({action:'verify',token}))).status,401);
  assert.equal(calls.length,1);
});
test('A verified purchase is saved and acknowledged before granting access',async()=>{
  const {handler,calls}=harness({owner:null});const result=await handler(request({action:'verify',token}));
  assert.equal(result.status,200);assert.equal((await result.json()).active,true);
  const save=calls.find(c=>c.url.includes('play_purchase_tokens')&&c.options.method==='POST');
  assert.equal(JSON.parse(save.options.body).user_id,user);
  assert.ok(calls.some(c=>c.url.endsWith(':acknowledge')));
});
test('A failure acknowledging a purchase cannot grant access',async()=>{
  const {handler}=harness({acknowledgementFails:true});const result=await handler(request({action:'verify',token}));
  assert.equal(result.status,503);assert.equal((await result.json()).active,undefined);
});
test('Tokens owned by another account cannot be rebound',async()=>{
  const {handler,calls}=harness({owner:'another-account'});
  assert.equal((await handler(request({action:'verify',token}))).status,403);
  assert.equal(calls.some(c=>c.options.method==='POST'),false);
});
test('Status revalidates stored tokens with Google, including revocation',async()=>{
  const {handler,calls}=harness({tokens:[token],data:await purchase('SUBSCRIPTION_STATE_EXPIRED')});
  assert.equal((await (await handler(request({action:'status'}))).json()).active,false);
  assert.ok(calls.some(c=>c.url.includes('subscriptionsv2')));
});
test('Pending purchase never receives paid access or acknowledgement',async()=>{
  const {handler,calls}=harness({data:await purchase('SUBSCRIPTION_STATE_PENDING')});
  const result=await handler(request({action:'verify',token}));
  assert.equal((await result.json()).active,false);
  assert.equal(calls.some(c=>c.url.endsWith(':acknowledge')),false);
});
test('Unexpected origins and unknown actions are rejected',async()=>{
  const {handler}=harness();
  assert.equal((await handler(new Request('https://functions.example.test',{method:'POST',headers:{Origin:'https://untrusted.example.test'}}))).status,403);
  assert.equal((await handler(request({action:'grant-access'}))).status,400);
});

test('OAuth JWT uses the correct audience/scope and a verifiable RSA signature', async()=>{
  const keys=await crypto.subtle.generateKey({name:'RSASSA-PKCS1-v1_5',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['sign','verify']);
  const raw=await crypto.subtle.exportKey('pkcs8',keys.privateKey);
  const pem='-----BEGIN PRIVATE KEY-----\n'+Buffer.from(raw).toString('base64')+'\n-----END PRIVATE KEY-----';
  const value=await googleAccessToken('test@example.test',pem,async(url,options)=>{
    assert.equal(url,'https://oauth2.googleapis.com/token');
    const [header,payload,signature]=options.body.get('assertion').split('.');
    const claims=JSON.parse(Buffer.from(payload,'base64url'));
    assert.equal(claims.aud,url);assert.equal(claims.iss,'test@example.test');
    assert.equal(claims.scope,'https://www.googleapis.com/auth/androidpublisher');
    assert.ok(await crypto.subtle.verify('RSASSA-PKCS1-v1_5',keys.publicKey,Buffer.from(signature,'base64url'),new TextEncoder().encode(header+'.'+payload)));
    return response({access_token:'test-access-token'});
  });
  assert.equal(value,'test-access-token');
});

test('Only a server-assigned admin can bypass a subscription, even when sales are disabled', async()=>{
  const {handler,calls}=harness({role:'admin',trustedAdmin:true,overrides:{PLAY_BILLING_ENABLED:'false',GOOGLE_PLAY_PRIVATE_KEY:''}});
  const result=await handler(request({action:'status'}));
  assert.equal(result.status,200);
  assert.deepEqual(await result.json(),{ready:true,active:true,expiresAt:null,access:'admin'});
  assert.equal(calls.some(c=>c.url.includes('androidpublisher')||c.url.includes('play_purchase_tokens')),false);
});
test('A client-supplied admin role or email never promotes a student',async()=>{
  const {handler}=harness({role:'student',overrides:{PLAY_BILLING_ENABLED:'false'}});
  const result=await handler(request({action:'status',role:'admin',email:'datogringi@gmail.com'}));
  assert.equal(result.status,503);
});
test('Profile lookup errors fail closed instead of granting admin access',async()=>{
  const {handler}=harness({role:'admin',trustedAdmin:true,profileStatus:500});
  assert.equal((await handler(request({action:'status'}))).status,503);
});

test('A profile role alone and editable user metadata cannot bypass a subscription',async()=>{
  const {handler}=harness({role:'admin',trustedAdmin:false,overrides:{PLAY_BILLING_ENABLED:'false'}});
  assert.equal((await handler(request({action:'status'}))).status,503);
});
