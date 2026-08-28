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
