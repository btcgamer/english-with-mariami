/* English with Mariami — safe PWA/app shell bootstrap */
(function(){
  'use strict';

  var standalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
  var iosStandalone = window.navigator.standalone === true;
  document.documentElement.classList.toggle('is-pwa', !!(standalone || iosStandalone));

  /* One-time recovery from stale/broken service-worker navigation caches. */
  var RESET_KEY = 'ewm-sw-route-reset-v20';
  function recoverRouting(){
    try{
      if(localStorage.getItem(RESET_KEY)==='1') return Promise.resolve(false);
      localStorage.setItem(RESET_KEY,'1');
    }catch(_){ return Promise.resolve(false); }
    var work=[];
    if('serviceWorker' in navigator){
      work.push(navigator.serviceWorker.getRegistrations().then(function(regs){
        return Promise.all(regs.map(function(reg){return reg.unregister().catch(function(){return false})}));
      }).catch(function(){return []}));
    }
    if('caches' in window){
      work.push(caches.keys().then(function(names){
        return Promise.all(names.filter(function(n){return n.indexOf('english-with-mariami-')===0}).map(function(n){return caches.delete(n)}));
      }).catch(function(){return []}));
    }
    return Promise.all(work).then(function(){
      try{location.reload()}catch(_){}
      return true;
    }).catch(function(){return false});
  }

  document.addEventListener('click', function(e){
    var link = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!link || standalone) return;
    var href = link.getAttribute('href');
    if (!href || href.charAt(0) === '#' || link.target === '_blank' || link.hasAttribute('download')) return;
    try {
      var url = new URL(href, location.href);
      if (url.origin !== location.origin) return;
      link.target = '_self';
    } catch (_) {}
  }, {passive:true});

  var lastTouch = 0;
  document.addEventListener('touchend', function(e){
    var now = Date.now();
    if (now - lastTouch < 280 && e.target && e.target.closest && e.target.closest('button,a')) e.preventDefault();
    lastTouch = now;
  }, {passive:false});

  if('serviceWorker' in navigator){
    window.addEventListener('load', function(){
      recoverRouting().then(function(reset){
        if(reset) return;
        navigator.serviceWorker.register('/sw.js', {scope:'/'}).then(function(reg){ if(reg.update) reg.update(); }).catch(function(err){ console.warn('[PWA] Service Worker unavailable:', err); });
      });
    }, {once:true});
  }

  var deferredPrompt = null;
  var installButton = null;
  function isGrade4(){ return false; }
  function createInstallUI(){ return; }
  function showInstallUI(){ return; }
  function hideInstallUI(){ if (installButton) installButton.style.display='none'; }
  window.addEventListener('beforeinstallprompt', function(e){ return; });
  window.addEventListener('appinstalled', function(){ deferredPrompt = null; hideInstallUI(); });
})();