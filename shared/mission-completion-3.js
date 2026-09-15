/* MAGIC NEON AI ACADEMY — Cinematic Mission Completion 3.0 (visual-only) */
(function(){'use strict';
  function boot(){
    if(document.documentElement.dataset.missionCompletion3==='1')return;
    document.documentElement.dataset.missionCompletion3='1';
    document.addEventListener('click',function(e){
      const button=e.target.closest&&e.target.closest('[data-complete]');
      if(!button)return;
      const overlay=document.createElement('div');
      overlay.className='mission-completion-overlay';
      overlay.setAttribute('aria-hidden','true');
      overlay.innerHTML='<div class="mc-ring"></div><div class="mc-ring r2"></div><div class="mc-ring r3"></div><div class="mc-scan"></div><div class="mc-stars"><span class="mc-star">★</span><span class="mc-star">✦</span><span class="mc-star">★</span><span class="mc-star">✦</span><span class="mc-star">★</span></div><div class="mission-completion-core"><div class="mc-kicker">AI ACADEMY • MISSION EVENT</div><div class="mc-title">MISSION COMPLETE</div><div class="mc-sub">XP ENERGY +10 &nbsp; • &nbsp; STAR CORE +1 &nbsp; • &nbsp; NEXT MISSION READY</div></div><div class="mc-xp">+10 XP</div>';
      document.documentElement.appendChild(overlay);
      requestAnimationFrame(function(){overlay.classList.add('show')});
      window.setTimeout(function(){overlay.remove()},1900);
    },true);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
