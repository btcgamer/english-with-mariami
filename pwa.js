/* English with Mariami — safe PWA/app shell bootstrap */
(function(){
  'use strict';

  var standalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
  var iosStandalone = window.navigator.standalone === true;
  document.documentElement.classList.toggle('is-pwa', !!(standalone || iosStandalone));

  /* Keep installed app navigation inside the app shell whenever possible. */
  document.addEventListener('click', function(e){
    var link = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!link || !standalone) return;
    var href = link.getAttribute('href');
    if (!href || href.charAt(0) === '#' || link.target === '_blank' || link.hasAttribute('download')) return;
    try {
      var url = new URL(href, location.href);
      if (url.origin !== location.origin) return;
      link.target = '_self';
    } catch (_) {}
  }, {passive:true});

  /* Prevent accidental double-tap zoom on app controls without disabling page zoom. */
  var lastTouch = 0;
  document.addEventListener('touchend', function(e){
    var now = Date.now();
    if (now - lastTouch < 280 && e.target && e.target.closest && e.target.closest('button,a')) e.preventDefault();
    lastTouch = now;
  }, {passive:false});

  /* Register/update the existing service worker. */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function(){
      navigator.serviceWorker.register('/sw.js', {scope:'/'}).then(function(reg){ if (reg.update) reg.update(); }).catch(function(err){ console.warn('[PWA] Service Worker unavailable:', err); });
    }, {once:true});
  }

  /* Chrome/Edge install prompt: only show after the browser says installation is available. */
  var deferredPrompt = null;
  var installButton = null;

  function isGrade4(){ return /(^|\/)grade4(?:\/|$)/i.test(location.pathname); }

  function createInstallUI(){
    if (!isGrade4() || installButton || standalone || iosStandalone) return;
    var wrap = document.createElement('div');
    wrap.id = 'g4-install-app';
    wrap.style.cssText = 'position:fixed;left:16px;right:16px;bottom:calc(16px + env(safe-area-inset-bottom));z-index:99999;display:flex;justify-content:center;pointer-events:none;';
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = '📱 INSTALL GRADE 4 APP';
    btn.setAttribute('aria-label','Install English with Mariami Grade 4 as an app');
    btn.style.cssText = 'pointer-events:auto;border:1px solid rgba(125,211,252,.65);border-radius:999px;padding:13px 20px;font:700 14px/1 system-ui,sans-serif;letter-spacing:.04em;color:#e0f2fe;background:rgba(2,8,23,.94);box-shadow:0 8px 30px rgba(0,0,0,.35),0 0 24px rgba(56,189,248,.25);backdrop-filter:blur(12px);cursor:pointer;';
    btn.addEventListener('click', function(){
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function(){ deferredPrompt = null; hideInstallUI(); }).catch(function(){ deferredPrompt = null; });
    });
    wrap.appendChild(btn);
    document.body.appendChild(wrap);
    installButton = wrap;
  }

  function showInstallUI(){ if (!installButton) createInstallUI(); if (installButton) installButton.style.display='flex'; }
  function hideInstallUI(){ if (installButton) installButton.style.display='none'; }

  window.addEventListener('beforeinstallprompt', function(e){
    if (!isGrade4() || standalone || iosStandalone) return;
    e.preventDefault();
    deferredPrompt = e;
    showInstallUI();
  });

  window.addEventListener('appinstalled', function(){ deferredPrompt = null; hideInstallUI(); });
})();
