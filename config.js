// English with Mariami — Supabase configuration
const SUPABASE_URL = 'https://vtdhvsfqhwesxtwmduew.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_MnrM2ulyJY_ugwfFVfpQYA_iV5wjCmt';

(function(){
  'use strict';
  const path=location.pathname.toLowerCase();
  const publicPages=['/login.html','/register.html','/reset-password.html','/teacher-login.html'];
  const isPublic=publicPages.some(p=>path.endsWith(p));

  function hideRegistrationGrade(){
    if(!path.endsWith('/register.html')) return;
    const grade=document.getElementById('grade');
    if(!grade) return;
    grade.required=false;
    grade.value='0';
    grade.setAttribute('aria-hidden','true');
    const field=grade.closest('.field') || grade.parentElement;
    if(field) field.style.display='none';
  }

  /* One login for everybody. Role + grade decide the destination. */
  function installSafeLoginRouter(){
    if(!path.endsWith('/login.html')) return;
    const install=()=>{
      const form=document.getElementById('loginForm');
      if(!form || form.dataset.safeRouterInstalled==='1') return;
      form.dataset.safeRouterInstalled='1';
      form.addEventListener('submit',async function(event){
        event.preventDefault();
        event.stopImmediatePropagation();
        const emailInput=document.getElementById('email');
        const passwordInput=document.getElementById('password');
        const button=document.getElementById('loginButton');
        const message=document.getElementById('message');
        const email=String(emailInput?.value||'').trim().toLowerCase();
        const password=String(passwordInput?.value||'');
        const client=window.__ENGLISH_MARIAMI_SUPABASE_CLIENT||window.supabaseClient;
        if(!client || !email || !password) return;
        if(button){button.disabled=true;button.textContent='⏳ შესვლა...';}
        if(message){message.className='message';message.textContent='';}
        try{
          const {data,error}=await client.auth.signInWithPassword({email,password});
          if(error) throw error;
          if(!data?.session || !data?.user) throw new Error('სესია ვერ შეიქმნა.');
          const user=data.user;
          const {data:profile,error:profileError}=await client.from('profiles').select('role,grade').eq('user_id',user.id).maybeSingle();
          if(profileError) throw profileError;
          const role=String(profile?.role||'').trim().toLowerCase();
          const grade=Number(profile?.grade||0);
          const isTeacher=role==='teacher' || user.id==='be4b1c4d-e5f2-4039-b35e-aec3c110a94a' || email==='razmadzemariam45@gmail.com';

          if(isTeacher){
            if(message){message.className='message success';message.textContent='✅ შესვლა წარმატებულია! იხსნება მასწავლებლის სივრცე...';}
            setTimeout(()=>location.replace('teacher-dashboard.html'),300);
            return;
          }

          if(role==='parent'){
            if(message){message.className='message success';message.textContent='👨‍👩‍👧 იხსნება სასწავლო აკადემია...';}
            setTimeout(()=>location.replace('academy.html'),300);
            return;
          }

          if(role==='student' && [2,3,4].includes(grade)){
            if(message){message.className='message success';message.textContent='✅ შესვლა წარმატებულია! იხსნება მე-'+grade+' კლასის სივრცე...';}
            setTimeout(()=>location.replace('grade'+grade+'.html'),300);
            return;
          }

          if(message){message.className='message error';message.textContent='⚠️ თქვენი ანგარიში ჯერ არ არის მიბმული კლასზე. გთხოვთ, დაუკავშირდეთ მასწავლებელს.';}
          try{await client.auth.signOut();}catch(_){ }
        }catch(error){
          console.error('Safe login error:',error);
          if(message){
            message.className='message error';
            const text=String(error?.message||'');
            message.textContent=/invalid login credentials/i.test(text)?'❌ ელფოსტა ან პაროლი არასწორია.':'❌ '+(text||'შესვლა ვერ მოხერხდა.');
          }
        }finally{
          if(button){button.disabled=false;button.textContent='🚀 შესვლა';}
        }
      },true);
    };
    if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',install,{once:true});
    else install();
  }

  function cleanGradeNavigation(){
    if(!/\/grade[34]\.html$/.test(path)) return;
    const removeMainLinks=()=>{
      document.querySelectorAll('.nav-links a[href="index.html"], .navlinks a[href="index.html"]').forEach(a=>a.remove());
    };
    if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',removeMainLinks,{once:true});
    else removeMainLinks();
    const observer=new MutationObserver(removeMainLinks);
    observer.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(()=>observer.disconnect(),10000);
  }

  if(path.endsWith('/register.html')){
    if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',hideRegistrationGrade,{once:true});
    else hideRegistrationGrade();
  }

  cleanGradeNavigation();
  installSafeLoginRouter();

  /* IMPORTANT: do not clear Supabase storage on login.html.
     Supabase needs its persisted session during authentication and redirects. */

  if(path.endsWith('/grade2.html')){
    const quizScript=document.createElement('script');
    quizScript.src='grade2-quiz-fix.js?v=20260829-4';
    quizScript.defer=true;
    document.head.appendChild(quizScript);
  }

  function loadAfterSupabase(){
    const add=(src)=>{const s=document.createElement('script');s.src=src;s.defer=true;document.head.appendChild(s)};
    if(!isPublic){
      add('session-guard.js?v=20260829-8');
      add('grade-access.js?v=20260829-8');
      add('logout.js?v=20260829-5');
      add('teacher-navigation.js?v=20260829-5');
      if(path.endsWith('/grade3.html')) add('grade3-progress.js?v=20260829-2');
    }
    if(path.endsWith('/academy.html')){
      const style=document.createElement('style');
      style.textContent=`.neon-world{background:#010713 url('academy-bg.svg') center/cover no-repeat!important;background-attachment:fixed!important}.neon-world:after{content:"";position:absolute;inset:0;background:radial-gradient(circle at 50% 45%,transparent 15%,rgba(0,20,55,.12) 48%,rgba(0,4,15,.72) 100%),linear-gradient(180deg,rgba(0,234,255,.08),rgba(0,0,20,.35));pointer-events:none;animation:academyPulse 6s ease-in-out infinite}.neon-world .grid-floor{opacity:.3!important;mix-blend-mode:screen}.neon-world .letter{z-index:3;filter:drop-shadow(0 0 12px #00eaff) drop-shadow(0 18px 18px rgba(0,30,80,.75))}@keyframes academyPulse{0%,100%{opacity:.72}50%{opacity:1}}@media(max-width:850px){.neon-world{background-position:center top!important}}`;
      document.head.appendChild(style);
      const v=document.createElement('script');v.src='academy-visual.js?v=20260829-4';v.defer=true;document.head.appendChild(v);
    }
  }

  function init(){
    if(window.__ENGLISH_MARIAMI_SUPABASE_LOADING_DONE) return;
    if(!window.supabase||typeof window.supabase.createClient!=='function') return;
    window.__ENGLISH_MARIAMI_SUPABASE_LOADING_DONE=true;
    const supabaseClient=window.supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
    window.__ENGLISH_MARIAMI_SUPABASE_CLIENT=supabaseClient;
    window.supabaseClient=supabaseClient;
    try{window.dispatchEvent(new CustomEvent('englishMariamiSupabaseReady'))}catch(_){}
    loadAfterSupabase();
  }

  if(window.supabase&&typeof window.supabase.createClient==='function') init();
  else{
    const existing=document.querySelector('script[data-english-mariami-supabase]');
    if(existing) existing.addEventListener('load',init,{once:true});
    else{
      const script=document.createElement('script');
      script.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      script.dataset.englishMariamiSupabase='1';
      script.onload=init;
      script.onerror=()=>console.error('Supabase JS failed to load; page remains visible.');
      document.head.appendChild(script);
    }
  }
})();