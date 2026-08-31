// =========================================================
// English with Mariami — FUTURISTIC GLOBAL LOGOUT v2.0
// Supabase-safe • Mobile • Desktop • Keyboard • Neon UI
// =========================================================
(function () {
  'use strict';

  const path = (location.pathname || '').toLowerCase();

  // Login/register/reset pages do not need logout button
  if (/\/(login|register|reset-password|teacher-login)\.html$/.test(path)) {
    return;
  }

  const CLIENT =
    window.__ENGLISH_MARIAMI_SUPABASE_CLIENT ||
    window.supabaseClient ||
    null;

  if (!CLIENT) {
    console.warn('English with Mariami: Supabase client not found.');
    return;
  }

  const ID = 'ewm-futuristic-logout';

  // ---------------------------------------------------------
  // Detect current area
  // ---------------------------------------------------------
  const isTeacher =
    /teacher-(dashboard|journal)/.test(path) ||
    /teacher-dashboard/.test(path) ||
    /teacher-journal/.test(path);

  const isParent =
    /parent-(dashboard|journal)/.test(path) ||
    /parent-dashboard/.test(path);

  const isStudent =
    /student-dashboard/.test(path) ||
    /grade[234]\.html$/.test(path);

  // ---------------------------------------------------------
  // Remove old Supabase auth/session keys
  // ---------------------------------------------------------
  function clearAuthStorage() {
    try {
      const stores = [localStorage, sessionStorage];

      stores.forEach(store => {
        const keysToRemove = [];

        for (let i = 0; i < store.length; i++) {
          const key = store.key(i);
          if (!key) continue;

          if (
            /^sb-/i.test(key) ||
            /supabase/i.test(key) ||
            /auth-token/i.test(key)
          ) {
            keysToRemove.push(key);
          }
        }

        keysToRemove.forEach(key => {
          try {
            store.removeItem(key);
          } catch (_) {}
        });
      });
    } catch (_) {}
  }

  // ---------------------------------------------------------
  // Create futuristic CSS
  // ---------------------------------------------------------
  function injectCSS() {
    if (document.getElementById('ewm-logout-css')) return;

    const style = document.createElement('style');
    style.id = 'ewm-logout-css';

    style.textContent = `
      /* =====================================================
         EWM FUTURISTIC LOGOUT
      ===================================================== */

      #${ID} {
        position: fixed;
        top: 14px;
        right: 18px;
        z-index: 999999;

        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;

        min-width: 132px;
        min-height: 44px;

        padding: 10px 16px;

        border: 1px solid rgba(255,255,255,.28);
        border-radius: 15px;

        color: #fff;
        background:
          linear-gradient(
            135deg,
            rgba(255,55,120,.96),
            rgba(255,20,68,.96)
          );

        font:
          900 13px/1 Arial,
          sans-serif;

        letter-spacing: .2px;

        cursor: pointer;
        user-select: none;
        -webkit-user-select: none;

        box-shadow:
          0 0 10px rgba(255,35,90,.28),
          0 0 28px rgba(255,35,90,.18),
          0 10px 30px rgba(0,0,0,.35);

        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);

        transition:
          transform .18s ease,
          box-shadow .18s ease,
          filter .18s ease,
          opacity .18s ease;
      }

      #${ID}::before {
        content: "";
        position: absolute;
        inset: -1px;
        border-radius: inherit;
        padding: 1px;

        background:
          linear-gradient(
            120deg,
            transparent,
            rgba(255,255,255,.55),
            transparent
          );

        -webkit-mask:
          linear-gradient(#000 0 0) content-box,
          linear-gradient(#000 0 0);

        -webkit-mask-composite: xor;
        mask-composite: exclude;

        opacity: .55;
        pointer-events: none;
      }

      #${ID}:hover {
        transform: translateY(-2px) scale(1.025);

        filter: brightness(1.08);

        box-shadow:
          0 0 16px rgba(255,35,90,.55),
          0 0 42px rgba(255,35,90,.30),
          0 14px 35px rgba(0,0,0,.42);
      }

      #${ID}:active {
        transform: scale(.96);
      }

      #${ID}:focus-visible {
        outline: 2px solid #ffe600;
        outline-offset: 3px;
      }

      #${ID}.loading {
        pointer-events: none;
        cursor: wait;

        background:
          linear-gradient(
            135deg,
            #66213b,
            #8d1737
          );

        opacity: .9;
      }

      #${ID}.success {
        background:
          linear-gradient(
            135deg,
            #00b894,
            #00cec9
          );

        box-shadow:
          0 0 20px rgba(0,206,201,.45),
          0 10px 30px rgba(0,0,0,.35);
      }

      #${ID}.error {
        background:
          linear-gradient(
            135deg,
            #8e2430,
            #c0392b
          );
      }

      .ewm-logout-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;

        width: 21px;
        height: 21px;

        font-size: 18px;

        transition: transform .2s ease;
      }

      #${ID}:hover .ewm-logout-icon {
        transform: translateX(2px) rotate(-4deg);
      }

      .ewm-logout-text {
        white-space: nowrap;
      }

      /* Animated loading dots */
      .ewm-loading-dots {
        display: inline-flex;
        gap: 3px;
      }

      .ewm-loading-dots span {
        width: 4px;
        height: 4px;

        border-radius: 50%;
        background: #fff;

        animation: ewmLogoutDot 1s infinite ease-in-out;
      }

      .ewm-loading-dots span:nth-child(2) {
        animation-delay: .15s;
      }

      .ewm-loading-dots span:nth-child(3) {
        animation-delay: .3s;
      }

      @keyframes ewmLogoutDot {
        0%, 60%, 100% {
          transform: translateY(0);
          opacity: .45;
        }

        30% {
          transform: translateY(-4px);
          opacity: 1;
        }
      }

      /* Mobile */
      @media(max-width:600px) {

        #${ID} {
          top: 8px;
          right: 8px;

          min-width: 46px;
          width: 46px;
          height: 46px;

          padding: 0;

          border-radius: 14px;
        }

        .ewm-logout-text {
          display: none;
        }

        .ewm-logout-icon {
          font-size: 19px;
        }
      }

      /* Very small phones */
      @media(max-width:360px) {

        #${ID} {
          top: 7px;
          right: 7px;

          width: 43px;
          height: 43px;
        }
      }

      /* Reduced motion */
      @media(prefers-reduced-motion:reduce) {

        #${ID},
        #${ID}:hover,
        #${ID}:active,
        .ewm-logout-icon,
        .ewm-loading-dots span {
          animation: none !important;
          transition: none !important;
        }
      }
    `;

    document.head.appendChild(style);
  }

  // ---------------------------------------------------------
  // Redirect destination
  // ---------------------------------------------------------
  function getLoginPage() {
    if (isTeacher) {
      return 'teacher-login.html?logout=1';
    }

    if (isParent) {
      return 'login.html?logout=1&role=parent';
    }

    if (isStudent) {
      return 'login.html?logout=1&role=student';
    }

    return 'login.html?logout=1';
  }

  // ---------------------------------------------------------
  // Loading UI
  // ---------------------------------------------------------
  function setLoading(button) {
    button.classList.add('loading');
    button.disabled = true;

    button.innerHTML = `
      <span class="ewm-logout-icon">⏳</span>
      <span class="ewm-logout-text">გამოდის</span>
      <span class="ewm-loading-dots">
        <span></span>
        <span></span>
        <span></span>
      </span>
    `;
  }

  // ---------------------------------------------------------
  // Logout process
  // ---------------------------------------------------------
  async function logout(button) {

    if (button.dataset.busy === '1') return;

    button.dataset.busy = '1';

    setLoading(button);

    let signOutError = null;

    try {

      // Primary Supabase logout
      const result = await CLIENT.auth.signOut({
        scope: 'global'
      });

      if (result && result.error) {
        signOutError = result.error;
      }

    } catch (error) {
      signOutError = error;
      console.warn(
        'English with Mariami logout error:',
        error
      );
    }

    // Always clear browser auth leftovers
    clearAuthStorage();

    // Small success state before redirect
    button.classList.remove('loading');
    button.classList.add(
      signOutError ? 'error' : 'success'
    );

    button.innerHTML = `
      <span class="ewm-logout-icon">
        ${signOutError ? '⚠️' : '✅'}
      </span>
      <span class="ewm-logout-text">
        ${signOutError ? 'გამოსვლა' : 'მზადაა'}
      </span>
    `;

    // Redirect even if Supabase returned an error,
    // because local auth storage has already been cleared.
    setTimeout(() => {
      window.location.replace(getLoginPage());
    }, signOutError ? 350 : 250);
  }

  // ---------------------------------------------------------
  // Install button
  // ---------------------------------------------------------
  function install() {

    if (!document.body) return;
    if (document.getElementById(ID)) return;

    injectCSS();

    const button = document.createElement('button');

    button.id = ID;
    button.type = 'button';

    button.setAttribute(
      'aria-label',
      'ანგარიშიდან გამოსვლა'
    );

    button.title = 'ანგარიშიდან გამოსვლა';

    button.innerHTML = `
      <span class="ewm-logout-icon">🚪</span>
      <span class="ewm-logout-text">გამოსვლა</span>
    `;

    // Mouse / touch / keyboard all use same handler
    button.addEventListener('click', () => {
      logout(button);
    });

    document.body.appendChild(button);
  }

  // ---------------------------------------------------------
  // Boot safely
  // ---------------------------------------------------------
  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      install,
      { once: true }
    );
  } else {
    install();
  }

  // Public API
  window.ENGLISH_MARIAMI_LOGOUT = {
    logout
  };

})();
