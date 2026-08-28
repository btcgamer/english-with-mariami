// English with Mariami — teacher-only navigation for grade pages
(function () {
  'use strict';
  const TEACHER_EMAIL = 'razmadzemariam45@gmail.com';
  const TEACHER_ID = 'be4b1c4d-e5f2-4039-b35e-aec3c110a94a';
  const path = location.pathname.toLowerCase();
  if (!/\/grade[234]\.html$/.test(path)) return;
  function addTeacherNav() {
    if (document.getElementById('teacher-only-nav')) return;
    const nav = document.createElement('div');
    nav.id = 'teacher-only-nav';
    nav.innerHTML = '<a href="teacher-dashboard.html">👩‍🏫 მასწავლებლის Dashboard</a>';
    const style = document.createElement('style');
    style.textContent = '#teacher-only-nav{margin:10px auto 0;max-width:1200px;padding:0 18px;position:relative;z-index:9999}#teacher-only-nav a{display:inline-block;padding:11px 16px;border-radius:12px;background:linear-gradient(135deg,#075eff,#00c9f2);color:#fff;text-decoration:none;font-weight:900;box-shadow:0 0 18px #00eaff44}';
    document.head.appendChild(style);
    document.body.insertBefore(nav, document.body.firstChild);
  }
  async function checkTeacher() {
    const client = window.__ENGLISH_MARIAMI_SUPABASE_CLIENT || window.supabaseClient;
    if (!client) return;
    try {
      const { data: { session } } = await client.auth.getSession();
      if (!session || !session.user) return;
      const user = session.user;
      const email = String(user.email || '').toLowerCase();
      let role = '';
      try {
        const { data } = await client.from('profiles').select('role').eq('user_id', user.id).maybeSingle();
        role = String(data?.role || '').toLowerCase();
      } catch (_) {}
      if (email === TEACHER_EMAIL || user.id === TEACHER_ID || role === 'teacher') addTeacherNav();
    } catch (_) {}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', checkTeacher);
  else checkTeacher();
})();
