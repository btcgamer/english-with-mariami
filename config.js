/* English with Mariami — public Supabase browser configuration. */
window.SUPABASE_URL='https://vtdhvsfqhwesxtwmduew.supabase.co';
window.SUPABASE_PUBLISHABLE_KEY='sb_publishable_MnrM2ulyJY_ugwfFVfpQYA_iV5wjCmt';

(function(){
  'use strict';

  /* Create one shared browser client as soon as the Supabase CDN is available.
     This keeps the existing auth session available when navigating Grade → Academy. */
  function initSupabaseClient(){
    if(window.__ENGLISH_MARIAMI_SUPABASE_CLIENT || window.supabaseClient) return true;
    if(!window.supabase || typeof window.supabase.createClient!=='function') return false;
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

  const path=(window.location.pathname||'').toLowerCase();
  if(!path.endsWith('/academy.html') && path!=='academy.html') return;
  if(document.querySelector('script[data-ewm-academy-grade-layout]')) return;
  const s=document.createElement('script');
  s.src='/academy-grade-layout.js?v=20260907';
  s.defer=true;
  s.dataset.ewmAcademyGradeLayout='1';
  document.head.appendChild(s);
})();
