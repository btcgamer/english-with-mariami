/* English with Mariami — public Supabase browser configuration. */
window.SUPABASE_URL='https://vtdhvsfqhwesxtwmduew.supabase.co';
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

  /* Academy access is owned by academy-grade-visual-only.js. */
  if(document.querySelector('script[data-ewm-academy-grade-visual-only]')) return;
  const visual=document.createElement('script');
  visual.src='/academy-grade-visual-only.js?v=20260908';
  visual.defer=true;
  visual.dataset.ewmAcademyGradeVisualOnly='1';
  document.head.appendChild(visual);
})();
