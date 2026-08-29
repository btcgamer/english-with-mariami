// ============================================================
// TEACHER-ONLY ENTRY POINT
// 3D NEON • GLASS • HOLOGRAPHIC UI
// English with Mariami
// ============================================================

(function () {
  'use strict';

  const TEACHER_ID = 'be4b1c4d-e5f2-4039-b35e-aec3c110a94a';

  const path = location.pathname.toLowerCase();

  // Login/register/reset pages-ზე არ ვამატებთ teacher menu-ს
  if (
    path.endsWith('/login.html') ||
    path.endsWith('/register.html') ||
    path.endsWith('/reset-password.html')
  ) {
    return;
  }

  // ==========================================================
  // INJECT 3D NEON STYLES
  // ==========================================================

  function injectStyles() {

    if (document.getElementById('teacher-neon-3d-style')) {
      return;
    }

    const style = document.createElement('style');

    style.id = 'teacher-neon-3d-style';

    style.textContent = `

      /* ======================================================
         TEACHER 3D MENU
      ====================================================== */

      #teacher-menu-link {

        position: relative;

        display: inline-flex !important;

        align-items: center;

        justify-content: center;

        gap: 8px;

        min-height: 42px;

        padding: 10px 16px !important;

        margin: 3px 4px;

        border-radius: 14px !important;

        overflow: hidden;

        isolation: isolate;

        text-decoration: none !important;

        font-family:
          Arial,
          "Noto Sans Georgian",
          sans-serif;

        font-size: 13px;

        font-weight: 1000 !important;

        letter-spacing: .1px;

        color: #08101f !important;

        background:
          linear-gradient(
            135deg,
            #fff700 0%,
            #ffe600 28%,
            #ffb300 65%,
            #ff8a00 100%
          ) !important;

        border:
          1px solid
          rgba(255,255,255,.65) !important;

        box-shadow:

          0 5px 0 #9a6300,

          0 8px 20px rgba(255,180,0,.25),

          0 0 15px rgba(255,230,0,.35),

          0 0 35px rgba(255,180,0,.15),

          inset 0 1px 1px rgba(255,255,255,.8),

          inset 0 -8px 20px rgba(180,90,0,.12);

        transform:
          perspective(700px)
          translateZ(0)
          rotateX(0deg)
          rotateY(0deg);

        transition:
          transform .28s cubic-bezier(.2,.8,.2,1),
          box-shadow .28s ease,
          filter .28s ease;

        animation:
          teacherPulse3D 3.2s ease-in-out infinite;

        z-index: 5;

      }


      /* ======================================================
         GLASS HIGHLIGHT
      ====================================================== */

      #teacher-menu-link::before {

        content: "";

        position: absolute;

        top: -70%;

        left: -45%;

        width: 35%;

        height: 240%;

        pointer-events: none;

        background:
          linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,.85),
            transparent
          );

        transform: rotate(25deg);

        filter: blur(1px);

        animation:
          teacherShine 4.5s ease-in-out infinite;

        z-index: -1;

      }


      /* ======================================================
         INNER GLOW
      ====================================================== */

      #teacher-menu-link::after {

        content: "";

        position: absolute;

        inset: 1px;

        border-radius: 13px;

        pointer-events: none;

        background:
          linear-gradient(
            180deg,
            rgba(255,255,255,.30),
            transparent 42%,
            rgba(255,145,0,.08)
          );

        box-shadow:
          inset 0 0 12px rgba(255,255,255,.25);

        z-index: -1;

      }


      /* ======================================================
         HOVER 3D
      ====================================================== */

      #teacher-menu-link:hover {

        transform:
          perspective(700px)
          translateY(-4px)
          translateZ(12px)
          rotateX(4deg)
          rotateY(-5deg)
          scale(1.045);

        filter:
          brightness(1.12)
          saturate(1.15);

        box-shadow:

          0 7px 0 #9a6300,

          0 15px 30px rgba(255,180,0,.32),

          0 0 22px rgba(255,230,0,.55),

          0 0 55px rgba(255,180,0,.30),

          inset 0 1px 2px rgba(255,255,255,.95),

          inset 0 -10px 25px rgba(180,90,0,.14);

      }


      /* ======================================================
         ACTIVE / CLICK
      ====================================================== */

      #teacher-menu-link:active {

        transform:
          perspective(700px)
          translateY(2px)
          translateZ(0)
          scale(.97);

        box-shadow:

          0 2px 0 #9a6300,

          0 5px 14px rgba(255,180,0,.25),

          0 0 20px rgba(255,230,0,.30);

      }


      /* ======================================================
         PULSE
      ====================================================== */

      @keyframes teacherPulse3D {

        0%,
        100% {

          box-shadow:

            0 5px 0 #9a6300,

            0 8px 20px rgba(255,180,0,.22),

            0 0 15px rgba(255,230,0,.30),

            0 0 30px rgba(255,180,0,.10),

            inset 0 1px 1px rgba(255,255,255,.8);

        }

        50% {

          box-shadow:

            0 5px 0 #9a6300,

            0 10px 25px rgba(255,180,0,.30),

            0 0 25px rgba(255,230,0,.50),

            0 0 55px rgba(255,180,0,.18),

            inset 0 1px 2px rgba(255,255,255,.9);

        }

      }


      /* ======================================================
         SHINE
      ====================================================== */

      @keyframes teacherShine {

        0% {

          left: -45%;

          opacity: 0;

        }

        15% {

          opacity: 1;

        }

        45% {

          left: 125%;

          opacity: 1;

        }

        55%,
        100% {

          left: 125%;

          opacity: 0;

        }

      }


      /* ======================================================
         HOVER PARTICLE
      ====================================================== */

      #teacher-menu-link .teacher-energy {

        position: absolute;

        width: 4px;

        height: 4px;

        border-radius: 50%;

        background: #fff;

        box-shadow:
          0 0 7px #fff,
          0 0 14px #ffe600,
          0 0 25px #ffb300;

        pointer-events: none;

        opacity: 0;

      }


      #teacher-menu-link:hover .teacher-energy {

        opacity: 1;

        animation:
          teacherParticle 1.6s linear infinite;

      }


      #teacher-menu-link .teacher-energy:nth-child(1) {

        left: 15%;

        bottom: 5px;

        animation-delay: 0s;

      }


      #teacher-menu-link .teacher-energy:nth-child(2) {

        left: 45%;

        bottom: 2px;

        animation-delay: .35s;

      }


      #teacher-menu-link .teacher-energy:nth-child(3) {

        left: 75%;

        bottom: 5px;

        animation-delay: .7s;

      }


      @keyframes teacherParticle {

        0% {

          transform:
            translate3d(0,8px,0)
            scale(.3);

          opacity: 0;

        }

        25% {

          opacity: 1;

        }

        100% {

          transform:
            translate3d(
              8px,
              -28px,
              30px
            )
            scale(1.2);

          opacity: 0;

        }

      }


      /* ======================================================
         MOBILE
      ====================================================== */

      @media(max-width:700px) {

        #teacher-menu-link {

          min-height: 38px;

          padding:
            8px 12px !important;

          border-radius: 12px !important;

          font-size: 11px;

        }

      }


      /* ======================================================
         REDUCED MOTION
      ====================================================== */

      @media(prefers-reduced-motion:reduce) {

        #teacher-menu-link,
        #teacher-menu-link::before,
        #teacher-menu-link .teacher-energy {

          animation: none !important;

          transition: none !important;

        }

      }

    `;

    document.head.appendChild(style);
  }


  // ==========================================================
  // CREATE TEACHER MENU
  // ==========================================================

  function addTeacherMenu() {

    if (
      document.getElementById(
        'teacher-menu-link'
      )
    ) {
      return;
    }


    const client =
      window.supabaseClient;


    if (!client) {

      setTimeout(
        addTeacherMenu,
        150
      );

      return;

    }


    client.auth
      .getSession()

      .then(async function ({ data: { session } }) {

        // ----------------------------------------------------
        // Must be logged in
        // ----------------------------------------------------

        if (
          !session ||
          !session.user ||
          session.user.id !== TEACHER_ID
        ) {

          return;

        }


        // ----------------------------------------------------
        // Verify teacher role
        // ----------------------------------------------------

        const { data: profile } =
          await client
            .from('profiles')
            .select('role')
            .eq(
              'user_id',
              session.user.id
            )
            .maybeSingle();


        if (
          !profile ||
          profile.role !== 'teacher'
        ) {

          return;

        }


        // ----------------------------------------------------
        // Inject CSS
        // ----------------------------------------------------

        injectStyles();


        // ----------------------------------------------------
        // Find navigation
        // ----------------------------------------------------

        const nav =
          document.querySelector(
            '.navlinks'
          );


        // ----------------------------------------------------
        // Create link
        // ----------------------------------------------------

        const link =
          document.createElement('a');


        link.id =
          'teacher-menu-link';


        link.href =
          'teacher-journal.html';


        link.setAttribute(
          'aria-label',
          'მასწავლებლის ჟურნალი'
        );


        link.innerHTML = `

          <span
            style="
              position:relative;
              z-index:5;
            "
          >
            👩‍🏫 ჟურნალი
          </span>

          <i
            class="teacher-energy"
          ></i>

          <i
            class="teacher-energy"
          ></i>

          <i
            class="teacher-energy"
          ></i>

        `;


        // ----------------------------------------------------
        // Add to navigation
        // ----------------------------------------------------

        if (nav) {

          nav.prepend(link);

        } else {

          document.body.appendChild(link);

        }


        // ----------------------------------------------------
        // Small entrance animation
        // ----------------------------------------------------

        link.style.opacity = '0';

        link.style.transform =
          `
          perspective(700px)
          translateY(-12px)
          translateZ(20px)
          rotateX(-8deg)
          scale(.92)
          `;


        requestAnimationFrame(function () {

          setTimeout(function () {

            link.style.opacity = '1';

            link.style.transform =
              `
              perspective(700px)
              translateY(0)
              translateZ(0)
              rotateX(0)
              rotateY(0)
              scale(1)
              `;

          }, 80);

        });


        // ----------------------------------------------------
        // Mouse 3D tilt
        // ----------------------------------------------------

        link.addEventListener(
          'mousemove',
          function (e) {

            if (
              window.innerWidth < 700
            ) {
              return;
            }


            const rect =
              link.getBoundingClientRect();


            const x =
              e.clientX -
              rect.left;


            const y =
              e.clientY -
              rect.top;


            const px =
              x / rect.width -
              .5;


            const py =
              y / rect.height -
              .5;


            const rotateY =
              px * 12;


            const rotateX =
              py * -10;


            link.style.transform =
              `
              perspective(700px)
              translateY(-4px)
              translateZ(12px)
              rotateX(${rotateX}deg)
              rotateY(${rotateY}deg)
              scale(1.045)
              `;

          }
        );


        // ----------------------------------------------------
        // Mouse leave reset
        // ----------------------------------------------------

        link.addEventListener(
          'mouseleave',
          function () {

            link.style.transform =
              `
              perspective(700px)
              translateY(0)
              translateZ(0)
              rotateX(0deg)
              rotateY(0deg)
              scale(1)
              `;

          }
        );

      })

      .catch(function () {

        // Silent fail

      });

  }


  // ==========================================================
  // INITIALIZE
  // ==========================================================

  if (
    document.readyState ===
    'loading'
  ) {

    document.addEventListener(
      'DOMContentLoaded',
      addTeacherMenu
    );

  } else {

    addTeacherMenu();

  }


  // ==========================================================
  // PROTECTION AGAINST DYNAMIC NAV REPLACEMENT
  // ==========================================================

  const observer =
    new MutationObserver(
      function () {

        if (
          !document.getElementById(
            'teacher-menu-link'
          )
        ) {

          addTeacherMenu();

        }

      }
    );


  observer.observe(
    document.documentElement,
    {
      childList: true,
      subtree: true
    }
  );


})();
