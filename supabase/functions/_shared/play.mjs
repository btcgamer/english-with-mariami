import { webEntitlement, webProviderConfigured, webConfigured } from './web-billing.mjs';
export const PRODUCT = 'mariami_all_grades';
export const PACKAGE = 'com.englishwithmariami.academy';
export const PLANS = new Set(['monthly', 'quarterly', 'half-yearly', 'yearly']);
const allowedStates = new Set(['SUBSCRIPTION_STATE_ACTIVE', 'SUBSCRIPTION_STATE_IN_GRACE_PERIOD', 'SUBSCRIPTION_STATE_CANCELED']);
export async function sha256(value) {
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)))].map(n => n.toString(16).padStart(2, '0')).join('');
}
export async function inspectSubscription(data, userId, now = Date.now()) {
  if (data?.externalAccountIdentifiers?.obfuscatedExternalAccountId !== await sha256(userId)) {
    throw new Error('PURCHASE_ACCOUNT_MISMATCH');
  }
  const items = (data.lineItems || []).filter(item => item.productId === PRODUCT &&
    PLANS.has(item.offerDetails?.basePlanId) && item.autoRenewingPlan);
  const expiry = Math.max(0, ...items.map(item => Date.parse(item.expiryTime) || 0));
  return { active: allowedStates.has(data.subscriptionState) && expiry > now,
    expiresAt: expiry ? new Date(expiry).toISOString() : null,
    state: data.subscriptionState,
    acknowledgementRequired: data.acknowledgementState === 'ACKNOWLEDGEMENT_STATE_PENDING' && expiry > now && allowedStates.has(data.subscriptionState) };
}
const b64url = bytes => btoa(String.fromCharCode(...bytes)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
export async function googleAccessToken(email, pem, fetcher = fetch) {
  const encode = value => b64url(new TextEncoder().encode(JSON.stringify(value)));
  const now = Math.floor(Date.now() / 1000);
  const assertion = encode({ alg: 'RS256', typ: 'JWT' }) + '.' + encode({ iss: email,
    scope: 'https://www.googleapis.com/auth/androidpublisher', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3500 });
  const der = pem.replace(/\\n/g, '\n').replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
  const key = await crypto.subtle.importKey('pkcs8', Uint8Array.from(atob(der), c => c.charCodeAt(0)),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(assertion));
  const response = await fetcher('https://oauth2.googleapis.com/token', { method: 'POST',
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: assertion + '.' + b64url(new Uint8Array(sig)) }) });
  if (!response.ok) throw new Error('PLAY_SERVICE_UNAVAILABLE');
  const token = (await response.json()).access_token;
  if (!token) throw new Error('PLAY_SERVICE_UNAVAILABLE');
  return token;
}

// Dependencies are injected so authentication, ownership and acknowledgement can be tested without credentials.
export function subscriptionHandler({ env, fetcher = fetch, accessToken = () => googleAccessToken(env.GOOGLE_PLAY_SERVICE_ACCOUNT_EMAIL, env.GOOGLE_PLAY_PRIVATE_KEY, fetcher) }) {
  const origins = new Set(['https://englishwithmariami.com.ge', 'https://www.englishwithmariami.com.ge', 'https://localhost','http://localhost:4173','http://127.0.0.1:4173','http://127.0.0.1:4174']);
  return async request => {
    const origin = request.headers.get('Origin');
    const cors = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Vary': 'Origin',
      'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
    if (origins.has(origin)) cors['Access-Control-Allow-Origin'] = origin;
    const reply = (status, data) => new Response(JSON.stringify(data), { status, headers: cors });
    if (origin && !origins.has(origin)) return reply(403, { error: 'ORIGIN_NOT_ALLOWED' });
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method !== 'POST') return reply(405, { error: 'METHOD_NOT_ALLOWED' });
    if (!['SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY'].every(k => env[k])) {
      return reply(503, { error: 'BILLING_NOT_CONFIGURED' });
    }
    const auth = request.headers.get('Authorization');
    if (!auth?.startsWith('Bearer ')) return reply(401, { error: 'SIGN_IN_REQUIRED' });
    const admin = { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: 'Bearer ' + env.SUPABASE_SERVICE_ROLE_KEY, 'Content-Type': 'application/json' };
    try {
      const identity = await fetcher(env.SUPABASE_URL + '/auth/v1/user', { headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: auth } });
      if (!identity.ok) return reply(401, { error: 'SIGN_IN_REQUIRED' });
      const user = await identity.json();
      if (!user.id) return reply(401, { error: 'SIGN_IN_REQUIRED' });
      const body = await request.json();
      if (!['status','verify'].includes(body.action)) return reply(400, { error: 'INVALID_REQUEST' });
      // Database roles are trusted; email strings and user-editable auth metadata are not.
      const profile = await fetcher(env.SUPABASE_URL + '/rest/v1/profiles?select=role&user_id=eq.' + encodeURIComponent(user.id), { headers: admin });
      if (!profile.ok) throw new Error('SERVICE_UNAVAILABLE');
      const profiles = await profile.json();
      if (user.app_metadata?.mariami_admin === true && profiles.length === 1 && String(profiles[0].role || '').trim().toLowerCase() === 'admin') {
        return reply(200, { ready: true, active: true, expiresAt: null, access: 'admin' });
      }
      let webReady=false,webState=null;
      if(body.action==='status'&&webProviderConfigured(env)){
        const web=await webEntitlement(env,user,fetcher);webState=web;webReady=web.ready&&webConfigured(env);
        if(web.ready&&(web.active||env.PLAY_BILLING_ENABLED!=='true'))return reply(200,{ready:true,active:web.active,expiresAt:web.expiresAt,source:'web',webReady,hasWebSubscription:!!web.portal,webPurchaseBlocked:!!web.purchaseBlocked});
      }
      if (env.PLAY_BILLING_ENABLED !== 'true' || !['GOOGLE_PLAY_SERVICE_ACCOUNT_EMAIL','GOOGLE_PLAY_PRIVATE_KEY'].every(k => env[k])) {
        return reply(503, { error: 'BILLING_NOT_CONFIGURED' });
      }
      const rest = env.SUPABASE_URL + '/rest/v1/play_purchase_tokens';
      let tokens;
      if (body.action === 'verify') {
        if (typeof body.token !== 'string' || body.token.length < 10 || body.token.length > 8192) return reply(400, { error: 'INVALID_REQUEST' });
        tokens = [body.token];
      } else {
        const rows = await fetcher(rest + '?select=purchase_token&user_id=eq.' + encodeURIComponent(user.id), { headers: admin });
        if (!rows.ok) throw new Error('SERVICE_UNAVAILABLE');
        tokens = (await rows.json()).map(row => row.purchase_token);
      }
      const bearer = tokens.length ? await accessToken() : null;
      let active = false, expiresAt = null;
      for (const token of tokens) {
        const api = 'https://androidpublisher.googleapis.com/androidpublisher/v3/applications/' + PACKAGE;
        const result = await fetcher(api + '/purchases/subscriptionsv2/tokens/' + encodeURIComponent(token), { headers: { Authorization: 'Bearer ' + bearer } });
        // Old expired tokens can disappear from Google's API; do not let them break a newer subscription.
        if ([404,410].includes(result.status)) continue;
        if (!result.ok) throw new Error('PLAY_SERVICE_UNAVAILABLE');
        const data = await result.json();
        const verified = await inspectSubscription(data, user.id);
        if (body.action === 'verify') {
          const hash = await sha256(token);
          const prior = await fetcher(rest + '?select=user_id&token_hash=eq.' + hash, { headers: admin });
          if (!prior.ok) throw new Error('SERVICE_UNAVAILABLE');
          const owners = await prior.json();
          if (owners.some(row => row.user_id !== user.id)) throw new Error('PURCHASE_ACCOUNT_MISMATCH');
          const saved = await fetcher(rest, { method: 'POST', headers: { ...admin, Prefer: 'resolution=ignore-duplicates' },
            body: JSON.stringify({ token_hash: hash, user_id: user.id, purchase_token: token }) });
          if (!saved.ok) throw new Error('SERVICE_UNAVAILABLE');
        }
        if (verified.acknowledgementRequired) {
          const acknowledged = await fetcher(api + '/purchases/subscriptions/' + PRODUCT + '/tokens/' + encodeURIComponent(token) + ':acknowledge', {
            method: 'POST', headers: { Authorization: 'Bearer ' + bearer, 'Content-Type': 'application/json' }, body: '{}' });
          if (!acknowledged.ok) throw new Error('PLAY_SERVICE_UNAVAILABLE');
        }
        if (verified.active) {
          active = true;
          if (!expiresAt || verified.expiresAt > expiresAt) expiresAt = verified.expiresAt;
        }
      }
      return reply(200, { ready: true, active, expiresAt, source:'play', ...(webReady?{webReady:true}:{}), ...(webState?.ready?{hasWebSubscription:!!webState.portal,webPurchaseBlocked:!!webState.purchaseBlocked}:{}) });
    } catch (error) {
      // Never return/log Google responses, user bearer tokens, private keys or purchase tokens.
      if (error.message === 'PURCHASE_ACCOUNT_MISMATCH') return reply(403, { error: error.message });
      if (error instanceof SyntaxError) return reply(400, { error: 'INVALID_REQUEST' });
      return reply(503, { error: 'VERIFICATION_UNAVAILABLE' });
    }
  };
}
