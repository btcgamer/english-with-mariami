/* English with Mariami — AI Guardian Reactions 17.0
 * Visual-only adaptive reaction layer. No persistent gameplay state.
 */
(function(){
  'use strict';
  if(window.__EWM_AI_GUARDIAN_17__) return;
  window.__EWM_AI_GUARDIAN_17__=true;

  const modes=['curious','energized','focused','celebrate','ready'];
  let lastMode='';

  function guardian(){return document.querySelector('.ewm-guardian7');}
  function pick(list){
    const available=list.filter(x=>x!==lastMode);
    const mode=available[Math.floor(Math.random()*available.length)]||list[0];
    lastMode=mode; return mode;
  }
  function grade(){
    const p=location.pathname.toLowerCase();
    return /grade4|g4/.test(p)?'4':/grade3|g3/.test(p)?'3':'2';
  }
  function react(reason){
    const g=guardian(); if(!g) return;
    const pools={
      enter:['curious','energized'],
      portal:['ready','energized','focused'],
      mission:['focused','ready','energized'],
      complete:['celebrate','energized'],
      guardian:['curious','focused','ready']
    };
    const mode=pick(pools[reason]||modes);
    g.classList.remove(...modes.map(x=>'g17-'+x));
    g.classList.add('g17-'+mode);
    g.dataset.reaction17=mode;
    const label=document.getElementById('ewm-g17-reaction')||createLabel();
    const text={curious:'GUARDIAN • CURIOUS',energized:'GUARDIAN • ENERGY RISE',focused:'GUARDIAN • FOCUS LOCK',celebrate:'GUARDIAN • CELEBRATION',ready:'GUARDIAN • READY'}[mode];
    label.textContent=text; label.classList.remove('show'); void label.offsetWidth; label.classList.add('show');
    clearTimeout(g.__g17Timer); g.__g17Timer=setTimeout(()=>g.classList.remove('g17-'+mode),1350);
    clearTimeout(label.__timer); label.__timer=setTimeout(()=>label.classList.remove('show'),1500);
  }
  function createLabel(){
    const el=document.createElement('div'); el.id='ewm-g17-reaction'; document.body.appendChild(el); return el;
  }
  function injectStyle(){
    const s=document.createElement('style');
    s.textContent=`
      #ewm-g17-reaction{position:fixed;left:50%;bottom:86px;z-index:99997;pointer-events:none;opacity:0;transform:translate(-50%,10px);padding:7px 13px;border:1px solid rgba(120,235,255,.42);border-radius:999px;background:rgba(4,8,24,.72);backdrop-filter:blur(10px);color:#eaffff;font:800 9px/1 system-ui,sans-serif;letter-spacing:.13em;box-shadow:0 0 22px rgba(65,220,255,.22);transition:.25s}
      #ewm-g17-reaction.show{opacity:1;transform:translate(-50%,0)}
      .ewm-guardian7.g17-curious .g7-eye{filter:brightness(2);transform:scale(1.12)}
      .ewm-guardian7.g17-energized{filter:brightness(1.65) saturate(1.3);transform:translateZ(60px) scale(1.06)!important}
      .ewm-guardian7.g17-energized .g7-core{filter:brightness(2.4);transform:scale(1.2)}
      .ewm-guardian7.g17-focused .g7-eye{filter:brightness(2.5);box-shadow:0 0 18px currentColor}
      .ewm-guardian7.g17-focused .g7-ring{filter:brightness(1.8)}
      .ewm-guardian7.g17-celebrate{filter:brightness(1.9) saturate(1.5);transform:translateZ(70px) scale(1.09)!important}
      .ewm-guardian7.g17-celebrate .g7-wing{filter:brightness(2.3)}
      .ewm-guardian7.g17-ready .g7-core{filter:brightness(2.6);transform:scale(1.15)}
      .ewm-guardian7.g17-ready .g7-ring{filter:brightness(2.1)}
      body[data-grade="4"] #ewm-g17-reaction{border-color:rgba(255,215,105,.55);box-shadow:0 0 24px rgba(255,190,65,.25)}
      @media(max-width:600px){#ewm-g17-reaction{bottom:72px;font-size:8px;max-width:calc(100vw - 24px)}}
      @media(prefers-reduced-motion:reduce){#ewm-g17-reaction{transition:none}.ewm-guardian7.g17-energized,.ewm-guardian7.g17-celebrate{transform:none!important}.ewm-guardian7.g17-curious .g7-eye,.ewm-guardian7.g17-energized .g7-core,.ewm-guardian7.g17-ready .g7-core{transform:none}}
    `;
    document.head.appendChild(s);
  }
  function boot(){
    if(!guardian()) return false;
    injectStyle();
    document.documentElement.dataset.aiGuardian17='adaptive-reactions';
    const g=guardian();
    document.addEventListener('click',e=>{
      if(e.target.closest('.ap4-portal,.ap4-enter,.ap4-launch')) react('portal');
      else if(e.target.closest('.g7-body,.g7-core')) react('guardian');
    },{passive:true});
    window.addEventListener('ewm:portal-activated',()=>react('portal'));
    window.addEventListener('ewm:mission-activated',()=>react('mission'));
    window.addEventListener('ewm:mission-complete',()=>react('complete'));
    setTimeout(()=>react('enter'),850);
    g.dataset.reactionGrade=grade();
    return true;
  }
  if(!boot()){
    const mo=new MutationObserver(()=>{if(boot())mo.disconnect()});
    mo.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(()=>mo.disconnect(),10000);
  }
})();
