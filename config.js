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
      // სესია ინახება მხოლოდ მიმდინარე ავტორიზაციისთვის.
      // Login გვერდზე ძველი სესია ყოველთვის იწმინდება.
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);

// Login გვერდზე ძველი/დარჩენილი Auth სესიის სრული გასუფთავება.
// ეს ხელს უშლის ძველი მომხმარებლის ავტომატურ გახსენებას.
if (location.pathname.toLowerCase().endsWith('/login.html')) {
  try {
    const keysToRemove = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        (key.startsWith('sb-') || key.toLowerCase().includes('supabase'))
      ) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));

    const sessionKeys = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (
        key &&
        (key.startsWith('sb-') || key.toLowerCase().includes('supabase'))
      ) {
        sessionKeys.push(key);
      }
    }

    sessionKeys.forEach(key => sessionStorage.removeItem(key));
  } catch (e) {
    console.warn('Auth storage cleanup:', e);
  }

  // Client-ის შიდა ძველი სესიის გაუქმებაც ვცადოთ.
  supabaseClient.auth.signOut({ scope: 'global' }).catch(() => {});
}

window.__ENGLISH_MARIAMI_SUPABASE_CLIENT = supabaseClient;
window.supabaseClient = supabaseClient;

// საერთო Logout მხოლოდ ავტორიზებულ გვერდებზე.
(function () {
  const path = location.pathname.toLowerCase();

  if (
    path.endsWith('/login.html') ||
    path.endsWith('/register.html') ||
    path.endsWith('/reset-password.html')
  ) return;

  const script = document.createElement('script');
  script.src = 'logout.js?v=20260828-3';
  script.defer = true;
  document.head.appendChild(script);
})();
