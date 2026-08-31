// ============================================================
// English with Mariami — UNIFIED SECURITY GUARD v1.0
// Teacher • Student • Parent • Grade 2/3/4
// Supabase Auth • Role Protection • Grade Protection
// Direct URL Protection • Session Validation • Auto Redirect
// ============================================================

(function () {
  'use strict';

  // ------------------------------------------------------------
  // CONFIG
  // ------------------------------------------------------------

  const path = (location.pathname || '').toLowerCase();

  const CLIENT =
    window.__ENGLISH_MARIAMI_SUPABASE_CLIENT ||
    window.supabaseClient ||
    null;

  const LOGIN_PAGE = 'login.html';
  const TEACHER_LOGIN = 'teacher-login.html';

  // Prevent multiple guards on same page
  if (window.__EWM_SECURITY_GUARD_ACTIVE) {
    return;
  }

  window.__EWM_SECURITY_GUARD_ACTIVE = true;

  // ------------------------------------------------------------
  // PUBLIC PAGES
  // ------------------------------------------------------------

  const PUBLIC_PAGES = [
    'login.html',
    'register.html',
    'reset-password.html',
    'teacher-login.html',
    'index.html',
    ''
  ];

  const currentFile =
    path.split('/').pop() || '';

  if (PUBLIC_PAGES.includes(currentFile)) {
    return;
  }

  if (!CLIENT) {
    console.error(
      'EWM Security Guard: Supabase client not found.'
    );

    redirectToLogin();
    return;
  }

  // ------------------------------------------------------------
  // PAGE TYPE
  // ------------------------------------------------------------

  function getPageType() {

    if (
      /teacher-dashboard\.html$/.test(path) ||
      /teacher-journal\.html$/.test(path)
    ) {
      return 'teacher';
    }

    if (
      /parent-dashboard\.html$/.test(path) ||
      /parent-journal\.html$/.test(path)
    ) {
      return 'parent';
    }

    if (
      /student-dashboard\.html$/.test(path)
    ) {
      return 'student';
    }

    const gradeMatch =
      path.match(/grade([234])\.html$/);

    if (gradeMatch) {
      return 'grade';
    }

    return null;
  }

  const pageType = getPageType();

  // Unknown pages are not blocked by this guard
  if (!pageType) {
    return;
  }

  // ------------------------------------------------------------
  // GRADE DETECTION
  // ------------------------------------------------------------

  function getCurrentGrade() {

    const match =
      path.match(/grade([234])\.html$/);

    if (!match) {
      return null;
    }

    return Number(match[1]);
  }

  const currentGrade =
    getCurrentGrade();

  // ------------------------------------------------------------
  // REDIRECT HELPERS
  // ------------------------------------------------------------

  function redirectToLogin(reason) {

    if (
      location.pathname
        .toLowerCase()
        .endsWith('login.html')
    ) {
      return;
    }

    let url = LOGIN_PAGE;

    if (reason) {
      url +=
        '?reason=' +
        encodeURIComponent(reason);
    }

    window.location.replace(url);
  }

  function redirectToTeacherLogin(reason) {

    if (
      location.pathname
        .toLowerCase()
        .endsWith('teacher-login.html')
    ) {
      return;
    }

    let url = TEACHER_LOGIN;

    if (reason) {
      url +=
        '?reason=' +
        encodeURIComponent(reason);
    }

    window.location.replace(url);
  }

  function redirectToGrade(grade) {

    if (![2, 3, 4].includes(Number(grade))) {
      redirectToLogin('invalid-grade');
      return;
    }

    window.location.replace(
      'grade' + Number(grade) + '.html'
    );
  }

  // ------------------------------------------------------------
  // CLEAR AUTH DATA
  // ------------------------------------------------------------

  function clearAuthStorage() {

    const stores = [];

    try {
      stores.push(localStorage);
    } catch (_) {}

    try {
      stores.push(sessionStorage);
    } catch (_) {}

    stores.forEach(function (store) {

      try {

        const keys = [];

        for (
          let i = 0;
          i < store.length;
          i++
        ) {

          const key = store.key(i);

          if (!key) continue;

          if (
            /^sb-/i.test(key) ||
            /supabase/i.test(key) ||
            /auth-token/i.test(key)
          ) {
            keys.push(key);
          }
        }

        keys.forEach(function (key) {

          try {
            store.removeItem(key);
          } catch (_) {}

        });

      } catch (_) {}

    });
  }

  // ------------------------------------------------------------
  // SECURITY OVERLAY
  // ------------------------------------------------------------

  function showSecurityScreen(message) {

    if (
      document.getElementById(
        'ewm-security-screen'
      )
    ) {
      return;
    }

    const style =
      document.createElement('style');

    style.id =
      'ewm-security-screen-style';

    style.textContent = `
      #ewm-security-screen {
        position: fixed;
        inset: 0;
        z-index: 99999999;

        display: flex;
        align-items: center;
        justify-content: center;

        background:
          radial-gradient(
            circle at center,
            rgba(0,234,255,.08),
            transparent 45%
          ),
          #020914;

        color: white;

        font-family:
          Arial,
          sans-serif;

        text-align: center;
      }

      .ewm-security-box {
        width: min(420px, calc(100% - 32px));
        padding: 32px 22px;

        border-radius: 25px;

        border:
          1px solid
          rgba(0,234,255,.25);

        background:
          linear-gradient(
            145deg,
            #061b31,
            #020a14
          );

        box-shadow:
          0 0 50px
          rgba(0,234,255,.12),
          0 25px 80px
          rgba(0,0,0,.6);
      }

      .ewm-security-icon {
        font-size: 52px;
        margin-bottom: 14px;
      }

      .ewm-security-title {
        font-size: 21px;
        font-weight: 900;
        margin-bottom: 10px;
      }

      .ewm-security-message {
        color: #91a9b8;
        font-size: 13px;
        line-height: 1.6;
      }

      .ewm-security-loader {
        width: 30px;
        height: 30px;

        margin:
          20px auto 0;

        border:
          3px solid
          rgba(255,255,255,.15);

        border-top-color:
          #00eaff;

        border-radius: 50%;

        animation:
          ewmSecuritySpin .7s
          linear infinite;
      }

      @keyframes ewmSecuritySpin {
        to {
          transform: rotate(360deg);
        }
      }
    `;

    document.head.appendChild(style);

    const screen =
      document.createElement('div');

    screen.id =
      'ewm-security-screen';

    screen.innerHTML = `
      <div class="ewm-security-box">

        <div class="ewm-security-icon">
          🔐
        </div>

        <div class="ewm-security-title">
          უსაფრთხოების შემოწმება
        </div>

        <div class="ewm-security-message">
          ${escapeHTML(
            message ||
            'მიმდინარეობს ანგარიშის შემოწმება...'
          )}
        </div>

        <div class="ewm-security-loader"></div>

      </div>
    `;

    document.body.appendChild(screen);
  }

  function escapeHTML(value) {

    return String(value || '')
      .replace(
        /[&<>"']/g,
        function (char) {

          return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
          }[char];

        }
      );
  }

  // ------------------------------------------------------------
  // ROLE NORMALIZATION
  // ------------------------------------------------------------

  function normalizeRole(role) {

    return String(
      role || ''
    )
      .trim()
      .toLowerCase();
  }

  // ------------------------------------------------------------
  // FETCH PROFILE
  // ------------------------------------------------------------

  async function getProfile(userId) {

    const result =
      await CLIENT
        .from('profiles')
        .select(
          'user_id,role,grade'
        )
        .eq(
          'user_id',
          userId
        )
        .maybeSingle();

    if (result.error) {
      throw result.error;
    }

    return result.data;
  }

  // ------------------------------------------------------------
  // AUTHENTICATION CHECK
  // ------------------------------------------------------------

  async function verify() {

    try {

      showSecurityScreen(
        'ვადასტურებთ თქვენს ანგარიშს...'
      );

      // IMPORTANT:
      // getUser() validates with Supabase Auth server.
      const {
        data,
        error
      } =
        await CLIENT.auth.getUser();

      if (
        error ||
        !data ||
        !data.user
      ) {

        clearAuthStorage();

        redirectToLogin(
          'session-expired'
        );

        return;
      }

      const user =
        data.user;

      // --------------------------------------------------------
      // PROFILE
      // --------------------------------------------------------

      const profile =
        await getProfile(
          user.id
        );

      if (!profile) {

        console.warn(
          'EWM Security Guard: profile not found.'
        );

        redirectToLogin(
          'profile-not-found'
        );

        return;
      }

      const role =
        normalizeRole(
          profile.role
        );

      const grade =
        Number(
          profile.grade || 0
        );

      // --------------------------------------------------------
      // TEACHER PAGE
      // --------------------------------------------------------

      if (pageType === 'teacher') {

        if (role !== 'teacher') {

          redirectByRole(
            role,
            grade
          );

          return;
        }

        allowPage(
          user,
          profile
        );

        return;
      }

      // --------------------------------------------------------
      // PARENT PAGE
      // --------------------------------------------------------

      if (pageType === 'parent') {

        if (role !== 'parent') {

          redirectByRole(
            role,
            grade
          );

          return;
        }

        allowPage(
          user,
          profile
        );

        return;
      }

      // --------------------------------------------------------
      // STUDENT DASHBOARD
      // --------------------------------------------------------

      if (pageType === 'student') {

        if (role !== 'student') {

          redirectByRole(
            role,
            grade
          );

          return;
        }

        allowPage(
          user,
          profile
        );

        return;
      }

      // --------------------------------------------------------
      // GRADE 2 / 3 / 4
      // --------------------------------------------------------

      if (pageType === 'grade') {

        // Only students can open student grades
        if (role === 'student') {

          if (
            ![2, 3, 4].includes(
              grade
            )
          ) {

            redirectToLogin(
              'invalid-grade'
            );

            return;
          }

          // Student opened old/wrong grade
          if (
            grade !== currentGrade
          ) {

            redirectToGrade(
              grade
            );

            return;
          }

          allowPage(
            user,
            profile
          );

          return;
        }

        // Teacher and parent may preview grades
        if (
          role === 'teacher' ||
          role === 'parent'
        ) {

          allowPage(
            user,
            profile
          );

          return;
        }

        redirectToLogin(
          'unauthorized'
        );

        return;
      }

      // Unknown
      redirectToLogin(
        'unauthorized'
      );

    } catch (error) {

      console.error(
        'EWM Security Guard error:',
        error
      );

      redirectToLogin(
        'security-error'
      );
    }
  }

  // ------------------------------------------------------------
  // ROLE REDIRECT
  // ------------------------------------------------------------

  function redirectByRole(
    role,
    grade
  ) {

    if (role === 'teacher') {

      window.location.replace(
        'teacher-dashboard.html'
      );

      return;
    }

    if (role === 'parent') {

      window.location.replace(
        'parent-dashboard.html'
      );

      return;
    }

    if (role === 'student') {

      if (
        [2, 3, 4].includes(
          Number(grade)
        )
      ) {

        window.location.replace(
          'grade' +
          Number(grade) +
          '.html'
        );

      } else {

        window.location.replace(
          'student-dashboard.html'
        );

      }

      return;
    }

    redirectToLogin(
      'unauthorized'
    );
  }

  // ------------------------------------------------------------
  // ALLOW PAGE
  // ------------------------------------------------------------

  function allowPage(
    user,
    profile
  ) {

    window.__EWM_AUTHORIZED_USER =
      user;

    window.__EWM_AUTHORIZED_PROFILE =
      profile;

    window.__EWM_AUTHORIZED_ROLE =
      normalizeRole(
        profile.role
      );

    window.__EWM_AUTHORIZED_GRADE =
      Number(
        profile.grade || 0
      );

    const screen =
      document.getElementById(
        'ewm-security-screen'
      );

    if (screen) {
      screen.remove();
    }

    document.documentElement
      .setAttribute(
        'data-ewm-auth',
        'verified'
      );

    document.documentElement
      .setAttribute(
        'data-ewm-role',
        normalizeRole(
          profile.role
        )
      );
  }

  // ------------------------------------------------------------
  // AUTH STATE MONITOR
  // ------------------------------------------------------------

  function watchAuth() {

    try {

      CLIENT.auth.onAuthStateChange(
        function (event) {

          if (
            event === 'SIGNED_OUT'
          ) {

            clearAuthStorage();

            redirectToLogin(
              'signed-out'
            );

            return;
          }

          if (
            event === 'TOKEN_REFRESHED'
          ) {

            // Session remains valid.
            return;
          }

          if (
            event === 'USER_DELETED'
          ) {

            clearAuthStorage();

            redirectToLogin(
              'account-removed'
            );
          }

        }
      );

    } catch (error) {

      console.warn(
        'EWM auth listener error:',
        error
      );
    }
  }

  // ------------------------------------------------------------
  // TAB / WINDOW VISIBILITY CHECK
  // ------------------------------------------------------------

  function installVisibilityGuard() {

    let checking = false;

    document.addEventListener(
      'visibilitychange',
      async function () {

        if (
          document.visibilityState !==
          'visible'
        ) {
          return;
        }

        if (checking) {
          return;
        }

        checking = true;

        try {

          const {
            data,
            error
          } =
            await CLIENT.auth.getUser();

          if (
            error ||
            !data ||
            !data.user
          ) {

            clearAuthStorage();

            redirectToLogin(
              'session-expired'
            );
          }

        } catch (_) {

        } finally {

          checking = false;

        }
      }
    );
  }

  // ------------------------------------------------------------
  // BACK BUTTON PROTECTION
  // ------------------------------------------------------------

  function installHistoryGuard() {

    try {

      history.pushState(
        null,
        '',
        location.href
      );

      window.addEventListener(
        'popstate',
        function () {

          history.pushState(
            null,
            '',
            location.href
          );

          verify();

        }
      );

    } catch (_) {}
  }

  // ------------------------------------------------------------
  // INITIALIZATION
  // ------------------------------------------------------------

  async function boot() {

    // Add a loading screen before checking auth
    if (
      document.body
    ) {

      showSecurityScreen(
        'უსაფრთხო სესიის შემოწმება...'
      );

    }

    watchAuth();

    installVisibilityGuard();

    installHistoryGuard();

    await verify();
  }

  // ------------------------------------------------------------
  // START
  // ------------------------------------------------------------

  if (
    document.readyState ===
    'loading'
  ) {

    document.addEventListener(
      'DOMContentLoaded',
      boot,
      { once: true }
    );

  } else {

    boot();

  }

  // ------------------------------------------------------------
  // PUBLIC SECURITY API
  // ------------------------------------------------------------

  window.ENGLISH_MARIAMI_SECURITY = {

    verify: verify,

    getUser: function () {
      return (
        window.__EWM_AUTHORIZED_USER ||
        null
      );
    },

    getProfile: function () {
      return (
        window.__EWM_AUTHORIZED_PROFILE ||
        null
      );
    },

    getRole: function () {
      return (
        window.__EWM_AUTHORIZED_ROLE ||
        null
      );
    },

    getGrade: function () {
      return (
        window.__EWM_AUTHORIZED_GRADE ||
        null
      );
    }

  };

})();
