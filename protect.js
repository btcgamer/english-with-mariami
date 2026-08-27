// English with Mariami — protected pages
// Shared Supabase session guard for all protected pages.
(function () {
  const SUPABASE_URL = "https://vtdhvsfqhwesxtwmduew.supabase.co";
  const SUPABASE_KEY = "sb_publishable_MnrM2ulyJY_ugwfFVfpQYA_iV5wjCmt";
  const STORAGE_KEY = "english-with-mariami-auth";
  const LOGIN = "login.html";

  function redirectToLogin() {
    const target = location.pathname + location.search + location.hash;
    location.replace(LOGIN + "?redirect=" + encodeURIComponent(target));
  }

  function startGuard() {
    if (!window.supabase || !window.supabase.createClient) {
      redirectToLogin();
      return;
    }

    const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage,
        storageKey: STORAGE_KEY
      }
    });

    client.auth.getSession().then(({ data }) => {
      if (data && data.session) return;
      setTimeout(async () => {
        const { data: retry } = await client.auth.getSession();
        if (!retry || !retry.session) redirectToLogin();
      }, 700);
    }).catch(() => redirectToLogin());
  }

  if (window.supabase && window.supabase.createClient) {
    startGuard();
  } else {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
    script.onload = startGuard;
    script.onerror = redirectToLogin;
    document.head.appendChild(script);
  }
})();
