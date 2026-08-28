// English with Mariami — shared Logout button
(function () {
  'use strict';

  const path = location.pathname.toLowerCase();
  if (path.endsWith('/login.html') || path.endsWith('/register.html') || path.endsWith('/reset-password.html')) return;

  function installLogout() {
    if (document.getElementById('ewm-logout')) return;

    const client = window.__ENGLISH_MARIAMI_SUPABASE_CLIENT || window.supabaseClient;
    if (!client) return;

    const style = document.createElement('style');
    style.id = 'ewm-logout-style';
    style.textContent = `
      #ewm-logout{position:fixed;right:18px;top:14px;z-index:9999;border:1px solid rgba(255,255,255,.35);border-radius:14px;padding:10px 15px;background:linear-gradient(135deg,#ff477e,#ff1744);color:#fff;font:900 13px Arial,sans-serif;cursor:pointer;box-shadow:0 0 18px rgba(255,23,68,.45),0 8px 25px rgba(0,0,0,.35);transition:.2s;backdrop-filter:blur(10px)}
      #ewm-logout:hover{transform:translateY(-2px) scale(1.03);box-shadow:0 0 28px rgba(255,23,68,.7),0 10px 30px rgba(0,0,0,.4)}
      #ewm-logout:disabled{opacity:.65;cursor:wait}
      @media(max-width:520px){#ewm-logout{right:10px;top:9px;padding:8px 11px;font-size:11px;border-radius:12px}}
    `;
    document.head.appendChild(style);

    const button = document.createElement('button');
    button.id = 'ewm-logout';
    button.type = 'button';
    button.textContent = '🚪 გამოსვლა';
    button.title = 'ანგარიშიდან გამოსვლა';

    button.addEventListener('click', async function () {
      button.disabled = true;
      button.textContent = '⏳ გამოდის...';
      try {
        const { error } = await client.auth.signOut();
        if (error) throw error;
        location.replace('login.html');
      } catch (error) {
        console.error('Logout error:', error);
        button.disabled = false;
        button.textContent = '🚪 გამოსვლა';
        alert('გამოსვლა ვერ მოხერხდა. სცადე თავიდან.');
      }
    });

    document.body.appendChild(button);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installLogout);
  } else {
    installLogout();
  }
})();
