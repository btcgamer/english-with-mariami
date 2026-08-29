// English with Mariami — teacher dashboard navigation
(function () {
  'use strict';

  const TEACHER_EMAIL = 'razmadzemariam45@gmail.com';
  const path = location.pathname.toLowerCase();
  const isAcademy = /\/academy\.html(?:$|\?)/.test(path);

  // Teacher Dashboard must NOT appear on Grade 2, Grade 3 or Grade 4 pages.
  // It is shown only on the main Academy page and only to the teacher account.
  if (!isAcademy) return;

  function getClient() {
    return window.__ENGLISH_MARIAMI_SUPABASE_CLIENT || window.supabaseClient || null;
  }

  function isTeacher() {
    const client = getClient();
    if (!client) return Promise.resolve(false);

    return client.auth.getSession().then(function (result) {
      const user = result && result.data && result.data.session
        ? result.data.session.user
        : null;

      if (!user) return false;

      const email = String(user.email || '').trim().toLowerCase();
      return email === TEACHER_EMAIL;
    }).catch(function () {
      return false;
    });
  }

  function addTeacherDashboard() {
    if (document.getElementById('teacher-dashboard-main-link')) return;

    const nav = document.querySelector('.navlinks');
    if (!nav) return;

    const link = document.createElement('a');
    link.id = 'teacher-dashboard-main-link';
    link.href = 'teacher-dashboard.html';
    link.textContent = '👩‍🏫 მასწავლებლის Dashboard';
    link.style.background = 'linear-gradient(135deg,#075eff,#00c9f2)';
    link.style.borderColor = '#00eaff';
    link.style.color = '#fff';
    link.style.fontWeight = '900';
    link.style.boxShadow = '0 0 18px #00eaff44';

    nav.appendChild(link);
  }

  function removeTeacherDashboard() {
    const link = document.getElementById('teacher-dashboard-main-link');
    if (link) link.remove();
  }

  function start() {
    isTeacher().then(function (ok) {
      if (ok) addTeacherDashboard();
      else removeTeacherDashboard();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }

  // config.js initializes Supabase and then dispatches this event.
  window.addEventListener('englishMariamiSupabaseReady', start);
})();
