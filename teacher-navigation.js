// English with Mariami — teacher dashboard navigation + attendance quick controls
(function () {
  'use strict';

  const TEACHER_EMAIL = 'razmadzemariam45@gmail.com';
  const path = location.pathname.toLowerCase();
  const isAcademy = /\/academy\.html(?:$|\?)/.test(path);
  const isTeacherDashboard = /\/teacher-dashboard\.html(?:$|\?)/.test(path);

  // Teacher Dashboard link is shown only on the Academy page and only to the teacher.
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
    if (!isAcademy) return;
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

  function installAttendanceQuickControls() {
    if (!isTeacherDashboard) return;
    if (document.getElementById('teacher-attendance-quick')) return;

    const lessonBox = document.querySelector('#lesson .lesson-box');
    if (!lessonBox) return;

    const actions = lessonBox.querySelector('.actions');
    if (!actions) return;

    const box = document.createElement('div');
    box.id = 'teacher-attendance-quick';
    box.style.cssText = 'margin-top:18px;padding:16px;border-radius:16px;background:#061b30;border:1px solid #00eaff33;';
    box.innerHTML = `
      <div style="font-weight:900;color:#ffe600;margin-bottom:10px">🧑‍🎓 მოსწავლის დასწრება</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button type="button" data-quick-status="present" style="border:0;border-radius:11px;padding:10px 13px;font-weight:900;background:#18c878;color:#00180d;cursor:pointer">✅ მოსვლა</button>
        <button type="button" data-quick-status="late" style="border:0;border-radius:11px;padding:10px 13px;font-weight:900;background:#d99b00;color:#171000;cursor:pointer">⏰ დაგვიანება</button>
        <button type="button" data-quick-status="absent" style="border:0;border-radius:11px;padding:10px 13px;font-weight:900;background:#d9364f;color:#fff;cursor:pointer">❌ გაცდენა</button>
        <button type="button" data-quick-departure="1" style="border:0;border-radius:11px;padding:10px 13px;font-weight:900;background:#008fc2;color:#fff;cursor:pointer">🚪 წასვლა</button>
      </div>
      <div id="teacher-attendance-quick-status" style="margin-top:10px;font-size:13px;color:#9dc7d5">ჯერ აირჩიე გაკვეთილი.</div>
    `;
    lessonBox.appendChild(box);

    box.querySelectorAll('[data-quick-status]').forEach(function (button) {
      button.addEventListener('click', function () {
        const realButton = document.querySelector('#attendanceList [data-status="' + button.dataset.quickStatus + '"]');
        if (realButton) {
          realButton.click();
          return;
        }
        const status = document.getElementById('teacher-attendance-quick-status');
        if (status) status.textContent = '⚠️ ჯერ აირჩიე და მოძებნე გაკვეთილი.';
      });
    });

    const departure = box.querySelector('[data-quick-departure]');
    departure.addEventListener('click', function () {
      const realButton = document.querySelector('#attendanceList [data-departure="1"]');
      if (realButton) {
        realButton.click();
        return;
      }
      const status = document.getElementById('teacher-attendance-quick-status');
      if (status) status.textContent = '⚠️ ჯერ აირჩიე და მოძებნე გაკვეთილი.';
    });

    // Keep the quick controls visible and give a clear hint until a schedule is selected.
    const observer = new MutationObserver(function () {
      const status = document.getElementById('teacher-attendance-quick-status');
      if (!status) return;
      const attendanceButtons = document.querySelectorAll('#attendanceList [data-status]');
      const hasSchedule = !!document.querySelector('#attendanceList .student-card');
      status.textContent = hasSchedule
        ? 'აირჩიე მოსვლა, დაგვიანება, გაცდენა ან წასვლა.'
        : 'აირჩიე კლასი, მოსწავლე, თარიღი და მოძებნე გაკვეთილი.';
      box.querySelectorAll('button').forEach(function (b) {
        b.style.opacity = hasSchedule ? '1' : '.55';
      });
    });
    const attendanceList = document.getElementById('attendanceList');
    if (attendanceList) observer.observe(attendanceList, { childList: true, subtree: true });
  }

  function start() {
    if (isTeacherDashboard) {
      installAttendanceQuickControls();
      return;
    }

    if (!isAcademy) return;

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

  window.addEventListener('englishMariamiSupabaseReady', start);
})();
