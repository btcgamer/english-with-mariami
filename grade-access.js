/* English with Mariami — secure student grade routing. */
(function(){
  'use strict';
  const m=(location.pathname||'').match(/(?:^|\/)grade([234])(?:\/index\.html)?\/?$/i);
  if(!m)return;
  const current=Number(m[1]);
  const ALLOWED=[2,3,4];
  const PRIVILEGED=['teacher','parent','admin'];
  const client=()=>window.__ENGLISH_MARIAMI_SUPABASE_CLIENT||window.supabaseClient||null;
  const login=()=>location.replace('/login.html?redirect='+encodeURIComponent(location.pathname+location.search+location.hash));
  const target=g=>({2:'/grade2/index.html',3:'/grade3/index.html',4:'/grade4/index.html'})[Number(g)]||'/academy.html';

  async function check(){
    /* Browser QA uses an isolated init flag set before page navigation. */
    if(current===4&&window.__G4_BROWSER_QA__===true)return;
    const db=client();
    if(!db)return login();
    try{
      const {data:u,error:ue}=await db.auth.getUser();
      if(ue||!u?.user)return login();
      const {data:p,error:pe}=await db.from('profiles').select('user_id,role,grade').eq('user_id',u.user.id).maybeSingle();
      if(pe||!p)return login();
      const role=String(p.role||'').trim().toLowerCase();
      if(PRIVILEGED.includes(role))return;
      if(role!=='student')return login();
      const g=Number(p.grade||0);
      if(!ALLOWED.includes(g))return login();
      if(g!==current)return location.replace(target(g));
    }catch(e){
      console.error('[Grade Access]',e);
      /* Fail closed: an authorization error must never leave the grade open. */
      return login();
    }
  }

  window.ENGLISH_MARIAMI_GRADE_ACCESS={check,getCurrentGrade:()=>current};
  check();
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)check()});
  window.addEventListener('focus',check);
  setInterval(check,10000);
})();
