/* English with Mariami — Academy grade navigation + Grade 4 app install */
(function(){
  'use strict';
  const path=(location.pathname||'').toLowerCase().replace(/\/+$/,'');
  const isAcademy=path.endsWith('/academy.html')||path==='academy.html';
  if(!isAcademy)return;

  function addNav(){
    if(document.getElementById('__ewm-academy-grade-nav'))return;
    const nav=document.createElement('nav');
    nav.id='__ewm-academy-grade-nav';
    nav.setAttribute('aria-label','Choose grade');
    nav.innerHTML='<a href="/grade2/">G2</a><a href="/grade3/">G3</a><a href="/grade4/">G4</a>';
    nav.style.cssText='position:fixed;right:16px;bottom:calc(16px + env(safe-area-inset-bottom));z-index:99998;display:flex;gap:7px;align-items:center;padding:7px;border:1px solid rgba(0,234,255,.35);border-radius:16px;background:rgba(2,8,23,.88);box-shadow:0 0 24px rgba(0,234,255,.16);backdrop-filter:blur(14px);';
    nav.querySelectorAll('a').forEach(function(a){a.style.cssText='display:inline-flex;align-items:center;justify-content:center;min-width:42px;padding:8px 11px;border:1px solid rgba(0,234,255,.35);border-radius:10px;color:#fff;text-decoration:none;font:900 12px/1 Arial,sans-serif;background:rgba(4,31,59,.82);';});
    document.body.appendChild(nav);
  }

  let deferredPrompt=null, installWrap=null;
  function createInstall(){
    if(installWrap||window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true)return;
    installWrap=document.createElement('div');
    installWrap.id='__ewm-grade4-install';
    installWrap.style.cssText='position:fixed;left:16px;bottom:calc(16px + env(safe-area-inset-bottom));z-index:99997;';
    const btn=document.createElement('button');
    btn.type='button';
    btn.textContent='📱 INSTALL GRADE 4 APP';
    btn.style.cssText='border:1px solid rgba(125,211,252,.65);border-radius:999px;padding:12px 16px;font:800 12px/1 system-ui,sans-serif;letter-spacing:.03em;color:#e0f2fe;background:rgba(2,8,23,.94);box-shadow:0 8px 30px rgba(0,0,0,.35),0 0 24px rgba(56,189,248,.25);backdrop-filter:blur(12px);cursor:pointer;';
    btn.onclick=function(){if(!deferredPrompt)return;deferredPrompt.prompt();deferredPrompt.userChoice.then(function(){deferredPrompt=null;installWrap.style.display='none';}).catch(function(){deferredPrompt=null;});};
    installWrap.appendChild(btn);document.body.appendChild(installWrap);installWrap.style.display='none';
  }
  function register(){
    if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js',{scope:'/'}).then(function(reg){if(reg.update)reg.update();}).catch(function(){});}
  }
  function init(){addNav();createInstall();register();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();deferredPrompt=e;if(!installWrap)createInstall();if(installWrap)installWrap.style.display='block';});
  window.addEventListener('appinstalled',function(){deferredPrompt=null;if(installWrap)installWrap.style.display='none';});
})();
