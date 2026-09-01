/* English with Mariami — safe home-page PWA install controller */
(function(){
  'use strict';
  if ((location.pathname || '/').toLowerCase() !== '/' && !(location.pathname || '').toLowerCase().endsWith('/index.html')) return;

  /* Make the root manifest discoverable without rewriting the large index.html. */
  if (!document.querySelector('link[rel="manifest"]')) {
    var manifest = document.createElement('link');
    manifest.rel = 'manifest';
    manifest.href = '/manifest.webmanifest';
    document.head.appendChild(manifest);
  }

  /* Register the existing root service worker for the home page. */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function(){
      navigator.serviceWorker.register('/sw.js', {scope:'/'}).then(function(reg){
        if (reg.update) reg.update();
      }).catch(function(err){
        console.warn('[Home PWA] Service Worker unavailable:', err);
      });
    }, {once:true});
  }

  var deferredPrompt = null;
  var button = null;

  function addButton(){
    if (button || window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) return;
    var host = document.querySelector('.hero-buttons');
    if (!host) return;

    button = document.createElement('button');
    button.type = 'button';
    button.id = 'installAppButton';
    button.className = 'secondary-button';
    button.textContent = '📱 INSTALL APP';
    button.style.cursor = 'pointer';
    button.style.display = 'inline-flex';
    button.setAttribute('aria-label', 'Install English with Mariami app');
    button.hidden = true;

    button.addEventListener('click', async function(){
      if (!deferredPrompt) {
        alert('აპის ინსტალაცია ჯერ არ არის ხელმისაწვდომი ამ ბრაუზერში. Chrome-ში გახსენი ⋮ მენიუ და აირჩიე Install app, თუ ეს ვარიანტი გამოჩნდა.');
        return;
      }
      deferredPrompt.prompt();
      try { await deferredPrompt.userChoice; } catch (_) {}
      deferredPrompt = null;
      button.hidden = true;
    });

    host.appendChild(button);
  }

  function showButton(){
    addButton();
    if (button) button.hidden = false;
  }

  window.addEventListener('beforeinstallprompt', function(event){
    event.preventDefault();
    deferredPrompt = event;
    showButton();
  });

  window.addEventListener('appinstalled', function(){
    deferredPrompt = null;
    if (button) button.hidden = true;
  });

  document.addEventListener('DOMContentLoaded', addButton, {once:true});
})();
