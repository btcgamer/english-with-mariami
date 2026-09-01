/* English with Mariami — public Supabase browser configuration. */
window.SUPABASE_URL='https://vtdhvsfqhwesxtwmdue.supabase.co';
window.SUPABASE_PUBLISHABLE_KEY='sb_publishable_MnrM2ulyJY_ugwfFVfpQYA_iV5wjCmt';

/*
   Keep normal website authentication persistent, but make an installed
   PWA session temporary. sessionStorage is scoped to the app/browser
   session, so closing the installed PWA does not keep its auth session.
*/
(function(){
  'use strict';
  const standalone=!!(window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches)||window.navigator.standalone===true;
  const temporaryStorage=standalone?window.sessionStorage:window.localStorage;
  window.supabaseClient=window.supabase.createClient(window.SUPABASE_URL,window.SUPABASE_PUBLISHABLE_KEY,{auth:{autoRefreshToken:true,persistSession:true,storage:temporaryStorage,detectSessionInUrl:true}});
  window.__ENGLISH_MARIAMI_SUPABASE_CLIENT=window.supabaseClient;
})();

(function(){
  'use strict';
  const path=(location.pathname||'').toLowerCase().replace(/\/+$/,'');
  const client=window.__ENGLISH_MARIAMI_SUPABASE_CLIENT||window.supabaseClient;
  if(!client)return;
  const gradeMatch=path.match(/(?:^|\/)grade([234])(?:\.html|\/index\.html)?$/);
  const isStudentDashboard=path.endsWith('/student-dashboard.html')||path.endsWith('student-dashboard.html');
  function gradeTarget(g){return '/grade'+Number(g)+'/index.html'}
  async function getProfile(){
    const r=await client.auth.getSession();
    if(r.error)throw r.error;
    if(!r.data?.session?.user)return null;
    const user=r.data.session.user;
    const p=await client.from('profiles').select('role,grade').eq('user_id',user.id).maybeSingle();
    if(p.error)throw p.error;
    return {user,profile:p.data};
  }
  async function guardGradePage(){
    if(!gradeMatch)return;
    try{
      const current=Number(gradeMatch[1]);
      const auth=await getProfile();
      if(!auth){location.replace('/login.html?reason=unauthorized');return}
      const role=String(auth.profile?.role||'').trim().toLowerCase();
      const assigned=Number(auth.profile?.grade||0);
      if(role!=='student'){
        location.replace(role==='teacher'?'/teacher-dashboard.html':'/login.html?reason=wrong-role');
        return;
      }
      if(![2,3,4].includes(assigned)){
        location.replace('/student-dashboard.html?reason=no-grade');
        return;
      }
      if(assigned!==current)location.replace(gradeTarget(assigned)+'?reason=grade-locked');
    }catch(e){
      console.warn('Grade access guard error:',e);
      location.replace('/student-dashboard.html?reason=access-check');
    }
  }
  async function guardStudentDashboard(){
    if(!isStudentDashboard)return;
    try{
      const auth=await getProfile();
      if(!auth){location.replace('/login.html?reason=unauthorized');return}
      const role=String(auth.profile?.role||'').trim().toLowerCase();
      if(role!=='student')location.replace(role==='teacher'?'/teacher-dashboard.html':'/login.html?reason=wrong-role');
    }catch(e){
      console.warn('Student dashboard access guard error:',e);
    }
  }
  function installGradeNavigation(){
    if(!gradeMatch)return;
    const add=()=>{
      const brand=document.querySelector('.brand');
      if(brand)brand.setAttribute('href','/academy.html');
      if(document.getElementById('__ewm-academy-home'))return;
      const home=document.createElement('a');
      home.id='__ewm-academy-home';
      home.href='/academy.html';
      home.textContent='🏠 HOME';
      home.setAttribute('aria-label','Back to Academy');
      home.style.cssText='position:fixed;left:16px;top:16px;z-index:999990;display:inline-flex;align-items:center;justify-content:center;padding:10px 14px;border:1px solid rgba(0,234,255,.45);border-radius:13px;background:rgba(2,18,35,.86);color:#fff;text-decoration:none;font:900 12px/1 Arial,sans-serif;box-shadow:0 0 18px rgba(0,234,255,.18);backdrop-filter:blur(12px)';
      document.body.appendChild(home);
    };
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',add,{once:true});else add();
    const ls=document.createElement('script');
    ls.src='/logout.js';ls.async=true;ls.dataset.englishMariamiGradeLogout='1';
    if(!document.querySelector('script[data-english-mariami-grade-logout]'))document.head.appendChild(ls);
  }
  guardGradePage();
  guardStudentDashboard();
  installGradeNavigation();
})();

(function(){
  if(document.querySelector('script[data-english-mariami-progress-sync]'))return;
  const s=document.createElement('script');s.src='/progress-sync.js';s.async=true;s.dataset.englishMariamiProgressSync='1';document.head.appendChild(s);
})();
(function(){
  if(document.querySelector('script[data-english-mariami-dashboard-progress]'))return;
  const s=document.createElement('script');s.src='/dashboard-progress.js';s.async=true;s.dataset.englishMariamiDashboardProgress='1';document.head.appendChild(s);
})();
(function(){
  'use strict';
  const client=window.__ENGLISH_MARIAMI_SUPABASE_CLIENT||window.supabaseClient;
  if(!client)return;
  window.__EWM_ACADEMY_LOGGING_OUT=false;
  document.addEventListener('click',function(event){
    const brand=event.target.closest('.brand');if(!brand)return;
    const currentPath=(window.location.pathname||'').toLowerCase();
    const target=(brand.getAttribute('href')||'').toLowerCase();
    const isAcademy=currentPath.endsWith('/academy.html')||currentPath==='academy.html';
    const pointsToPublicHome=target==='index.html'||target==='/index.html'||target.endsWith('/index.html');
    if(isAcademy&&pointsToPublicHome){event.preventDefault();event.stopImmediatePropagation();window.scrollTo({top:0,behavior:'smooth'})}
  },true);
  const originalOnAuthStateChange=client.auth.onAuthStateChange.bind(client.auth);
  client.auth.onAuthStateChange=function(callback){
    return originalOnAuthStateChange(function(event,session){
      if(window.__EWM_ACADEMY_LOGGING_OUT&&event==='SIGNED_OUT')return;
      return callback(event,session);
    });
  };
  document.addEventListener('click',async function(event){
    const link=event.target.closest('#logoutLink');if(!link)return;
    event.preventDefault();event.stopImmediatePropagation();window.__EWM_ACADEMY_LOGGING_OUT=true;link.setAttribute('aria-busy','true');
    try{await client.auth.signOut({scope:'local'})}catch(error){console.warn('Academy logout error:',error)}finally{window.location.replace('/index.html')}
  },true);
})();