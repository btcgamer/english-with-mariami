/* English with Mariami — Academy grade navigation + unified rewards loader */
(function(){
'use strict';
const path=(location.pathname||'').toLowerCase().replace(/\/+$/,'');
const isAcademy=path.endsWith('/academy.html')||path==='academy.html';
const isGrade=/\/grade[234](?:\/|$)/.test(path)||/^grade[234](?:\/|$)/.test(path);
function loadRewards(){
  if(document.querySelector('script[data-academy-rewards]'))return;
  const s=document.createElement('script');
  s.src='/academy-rewards.js?v=20260905';
  s.async=true;
  s.dataset.academyRewards='1';
  document.head.appendChild(s);
}
if(!isAcademy&&!isGrade)return;
function addNav(){
  /* Grade shortcuts were intentionally removed from the Academy surface.
     Keep this hook for backward compatibility with pages that load the
     script, but do not inject G2/G3/G4 controls anymore. */
  return;
}
let deferredPrompt=null,installWrap=null;
function createInstall(){
 if(!isAcademy||installWrap||window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true)return;
 installWrap=document.createElement('div');installWrap.id='__ewm-grade4-install';installWrap.style.cssText='position:fixed;left:16px;bottom:calc(16px + env(safe-area-inset-bottom));z-index:99997;';
 const btn=document.createElement('button');btn.type='button';btn.textContent='📱 INSTALL GRADE 4 APP';btn.style.cssText='border:1px solid rgba(125,211,252,.65);border-radius:999px;padding:12px 16px;font:800 12px/1 system-ui,sans-serif;letter-spacing:.03em;color:#e0f2fe;background:rgba(2,8,23,.94);box-shadow:0 8px 30px rgba(0,0,0,.35),0 0 24px rgba(56,189,248,.25);backdrop-filter:blur(12px);cursor:pointer;';
 btn.onclick=function(){if(!deferredPrompt)return;deferredPrompt.prompt();deferredPrompt.userChoice.then(function(){deferredPrompt=null;installWrap.style.display='none';}).catch(function(){deferredPrompt=null;});};
 installWrap.appendChild(btn);document.body.appendChild(installWrap);installWrap.style.display='none';
}
function register(){if('serviceWorker' in navigator&&isAcademy){navigator.serviceWorker.register('/sw.js',{scope:'/'}).then(function(reg){if(reg.update)reg.update();}).catch(function(){});}}
function init(){loadRewards();addNav();createInstall();register();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();deferredPrompt=e;if(!installWrap)createInstall();if(installWrap)installWrap.style.display='block';});
window.addEventListener('appinstalled',function(){deferredPrompt=null;if(installWrap)installWrap.style.display='none';});
})();
