/* English with Mariami — AI Guardian Mission Guidance 19.0
 * Visual-only guidance layer. It observes existing UI signals and never changes gameplay state.
 */
(function(){
  'use strict';
  if(window.__EWM_AI_GUARDIAN_19__) return;
  window.__EWM_AI_GUARDIAN_19__=true;

  let timer;
  function guardian(){return document.querySelector('.ewm-guardian7');}
  function guide(step,text){
    const g=guardian(); if(!g)return;
    ['enter','learn','answer','complete','next'].forEach(x=>g.classList.remove('g19-'+x));
    g.classList.add('g19-'+step);
    g.dataset.guidance19=step;
    let el=document.getElementById('ewm-g19-guide');
    if(!el){el=document.createElement('div');el.id='ewm-g19-guide';document.body.appendChild(el)}
    el.innerHTML='<span class="g19-dot"></span><b>'+text+'</b>';
    el.classList.remove('show');void el.offsetWidth;el.classList.add('show');
    clearTimeout(timer);timer=setTimeout(()=>{g.classList.remove('g19-'+step);el.classList.remove('show')},1900);
  }
  function styles(){
    const s=document.createElement('style');
    s.textContent=`
      #ewm-g19-guide{position:fixed;left:50%;bottom:18px;z-index:99995;pointer-events:none;opacity:0;transform:translate(-50%,12px);display:flex;align-items:center;gap:8px;padding:9px 15px;border:1px solid rgba(95,230,255,.48);border-radius:999px;background:rgba(3,8,25,.78);backdrop-filter:blur(12px);color:#eaffff;font:800 9px/1 system-ui,sans-serif;letter-spacing:.14em;box-shadow:0 0 28px rgba(67,218,255,.22);transition:.3s}
      #ewm-g19-guide.show{opacity:1;transform:translate(-50%,0)}
      .g19-dot{width:6px;height:6px;border-radius:50%;background:currentColor;box-shadow:0 0 12px currentColor}
      .ewm-guardian7.g19-enter{filter:brightness(1.45)}
      .ewm-guardian7.g19-learn .g7-core{filter:brightness(2.1);transform:scale(1.13)}
      .ewm-guardian7.g19-answer .g7-eye{filter:brightness(2.6)}
      .ewm-guardian7.g19-complete{filter:brightness(1.9) saturate(1.45);transform:translateZ(65px) scale(1.08)!important}
      .ewm-guardian7.g19-next .g7-ring{filter:brightness(2.4)}
      body[data-grade="4"] #ewm-g19-guide{border-color:rgba(255,211,105,.58);box-shadow:0 0 28px rgba(255,190,65,.25)}
      @media(max-width:600px){#ewm-g19-guide{bottom:12px;font-size:8px;max-width:calc(100vw - 24px)}}
      @media(prefers-reduced-motion:reduce){#ewm-g19-guide{transition:none}.ewm-guardian7.g19-complete{transform:none!important}.ewm-guardian7.g19-learn .g7-core{transform:none}}
    `;
    document.head.appendChild(s);
  }
  function boot(){
    if(!guardian())return false;
    styles();
    document.documentElement.dataset.aiGuardian19='mission-guidance';
    const g=guardian();
    setTimeout(()=>guide('enter','GUIDANCE • ENTER WORLD'),700);
    document.addEventListener('click',e=>{
      if(e.target.closest('.ap4-portal,.ap4-enter,.ap4-launch'))guide('learn','GUIDANCE • LEARN');
      else if(e.target.closest('.choice,[data-answer],button'))guide('answer','GUIDANCE • ANSWER');
    },{passive:true});
    window.addEventListener('ewm:portal-activated',()=>guide('learn','GUIDANCE • LEARN'));
    window.addEventListener('ewm:mission-activated',()=>guide('answer','GUIDANCE • ANSWER'));
    window.addEventListener('ewm:mission-complete',()=>guide('complete','GUIDANCE • COMPLETE'));
    const next=document.querySelector('[data-next],[data-action="next"],.next-lesson,.next');
    if(next) next.addEventListener('click',()=>guide('next','GUIDANCE • NEXT MISSION'),{passive:true});
    g.dataset.guidance19='online';
    return true;
  }
  if(!boot()){
    const mo=new MutationObserver(()=>{if(boot())mo.disconnect()});
    mo.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(()=>mo.disconnect(),10000);
  }
})();
