// English with Mariami — shared authentication guard
(function () {
  'use strict';

  const path = location.pathname.toLowerCase();
  const publicPages = ['/login.html', '/register.html', '/reset-password.html'];
  if (publicPages.some(page => path.endsWith(page))) return;

  const client = window.__ENGLISH_MARIAMI_SUPABASE_CLIENT || window.supabaseClient;
  if (!client) {
    location.replace('login.html');
    return;
  }

  client.auth.getSession()
    .then(({ data, error }) => {
      if (error || !data || !data.session) {
        const target = location.pathname + location.search + location.hash;
        location.replace('login.html?redirect=' + encodeURIComponent(target));
      }
    })
    .catch(() => {
      location.replace('login.html');
    });
})();
