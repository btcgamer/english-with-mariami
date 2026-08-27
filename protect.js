// English with Mariami — protected pages
// This file redirects visitors to login.html when there is no Supabase session.
(function () {
  const SUPABASE_URL = "https://vtdhvsfqhwesxtwmduew.supabase.co";
  const SUPABASE_KEY = "sb_publishable_MnrM2ulyJY_ugwfFVfpQYA_iV5wjCmt";

  const script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
  script.onload = async function () {
    try {
      const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      const { data } = await client.auth.getSession();
      if (!data.session) {
        const target = encodeURIComponent(location.pathname + location.search + location.hash);
        location.replace("login.html?redirect=" + target);
      }
    } catch (e) {
      console.error("Auth check failed", e);
      location.replace("login.html");
    }
  };
  document.head.appendChild(script);
})();
