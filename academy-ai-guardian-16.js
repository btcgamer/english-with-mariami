/* English with Mariami — AI Guardian Bond 16.0
 * Visual-only relationship layer. Tracks session interaction count in memory only.
 * No auth, Supabase, XP, stars, progress, lessons, or navigation changes.
 */
(function(){
  'use strict';
  if(window.__EWM_AI_GUARDIAN_16__) return;
  window.__EWM_AI_GUARDIAN_16__=true;

  let interactions=0;
  let firstVisit=true;

  function guardian(){return document.querySelector('.ewm-guardian7');}
  function grade(){
    const p=location.pathname.toLowerCase();
    if(/grade4|g4/.test(p)) return '4';
    if(/grade3|g3/.test(p)) return '3';
    return '2';
  }
  function pulse(mode){
    const g=guardian(); if(!g) return;
    g.classList.remove('g16-welcome','g16-bond','g16-guide','g16-celebrate','g16-sync');
    g.classList.add('g16-'+mode);
    clearTimeout(g.__g16Timer);
    g.__g16Timer=setTimeout(()=>g.classList.remove('g16-'+mode),1500);
  }
  function message(text){
    let el=document.getElementById('ewm-g16-bond');
    if(!el){el=document.createElement('div');el.id='ewm-g16-bond';document.body.appendChild(el)}
    el.textContent=text; el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
    clearTimeout(el.__timer); el.__timer=setTimeout(()=>el.classList.remove('show'),1900);
  }
  function boot(){
    if(!guardian()) return false;
    document.documentElement.dataset.aiGuardian16='bond';
    const style=document.createElement('style');
    style.textContent=`
      #ewm-g16-bond{position:fixed;left:50%;bottom:58px;z-index:99998;pointer-events:none;opacity:0;transform:translate(-50%,14px);padding:8px 15px;border:1px solid rgba(96,238,255,.5);border-radius:999px;background:rgba(4,8,24,.78);backdrop-filter:blur(10px);box-shadow:0 0 25px rgba(74,220,255,.25);color:#e8fdff;font:700 10px/1.2 system-ui,sans-serif;letter-spacing:.14em;transition:.3s}
      #ewm-g16-bond.show{opacity:1;transform:translate(-50%,0)}
      .ewm-guardian7.g16-welcome{filter:brightness(1.8);transform:translateZ(65px) scale(1.08)!important}
      .ewm-guardian7.g16-bond .g7-core{filter:brightness(2.3);transform:scale(1.18)}
      .ewm-guardian7.g16-guide .g7-eye{filter:brightness(2.2);transform:scale(1.14)}
      .ewm-guardian7.g16-celebrate{filter:brightness(1.8) saturate(1.4);transform:translateZ(75px) scale(1.1)!important}
      .ewm-guardian7.g16-sync .g7-ring{filter:brightness(2.3)}
      @media(max-width:600px){#ewm-g16-bond{bottom:48px;font-size:9px;max-width:calc(100vw - 24px)}}
      @media(prefers-reduced-motion:reduce){#ewm-g16-bond{transition:none}.ewm-guardian7.g16-welcome,.ewm-guardian7.g16-celebrate{transform:none!important}.ewm-guardian7.g16-bond .g7-core,.ewm-guardian7.g16-guide .g7-eye{transform:none}}
    `;
    document.head.appendChild(style);

    const g=guardian();
    g.addEventListener('mouseenter',()=>{interactions++;pulse('bond')});
    document.addEventListener('click',e=>{
      if(e.target.closest('.ap4-portal,.ap4-enter,.ap4-launch')){
        interactions++; pulse('guide'); message('GUARDIAN BOND • WORLD SYNC');
      }else if(e.target.closest('.g7-body,.g7-core')){
        interactions++; pulse('bond'); message('GUARDIAN BOND • CONNECTED');
      }
    },{passive:true});
    window.addEventListener('ewm:portal-activated',()=>{interactions++;pulse('sync');message('BOND SYNC • GATEWAY READY')});
    window.addEventListener('ewm:mission-activated',()=>{interactions++;pulse('guide');message('GUARDIAN BOND • I AM WITH YOU')});
    window.addEventListener('ewm:mission-complete',()=>{interactions++;pulse('celebrate');message('BOND LEVEL • MISSION COMPLETE')});

    if(firstVisit){firstVisit=false;setTimeout(()=>{pulse('welcome');message('AI GUARDIAN • WELCOME BACK')},700)}
    g.dataset.bondInteractions=String(interactions);
    g.dataset.bondGrade=grade();
    return true;
  }
  if(!boot()){
    const mo=new MutationObserver(()=>{if(boot())mo.disconnect()});
    mo.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(()=>mo.disconnect(),10000);
  }
})();
