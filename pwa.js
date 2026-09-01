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

  /* Grade 4 install UI was moved to the Academy hub. */
  var deferredPrompt = null;
  var installButton = null;
  function isGrade4(){ return false; }
  function createInstallUI(){ return; }
  function showInstallUI(){ return; }
  function hideInstallUI(){ if (installButton) installButton.style.display='none'; }
  window.addEventListener('beforeinstallprompt', function(e){ return; });
  window.addEventListener('appinstalled', function(){ deferredPrompt = null; hideInstallUI(); });
})();
