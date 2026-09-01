/* English with Mariami — secure student grade routing. */
(function(){
  'use strict';
  const m=(location.pathname||'').match(/(?:^|\/)grade([234])(?:\.html|\/index\.html)$/i);
  if(!m)return;
  const current=Number(m[1]);
  const ALLOWED=[2,3,4];
  const client=()=>window.__ENGLISH_MARIAMI_SUPABASE_CLIENT||window.supabaseClient||window.supabase;
  const login=()=>location.replace('/login.html?redirect='+encodeURIComponent(location.pathname+location.search+location.hash));
  const target=g=>Number(g)===2?'/grade2/index.html':'/grade'+Number(g)+'.html';
  async function check(){
    const db=client(); if(!db)return;
    try{
      const {data:u,error:ue}=await db.auth.getUser();
      if(ue||!u?.user)return login();
      const {data:p,error:pe}=await db.from('profiles').select('user_id,role,grade').eq('user_id',u.user.id).maybeSingle();
      if(pe||!p)return login();
      const role=String(p.role||'').trim().toLowerCase();
      if(role==='student'){
        const g=Number(p.grade||0);
        if(!ALLOWED.includes(g))return login();
        if(g!==current)return location.replace(target(g));
        if(current===2 && !/\/grade2\/index\.html$/i.test(location.pathname))return location.replace('/grade2/index.html');
      }else if(role!=='teacher'&&role!=='parent')return login();
    }catch(e){console.error('[Grade Access]',e)}
  }
  window.ENGLISH_MARIAMI_GRADE_ACCESS={check,getCurrentGrade:()=>current};
  check();
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)check()});
  window.addEventListener('focus',check);
  setInterval(check,10000);
})();