/* English with Mariami — public Supabase browser configuration. */
window.SUPABASE_URL='https://vtdhvsfqhwesxtwmduew.supabase.co';
window.SUPABASE_PUBLISHABLE_KEY='sb_publishable_MnrM2ulyJY_ugwfFVfpQYA_iV5wjCmt';
window.supabaseClient=window.supabase.createClient(window.SUPABASE_URL,window.SUPABASE_PUBLISHABLE_KEY,{auth:{autoRefreshToken:true,persistSession:true,detectSessionInUrl:true}});
window.__ENGLISH_MARIAMI_SUPABASE_CLIENT=window.supabaseClient;
(function(){'use strict';const path=(location.pathname||'').toLowerCase().replace(/\/+$/,'');const client=window.__ENGLISH_MARIAMI_SUPABASE_CLIENT||window.supabaseClient;if(!client)return;const gradeMatch=path.match(/(?:^|\/)grade([234])(?:\.html|\/index\.html)?$/);const isStudentDashboard=path.endsWith('/student-dashboard.html')||path.endsWith('student-dashboard.html');function gradeTarget(g){return '/grade'+Number(g)+'/index.html'}async function getProfile(){const r=await client.auth.getUser();if(r.error)throw r.error;if(!r.data?.user)return null;const p=await client.from('profiles').select('role,grade').eq('user_id',r.data.user.id).maybeSingle();if(p.error)throw p.error;return {user:r.data.user,profile:p.data}}async function guardGradePage(){if(!gradeMatch)return;try{const current=Number(gradeMatch[1]),auth=await getProfile();if(!auth){location.replace('/login.html?reason=unauthorized');return}const role=String(auth.profile?.role||'').trim().toLowerCase(),assigned=Number(auth.profile?.grade||0);if(role!=='student'){location.replace(role==='teacher'?'/teacher-dashboard.html':'/login.html?reason=wrong-role');return}if(![2,3,4].includes(assigned)){location.replace('/student-dashboard.html?reason=no-grade');return}if(assigned!==current)location.replace(gradeTarget(assigned)+'?reason=grade-locked')}catch(e){console.warn('Grade access guard error:',e);location.replace('/student-dashboard.html?reason=access-check')}}async function guardStudentDashboard(){if(!isStudentDashboard)return;try{const auth=await getProfile();if(!auth){location.replace('/login.html?reason=unauthorized');return}const role=String(auth.profile?.role||'').trim().toLowerCase();if(role!=='student')location.replace(role==='teacher'?'/teacher-dashboard.html':'/login.html?reason=wrong-role')}catch(e){console.warn('Student dashboard access guard error:',e)}}function installGradeNavigation(){if(!gradeMatch)return;const add=()=>{const brand=document.querySelector('.brand');if(brand)brand.setAttribute('href','/academy.html');if(document.getElementById('__ewm-academy-home'))return;const home=document.createElement('a');home.id='__ewm-academy-home';home.href='/academy.html';home.textContent='🏠 HOME';home.setAttribute('aria-label','Back to Academy');home.style.cssText='position:fixed;left:16px;top:16px;z-index:999990;display:inline-flex;align-items:center;justify-content:center;padding:10px 14px;border:1px solid rgba(0,234,255,.45);border-radius:13px;background:rgba(2,18,35,.86);color:#fff;text-decoration:none;font:900 12px/1 Arial,sans-serif;box-shadow:0 0 18px rgba(0,234,255,.18);backdrop-filter:blur(12px)';document.body.appendChild(home)};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',add,{once:true});else add();const ls=document.createElement('script');ls.src='/logout.js';ls.async=true;ls.dataset.englishMariamiGradeLogout='1';if(!document.querySelector('script[data-english-mariami-grade-logout]'))document.head.appendChild(ls)}guardGradePage();guardStudentDashboard();installGradeNavigation()})();
(function(){if(document.querySelector('script[data-english-mariami-progress-sync]'))return;const s=document.createElement('script');s.src='/progress-sync.js';s.async=true;s.dataset.englishMariamiProgressSync='1';document.head.appendChild(s)})();
(function(){if(document.querySelector('script[data-english-mariami-dashboard-progress]'))return;const s=document.createElement('script');s.src='/dashboard-progress.js';s.async=true;s.dataset.englishMariamiDashboardProgress='1';document.head.appendChild(s)})();

/* Academy navigation + logout. */
(function(){
  'use strict';
  const client=window.__ENGLISH_MARIAMI_SUPABASE_CLIENT||window.supabaseClient;
  if(!client)return;

  const isAcademyPage=()=>{
    const p=(window.location.pathname||'').toLowerCase().replace(/\/+$/,'');
    return p==='/academy.html'||p==='academy.html';
  };

  window.__EWM_ACADEMY_LOGGING_OUT=false;

  /* HARD BLOCK: the Academy brand is NOT a home button.
     On academy.html it must never navigate to index.html.
     We also remove its href so normal browser navigation cannot occur. */
  functionlockAcademyBrand(){
    if(!isAcademyPage())return;
    const brand=document.querySelector('.brand');
    if(!brand)return;
    if(brand.dataset.ewmAcademyLocked==='1')return;
    brand.dataset.ewmAcademyLocked='1';
    brand.dataset.originalHref=brand.getAttribute('href')||'';
    brand.setAttribute('href','#academy-top');
    brand.setAttribute('role','button');
    brand.setAttribute('aria-label','English with Mariami Academy');
  }

  function installAcademyBrandLock(){
    function run(){
      functionlockAcademyBrand();
      const observer=new MutationObserver(function(){functionlockAcademyBrand()});
      if(document.body)observer.observe(document.body,{childList:true,subtree:true});
    }
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});
    else run();
  }
  installAcademyBrandLock();

  window.addEventListener('click',function(event){
    const brand=event.target.closest&&event.target.closest('.brand');
    if(!brand||!isAcademyPage())return;
    event.preventDefault();
    event.stopPropagation();
    if(event.stopImmediatePropagation)event.stopImmediatePropagation();
    window.history.replaceState(null,'','#academy-top');
    window.scrollTo({top:0,behavior:'smooth'});
  },true);

  const originalOnAuthStateChange=client.auth.onAuthStateChange.bind(client.auth);
  client.auth.onAuthStateChange=function(callback){
    return originalOnAuthStateChange(function(event,session){
      if(window.__EWM_ACADEMY_LOGGING_OUT&&event==='SIGNED_OUT')return;
      return callback(event,session);
    });
  };

  window.addEventListener('click',async function(event){
    const link=event.target.closest&&event.target.closest('#logoutLink');
    if(!link)return;
    event.preventDefault();
    event.stopPropagation();
    if(event.stopImmediatePropagation)event.stopImmediatePropagation();
    window.__EWM_ACADEMY_LOGGING_OUT=true;
    link.setAttribute('aria-busy','true');
    try{await client.auth.signOut({scope:'local'});}catch(error){console.warn('Academy logout error:',error)}
    finally{window.location.replace('/index.html');}
  },true);
})();
