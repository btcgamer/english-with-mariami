/* Grade 4 — temporary auth-session bridge. */
(function () {
  'use strict';
  const client = window.__ENGLISH_MARIAMI_SUPABASE_CLIENT || window.supabaseClient;
  if (!client) return;

  const KEY = 'ewm_grade4_auth_session';
  const isStandalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;

  function store(session) {
    try {
      if (session) sessionStorage.setItem(KEY, JSON.stringify(session));
      else sessionStorage.removeItem(KEY);
    } catch (_) {}
  }

  async function sync() {
    try {
      const { data, error } = await client.auth.getSession();
      if (!error && data && data.session) store(data.session);
    } catch (_) {}
  }

  // Never invent or restore an auth state. Mirror only the live Supabase session.
  sync();

  client.auth.onAuthStateChange(function (event, session) {
    if (event === 'SIGNED_OUT') {
      store(null);
    } else if (session) {
      store(session);
    }
  });

  // A PWA/browser browsing context cannot reliably distinguish closing from
  // ordinary navigation, so do not sign out on pagehide. sessionStorage is
  // scoped to the current browsing context and avoids persistent Grade 4 state.
  window.addEventListener('pagehide', function () {});

  window.__EWM_GRADE4_AUTH_TEMPORARY = true;
  window.__EWM_GRADE4_STANDALONE = !!isStandalone;
})();
