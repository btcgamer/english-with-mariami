// English with Mariami — shared authentication guard
(function () {
  'use strict';

  const path = location.pathname.toLowerCase();

  const publicPages = [
    '/login.html',
    '/register.html',
    '/reset-password.html',
    '/teacher-login.html'
  ];

  // საჯარო გვერდებზე ავტორიზაცია არ არის საჭირო
  if (publicPages.some(page => path.endsWith(page))) {
    return;
  }

  // Supabase client-ის მიღება
  const client =
    window.__ENGLISH_MARIAMI_SUPABASE_CLIENT ||
    window.supabaseClient;

  // თუ Supabase client ჯერ არ არის ჩატვირთული,
  // guard არაფერს აკეთებს
  if (!client) {
    return;
  }

  // მომხმარებლის სესიის შემოწმება
  client.auth
    .getSession()
    .then(({ data, error }) => {

      // თუ ავტორიზებული მომხმარებელი არ არის,
      // გადავიყვანოთ Login გვერდზე
      if (error || !data || !data.session) {

        const target =
          location.pathname +
          location.search +
          location.hash;

        const loginUrl =
          'login.html?redirect=' +
          encodeURIComponent(target);

        location.replace(loginUrl);
      }
    })
    .catch(() => {
      // შეცდომის შემთხვევაში გვერდი არ გაითიშოს
    });

})();
