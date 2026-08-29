// English with Mariami — Supabase configuration
const SUPABASE_URL = 'https://vtdhvsfqhwesxtwmduew.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_MnrM2ulyJY_ugwfFVfpQYA_iV5wjCmt';

(function(){
  'use strict';
  const path=location.pathname.toLowerCase();
  const publicPages=['/login.html','/register.html','/reset-password.html','/teacher-login.html'];
  const isPublic=publicPages.some(p=>path.endsWith(p));

  if(path.endsWith('/login.html')){
    try{
      [localStorage,sessionStorage].forEach(store=>{
        const remove=[];
        for(let i=0;i<store.length;i++){
          const key=store.key(i);
          if(key&&(key.startsWith('sb-')||key.toLowerCase().includes('supabase'))) remove.push(key);
        }
        remove.forEach(key=>store.removeItem(key));
      });
    }catch(_){}
  }

  function loadAfterSupabase(){
    const add=(src)=>{const s=document.createElement('script');s.src=src;s.defer=true;document.head.appendChild(s)};
    if(!isPublic){
      add('session-guard.js?v=20260829-6');
      add('grade-access.js?v=20260829-5');
      add('logout.js?v=20260829-3');
      add('teacher-navigation.js?v=20260829-2');
    }
    if(path.endsWith('/academy.html')){
      const style=document.createElement('style');
      style.textContent=`.neon-world{background:#010713 url('academy-bg.svg') center/cover no-repeat!important;background-attachment:fixed!important}.neon-world:after{content:"";position:absolute;inset:0;background:radial-gradient(circle at 50% 45%,transparent 15%,rgba(0,20,55,.12) 48%,rgba(0,4,15,.72) 100%),linear-gradient(180deg,rgba(0,234,255,.08),rgba(0,0,20,.35));pointer-events:none;animation:academyPulse 6s ease-in-out infinite}.neon-world .grid-floor{opacity:.3!important;mix-blend-mode:screen}.neon-world .letter{z-index:3;filter:drop-shadow(0 0 12px #00eaff) drop-shadow(0 18px 18px rgba(0,30,80,.75))}@keyframes academyPulse{0%,100%{opacity:.72}50%{opacity:1}}@media(max-width:850px){.neon-world{background-position:center top!important}}`;
      document.head.appendChild(style);
      const v=document.createElement('script');v.src='academy-visual.js?v=20260829-3';v.defer=true;document.head.appendChild(v);
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

  /* Grade 2/3/4 pages previously loaded config.js without loading supabase-js first.
     The old config threw an exception, which left those pages completely blank.
     Supabase officially supports loading supabase-js v2 from this CDN in browser apps. */
  if(window.supabase&&typeof window.supabase.createClient==='function'){
    init();
  }else{
    const existing=document.querySelector('script[data-english-mariami-supabase]');
    if(existing){
      existing.addEventListener('load',init,{once:true});
    }else{
      const script=document.createElement('script');
      script.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      script.dataset.englishMariamiSupabase='1';
      script.onload=init;
      script.onerror=()=>console.error('Supabase JS failed to load; page remains visible.');
      document.head.appendChild(script);
    }
  }
})();
