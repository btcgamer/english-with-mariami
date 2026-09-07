/* English with Mariami — public Supabase browser configuration. */
window.SUPABASE_URL='https://vtdhvsfqhwesxtwmduew.supabase.co';
window.SUPABASE_PUBLISHABLE_KEY='sb_publishable_MnrM2ulyJY_ugwfFVfpQYA_iV5wjCmt';

(function(){
  'use strict';
  const isAcademy=/\/academy\.html(?:$|[?#])/i.test(location.pathname+location.search+location.hash);

  function protectAcademySession(client){
    if(!isAcademy||!client||!client.auth||client.auth.__ewmProtected) return;
    /* Academy must never destroy a valid session just because its optional
       profile/progress request fails. Logout is still allowed explicitly by
       the Academy logout control. */
    const originalSignOut=client.auth.signOut.bind(client.auth);
    let explicitLogout=false;
    client.auth.__ewmProtected=true;
    client.auth.__ewmAllowLogout=function(){explicitLogout=true;};
    client.auth.signOut=async function(options){
      if(explicitLogout){
        return originalSignOut(options);
      }
      console.warn('Academy auth guard: prevented automatic signOut.');
      return {data:{},error:null};
    };
    document.addEventListener('click',function(event){
      const logout=event.target.closest&&event.target.closest('#logoutLink,.logout-btn');
      if(logout) explicitLogout=true;
    },true);
  }

  function initSupabaseClient(){
    let client=window.__ENGLISH_MARIAMI_SUPABASE_CLIENT||window.supabaseClient;
    if(client){protectAcademySession(client);return true;}
    if(!window.supabase||typeof window.supabase.createClient!=='function') return false;
    try{
      const key=window.SUPABASE_PUBLISHABLE_KEY||window.SUPABASE_KEY;
      if(!window.SUPABASE_URL||!key) return false;
      client=window.supabase.createClient(window.SUPABASE_URL,key);
      window.__ENGLISH_MARIAMI_SUPABASE_CLIENT=client;
      protectAcademySession(client);
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

  if(!isAcademy) return;

  /* Academy grade cards are presentation-only. This listener is registered
     before the dynamically loaded grade-layout script, so clicking a grade
     never reaches a navigation/auth handler. */
  if(!document.querySelector('script[data-ewm-academy-grade-visual-only]')){
    const visual=document.createElement('script');
    visual.src='/academy-grade-visual-only.js?v=20260907';
    visual.defer=true;
    visual.dataset.ewmAcademyGradeVisualOnly='1';
    document.head.appendChild(visual);
  }

  if(document.querySelector('script[data-ewm-academy-grade-layout]')) return;
  const s=document.createElement('script');
  s.src='/academy-grade-layout.js?v=20260907';
  s.defer=true;
  s.dataset.ewmAcademyGradeLayout='1';
  document.head.appendChild(s);
})();
