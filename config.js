/* English with Mariami — public Supabase browser configuration. */
window.SUPABASE_URL='https://vtdhvsfqhwesxtwmduew.supabase.co';
window.SUPABASE_PUBLISHABLE_KEY='sb_publishable_MnrM2ulyJY_ugwfFVfpQYA_iV5wjCmt';window.SUPABASE_KEY=window.SUPABASE_PUBLISHABLE_KEY;
(function(){'use strict';if(!document.querySelector('link[data-ewm-universal-text-visibility]')){const s=document.createElement('link');s.rel='stylesheet';s.href='/shared/universal-text-visibility.css?v=20260928-textfix';s.dataset.ewmUniversalTextVisibility='1';document.head.appendChild(s)}if(!document.querySelector('link[data-ewm-g4-ui]')){const g=document.createElement('link');g.rel='stylesheet';g.href='/shared/grade-g4-inspired-ui.css?v=20260928-g4ui3';g.dataset.ewmG4Ui='1';document.head.appendChild(g)}function initSupabaseClient(){if(window.__ENGLISH_MARIAMI_SUPABASE_CLIENT||window.supabaseClient)return true;if(!window.supabase||typeof window.supabase.createClient!=='function')return false;try{const key=window.SUPABASE_PUBLISHABLE_KEY||window.SUPABASE_KEY;if(!window.SUPABASE_URL||!key)return false;window.__ENGLISH_MARIAMI_SUPABASE_CLIENT=window.supabase.createClient(window.SUPABASE_URL,key);window.dispatchEvent(new Event('englishMariamiSupabaseReady'));return true}catch(error){console.error('Supabase client initialization error:',error);return false}}if(!initSupabaseClient()){window.addEventListener('load',initSupabaseClient,{once:true});setTimeout(initSupabaseClient,0)}
window.EWM_AUTH=window.EWM_AUTH||{
  client:function(){return window.__ENGLISH_MARIAMI_SUPABASE_CLIENT||window.supabaseClient||null},
  waitForSession:async function(timeoutMs){
    const started=Date.now();
    let db=null;
    while(Date.now()-started<Math.max(1500,timeoutMs||7000)){
      db=this.client();
      if(db&&db.auth)break;
      await new Promise(function(r){setTimeout(r,120)});
    }
    if(!db||!db.auth)return {client:null,session:null,error:new Error('Supabase client unavailable')};
    let lastError=null;
    while(Date.now()-started<Math.max(1500,timeoutMs||7000)){
      try{
        const r=await db.auth.getSession();
        if(r.data&&r.data.session)return {client:db,session:r.data.session,error:null};
        lastError=r.error||null;
      }catch(e){lastError=e}
      await new Promise(function(r){setTimeout(r,350)});
    }
    return {client:db,session:null,error:lastError};
  },
  profile:async function(db,userId){
    if(!db||!userId)return {data:null,error:new Error('Missing auth client/user')};
    let last=null;
    for(let i=0;i<4;i++){
      try{
        const r=await db.from('profiles').select('user_id,role,grade,full_name').eq('user_id',userId).maybeSingle();
        if(r.data)return r;
        last=r.error||null;
      }catch(e){last=e}
      await new Promise(function(r){setTimeout(r,350)});
    }
    return {data:null,error:last};
  }
};const path=location.pathname+location.search+location.hash,isAcademy=/\/academy\.html(?:$|[?#])/i.test(path),isTeacherDashboard=/\/teacher-dashboard\.html(?:$|[?#])/i.test(path);if(isTeacherDashboard&&!document.querySelector('script[data-ewm-teacher-dashboard-fix]')){const x=document.createElement('script');x.src='/shared/teacher-dashboard-fix.js?v=20260908';x.async=false;x.dataset.ewmTeacherDashboardFix='1';document.head.appendChild(x)}if(isAcademy){
  if(!window.__EWM_ACADEMY_RETURN_GUARD){
    window.__EWM_ACADEMY_RETURN_GUARD='1';
    window.addEventListener('pageshow',function(event){
      if(event.persisted){ window.location.reload(); return; }
      document.body.classList.remove('is-loading');
      document.querySelectorAll('[style*="transform"]').forEach(function(el){ if(el.closest('.neon-card')) el.style.transform=''; });
    });
  }
}
if(!isAcademy){
const gradePath=/\/grade(\d+)(?:\/|\/index\.html)?(?:$|[?#])/i.exec(path);
if(gradePath&&!document.querySelector('script[data-ewm-mission-completion3]')){
  if(!document.querySelector('link[data-ewm-mission-completion3-css]')){const mc=document.createElement('link');mc.rel='stylesheet';mc.href='/shared/mission-completion-3.css?v=20260928-finalreward';mc.dataset.ewmMissionCompletion3Css='1';document.head.appendChild(mc)}
  const ms=document.createElement('script');ms.src='/shared/mission-completion-3.js?v=20260928-finalreward';ms.defer=true;ms.dataset.ewmMissionCompletion3='1';document.head.appendChild(ms)
}
return;
}if(!document.querySelector('link[data-ewm-academy-visual]')){const x=document.createElement('link');x.rel='stylesheet';x.href='/academy-visual.css?v=20260908';x.dataset.ewmAcademyVisual='1';document.head.appendChild(x)}
const loaders=[['academy-visual.js?v=20260926-p1','data-ewm-academy-command-center'],['academy-portal-4.js?v=20260926-p1','data-ewm-academy-portal-4'],['academy-mission-gateway-5.js?v=20260926-p1','data-ewm-academy-gateway-5'],['academy-3d-reality-6.js?v=20260926-p1','data-ewm-academy-3d-reality-6'],['academy-ai-guardian-7.js?v=20260926-p1','data-ewm-academy-ai-guardian-7'],['academy-3d-world-environment-8.js?v=20260926-p1','data-ewm-academy-world-8'],['academy-3d-world-portals-9.js?v=20260926-p1','data-ewm-academy-world-portals-9'],['academy-portal-cinematic-10.js?v=20260926-p1','data-ewm-academy-portal-cinematic-10'],['academy-living-world-11.js?v=20260926-p1','data-ewm-academy-living-world-11']];for(const [src,attr] of loaders){if(document.querySelector(`script[${attr}]`))continue;const x=document.createElement('script');x.src='/'+src;x.defer=true;x.setAttribute(attr,'1');document.head.appendChild(x)}if(document.querySelector('script[data-ewm-academy-grade-visual-only]'))return;const visual=document.createElement('script');visual.src='/academy-grade-visual-only.js?v=20260908';visual.defer=true;visual.dataset.ewmAcademyGradeVisualOnly='1';document.head.appendChild(visual)})();
