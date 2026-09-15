/* English with Mariami — AI Guardian Intelligence 13.0
 * Visual-only intelligence layer for Academy Command Center.
 * No auth, Supabase, XP, stars, progress, lessons, or navigation changes.
 */
(function(){
  'use strict';
  if(window.__EWM_AI_GUARDIAN_13__) return;
  window.__EWM_AI_GUARDIAN_13__=true;

  function grade(){
    const p=location.pathname.toLowerCase();
    if(/grade4|g4/.test(p)) return '4';
    if(/grade3|g3/.test(p)) return '3';
    return '2';
  }
  function guardian(){return document.querySelector('.ewm-guardian7');}
  function react(mode,ms){
    const g=guardian(); if(!g) return;
    g.classList.remove('g13-awaken','g13-track','g13-scan','g13-ready','g13-think');
    g.classList.add('g13-'+mode);
    clearTimeout(g.__g13Timer);
    g.__g13Timer=setTimeout(()=>g.classList.remove('g13-'+mode),ms||1100);
  }
  function boot(){
    const g=guardian(); if(!g) return false;
    document.documentElement.dataset.aiGuardian13='intelligence';
    const style=document.createElement('style');
    style.textContent=`
      .ewm-guardian7.g13-awaken{filter:brightness(1.7) saturate(1.35);transform:translateZ(70px) scale(1.09)!important}
      .ewm-guardian7.g13-track .g7-eye{transform:scale(1.28);filter:brightness(2.2)}
      .ewm-guardian7.g13-scan .g7-core{animation:g13Scan .7s ease-out 1}
      .ewm-guardian7.g13-ready .g7-ring{filter:brightness(2);animation:g13Ring .8s ease-out 1}
      .ewm-guardian7.g13-think .g7-eye{animation:g13Think .45s ease-in-out 2}
      .ewm-guardian7.g13-busy{filter:brightness(1.35)}
      @keyframes g13Scan{0%{transform:scale(.75);opacity:.65}55%{transform:scale(1.35);opacity:1}100%{transform:scale(1)}}
      @keyframes g13Ring{0%{transform:scale(.8) rotate(0deg);opacity:.5}100%{transform:scale(1.3) rotate(18deg);opacity:1}}
      @keyframes g13Think{0%,100%{opacity:.75}50%{opacity:1;filter:brightness(2.4)}}
      @media (prefers-reduced-motion:reduce){.ewm-guardian7.g13-awaken{transform:none!important}.ewm-guardian7.g13-scan .g7-core,.ewm-guardian7.g13-ready .g7-ring,.ewm-guardian7.g13-think .g7-eye{animation:none}}
    `;
    document.head.appendChild(style);

    const root=document.querySelector('.ewm-3d-card')||document.body;
    root.addEventListener('pointermove',e=>{
      const r=root.getBoundingClientRect();
      const x=(e.clientX-r.left)/Math.max(1,r.width)-.5;
      if(Math.abs(x)>.08) react('track',500);
    },{passive:true});
    document.addEventListener('click',e=>{
      if(e.target.closest('.ap4-portal,.ap4-enter,.ap4-launch')) react('awaken',1300);
      else if(e.target.closest('.g7-body,.g7-core')) react('scan',1000);
    },{passive:true});
    window.addEventListener('ewm:portal-activated',()=>react('ready',1200));
    window.addEventListener('ewm:mission-activated',()=>react('ready',1200));
    window.addEventListener('ewm:mission-complete',()=>react('think',1000));
    return true;
  }
  if(!boot()){
    const mo=new MutationObserver(()=>{if(boot()) mo.disconnect()});
    mo.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(()=>mo.disconnect(),10000);
  }
})();
