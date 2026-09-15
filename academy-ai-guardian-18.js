/* English with Mariami — AI Guardian Learning Awareness 18.0
 * Visual-only awareness of mission-stage signals. No gameplay state is written.
 */
(function(){
  'use strict';
  if(window.__EWM_AI_GUARDIAN_18__) return;
  window.__EWM_AI_GUARDIAN_18__=true;

  let stage='entry';
  let pulseTimer;

  function guardian(){return document.querySelector('.ewm-guardian7');}
  function label(){
    let el=document.getElementById('ewm-g18-awareness');
    if(!el){el=document.createElement('div');el.id='ewm-g18-awareness';document.body.appendChild(el)}
    return el;
  }
  function setStage(next, text){
    const g=guardian(); if(!g) return;
    stage=next;
    ['entry','learning','launch','complete'].forEach(x=>g.classList.remove('g18-'+x));
    g.classList.add('g18-'+next);
    g.dataset.learningStage=next;
    const el=label();
    el.textContent=text; el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
    clearTimeout(pulseTimer);
    pulseTimer=setTimeout(()=>{g.classList.remove('g18-'+next);el.classList.remove('show')},1800);
  }
  function inject(){
    const s=document.createElement('style');
    s.textContent=`
      #ewm-g18-awareness{position:fixed;right:18px;bottom:18px;z-index:99996;pointer-events:none;opacity:0;transform:translateY(8px);padding:8px 12px;border:1px solid rgba(88,225,255,.42);border-radius:10px;background:rgba(3,8,24,.72);backdrop-filter:blur(10px);color:#e9ffff;font:800 9px/1.15 system-ui,sans-serif;letter-spacing:.12em;box-shadow:0 0 22px rgba(70,220,255,.2);transition:.28s}
      #ewm-g18-awareness.show{opacity:1;transform:translateY(0)}
      .ewm-guardian7.g18-entry{filter:brightness(1.35)}
      .ewm-guardian7.g18-learning .g7-core{filter:brightness(2);transform:scale(1.12)}
      .ewm-guardian7.g18-learning .g7-ring{filter:brightness(1.7)}
      .ewm-guardian7.g18-launch{filter:brightness(1.75) saturate(1.3);transform:translateZ(65px) scale(1.07)!important}
      .ewm-guardian7.g18-launch .g7-eye{filter:brightness(2.5)}
      .ewm-guardian7.g18-complete{filter:brightness(1.9) saturate(1.45);transform:translateZ(75px) scale(1.1)!important}
      .ewm-guardian7.g18-complete .g7-wing{filter:brightness(2.4)}
      body[data-grade="4"] #ewm-g18-awareness{border-color:rgba(255,211,105,.55);box-shadow:0 0 24px rgba(255,190,65,.25)}
      @media(max-width:600px){#ewm-g18-awareness{right:10px;bottom:12px;font-size:8px}}
      @media(prefers-reduced-motion:reduce){#ewm-g18-awareness{transition:none}.ewm-guardian7.g18-launch,.ewm-guardian7.g18-complete{transform:none!important}.ewm-guardian7.g18-learning .g7-core{transform:none}}
    `;
    document.head.appendChild(s);
  }
  function boot(){
    if(!guardian()) return false;
    inject();
    document.documentElement.dataset.aiGuardian18='learning-awareness';
    const g=guardian();
    setTimeout(()=>setStage('entry','GUARDIAN AWARENESS • SESSION START'),700);
    document.addEventListener('click',e=>{
      if(e.target.closest('.ap4-portal,.ap4-enter,.ap4-launch')) setStage('launch','LEARNING AWARENESS • WORLD LAUNCH');
      else if(e.target.closest('.g7-body,.g7-core')) setStage(stage==='entry'?'learning':'learning','GUARDIAN AWARE • LEARNING LINK');
    },{passive:true});
    window.addEventListener('ewm:portal-activated',()=>setStage('launch','GUARDIAN AWARE • MISSION GATE READY'));
    window.addEventListener('ewm:mission-activated',()=>setStage('launch','GUARDIAN AWARE • MISSION ACTIVE'));
    window.addEventListener('ewm:mission-complete',()=>setStage('complete','GUARDIAN AWARE • MISSION COMPLETE'));
    g.dataset.awareness18='online';
    return true;
  }
  if(!boot()){
    const mo=new MutationObserver(()=>{if(boot())mo.disconnect()});
    mo.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(()=>mo.disconnect(),10000);
  }
})();
