/* Grade 2 — secure Supabase grade gate + dashboard sync indicator. */
(function(){
  'use strict';
  const path=(location.pathname||'').toLowerCase();
  if(!path.endsWith('/grade2/index.html'))return;
  const ALLOWED=2;
  const getDB=()=>window.__ENGLISH_MARIAMI_SUPABASE_CLIENT||window.supabaseClient||window.supabase;
  const goLogin=()=>location.replace('../login.html?reason=unauthorized');
  async function gate(){
    const db=getDB();
    if(!db){setTimeout(gate,500);return}
    try{
      const {data:u,error:ue}=await db.auth.getUser();
      if(ue||!u?.user)return goLogin();
      const {data:p,error:pe}=await db.from('profiles').select('user_id,role,grade').eq('user_id',u.user.id).maybeSingle();
      if(pe||!p)return goLogin();
      const role=String(p.role||'').trim().toLowerCase();
      const grade=Number(p.grade||0);
      if(role==='student'&&grade!==ALLOWED)return location.replace('../grade'+grade+'.html');
      if(!['student','teacher','parent'].includes(role))return goLogin();
      const badge=document.createElement('div');
      badge.textContent=role==='student'?'✓ GRADE 2 SYNCED':'✓ GRADE 2 PREVIEW';
      badge.style.cssText='position:fixed;right:12px;bottom:12px;z-index:9999;padding:7px 10px;border:1px solid #00eaff55;border-radius:10px;background:#02040ddd;color:#00eaff;font:700 10px Arial;letter-spacing:1px;backdrop-filter:blur(10px)';
      document.body.appendChild(badge);
    }catch(e){console.error('[Grade 2 Gate]',e);goLogin()}
  }
  gate();
})();
