// English with Mariami — Supabase configuration
// ერთი საერთო Auth სისტემა მთელი საიტისთვის.

const SUPABASE_URL = 'https://vtdhvsfqhwesxtwmduew.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_MnrM2ulyJY_ugwfFVfpQYA_iV5wjCmt';

if (!window.supabase) {
  throw new Error('Supabase JS library failed to load.');
}

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: true
    }
  }
);

window.__ENGLISH_MARIAMI_SUPABASE_CLIENT = supabaseClient;
window.supabaseClient = supabaseClient;

// საერთო Logout მხოლოდ ავტორიზებულ გვერდებზე.
(function () {
  const path = location.pathname.toLowerCase();
  if (path.endsWith('/login.html') || path.endsWith('/register.html') || path.endsWith('/reset-password.html')) return;

  const script = document.createElement('script');
  script.src = 'logout.js?v=20260828-2';
  script.defer = true;
  document.head.appendChild(script);
})();
