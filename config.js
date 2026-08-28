// English with Mariami — Supabase configuration
const SUPABASE_URL = 'https://vtdhvsfqhwesxtwmduew.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_MnrM2ulyJY_ugwfFVfpQYA_iV5wjCmt';

if (!window.supabase) throw new Error('Supabase JS library failed to load.');

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

window.__ENGLISH_MARIAMI_SUPABASE_CLIENT = supabaseClient;
window.supabaseClient = supabaseClient;

// Login must never inherit an old browser session.
if (location.pathname.toLowerCase().endsWith('/login.html')) {
  (async function () {
    try { await supabaseClient.auth.signOut({ scope: 'global' }); } catch (_) {}
    try {
      const clear = storage => {
        const keys = [];
        for (let i = 0; i < storage.length; i++) {
          const k = storage.key(i);
          if (k && (k.startsWith('sb-') || k.toLowerCase().includes('supabase'))) keys.push(k);
        }
        keys.forEach(k => storage.removeItem(k));
      };
      clear(localStorage);
      clear(sessionStorage);
    } catch (_) {}
  })();
}

(function () {
  const path = location.pathname.toLowerCase();
  if (path.endsWith('/login.html') || path.endsWith('/register.html') || path.endsWith('/reset-password.html')) return;

  const guard = document.createElement('script');
  guard.src = 'session-guard.js?v=20260828-1';
  guard.defer = true;
  document.head.appendChild(guard);

  const logout = document.createElement('script');
  logout.src = 'logout.js?v=20260828-5';
  logout.defer = true;
  document.head.appendChild(logout);
})();
