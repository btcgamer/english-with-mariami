// English with Mariami — single Supabase session guard
(function () {
  const SUPABASE_URL = "https://vtdhvsfqhwesxtwmduew.supabase.co";
  const SUPABASE_KEY = "sb_publishable_MnrM2ulyJY_ugwfFVfpQYA_iV5wjCmt";
  const LOGIN = "login.html";

  // Prevent protected content flashing before the session check finishes.
  document.documentElement.style.visibility = "hidden";

  function goLogin() {
    const target = location.pathname.split('/').pop() + location.search + location.hash;
    location.replace(LOGIN + "?redirect=" + encodeURIComponent(target));
  }

  async function start() {
    if (!window.supabase?.createClient) return goLogin();
    try {
      // IMPORTANT: no custom storageKey here. Every page uses Supabase's
      // default storage key, so login/register/student/protected pages share one session.
      const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storage: window.localStorage }
      });
      const { data, error } = await client.auth.getSession();
      if (error || !data?.session) return goLogin();
      document.documentElement.style.visibility = "visible";
    } catch (e) {
      goLogin();
    }
  }

  if (window.supabase?.createClient) start();
  else {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
    script.onload = start;
    script.onerror = goLogin;
    document.head.appendChild(script);
  }
})();
