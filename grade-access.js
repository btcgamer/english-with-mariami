/* English with Mariami — secure student grade routing. */
(function(){
  'use strict';
  const m=(location.pathname||'').match(/(?:^|\/)grade([1-9]|1[0-2])(?:\/index\.html)?\/?$/i);
  if(!m)return;
  const current=Number(m[1]);
  const ALLOWED=Array.from({length:12},(_,i)=>i+1);
  const PRIVILEGED=['teacher','parent','admin'];
  const client=()=>window.__ENGLISH_MARIAMI_SUPABASE_CLIENT||window.supabaseClient||null;
  const login=()=>location.replace('/login.html?redirect='+encodeURIComponent(location.pathname+location.search+location.hash));
  const target=g=>`/grade${Number(g)}/index.html`;

  let checking=false;
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  async function check(){
    /* Browser QA uses an isolated init flag set before page navigation. */
    if(current===4&&window.__G4_BROWSER_QA__===true)return;
    if(checking)return;
    checking=true;
    try{
      let db=null;
      for(let i=0;i<20&&!db;i++){db=client();if(!db)await sleep(100);}
      if(!db){console.warn('[Grade Access] Supabase client is not ready yet; failing closed.');return login();}
      let session=null,authError=null;
      if(window.EWM_AUTH&&typeof window.EWM_AUTH.waitForSession==='function'){
        const shared=await window.EWM_AUTH.waitForSession(8000);
        if(shared.client)db=shared.client;
        session=shared.session||null; authError=shared.error||null;
      }else{
        for(let i=0;i<8&&!session;i++){
          try{const r=await db.auth.getSession();authError=r.error||null;session=r.data?.session||null;if(session)break;}catch(e){authError=e;}
          await sleep(350);
        }
      }
      if(authError&&!session){console.warn('[Grade Access] Auth session check failed; failing closed.',authError);return login();}
      if(!session?.user)return login();
      let profile=null,profileError=null;
      if(window.EWM_AUTH&&typeof window.EWM_AUTH.profile==='function'){
        const pr=await window.EWM_AUTH.profile(db,session.user.id);
        profile=pr.data||null; profileError=pr.error||null;
      }else{
        for(let i=0;i<5&&!profile;i++){
          try{const r=await db.from('profiles').select('user_id,role,grade').eq('user_id',session.user.id).maybeSingle();profileError=r.error||null;profile=r.data||null;if(profile)break;}catch(e){profileError=e;}
          await sleep(400);
        }
      }
      if(profileError&&!profile){console.warn('[Grade Access] Profile check failed; failing closed.',profileError);return login();}
      if(!profile)return login();
      const role=String(profile.role||'').trim().toLowerCase();
      if(PRIVILEGED.includes(role))return;
      if(role!=='student')return login();
      const g=Number(profile.grade||0);
      if(!ALLOWED.includes(g))return login();
      if(g!==current)return location.replace(target(g));
    }catch(e){console.error('[Grade Access] transient check error',e);return login();}
    finally{checking=false;}
  }

  window.ENGLISH_MARIAMI_GRADE_ACCESS={check,getCurrentGrade:()=>current};
  check();
  window.addEventListener('englishMariamiSupabaseReady',check);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)check()});
  window.addEventListener('focus',check);
})();
