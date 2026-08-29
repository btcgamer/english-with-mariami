// English with Mariami — grade navigation
(function () {
  'use strict';

  const TEACHER_EMAIL = 'razmadzemariam45@gmail.com';
  const TEACHER_ID = 'be4b1c4d-e5f2-4039-b35e-aec3c110a94a';
  const path = location.pathname.toLowerCase();
  const isGrade3 = /\/grade3\.html(?:$|\?)/.test(path);
  const isGrade4 = /\/grade4\.html(?:$|\?)/.test(path);
  const isTeacherGrade = /\/teacher-grade[234]\.html(?:$|\?)/.test(path);

  if (!isGrade3 && !isGrade4 && !isTeacherGrade) return;

  function hideGradeHome() {
    if (!isGrade3 && !isGrade4) return;
    document.querySelectorAll('a').forEach(function (el) {
      const href = (el.getAttribute('href') || '').toLowerCase();
      const text = (el.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
      const isHome = href === '/' || href.endsWith('/index.html') || href === 'index.html' || text === '🏠 მთავარი' || text === 'მთავარი';
      if (isHome) el.style.setProperty('display', 'none', 'important');
    });
  }

  function isTeacher() {
    const client = window.__ENGLISH_MARIAMI_SUPABASE_CLIENT || window.supabaseClient;
    if (!client) return Promise.resolve(false);
    return client.auth.getSession().then(function (result) {
      const user = result?.data?.session?.user;
      if (!user) return false;
      const email = String(user.email || '').trim().toLowerCase();
      if (email === TEACHER_EMAIL || user.id === TEACHER_ID) return true;
      return client.from('profiles').select('role').eq('user_id', user.id).maybeSingle()
        .then(function (r) {
          return String(r?.data?.role || '').trim().toLowerCase() === 'teacher';
        })
        .catch(function () { return false; });
    }).catch(function () { return false; });
  }

  function hideTeacherPageLinks() {
    if (!isTeacherGrade) return;
    document.querySelectorAll('a,button').forEach(function (el) {
      const href = (el.getAttribute('href') || '').toLowerCase();
      const text = (el.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
      const isHome = href === '/' || href.endsWith('/index.html') || href === 'index.html' || text === '🏠 მთავარი' || text === 'მთავარი';
      const isAcademy = href.includes('academy.html') || text === 'academy' || text.includes('🎓 academy');
      if (isHome || isAcademy) el.style.setProperty('display', 'none', 'important');
    });
  }

  function addTeacherBack() {
    if (!document.body || document.getElementById('teacher-only-nav')) return;
    const nav = document.createElement('div');
    nav.id = 'teacher-only-nav';
    nav.innerHTML = '<a href="teacher-dashboard.html">👩‍🏫 მასწავლებლის Dashboard</a>';
    const style = document.createElement('style');
    style.textContent = '#teacher-only-nav{margin:10px auto;max-width:1200px;padding:0 18px;position:relative;z-index:999999}#teacher-only-nav a{display:inline-block!important;padding:11px 16px;border-radius:12px;background:linear-gradient(135deg,#075eff,#00c9f2);color:#fff!important;text-decoration:none!important;font-weight:900;box-shadow:0 0 18px #00eaff44}';
    document.head.appendChild(style);
    document.body.insertBefore(nav, document.body.firstChild);
  }

  function enableTeacherView() {
    hideTeacherPageLinks();
    addTeacherBack();
    setInterval(hideTeacherPageLinks, 250);
  }

  function start() {
    hideGradeHome();
    if (isTeacherGrade || isGrade3 || isGrade4) {
      isTeacher().then(function (ok) {
        if (ok) enableTeacherView();
      });
    }
    if (isGrade3 || isGrade4) setInterval(hideGradeHome, 250);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
