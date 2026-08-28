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

// Login page: never reuse an old saved session.
if (location.pathname.toLowerCase().endsWith('/login.html')) {
  (async function clearOldAuth() {
    try { await supabaseClient.auth.signOut({ scope: 'global' }); } catch (_) {}
    try {
      const remove = (storage) => {
        const keys = [];
        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i);
          if (key && (key.startsWith('sb-') || key.toLowerCase().includes('supabase'))) keys.push(key);
        }
        keys.forEach(k => storage.removeItem(k));
      };
      remove(localStorage);
      remove(sessionStorage);
    } catch (_) {}
  })();
}

// Load the shared logout button on protected/site pages only.
(function () {
  const path = location.pathname.toLowerCase();
  if (path.endsWith('/login.html') || path.endsWith('/register.html') || path.endsWith('/reset-password.html')) return;
  const script = document.createElement('script');
  script.src = 'logout.js?v=20260828-4';
  script.defer = true;
  document.head.appendChild(script);
})();
