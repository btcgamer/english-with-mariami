// English with Mariami — Supabase configuration
const SUPABASE_URL = 'https://vtdhvsfqhwesxtwmduew.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_MnrM2ulyJY_ugwfFVfpQYA_iV5wjCmt';

if (!window.supabase) throw new Error('Supabase JS library failed to load.');
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}
});
window.__ENGLISH_MARIAMI_SUPABASE_CLIENT=supabaseClient;
window.supabaseClient=supabaseClient;

if(location.pathname.toLowerCase().endsWith('/login.html')){
  (async function(){try{await supabaseClient.auth.signOut({scope:'global'});}catch(_){}try{const c=s=>{const k=[];for(let i=0;i<s.length;i++){const x=s.key(i);if(x&&(x.startsWith('sb-')||x.toLowerCase().includes('supabase')))k.push(x)}k.forEach(x=>s.removeItem(x))};c(localStorage);c(sessionStorage)}catch(_){}})();
}
(function(){const p=location.pathname.toLowerCase();if(p.endsWith('/login.html')||p.endsWith('/register.html')||p.endsWith('/reset-password.html')||p.endsWith('/teacher-login.html'))return;const add=(src)=>{const s=document.createElement('script');s.src=src;s.defer=true;document.head.appendChild(s)};add('session-guard.js?v=20260828-3');add('logout.js?v=20260828-7')})();

/* Academy visual layer: applies only to academy.html so the other pages stay unchanged. */
(function(){
  if(!location.pathname.toLowerCase().endsWith('/academy.html')) return;
  const style=document.createElement('style');
  style.textContent=`
    .neon-world{
      background:#010713 url('academy-bg.svg') center/cover no-repeat !important;
      background-attachment:fixed !important;
    }
    .neon-world:after{
      content:"";
      position:absolute;
      inset:0;
      background:
        radial-gradient(circle at 50% 45%,transparent 15%,rgba(0,20,55,.12) 48%,rgba(0,4,15,.72) 100%),
        linear-gradient(180deg,rgba(0,234,255,.08),rgba(0,0,20,.35));
      pointer-events:none;
      animation:academyPulse 6s ease-in-out infinite;
    }
    .neon-world .grid-floor{opacity:.3 !important;mix-blend-mode:screen;}
    .neon-world .letter{
      z-index:3;
      filter:drop-shadow(0 0 12px #00eaff) drop-shadow(0 18px 18px rgba(0,30,80,.75));
    }
    @keyframes academyPulse{0%,100%{opacity:.72}50%{opacity:1}}
    @media(max-width:850px){
      .neon-world{background-position:center top !important;}
    }
  `;
  document.head.appendChild(style);
})();
