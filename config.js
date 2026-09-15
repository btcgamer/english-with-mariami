/* English with Mariami — public Supabase browser configuration. */
window.SUPABASE_URL='https://vtdhvsfqhwesxtwmdue.supabase.co';
window.SUPABASE_PUBLISHABLE_KEY='sb_publishable_MnrM2ulyJY_ugwfFVfpQYA_iV5wjCmt';

(function(){
  'use strict';

  function initSupabaseClient(){
    if(window.__ENGLISH_MARIAMI_SUPABASE_CLIENT||window.supabaseClient) return true;
    if(!window.supabase||typeof window.supabase.createClient!=='function') return false;
    try{
      const key=window.SUPABASE_PUBLISHABLE_KEY||window.SUPABASE_KEY;
      if(!window.SUPABASE_URL||!key) return false;
      window.__ENGLISH_MARIAMI_SUPABASE_CLIENT=window.supabase.createClient(window.SUPABASE_URL,key);
      window.dispatchEvent(new Event('englishMariamiSupabaseReady'));
      return true;
    }catch(error){
      console.error('Supabase client initialization error:',error);
      return false;
    }
  }

  if(!initSupabaseClient()){
    window.addEventListener('load',initSupabaseClient,{once:true});
    setTimeout(initSupabaseClient,0);
  }

  const path=location.pathname+location.search+location.hash;
  const isAcademy=/\/academy\.html(?:$|[?#])/i.test(path);
  const isTeacherDashboard=/\/teacher-dashboard\.html(?:$|[?#])/i.test(path);

  if(isTeacherDashboard && !document.querySelector('script[data-ewm-teacher-dashboard-fix]')){
    const fix=document.createElement('script');
    fix.src='/shared/teacher-dashboard-fix.js?v=20260908';
    fix.async=false;
    fix.dataset.ewmTeacherDashboardFix='1';
    document.head.appendChild(fix);
  }

  if(!isAcademy) return;

  /* Restore the Academy visual system independently of auth/network state. */
  if(!document.querySelector('link[data-ewm-academy-visual]')){
    const css=document.createElement('link');
    css.rel='stylesheet';
    css.href='/academy-visual.css?v=20260908';
    css.dataset.ewmAcademyVisual='1';
    document.head.appendChild(css);
  }

  /* Academy Command Center 3.0 — visual-only, no auth/progress writes. */
  if(!document.querySelector('script[data-ewm-academy-command-center]')){
    const commandCenter=document.createElement('script');
    commandCenter.src='/academy-visual.js?v=20260915-cc3';
    commandCenter.defer=true;
    commandCenter.dataset.ewmAcademyCommandCenter='1';
    document.head.appendChild(commandCenter);
  }

  /* Academy Portal 4.0 — visual-only, no auth/progress writes. */
  if(!document.querySelector('script[data-ewm-academy-portal-4]')){
    const portal=document.createElement('script');
    portal.src='/academy-portal-4.js?v=20260915-p4';
    portal.defer=true;
    portal.dataset.ewmAcademyPortal4='1';
    document.head.appendChild(portal);
  }

  /* Academy Mission Gateway 5.0 — visual-only, navigation remains native. */
  if(!document.querySelector('script[data-ewm-academy-gateway-5]')){
    const gateway=document.createElement('script');
    gateway.src='/academy-mission-gateway-5.js?v=20260915-g5';
    gateway.defer=true;
    gateway.dataset.ewmAcademyGateway5='1';
    document.head.appendChild(gateway);
  }

  /* Academy realistic 3D layer 6.0 — visual-only. */
  if(!document.querySelector('script[data-ewm-academy-3d-reality-6]')){
    const reality3d=document.createElement('script');
    reality3d.src='/academy-3d-reality-6.js?v=20260915-3d6';
    reality3d.defer=true;
    reality3d.dataset.ewmAcademy3dReality6='1';
    document.head.appendChild(reality3d);
  }

  /* Academy access is owned by academy-grade-visual-only.js. */
  if(document.querySelector('script[data-ewm-academy-grade-visual-only]')) return;
  const visual=document.createElement('script');
  visual.src='/academy-grade-visual-only.js?v=20260908';
  visual.defer=true;
  visual.dataset.ewmAcademyGradeVisualOnly='1';
  document.head.appendChild(visual);
})();
