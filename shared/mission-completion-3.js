/* MAGIC NEON AI ACADEMY — Cinematic Mission Completion 3.0 (visual-only) */
(function(){'use strict';
  function boot(){
    if(document.documentElement.dataset.missionCompletion3==='1')return;
    document.documentElement.dataset.missionCompletion3='1';
    window.addEventListener('englishMariamiMissionCompleted',function(e){
      const n=Number(e&&e.detail&&e.detail.mission)||0;
      const heading=[...document.querySelectorAll('h1,h2,.title,.eyebrow')].map(x=>x.textContent||'').join(' ');
      const isFinal=n===60||/MISSION\\s*60(?:\\s*\\/\\s*60)?/i.test(heading);
      const title=isFinal?'FINAL MISSION COMPLETE':'MISSION COMPLETE';
      const sub=isFinal?'60 / 60 • FINAL REWARD UNLOCKED':'XP ENERGY +10 • STAR CORE UPDATED • NEXT MISSION READY';
      const overlay=document.createElement('div');
      overlay.className='mission-completion-overlay';
      overlay.setAttribute('aria-hidden','true');
      overlay.innerHTML='<div class="mc-ring"></div><div class="mc-ring r2"></div><div class="mc-ring r3"></div><div class="mc-scan"></div><div class="mc-stars"><span class="mc-star">★</span><span class="mc-star">✦</span><span class="mc-star">★</span><span class="mc-star">✦</span><span class="mc-star">★</span></div><div class="mission-completion-core"><div class="mc-kicker">AI ACADEMY • '+(isFinal?'FINAL REWARD':'MISSION EVENT')+'</div><div class="mc-title">'+title+'</div><div class="mc-sub">'+sub+'</div></div><div class="mc-xp">'+(isFinal?'🏆 FINAL REWARD':'+10 XP')+'</div>';
      document.documentElement.appendChild(overlay);
      requestAnimationFrame(function(){overlay.classList.add('show')});
      window.setTimeout(function(){overlay.remove()},1900);
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
