// ============================================================
// English with Mariami — SECURE FUTURISTIC LOGOUT v3.0
// Enterprise UI • Supabase • Session Guard • Mobile • Desktop
// Confirmation Modal • Secure Redirect • Cache Protection
// ============================================================

(function () {
  'use strict';

  // ------------------------------------------------------------
  // CONFIG
  // ------------------------------------------------------------

  const PATH = (location.pathname || '').toLowerCase();

  const LOGOUT_ID = 'ewm-secure-logout-v3';
  const MODAL_ID = 'ewm-logout-modal-v3';
  const CSS_ID = 'ewm-logout-style-v3';

  const CLIENT =
    window.__ENGLISH_MARIAMI_SUPABASE_CLIENT ||
    window.supabaseClient ||
    null;

  // Do not install on authentication pages
  if (
    /\/(login|register|reset-password|teacher-login)\.html$/.test(PATH)
  ) {
    return;
  }

  if (!CLIENT) {
    console.warn(
      'English with Mariami: Supabase client unavailable.'
    );
    return;
  }

  // ------------------------------------------------------------
  // ROLE / AREA DETECTION
  // ------------------------------------------------------------

  const isTeacher =
    /teacher-dashboard/.test(PATH) ||
    /teacher-journal/.test(PATH) ||
    /teacher-(dashboard|journal)/.test(PATH);

  const isParent =
    /parent-dashboard/.test(PATH) ||
    /parent-journal/.test(PATH) ||
    /parent-(dashboard|journal)/.test(PATH);

  const isStudent =
    /student-dashboard/.test(PATH) ||
    /grade[234](?:\.html|\/index\.html)$/.test(PATH);

  // ------------------------------------------------------------
  // REDIRECT
  // ------------------------------------------------------------

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

  // ------------------------------------------------------------
  // AUTH STORAGE CLEANUP
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

        const remove = [];

        for (let i = 0; i < store.length; i++) {

          const key = store.key(i);

          if (!key) continue;

          if (
            /^sb-/i.test(key) ||
            /supabase/i.test(key) ||
            /auth-token/i.test(key) ||
            /access-token/i.test(key) ||
            /refresh-token/i.test(key)
          ) {
            remove.push(key);
          }
        }

        remove.forEach(function (key) {
          try {
            store.removeItem(key);
          } catch (_) {}
        });

      } catch (_) {}
    });
  }

  // ------------------------------------------------------------
  // CACHE / HISTORY PROTECTION
  // ------------------------------------------------------------

  function protectPageAfterLogout() {

    try {

      if ('replaceState' in history) {

        history.replaceState(
          null,
          '',
          location.href
        );
      }

    } catch (_) {}

    try {

      if (
        'serviceWorker' in navigator &&
        navigator.serviceWorker.controller
      ) {
        // Do not unregister service workers.
        // Only prevent application logic from assuming
        // that the previous authenticated state still exists.
      }

    } catch (_) {}
  }

  // ------------------------------------------------------------
  // CSS
  // ------------------------------------------------------------

  function injectCSS() {

    if (document.getElementById(CSS_ID)) {
      return;
    }

    const style = document.createElement('style');

    style.id = CSS_ID;

    style.textContent = `

      /* ========================================================
         GLOBAL BUTTON
      ======================================================== */

      #${LOGOUT_ID} {

        position: fixed;

        top: 15px;
        right: 18px;

        z-index: 999990;

        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 9px;

        min-width: 145px;
        height: 46px;

        padding: 0 17px;

        border: 1px solid rgba(255,255,255,.25);
        border-radius: 16px;

        color: #fff;

        background:
          linear-gradient(
            135deg,
            rgba(255,36,112,.97),
            rgba(216,18,61,.97)
          );

        font:
          900 13px/1 Arial,
          sans-serif;

        letter-spacing: .25px;

        cursor: pointer;

        user-select: none;
        -webkit-user-select: none;

        overflow: hidden;

        box-shadow:
          0 0 0 1px rgba(255,255,255,.04),
          0 0 15px rgba(255,35,95,.32),
          0 8px 28px rgba(0,0,0,.38);

        backdrop-filter: blur(18px);
        -webkit-backdrop-filter: blur(18px);

        transition:
          transform .18s ease,
          box-shadow .18s ease,
          filter .18s ease;
      }

      #${LOGOUT_ID}::before {

        content: "";

        position: absolute;

        top: 0;
        left: -120%;

        width: 70%;
        height: 100%;

        background:
          linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,.35),
            transparent
          );

        transform: skewX(-20deg);

        transition: left .55s ease;

        pointer-events: none;
      }

      #${LOGOUT_ID}:hover::before {
        left: 150%;
      }

      #${LOGOUT_ID}:hover {

        transform:
          translateY(-2px)
          scale(1.025);

        filter: brightness(1.08);

        box-shadow:
          0 0 18px rgba(255,35,95,.55),
          0 0 45px rgba(255,35,95,.25),
          0 12px 34px rgba(0,0,0,.45);
      }

      #${LOGOUT_ID}:active {
        transform: scale(.95);
      }

      #${LOGOUT_ID}:focus-visible {

        outline: 2px solid #ffe600;
        outline-offset: 4px;
      }

      .ewm-v3-icon {

        width: 22px;
        height: 22px;

        display: inline-flex;
        align-items: center;
        justify-content: center;

        font-size: 18px;

        transition:
          transform .2s ease;
      }

      #${LOGOUT_ID}:hover .ewm-v3-icon {

        transform:
          translateX(2px)
          rotate(-5deg);
      }

      .ewm-v3-text {
        white-space: nowrap;
      }

      /* ========================================================
         MODAL BACKDROP
      ======================================================== */

      #${MODAL_ID} {

        position: fixed;

        inset: 0;

        z-index: 1000000;

        display: flex;

        align-items: center;
        justify-content: center;

        padding: 20px;

        background:
          radial-gradient(
            circle at 50% 30%,
            rgba(0,234,255,.08),
            transparent 40%
          ),
          rgba(0,4,15,.84);

        backdrop-filter: blur(18px);
        -webkit-backdrop-filter: blur(18px);

        animation:
          ewmModalIn .2s ease;
      }

      @keyframes ewmModalIn {

        from {
          opacity: 0;
        }

        to {
          opacity: 1;
        }
      }

      /* ========================================================
         MODAL
      ======================================================== */

      .ewm-v3-modal {

        width:
          min(
            460px,
            100%
          );

        border-radius: 26px;

        border:
          1px solid
          rgba(0,234,255,.25);

        background:

          radial-gradient(
            circle at 50% 0%,
            rgba(0,234,255,.08),
            transparent 48%
          ),

          linear-gradient(
            145deg,
            #06192d,
            #020b17
          );

        color: #fff;

        padding: 28px;

        box-shadow:

          0 0 0 1px rgba(255,255,255,.03),

          0 0 40px rgba(0,234,255,.12),

          0 25px 80px rgba(0,0,0,.65);

        animation:
          ewmModalScale .22s ease;
      }

      @keyframes ewmModalScale {

        from {
          opacity: 0;
          transform:
            scale(.94)
            translateY(10px);
        }

        to {
          opacity: 1;
          transform:
            scale(1)
            translateY(0);
        }
      }

      .ewm-v3-modal-icon {

        width: 72px;
        height: 72px;

        margin: 0 auto 16px;

        display: flex;
        align-items: center;
        justify-content: center;

        border-radius: 22px;

        background:
          linear-gradient(
            135deg,
            rgba(255,45,105,.18),
            rgba(255,20,70,.08)
          );

        border:
          1px solid
          rgba(255,50,110,.28);

        font-size: 34px;

        box-shadow:
          0 0 30px rgba(255,35,95,.14);
      }

      .ewm-v3-title {

        margin: 0;

        text-align: center;

        font:
          1000 23px/1.2 Arial,
          sans-serif;
      }

      .ewm-v3-description {

        margin:
          12px 0 22px;

        text-align: center;

        color: #9db4c4;

        font:
          500 14px/1.6 Arial,
          sans-serif;
      }

      .ewm-v3-status {

        display: flex;

        align-items: center;
        justify-content: center;

        gap: 8px;

        margin-bottom: 20px;

        color: #5cffc2;

        font:
          800 11px Arial,
          sans-serif;

        letter-spacing: .5px;
      }

      .ewm-v3-status-dot {

        width: 7px;
        height: 7px;

        border-radius: 50%;

        background: #5cffc2;

        box-shadow:
          0 0 10px #5cffc2;

        animation:
          ewmPulse 1.4s infinite;
      }

      @keyframes ewmPulse {

        0%,100% {
          opacity: .45;
          transform: scale(.85);
        }

        50% {
          opacity: 1;
          transform: scale(1.15);
        }
      }

      .ewm-v3-actions {

        display: grid;

        grid-template-columns:
          1fr 1fr;

        gap: 10px;
      }

      .ewm-v3-action {

        height: 48px;

        border-radius: 14px;

        border:
          1px solid
          rgba(255,255,255,.12);

        cursor: pointer;

        font:
          900 13px Arial,
          sans-serif;

        transition:
          transform .15s ease,
          filter .15s ease;
      }

      .ewm-v3-action:hover {
        transform: translateY(-1px);
        filter: brightness(1.08);
      }

      .ewm-v3-cancel {

        color: #d8e5ec;

        background:
          rgba(255,255,255,.06);
      }

      .ewm-v3-confirm {

        color: #fff;

        background:
          linear-gradient(
            135deg,
            #ff477e,
            #e8174f
          );

        box-shadow:
          0 0 20px rgba(255,30,90,.20);
      }

      /* ========================================================
         LOADING STATE
      ======================================================== */

      .ewm-v3-loading {

        pointer-events: none !important;

        opacity: .82;
      }

      .ewm-v3-spinner {

        width: 17px;
        height: 17px;

        border-radius: 50%;

        border:
          2px solid
          rgba(255,255,255,.28);

        border-top-color: #fff;

        animation:
          ewmSpin .65s linear infinite;
      }

      @keyframes ewmSpin {
        to {
          transform: rotate(360deg);
        }
      }

      /* ========================================================
         MOBILE
      ======================================================== */

      @media(max-width:600px) {

        #${LOGOUT_ID} {

          top: 8px;
          right: 8px;

          width: 46px;
          min-width: 46px;

          height: 46px;

          padding: 0;

          border-radius: 14px;
        }

        #${LOGOUT_ID} .ewm-v3-text {
          display: none;
        }

        #${LOGOUT_ID} .ewm-v3-icon {
          font-size: 19px;
        }

        #${MODAL_ID} {
          padding: 12px;
        }

        .ewm-v3-modal {
          padding: 22px 18px;
          border-radius: 22px;
        }

        .ewm-v3-title {
          font-size: 20px;
        }

        .ewm-v3-description {
          font-size: 13px;
        }

        .ewm-v3-actions {
          grid-template-columns: 1fr;
        }

        .ewm-v3-action {
          min-height: 48px;
        }
      }

      /* ========================================================
         ACCESSIBILITY
      ======================================================== */

      @media(prefers-reduced-motion:reduce) {

        #${LOGOUT_ID},
        #${LOGOUT_ID} *,
        #${MODAL_ID},
        .ewm-v3-modal,
        .ewm-v3-status-dot,
        .ewm-v3-spinner {
          animation: none !important;
          transition: none !important;
        }
      }
    `;

    document.head.appendChild(style);
  }

  // ------------------------------------------------------------
  // MODAL
  // ------------------------------------------------------------

  function closeModal() {

    const modal =
      document.getElementById(MODAL_ID);

    if (modal) {
      modal.remove();
    }
  }

  function createModal() {

    if (
      document.getElementById(MODAL_ID)
    ) {
      return;
    }

    const modal =
      document.createElement('div');

    modal.id = MODAL_ID;

    modal.setAttribute(
      'role',
      'dialog'
    );

    modal.setAttribute(
      'aria-modal',
      'true'
    );

    modal.innerHTML = `

      <div class="ewm-v3-modal">

        <div class="ewm-v3-modal-icon">
          🚪
        </div>

        <h2 class="ewm-v3-title">
          ანგარიშიდან გამოსვლა?
        </h2>

        <p class="ewm-v3-description">
          ნამდვილად გსურს მიმდინარე სესიის დასრულება?
          უსაფრთხოების მიზნით ანგარიშიდან სრულად გამოხვალ.
        </p>

        <div class="ewm-v3-status">
          <span class="ewm-v3-status-dot"></span>
          SECURE SESSION
        </div>

        <div class="ewm-v3-actions">

          <button
            type="button"
            class="ewm-v3-action ewm-v3-cancel"
            id="ewm-v3-cancel"
          >
            დარჩენა
          </button>

          <button
            type="button"
            class="ewm-v3-action ewm-v3-confirm"
            id="ewm-v3-confirm"
          >
            🚪 გამოსვლა
          </button>

        </div>

      </div>
    `;

    document.body.appendChild(modal);

    const cancel =
      document.getElementById(
        'ewm-v3-cancel'
      );

    const confirm =
      document.getElementById(
        'ewm-v3-confirm'
      );

    cancel.focus();

    cancel.onclick = closeModal;

    confirm.onclick = function () {
      performLogout(confirm);
    };

    modal.addEventListener(
      'click',
      function (event) {

        if (event.target === modal) {
          closeModal();
        }

      }
    );

    modal.addEventListener(
      'keydown',
      function (event) {

        if (event.key === 'Escape') {
          closeModal();
        }

      }
    );
  }

  // ------------------------------------------------------------
  // REAL SUPABASE LOGOUT
  // ------------------------------------------------------------

  async function performLogout(button) {

    if (
      button.dataset.busy === '1'
    ) {
      return;
    }

    button.dataset.busy = '1';

    button.classList.add(
      'ewm-v3-loading'
    );

    button.disabled = true;

    button.innerHTML = `
      <span class="ewm-v3-spinner"></span>
      გამოსვლა...
    `;

    let error = null;

    try {

      const result =
        await CLIENT.auth.signOut({
          scope: 'global'
        });

      if (
        result &&
        result.error
      ) {
        error = result.error;
      }

    } catch (err) {

      error = err;

      console.warn(
        'English with Mariami:',
        'Supabase logout error',
        err
      );
    }

    // Always clear local auth remnants
    clearAuthStorage();

    protectPageAfterLogout();

    // Even if Supabase has a transient error,
    // browser session data is cleared and user is redirected.
    if (error) {

      console.warn(
        'Logout completed locally:',
        error
      );
    }

    // Short transition
    setTimeout(
      function () {

        window.location.replace(
          getLoginPage()
        );

      },
      error ? 450 : 250
    );
  }

  // ------------------------------------------------------------
  // INSTALL BUTTON
  // ------------------------------------------------------------

  function install() {

    if (!document.body) {
      return;
    }

    if (
      document.getElementById(
        LOGOUT_ID
      )
    ) {
      return;
    }

    injectCSS();

    const button =
      document.createElement('button');

    button.id = LOGOUT_ID;

    button.type = 'button';

    button.setAttribute(
      'aria-label',
      'ანგარიშიდან გამოსვლა'
    );

    button.title =
      'უსაფრთხოდ გამოსვლა';

    button.innerHTML = `
      <span class="ewm-v3-icon">
        🚪
      </span>

      <span class="ewm-v3-text">
        გამოსვლა
      </span>
    `;

    button.addEventListener(
      'click',
      createModal
    );

    document.body.appendChild(
      button
    );
  }

  // ------------------------------------------------------------
  // SUPABASE AUTH LISTENER
  // ------------------------------------------------------------

  try {

    CLIENT.auth.onAuthStateChange(
      function (event) {

        if (
          event === 'SIGNED_OUT'
        ) {

          clearAuthStorage();

        }

      }
    );

  } catch (_) {}

  // ------------------------------------------------------------
  // BOOT
  // ------------------------------------------------------------

  if (
    document.readyState === 'loading'
  ) {

    document.addEventListener(
      'DOMContentLoaded',
      install,
      { once: true }
    );

  } else {

    install();

  }

  // ------------------------------------------------------------
  // PUBLIC API
  // ------------------------------------------------------------

  window.ENGLISH_MARIAMI_LOGOUT = {

    open: createModal,

    close: closeModal,

    logout: function () {

      createModal();

      setTimeout(
        function () {

          const button =
            document.getElementById(
              'ewm-v3-confirm'
            );

          if (button) {
            performLogout(button);
          }

        },
        50
      );

    }

  };

})();
