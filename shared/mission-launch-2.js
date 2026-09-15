/* MAGIC NEON AI ACADEMY — Mission Launch 2.0
   Visual-only: observes world-button clicks and adds/removes an overlay.
   It does not navigate, mutate state, localStorage, progress, XP or lesson data. */
(function(){'use strict';
function boot(){
  if(window.__missionLaunch2Installed)return;
  window.__missionLaunch2Installed=true;
  document.addEventListener('click',function(e){
    const world=e.target.closest&&e.target.closest('.world');
    if(!world)return;
    const old=document.getElementById('mission-launch-2');
    if(old)old.remove();
    const box=document.createElement('div');
    box.id='mission-launch-2';
    box.setAttribute('aria-hidden','true');
    box.innerHTML='<div class="ml2-core"><span class="ml2-scan"></span><div class="ml2-copy">MISSION ACTIVATED<span class="ml2-sub">PORTAL • HUD SCAN • READY</span></div></div>';
    document.body.appendChild(box);
    requestAnimationFrame(function(){box.classList.add('is-active')});
    window.setTimeout(function(){if(box.parentNode)box.remove()},1600);
  },{passive:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
