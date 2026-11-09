import { subscriptionHandler } from './play.mjs';

export function validResource(resource) {
  return typeof resource === 'string' && (
    /^supplementary\/grade([1-9]|1[0-2])\.json$/.test(resource) ||
    /^curriculum\/grade([1-9]|1[0-2])-world([1-9]|10)\.json$/.test(resource)
  );
}

/** Every material request requires a freshly verified account/entitlement. */
export function paidCourseHandler({ env, fetcher = fetch, authorize = subscriptionHandler({ env, fetcher }) }) {
  return async request => {
    // Reuse authentication, trusted-admin and current Google status checks, including CORS.
    const headers = new Headers(request.headers);
    headers.delete('content-length');
    const access = await authorize(new Request(request.url, {
      method: request.method, headers,
      ...(request.method === 'POST' ? {body:JSON.stringify({action:'status'})} : {})
    }));
    if (!access.ok || request.method !== 'POST') return access;
    const responseHeaders = new Headers(access.headers);
    responseHeaders.set('Content-Type', 'application/json');
    responseHeaders.set('Cache-Control', 'no-store');
    const reply = (status, value) => new Response(JSON.stringify(value), {status, headers:responseHeaders});
    let status;
    try { status = await access.json(); } catch { return reply(503,{error:'VERIFICATION_UNAVAILABLE'}); }
    if (status.ready !== true || status.active !== true) return reply(403,{error:'SUBSCRIPTION_REQUIRED'});
    let resource;
    try {
      const reader = request.body?.getReader();
      if (!reader) return reply(400,{error:'INVALID_RESOURCE'});
      const chunks=[]; let size=0;
      while (true) {
        const next=await reader.read();
        if (next.done) break;
        size+=next.value.length;
        if (size>2048) { await reader.cancel(); return reply(400,{error:'INVALID_RESOURCE'}); }
        chunks.push(next.value);
      }
      const bytes=new Uint8Array(size);let offset=0;
      for (const chunk of chunks) { bytes.set(chunk,offset);offset+=chunk.length; }
      resource=JSON.parse(new TextDecoder().decode(bytes)).resource;
    } catch { return reply(400,{error:'INVALID_RESOURCE'}); }
    if (!validResource(resource)) return reply(400,{error:'INVALID_RESOURCE'});
    try {
      const result=await fetcher(env.SUPABASE_URL+'/rest/v1/paid_course_materials?select=payload&resource=eq.'+encodeURIComponent(resource),{
        headers:{apikey:env.SUPABASE_SERVICE_ROLE_KEY,Authorization:'Bearer '+env.SUPABASE_SERVICE_ROLE_KEY}
      });
      if (!result.ok) return reply(503,{error:'CONTENT_UNAVAILABLE'});
      const rows=await result.json();
      if (!Array.isArray(rows)||rows.length!==1) return reply(404,{error:'CONTENT_NOT_FOUND'});
      const payload=rows[0].payload;
      if (!payload||typeof payload!=='object'||Array.isArray(payload)) return reply(503,{error:'CONTENT_UNAVAILABLE'});
      return reply(200,{resource,content:payload});
    } catch { return reply(503,{error:'CONTENT_UNAVAILABLE'}); }
  };
}
