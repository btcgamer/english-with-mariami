// English with Mariami — shared navigation + secure student classroom bridge
(function () {
  'use strict';

  const path = location.pathname.toLowerCase();
  const isAcademy = /\/academy\.html(?:$|\?)/.test(path);
  const isTeacherDashboard = /\/teacher-dashboard\.html(?:$|\?)/.test(path);
  const gradeMatch = path.match(/\/grade([234])\.html(?:$|\?)/);
  const pageGrade = gradeMatch ? Number(gradeMatch[1]) : 0;

  function getClient() {
    return window.__ENGLISH_MARIAMI_SUPABASE_CLIENT || window.supabaseClient || null;
  }

  function getSession() {
    const client = getClient();
    if (!client) return Promise.resolve(null);
    return client.auth.getSession().then(function (result) {
      return result && result.data ? result.data.session : null;
    }).catch(function () { return null; });
  }

  function getProfile() {
    const client = getClient();
    return getSession().then(function (session) {
      if (!client || !session || !session.user) return null;
      return client.from('profiles').select('full_name,role,grade').eq('user_id', session.user.id).maybeSingle().then(function (result) {
        if (result.error || !result.data) return null;
        return result.data;
      }).catch(function () { return null; });
    });
  }

  function isTeacher() {
    return getProfile().then(function (profile) {
      return !!profile && String(profile.role || '').trim().toLowerCase() === 'teacher';
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

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>\"']/g, function (c) {
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]);
    });
  }

  function injectStudentStyles() {
    if (document.getElementById('student-teacher-bridge-style')) return;
    const style = document.createElement('style');
    style.id = 'student-teacher-bridge-style';
    style.textContent = `
      #student-teacher-bridge{margin:18px 0;padding:20px;border:1px solid #00eaff66;border-radius:22px;background:linear-gradient(145deg,#041a31ee,#020b19ee);box-shadow:0 18px 55px #0009,0 0 30px #00eaff22;color:#fff}
      #student-teacher-bridge h2{margin:0 0 8px;color:#00eaff}
      #student-teacher-bridge .bridge-note{color:#bfe5f0;font-size:13px;margin-bottom:14px}
      .teacher-schedule-card{padding:15px;margin:9px 0;border-radius:15px;background:#061a32;border:1px solid #00eaff22}
      .teacher-schedule-card b{color:#ffe600}
      .teacher-schedule-card small{display:block;color:#9dc7d5;margin-top:6px;line-height:1.5}
      .bridge-empty{padding:14px;border-radius:13px;background:#061a32;color:#9dc7d5;border:1px dashed #00eaff33}
    `;
    document.head.appendChild(style);
  }

  async function installStudentClassroomBridge() {
    if (!pageGrade) return;

    const client = getClient();
    if (!client) return;

    const session = await getSession();
    if (!session || !session.user) {
      window.location.replace('login.html?redirect=' + encodeURIComponent(location.pathname));
      return;
    }

    const profileResult = await client.from('profiles').select('full_name,role,grade').eq('user_id', session.user.id).maybeSingle();
    if (profileResult.error || !profileResult.data) {
      window.location.replace('login.html');
      return;
    }

    const role = String(profileResult.data.role || '').toLowerCase();
    const grade = Number(profileResult.data.grade || 0);

    if (role === 'student' && grade !== pageGrade) {
      if ([2,3,4].includes(grade)) {
        window.location.replace('grade' + grade + '.html');
      } else {
        window.location.replace('login.html');
      }
      return;
    }

    if (role !== 'student' && role !== 'teacher') return;

    injectStudentStyles();

    const bridge = document.createElement('section');
    bridge.id = 'student-teacher-bridge';
    bridge.innerHTML = `
      <h2>👩‍🏫 მასწავლებელთან გავლილი და დაგეგმილი გაკვეთილები</h2>
      <div class="bridge-note">${esc(profileResult.data.full_name || 'მოსწავლე')} • ${pageGrade === 2 ? 'მე-2' : pageGrade === 3 ? 'მე-3' : 'მე-4'} კლასი. აქ გამოჩნდება მასწავლებლის მიერ შენთვის დაგეგმილი გაკვეთილები.</div>
      <div id="teacher-schedule-list"><div class="bridge-empty">⏳ იტვირთება...</div></div>
    `;

    const anchor = document.querySelector('#vocabulary') || document.querySelector('main section') || document.querySelector('main');
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(bridge, anchor);

    const list = document.getElementById('teacher-schedule-list');
    if (!list) return;

    const result = await client
      .from('schedules')
      .select('id,lesson_date,start_time,end_time,subject,notes,status,started_at,finished_at')
      .eq('student_id', session.user.id)
      .order('lesson_date', { ascending: false })
      .order('start_time', { ascending: false })
      .limit(20);

    if (result.error) {
      list.innerHTML = '<div class="bridge-empty">📚 შენი კლასის სასწავლო მასალა ხელმისაწვდომია. დაგეგმილი გაკვეთილები ჯერ არ არის ნაჩვენები.</div>';
      return;
    }

    const rows = result.data || [];
    if (!rows.length) {
      list.innerHTML = '<div class="bridge-empty">📚 ჯერ დაგეგმილი გაკვეთილი არ გაქვს. მასწავლებელთან გაკვეთილის შემდეგ აქ გამოჩნდება დაგეგმილი მასალა.</div>';
      return;
    }

    list.innerHTML = rows.map(function (row) {
      const date = row.lesson_date || '';
      const time = row.start_time ? row.start_time.slice(0,5) + (row.end_time ? '–' + row.end_time.slice(0,5) : '') : '';
      const status = row.status ? ' • ' + row.status : '';
      return `<article class="teacher-schedule-card"><b>📚 ${esc(row.subject || 'ინგლისურის გაკვეთილი')}</b><div>${esc(date)} ${esc(time)}${esc(status)}</div>${row.notes ? `<small>📝 ${esc(row.notes)}</small>` : ''}</article>`;
    }).join('');
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
        if (realButton) realButton.click();
      });
    });

    const departure = box.querySelector('[data-quick-departure]');
    departure.addEventListener('click', function () {
      const realButton = document.querySelector('#attendanceList [data-departure="1"]');
      if (realButton) realButton.click();
    });
  }

  function start() {
    if (isTeacherDashboard) {
      installAttendanceQuickControls();
      return;
    }
    if (isAcademy) {
      isTeacher().then(function (ok) {
        if (ok) addTeacherDashboard(); else removeTeacherDashboard();
      });
    }
    if (pageGrade) installStudentClassroomBridge();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }

  window.addEventListener('englishMariamiSupabaseReady', start);
})();
