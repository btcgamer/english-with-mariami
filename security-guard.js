/* ============================================================
   ENGLISH WITH MARIAMI
   FUTURISTIC GLOBAL SECURITY GUARD v3.0
   ------------------------------------------------------------
   Auth + Role + Grade + Dashboard Protection
   Supabase RLS compatible
   Teacher / Student / Parent
   Automatic Grade Redirect
   Anti-Unauthorized Navigation
   Session Validation
   ============================================================ */

(function () {
  'use strict';

  const CLIENT =
    window.__ENGLISH_MARIAMI_SUPABASE_CLIENT ||
    window.supabaseClient ||
    null;

  if (!CLIENT) {
    console.error(
      'EWM Security Guard: Supabase client not found.'
    );
    return;
  }

  const path = (
    window.location.pathname || ''
  ).toLowerCase();

  const page = path.split('/').pop() || '';

  const LOGIN = 'login.html';
  const TEACHER_LOGIN = 'teacher-login.html';

  const GRADE_PAGES = {
    2: 'grade2.html',
    3: 'grade3.html',
    4: 'grade4.html'
  };

  const ROLE = {
    TEACHER: 'teacher',
    STUDENT: 'student',
    PARENT: 'parent'
  };

  let currentUser = null;
  let currentProfile = null;
  let guardRunning = false;

  /* ==========================================================
     PAGE DETECTION
  ========================================================== */

  function isPublicPage() {
    return [
      'index.html',
      'login.html',
      'register.html',
      'reset-password.html',
      'teacher-login.html'
    ].includes(page);
  }

  function isTeacherPage() {
    return (
      page === 'teacher-dashboard.html' ||
      page === 'teacher-journal.html' ||
      page.startsWith('teacher-')
    );
  }

  function isParentPage() {
    return (
      page === 'parent-dashboard.html' ||
      page === 'parent-journal.html' ||
      page.startsWith('parent-')
    );
  }

  function isStudentPage() {
    return (
      page === 'student-dashboard.html' ||
      /^grade[234]\.html$/.test(page)
    );
  }

  function getGradeFromPage() {
    const match = page.match(/^grade([234])\.html$/);
    return match ? Number(match[1]) : null;
  }

  /* ==========================================================
     SAFE REDIRECT
  ========================================================== */

  function redirect(url) {
    if (!url) return;

    if (
      window.location.pathname.toLowerCase() ===
      '/' + url.toLowerCase()
    ) {
      return;
    }

    window.location.replace(url);
  }

  function loginRedirect() {
    const target =
      page && page !== LOGIN
        ? LOGIN +
          '?redirect=' +
          encodeURIComponent(
            page + window.location.search
          )
        : LOGIN;

    redirect(target);
  }

  function teacherLoginRedirect() {
    redirect(
      TEACHER_LOGIN +
      '?redirect=' +
      encodeURIComponent(
        page + window.location.search
      )
    );
  }

  /* ==========================================================
     LOADING SCREEN
  ========================================================== */

  function injectSecurityUI() {

    if (document.getElementById('ewm-security-style')) {
      return;
    }

    const style = document.createElement('style');

    style.id = 'ewm-security-style';

    style.textContent = `
      #ewm-security-lock {
        position: fixed;
        inset: 0;
        z-index: 9999999;

        display: flex;
        align-items: center;
        justify-content: center;

        background:
          radial-gradient(
            circle at center,
            rgba(0,234,255,.12),
            rgba(1,7,18,.98) 65%
          );

        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);

        color: white;
        font-family: Arial, sans-serif;
      }

      .ewm-security-box {
        width: min(420px, calc(100% - 32px));
        padding: 28px;

        text-align: center;

        border-radius: 24px;

        background:
          linear-gradient(
            145deg,
            rgba(5,27,50,.96),
            rgba(2,11,24,.98)
          );

        border: 1px solid rgba(0,234,255,.3);

        box-shadow:
          0 0 35px rgba(0,234,255,.12),
          0 20px 70px rgba(0,0,0,.55);
      }

      .ewm-security-logo {
        font-size: 48px;
        margin-bottom: 12px;

        animation:
          ewmSecurityPulse 1.8s infinite ease-in-out;
      }

      .ewm-security-title {
        font-size: 21px;
        font-weight: 900;
        margin-bottom: 8px;
      }

      .ewm-security-text {
        color: #8da8b5;
        font-size: 13px;
        line-height: 1.5;
      }

      .ewm-security-spinner {
        width: 34px;
        height: 34px;

        margin: 20px auto 0;

        border:
          3px solid rgba(255,255,255,.12);

        border-top-color: #00eaff;
        border-right-color: #ffe600;

        border-radius: 50%;

        animation:
          ewmSecuritySpin .8s linear infinite;
      }

      @keyframes ewmSecuritySpin {
        to {
          transform: rotate(360deg);
        }
      }

      @keyframes ewmSecurityPulse {
        0%,100% {
          transform: scale(1);
          filter: drop-shadow(
            0 0 4px rgba(0,234,255,.2)
          );
        }

        50% {
          transform: scale(1.08);
          filter: drop-shadow(
            0 0 18px rgba(0,234,255,.6)
          );
        }
      }

      @media(prefers-reduced-motion:reduce) {
        .ewm-security-logo,
        .ewm-security-spinner {
          animation: none !important;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function showLock(message) {

    injectSecurityUI();

    if (document.getElementById('ewm-security-lock')) {
      return;
    }

    const lock = document.createElement('div');

    lock.id = 'ewm-security-lock';

    lock.innerHTML = `
      <div class="ewm-security-box">
        <div class="ewm-security-logo">🛡️</div>

        <div class="ewm-security-title">
          English with Mariami
        </div>

        <div class="ewm-security-text">
          ${escapeHTML(message || 'უსაფრთხოების შემოწმება...')}
        </div>

        <div class="ewm-security-spinner"></div>
      </div>
    `;

    document.body.appendChild(lock);
  }

  function hideLock() {
    document
      .getElementById('ewm-security-lock')
      ?.remove();
  }

  function escapeHTML(value) {
    return String(value ?? '')
      .replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      }[char]));
  }

  /* ==========================================================
     GET CURRENT USER
  ========================================================== */

  async function getUser() {

    try {

      const result =
        await CLIENT.auth.getUser();

      if (result.error || !result.data?.user) {
        return null;
      }

      return result.data.user;

    } catch (error) {

      console.warn(
        'EWM Security: getUser failed',
        error
      );

      return null;
    }
  }

  /* ==========================================================
     GET PROFILE
  ========================================================== */

  async function getProfile(userId) {

    if (!userId) {
      return null;
    }

    try {

      const result =
        await CLIENT
          .from('profiles')
          .select(
            'user_id,full_name,role,grade,points'
          )
          .eq('user_id', userId)
          .maybeSingle();

      if (result.error) {

        console.warn(
          'EWM Security: profile error',
          result.error
        );

        return null;
      }

      return result.data || null;

    } catch (error) {

      console.warn(
        'EWM Security: profile exception',
        error
      );

      return null;
    }
  }

  /* ==========================================================
     ROLE NORMALIZATION
  ========================================================== */

  function normalizeRole(role) {

    return String(role || '')
      .trim()
      .toLowerCase();
  }

  /* ==========================================================
     DASHBOARD AUTHORIZATION
  ========================================================== */

  function authorizePage(profile) {

    if (!profile) {
      loginRedirect();
      return false;
    }

    const role =
      normalizeRole(profile.role);

    /* --------------------------------------------------------
       TEACHER AREA
    -------------------------------------------------------- */

    if (isTeacherPage()) {

      if (role !== ROLE.TEACHER) {

        if (role === ROLE.STUDENT) {
          redirect(
            GRADE_PAGES[
              Number(profile.grade)
            ] || 'student-dashboard.html'
          );

        } else if (role === ROLE.PARENT) {
          redirect('parent-dashboard.html');

        } else {
          loginRedirect();
        }

        return false;
      }

      return true;
    }

    /* --------------------------------------------------------
       PARENT AREA
    -------------------------------------------------------- */

    if (isParentPage()) {

      if (role !== ROLE.PARENT) {

        if (role === ROLE.TEACHER) {
          redirect('teacher-dashboard.html');

        } else if (role === ROLE.STUDENT) {
          redirect(
            GRADE_PAGES[
              Number(profile.grade)
            ] || 'student-dashboard.html'
          );

        } else {
          loginRedirect();
        }

        return false;
      }

      return true;
    }

    /* --------------------------------------------------------
       STUDENT AREA
    -------------------------------------------------------- */

    if (isStudentPage()) {

      if (role !== ROLE.STUDENT) {

        if (role === ROLE.TEACHER) {
          redirect('teacher-dashboard.html');

        } else if (role === ROLE.PARENT) {
          redirect('parent-dashboard.html');

        } else {
          loginRedirect();
        }

        return false;
      }

      return true;
    }

    return true;
  }

  /* ==========================================================
     GRADE PROTECTION
  ========================================================== */

  function enforceGrade(profile) {

    if (!profile) {
      return false;
    }

    if (
      normalizeRole(profile.role) !==
      ROLE.STUDENT
    ) {
      return true;
    }

    const assignedGrade =
      Number(profile.grade || 0);

    const pageGrade =
      getGradeFromPage();

    if (
      ![2, 3, 4].includes(assignedGrade)
    ) {
      console.warn(
        'EWM Security: invalid student grade.'
      );

      redirect('student-dashboard.html');

      return false;
    }

    if (
      pageGrade &&
      pageGrade !== assignedGrade
    ) {

      console.info(
        `EWM Security: redirect Grade ${pageGrade} → Grade ${assignedGrade}`
      );

      redirect(
        GRADE_PAGES[assignedGrade]
      );

      return false;
    }

    return true;
  }

  /* ==========================================================
     STUDENT DASHBOARD → ASSIGNED GRADE
  ========================================================== */

  function enforceStudentDashboard(profile) {

    if (
      !isStudentPage() ||
      !profile
    ) {
      return true;
    }

    if (
      normalizeRole(profile.role) !==
      ROLE.STUDENT
    ) {
      return true;
    }

    if (
      page === 'student-dashboard.html'
    ) {
      return true;
    }

    return enforceGrade(profile);
  }

  /* ==========================================================
     REALTIME PROFILE CHECK
     ----------------------------------------------------------
     If teacher changes student's grade while page is open,
     the student gets redirected automatically.
  ========================================================== */

  function subscribeToProfileChanges(profile) {

    if (!profile?.user_id) {
      return;
    }

    if (
      normalizeRole(profile.role) !==
      ROLE.STUDENT
    ) {
      return;
    }

    try {

      CLIENT
        .channel(
          'ewm-security-profile-' +
          profile.user_id
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter:
              'user_id=eq.' +
              profile.user_id
          },
          payload => {

            const next =
              payload?.new || {};

            const newGrade =
              Number(next.grade || 0);

            const oldGrade =
              Number(profile.grade || 0);

            const newRole =
              normalizeRole(next.role);

            /* Role changed */

            if (
              newRole !==
              normalizeRole(profile.role)
            ) {

              window.location.reload();
              return;
            }

            /* Grade changed */

            if (
              [2,3,4].includes(newGrade) &&
              newGrade !== oldGrade
            ) {

              console.info(
                'EWM Security: live grade change',
                oldGrade,
                '→',
                newGrade
              );

              redirect(
                GRADE_PAGES[newGrade]
              );
            }
          }
        )
        .subscribe();

    } catch (error) {

      console.warn(
        'EWM Security realtime error:',
        error
      );
    }
  }

  /* ==========================================================
     AUTH STATE MONITOR
  ========================================================== */

  function installAuthListener() {

    CLIENT.auth.onAuthStateChange(
      async (event, session) => {

        if (
          event === 'SIGNED_OUT'
        ) {

          if (!isPublicPage()) {
            loginRedirect();
          }

          return;
        }

        if (
          event === 'SIGNED_IN' ||
          event === 'TOKEN_REFRESHED'
        ) {

          if (!session?.user) {
            return;
          }

          currentUser =
            session.user;

          currentProfile =
            await getProfile(
              session.user.id
            );

          if (
            currentProfile &&
            !authorizePage(
              currentProfile
            )
          ) {
            return;
          }

          if (
            currentProfile
          ) {
            enforceGrade(
              currentProfile
            );
          }
        }
      }
    );
  }

  /* ==========================================================
     INITIAL SECURITY CHECK
  ========================================================== */

  async function runGuard() {

    if (guardRunning) {
      return;
    }

    guardRunning = true;

    if (isPublicPage()) {
      installAuthListener();
      return;
    }

    showLock(
      'ვოწმებთ თქვენს ანგარიშს და წვდომის უფლებებს...'
    );

    try {

      currentUser =
        await getUser();

      if (!currentUser) {

        loginRedirect();
        return;
      }

      currentProfile =
        await getProfile(
          currentUser.id
        );

      if (!currentProfile) {

        console.error(
          'EWM Security: profile not found.'
        );

        loginRedirect();
        return;
      }

      const authorized =
        authorizePage(
          currentProfile
        );

      if (!authorized) {
        return;
      }

      if (
        !enforceStudentDashboard(
          currentProfile
        )
      ) {
        return;
      }

      subscribeToProfileChanges(
        currentProfile
      );

      installAuthListener();

      hideLock();

      document.documentElement
        .setAttribute(
          'data-ewm-authenticated',
          'true'
        );

      document.documentElement
        .setAttribute(
          'data-ewm-role',
          normalizeRole(
            currentProfile.role
          )
        );

      if (
        currentProfile.grade
      ) {
        document.documentElement
          .setAttribute(
            'data-ewm-grade',
            String(
              currentProfile.grade
            )
          );
      }

      window.ENGLISH_MARIAMI_SECURITY = {
        user: currentUser,
        profile: currentProfile,
        role: normalizeRole(
          currentProfile.role
        ),
        grade: Number(
          currentProfile.grade || 0
        ),

        isTeacher:
          normalizeRole(
            currentProfile.role
          ) === ROLE.TEACHER,

        isStudent:
          normalizeRole(
            currentProfile.role
          ) === ROLE.STUDENT,

        isParent:
          normalizeRole(
            currentProfile.role
          ) === ROLE.PARENT
      };

    } catch (error) {

      console.error(
        'EWM Security Guard fatal error:',
        error
      );

      loginRedirect();

    } finally {

      guardRunning = false;
    }
  }

  /* ==========================================================
     START
  ========================================================== */

  function boot() {

    if (!document.body) {
      return;
    }

    runGuard();
  }

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

})();
