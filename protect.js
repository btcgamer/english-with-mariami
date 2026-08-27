// English with Mariami — single Supabase session guard + navigation normalizer
(function () {
  const SUPABASE_URL = "https://vtdhvsfqhwesxtwmduew.supabase.co";
  const SUPABASE_KEY = "sb_publishable_MnrM2ulyJY_ugwfFVfpQYA_iV5wjCmt";
  const LOGIN = "login.html";

  document.documentElement.style.visibility = "hidden";

  function normalizeNavigation() {
    // academy.html is the single learning-center page.
    if (location.pathname.endsWith("/academy.html") || location.pathname.endsWith("academy.html")) {
      document.querySelectorAll('a[href="grade2.html"],a[href="grade3.html"],a[href="grade4.html"]').forEach(a => {
        const href = a.getAttribute("href");
        const grade = href.match(/grade([234])\.html/);
        if (grade) a.setAttribute("href", "academy.html?grade=" + grade[1]);
      });
      const student = document.querySelector('a[href="student.html"]');
      if (student) student.setAttribute("href", "academy.html");
    }
    // The home link is always the real site home, never a relative redirect target.
    document.querySelectorAll('a[data-home],a[href="./"],a[href="/"]').forEach(a => a.setAttribute("href", "index.html"));
  }

  function goLogin() {
    const target = location.pathname.split('/').pop() + location.search + location.hash;
    location.replace(LOGIN + "?redirect=" + encodeURIComponent(target));
  }

  async function start() {
    if (!window.supabase?.createClient) return goLogin();
    try {
      const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storage: window.localStorage }
      });
      const { data, error } = await client.auth.getSession();
      if (error || !data?.session) return goLogin();
      document.documentElement.style.visibility = "visible";
      normalizeNavigation();
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
