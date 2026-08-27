// English with Mariami — reliable protected-page guard
(function () {
  const SUPABASE_URL = "https://vtdhvsfqhwesxtwmduew.supabase.co";
  const SUPABASE_KEY = "sb_publishable_MnrM2ulyJY_ugwfFVfpQYA_iV5wjCmt";
  const STORAGE_KEY = "english-with-mariami-auth";
  const LOGIN = "login.html";

  function goLogin() {
    const target = location.pathname + location.search + location.hash;
    location.replace(LOGIN + "?redirect=" + encodeURIComponent(target));
  }

  async function start() {
    if (!window.supabase || !window.supabase.createClient) return goLogin();
    let client;
    try {
      client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storage: window.localStorage, storageKey: STORAGE_KEY }
      });
    } catch (e) { return goLogin(); }

    let session = null;
    for (let i = 0; i < 6 && !session; i++) {
      try {
        const { data } = await client.auth.getSession();
        session = data && data.session;
      } catch (e) {}
      if (!session) await new Promise(r => setTimeout(r, 500));
    }
    if (session) return;
    goLogin();
  }

  if (window.supabase && window.supabase.createClient) start();
  else {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
    script.onload = start;
    script.onerror = goLogin;
    document.head.appendChild(script);
  }
})();
