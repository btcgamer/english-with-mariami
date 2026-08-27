// English with Mariami — reliable protected-page guard
(function () {
  const SUPABASE_URL = "https://vtdhvsfqhwesxtwmduew.supabase.co";
  const SUPABASE_KEY = "sb_publishable_MnrM2ulyJY_ugwfFVfpQYA_iV5wjCmt";
  const LOGIN = "login.html";

  function goLogin() {
    const target = location.pathname + location.search + location.hash;
    location.replace(LOGIN + "?redirect=" + encodeURIComponent(target));
  }

  function start() {
    if (!window.supabase || !window.supabase.createClient) return goLogin();
    let client;
    try {
      client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storage: window.localStorage }
      });
    } catch (e) { return goLogin(); }

    let allowed = false;
    const allow = () => { allowed = true; };
    const deny = () => { if (!allowed) goLogin(); };

    client.auth.getSession().then(({ data }) => {
      if (data && data.session) { allow(); return; }
      setTimeout(() => client.auth.getSession().then(({ data: retry }) => retry && retry.session ? allow() : deny()).catch(deny), 1800);
    }).catch(deny);

    client.auth.onAuthStateChange((event, session) => {
      if (session) allow();
      else if (event === "SIGNED_OUT") goLogin();
    });
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
