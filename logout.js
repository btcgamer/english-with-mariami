// English with Mariami — shared Logout
(function () {
  'use strict';

  const path = location.pathname.toLowerCase();
  if (/\/(login|register|reset-password)\.html$/.test(path)) return;

  function clearAuthStorage() {
    try {
      [localStorage, sessionStorage].forEach(store => {
        const remove = [];
        for (let i = 0; i < store.length; i++) {
          const key = store.key(i);
          if (key && (/^sb-/i.test(key) || /supabase/i.test(key))) remove.push(key);
        }
        remove.forEach(key => store.removeItem(key));
      });
    } catch (_) {}
  }

  function install() {
    if (document.getElementById('ewm-logout')) return;
    const client = window.__ENGLISH_MARIAMI_SUPABASE_CLIENT || window.supabaseClient;
    if (!client) return;

    const style = document.createElement('style');
    style.textContent = '#ewm-logout{position:fixed;right:18px;top:14px;z-index:99999;border:1px solid rgba(255,255,255,.35);border-radius:14px;padding:10px 15px;background:linear-gradient(135deg,#ff477e,#ff1744);color:#fff;font:900 13px Arial,sans-serif;cursor:pointer;box-shadow:0 0 18px rgba(255,23,68,.45),0 8px 25px rgba(0,0,0,.35);transition:.2s}#ewm-logout:hover{transform:translateY(-2px) scale(1.03);box-shadow:0 0 28px rgba(255,23,68,.7)}#ewm-logout:disabled{opacity:.65;cursor:wait}@media(max-width:520px){#ewm-logout{right:10px;top:9px;padding:8px 11px;font-size:11px}}';
    document.head.appendChild(style);

    const button = document.createElement('button');
    button.id = 'ewm-logout';
    button.type = 'button';
    button.textContent = '🚪 გამოსვლა';
    button.addEventListener('click', async () => {
      button.disabled = true;
      button.textContent = '⏳ გამოდის...';
      try { await client.auth.signOut({ scope: 'global' }); } catch (_) {}
      clearAuthStorage();
      location.replace('login.html?logout=1');
    });
    document.body.appendChild(button);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install);
  else install();
})();
