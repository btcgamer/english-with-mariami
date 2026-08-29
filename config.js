// English with Mariami — Supabase configuration
const SUPABASE_URL = 'https://vtdhvsfqhwesxtwmduew.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_MnrM2ulyJY_ugwfFVfpQYA_iV5wjCmt';

(function () {
  'use strict';

  const path = location.pathname.toLowerCase();

  const publicPages = [
    '/login.html',
    '/register.html',
    '/reset-password.html',
    '/teacher-login.html'
  ];

  const isPublic = publicPages.some(page => path.endsWith(page));
  const isTeacherDashboard = path.endsWith('/teacher-dashboard.html');

  /* =========================================================
     LOGIN LAYOUT FIX
  ========================================================= */

  function installLoginLayoutFix() {
    if (!path.endsWith('/login.html')) return;

    const install = () => {
      if (document.getElementById('englishMariamiLoginLayoutFix')) return;

      const style = document.createElement('style');

      style.id = 'englishMariamiLoginLayoutFix';

      style.textContent = `
        .login-card .links{
          margin-top:10px!important;
        }

        .login-card #message{
          margin-top:9px!important;
          min-height:20px;
        }

        .login-card .links:last-of-type{
          margin-top:6px!important;
        }
      `;

      document.head.appendChild(style);
    };

    if (document.readyState === 'loading') {
      document.addEventListener(
        'DOMContentLoaded',
        install,
        { once: true }
      );
    } else {
      install();
    }
  }

  /* =========================================================
     MOBILE LOGIN / REGISTER FIT
  ========================================================= */

  function installMobileAuthFit() {
    if (
      !path.endsWith('/login.html') &&
      !path.endsWith('/register.html')
    ) {
      return;
    }

    const install = () => {
      if (
        document.getElementById(
          'englishMariamiMobileAuthFit'
        )
      ) {
        return;
      }

      const style = document.createElement('style');

      style.id = 'englishMariamiMobileAuthFit';

      style.textContent = `
        html,
        body{
          width:100%;
          min-height:100%;
        }

        @media (max-width:600px) and (max-height:850px){

          body{
            min-height:100dvh;
            height:100dvh;
            padding:8px;
            overflow:hidden;
          }

          .register-card,
          .login-card{
            width:min(500px,100%);
            max-height:calc(100dvh - 16px);
            overflow:hidden;
            padding:18px 18px;
            border-radius:24px;
          }

          /* REGISTER */

          .register-card h1{
            font-size:27px;
            margin:0 0 4px;
            line-height:1.1;
          }

          .register-card .subtitle{
            margin:4px 0 10px;
            font-size:14px;
          }

          .register-card .field{
            margin:8px 0;
          }

          .register-card label{
            margin-bottom:5px;
            font-size:14px;
          }

          .register-card input{
            height:44px;
            font-size:15px;
            border-radius:12px;
          }

          .register-card .register-button{
            height:47px;
            margin-top:4px;
            border-radius:13px;
            font-size:16px;
          }

          .register-card .message{
            min-height:18px;
            margin-top:7px;
            font-size:13px;
            line-height:1.25;
          }

          .register-card .login{
            margin-top:8px;
            font-size:14px;
          }

          .register-card .brand{
            margin-top:8px;
            font-size:16px;
          }

          .register-card .site-copyright{
            margin-top:9px;
            padding:8px 3px;
            font-size:11px;
            line-height:1.25;
          }

          /* LOGIN */

          .login-card{
            padding:17px 18px;
          }

          .login-card .logo{
            font-size:38px;
            margin-bottom:3px;
          }

          .login-card .brand{
            font-size:19px;
            line-height:1.1;
          }

          .login-card .subtitle{
            margin:4px 0 8px;
            font-size:13px;
          }

          .login-card h1{
            font-size:24px;
            margin:4px 0;
            line-height:1.1;
          }

          .login-card p{
            margin:5px 0;
            font-size:13px;
            line-height:1.25;
          }

          .login-card .form-group{
            margin:8px 0;
          }

          .login-card .form-group label{
            margin-bottom:5px;
            font-size:14px;
          }

          .login-card .form-group input{
            height:44px;
            font-size:15px;
            border-radius:12px;
          }

          .login-card .login-button{
            height:47px;
            margin-top:4px;
            border-radius:13px;
            font-size:16px;
          }

          .login-card .links{
            margin-top:5px!important;
          }

          .login-card .links a{
            margin:2px;
            padding:7px 9px;
            font-size:12px;
            border-radius:10px;
          }

          .login-card #message{
            margin-top:5px!important;
            min-height:17px;
            font-size:12px;
            line-height:1.2;
          }

          .login-card .site-copyright{
            margin-top:8px;
            padding:7px 3px;
            font-size:10px;
            line-height:1.2;
          }
        }

        @media (max-width:600px) and (max-height:620px){

          .register-card,
          .login-card{
            padding:12px 15px;
            border-radius:20px;
          }

          .register-card h1{
            font-size:24px;
          }

          .register-card .subtitle{
            font-size:12px;
            margin:2px 0 6px;
          }

          .register-card .field{
            margin:5px 0;
          }

          .register-card input,
          .login-card .form-group input{
            height:40px;
          }

          .register-card .register-button,
          .login-card .login-button{
            height:43px;
          }

          .register-card .site-copyright,
          .login-card .site-copyright{
            margin-top:5px;
            padding:5px 2px;
          }

          .login-card .logo{
            font-size:31px;
          }

          .login-card .brand{
            font-size:17px;
          }

          .login-card .subtitle{
            font-size:11px;
            margin:2px 0 5px;
          }

          .login-card h1{
            font-size:21px;
          }

          .login-card p{
            margin:3px 0;
            font-size:11px;
          }

          .login-card .form-group{
            margin:5px 0;
          }

          .login-card .links a{
            padding:5px 7px;
            font-size:11px;
          }
        }
      `;

      document.head.appendChild(style);
    };

    if (document.readyState === 'loading') {
      document.addEventListener(
        'DOMContentLoaded',
        install,
        { once: true }
      );
    } else {
      install();
    }
  }

  /* =========================================================
     HIDE REGISTRATION GRADE
  ========================================================= */

  function hideRegistrationGrade() {
    if (!path.endsWith('/register.html')) return;

    const grade = document.getElementById('grade');

    if (!grade) return;

    grade.required = false;
    grade.value = '0';
    grade.setAttribute('aria-hidden', 'true');

    const field =
      grade.closest('.field') ||
      grade.parentElement;

    if (field) {
      field.style.display = 'none';
    }
  }

  /* =========================================================
     SAFE LOGIN ROUTER
  ========================================================= */

  function installSafeLoginRouter() {
    if (!path.endsWith('/login.html')) return;

    const install = () => {
      const form = document.getElementById('loginForm');

      if (
        !form ||
        form.dataset.safeRouterInstalled === '1'
      ) {
        return;
      }

      form.dataset.safeRouterInstalled = '1';

      form.addEventListener(
        'submit',
        async function (event) {
          event.preventDefault();
          event.stopImmediatePropagation();

          const emailInput =
            document.getElementById('email');

          const passwordInput =
            document.getElementById('password');

          const button =
            document.getElementById('loginButton');

          const message =
            document.getElementById('message');

          const email =
            String(emailInput?.value || '')
              .trim()
              .toLowerCase();

          const password =
            String(passwordInput?.value || '');

          const client =
            window.__ENGLISH_MARIAMI_SUPABASE_CLIENT ||
            window.supabaseClient;

          if (!client || !email || !password) {
            return;
          }

          if (button) {
            button.disabled = true;
            button.textContent = '⏳ შესვლა...';
          }

          if (message) {
            message.className = 'message';
            message.textContent = '';
          }

          try {
            /* LOGIN */

            const {
              data,
              error
            } = await client.auth.signInWithPassword({
              email,
              password
            });

            if (error) {
              throw error;
            }

            if (
              !data?.session ||
              !data?.user
            ) {
              throw new Error(
                'სესია ვერ შეიქმნა.'
              );
            }

            const user = data.user;

            /* PROFILE */

            const {
              data: profile,
              error: profileError
            } = await client
              .from('profiles')
              .select('role,grade')
              .eq('user_id', user.id)
              .maybeSingle();

            if (profileError) {
              throw profileError;
            }

            const role =
              String(
                profile?.role || ''
              )
                .trim()
                .toLowerCase();

            const grade =
              Number(
                profile?.grade || 0
              );

            /* TEACHER */

            const isTeacher =
              role === 'teacher' ||
              user.id ===
                'be4b1c4d-e5f2-4039-b35e-aec3c110a94a' ||
              email ===
                'razmadzemariam45@gmail.com';

            if (isTeacher) {
              if (message) {
                message.className =
                  'message success';

                message.textContent =
                  '✅ შესვლა წარმატებულია! იხსნება მასწავლებლის სივრცე...';
              }

              setTimeout(() => {
                location.replace(
                  'teacher-dashboard.html'
                );
              }, 300);

              return;
            }

            /* PARENT */

            if (role === 'parent') {
              if (message) {
                message.className =
                  'message success';

                message.textContent =
                  '👨‍👩‍👧 იხსნება სასწავლო აკადემია...';
              }

              setTimeout(() => {
                location.replace(
                  'academy.html'
                );
              }, 300);

              return;
            }

            /* STUDENT */

            if (
              role === 'student' &&
              [2, 3, 4].includes(grade)
            ) {
              if (message) {
                message.className =
                  'message success';

                message.textContent =
                  '✅ შესვლა წარმატებულია! იხსნება მე-' +
                  grade +
                  ' კლასის სივრცე...';
              }

              setTimeout(() => {
                location.replace(
                  'grade' +
                  grade +
                  '.html'
                );
              }, 300);

              return;
            }

            /* NO CLASS */

            if (message) {
              message.className =
                'message error';

              message.textContent =
                '⚠️ თქვენი ანგარიში ჯერ არ არის მიბმული კლასზე. გთხოვთ, დაუკავშირდეთ მასწავლებელს.';
            }

            try {
              await client.auth.signOut();
            } catch (_) {}

          } catch (error) {

            console.error(
              'Safe login error:',
              error
            );

            if (message) {
              message.className =
                'message error';

              const text =
                String(
                  error?.message || ''
                );

              if (
                /invalid login credentials/i
                  .test(text)
              ) {
                message.textContent =
                  '❌ ელფოსტა ან პაროლი არასწორია.';
              } else {
                message.textContent =
                  '❌ ' +
                  (
                    text ||
                    'შესვლა ვერ მოხერხდა.'
                  );
              }
            }

          } finally {

            if (button) {
              button.disabled = false;
              button.textContent =
                '🚀 შესვლა';
            }
          }
        },
        true
      );
    };

    if (document.readyState === 'loading') {
      document.addEventListener(
        'DOMContentLoaded',
        install,
        { once: true }
      );
    } else {
      install();
    }
  }

  /* =========================================================
     CLEAN GRADE NAVIGATION
  ========================================================= */

  function cleanGradeNavigation() {
    if (!/\/grade[34]\.html$/.test(path)) {
      return;
    }

    const removeMainLinks = () => {
      document
        .querySelectorAll(
          '.nav-links a[href="index.html"], ' +
          '.navlinks a[href="index.html"]'
        )
        .forEach(a => a.remove());
    };

    if (document.readyState === 'loading') {
      document.addEventListener(
        'DOMContentLoaded',
        removeMainLinks,
        { once: true }
      );
    } else {
      removeMainLinks();
    }

    const observer =
      new MutationObserver(
        removeMainLinks
      );

    observer.observe(
      document.documentElement,
      {
        childList: true,
        subtree: true
      }
    );

    setTimeout(
      () => observer.disconnect(),
      10000
    );
  }

  /* =========================================================
     INITIAL PAGE FIXES
  ========================================================= */

  installLoginLayoutFix();
  installMobileAuthFit();

  if (path.endsWith('/register.html')) {
    if (document.readyState === 'loading') {
      document.addEventListener(
        'DOMContentLoaded',
        hideRegistrationGrade,
        { once: true }
      );
    } else {
      hideRegistrationGrade();
    }
  }

  cleanGradeNavigation();
  installSafeLoginRouter();

  /* =========================================================
     GRADE 2 QUIZ FIX
  ========================================================= */

  if (path.endsWith('/grade2.html')) {

    const quizScript =
      document.createElement('script');

    quizScript.src =
      'grade2-quiz-fix.js?v=20260829-4';

    quizScript.defer = true;

    document.head.appendChild(
      quizScript
    );
  }

  /* =========================================================
     LOAD AFTER SUPABASE
  ========================================================= */

  function loadAfterSupabase() {

    const add = (src) => {

      const script =
        document.createElement('script');

      script.src = src;
      script.defer = true;

      document.head.appendChild(
        script
      );
    };

    /* PRIVATE PAGES */

    if (!isPublic) {

      add(
        'session-guard.js?v=20260829-8'
      );

      add(
        'grade-access.js?v=20260829-8'
      );

      add(
        'logout.js?v=20260829-5'
      );

      if (!isTeacherDashboard) {
        add(
          'teacher-navigation.js?v=20260829-6'
        );
      }

      if (path.endsWith('/grade3.html')) {
        add(
          'grade3-progress.js?v=20260829-2'
        );
      }

      if (
        path.endsWith(
          '/teacher-dashboard.html'
        )
      ) {
        add(
          'teacher-dashboard.js?v=20260829-1'
        );
      }
    }

    /* =======================================================
       ACADEMY VISUAL
    ======================================================= */

    if (path.endsWith('/academy.html')) {

      const style =
        document.createElement('style');

      style.textContent = `
        .neon-world{
          background:
            #010713
            url('academy-bg.svg')
            center/cover
            no-repeat!important;

          background-attachment:
            fixed!important;
        }

        .neon-world:after{
          content:"";
          position:absolute;
          inset:0;

          background:
            radial-gradient(
              circle at 50% 45%,
              transparent 15%,
              rgba(0,20,55,.12) 48%,
              rgba(0,4,15,.72) 100%
            ),
            linear-gradient(
              180deg,
              rgba(0,234,255,.08),
              rgba(0,0,20,.35)
            );

          pointer-events:none;

          animation:
            academyPulse
            6s
            ease-in-out
            infinite;
        }

        .neon-world .grid-floor{
          opacity:.3!important;
          mix-blend-mode:screen;
        }

        .neon-world .letter{
          z-index:3;

          filter:
            drop-shadow(
              0 0 12px #00eaff
            )
            drop-shadow(
              0 18px 18px
              rgba(0,30,80,.75)
            );
        }

        @keyframes academyPulse{
          0%,100%{
            opacity:.72;
          }

          50%{
            opacity:1;
          }
        }

        @media(max-width:850px){

          .neon-world{
            background-position:
              center top!important;
          }
        }
      `;

      document.head.appendChild(
        style
      );

      const visual =
        document.createElement('script');

      visual.src =
        'academy-visual.js?v=20260829-4';

      visual.defer = true;

      document.head.appendChild(
        visual
      );
    }
  }

  /* =========================================================
     SUPABASE INITIALIZATION
  ========================================================= */

  function init() {

    if (
      window.__ENGLISH_MARIAMI_SUPABASE_LOADING_DONE
    ) {
      return;
    }

    if (
      !window.supabase ||
      typeof window.supabase.createClient !==
        'function'
    ) {
      return;
    }

    window.__ENGLISH_MARIAMI_SUPABASE_LOADING_DONE =
      true;

    const supabaseClient =
      window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY,
        {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
          }
        }
      );

    window.__ENGLISH_MARIAMI_SUPABASE_CLIENT =
      supabaseClient;

    window.supabaseClient =
      supabaseClient;

    try {

      window.dispatchEvent(
        new CustomEvent(
          'englishMariamiSupabaseReady'
        )
      );

    } catch (_) {}

    loadAfterSupabase();
  }

  /* =========================================================
     LOAD SUPABASE LIBRARY
  ========================================================= */

  if (
    window.supabase &&
    typeof window.supabase.createClient ===
      'function'
  ) {

    init();

  } else {

    const existing =
      document.querySelector(
        'script[data-english-mariami-supabase]'
      );

    if (existing) {

      existing.addEventListener(
        'load',
        init,
        { once: true }
      );

    } else {

      const script =
        document.createElement('script');

      script.src =
        'https://cdn.jsdelivr.net/npm/@Supabase/supabase-js@2';

      script.dataset
        .englishMariamiSupabase =
        '1';

      script.onload = init;

      script.onerror = () => {
        console.error(
          'Supabase JS failed to load; page remains visible.'
        );
      };

      document.head.appendChild(
        script
      );
    }
  }

})();
