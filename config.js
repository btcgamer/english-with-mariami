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

  /* Academy grade cards are presentation-only. Never inject the old grade
     layout/navigation/lesson-reset script on Academy. */
  const isAcademy=/\/academy\.html(?:$|[?#])/i.test(location.pathname+location.search+location.hash);
  if(!isAcademy) return;
  if(document.querySelector('script[data-ewm-academy-grade-visual-only]')) return;
  const visual=document.createElement('script');
  visual.src='/academy-grade-visual-only.js?v=20260907';
  visual.defer=true;
  visual.dataset.ewmAcademyGradeVisualOnly='1';
  document.head.appendChild(visual);
})();
