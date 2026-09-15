/* English with Mariami — AI Guardian Mission HUD Intelligence 20.0
 * Visual-only bridge between Guardian guidance and the existing Mission HUD.
 */
(function(){
  'use strict';
  if(window.__EWM_AI_GUARDIAN_20__) return;
  window.__EWM_AI_GUARDIAN_20__=true;

  let panel,timer;
  const state={step:'READY',objective:'MISSION READY'};
  function grade(){return document.body?.dataset.grade||document.documentElement.dataset.grade||'2'}
  function label(){return grade()==='4'?'GUARDIAN HUD • CROWN LINK':grade()==='3'?'GUARDIAN HUD • EXPLORER LINK':'GUARDIAN HUD • MAGIC LINK'}
  function ensure(){
    if(panel)return panel;
    panel=document.createElement('div');panel.id='ewm-g20-hud';
    panel.innerHTML='<div class="g20-head"><span class="g20-live"></span>'+label()+'</div><div class="g20-main"><b class="g20-step">READY</b><span class="g20-arrow">›</span><span class="g20-objective">MISSION READY</span></div>';
    document.body.appendChild(panel);return panel;
  }
  function update(step,objective){
    state.step=step;state.objective=objective;const p=ensure();
    p.querySelector('.g20-step').textContent=step;p.querySelector('.g20-objective').textContent=objective;
    p.classList.remove('g20-flash');void p.offsetWidth;p.classList.add('g20-flash');
    clearTimeout(timer);timer=setTimeout(()=>p.classList.remove('g20-flash'),700);
    const g=document.querySelector('.ewm-guardian7');if(g)g.dataset.hud20=step.toLowerCase();
  }
  function boot(){
    if(!document.body)return false;ensure();
    setTimeout(()=>update('ENTER','ENTER WORLD'),900);
    window.addEventListener('ewm:portal-activated',()=>update('LEARN','OPEN MISSION')); 
    window.addEventListener('ewm:mission-activated',()=>update('ANSWER','COMPLETE THE TASK'));
    window.addEventListener('ewm:mission-complete',()=>{update('COMPLETE','MISSION COMPLETE');setTimeout(()=>update('NEXT','NEXT MISSION READY'),1200)});
    document.addEventListener('click',e=>{
      if(e.target.closest('.choice,[data-answer]'))update('ANSWER','CHOOSE YOUR ANSWER');
      else if(e.target.closest('[data-next],[data-action="next"],.next-lesson,.next'))update('NEXT','NEXT MISSION READY');
    },{passive:true});
    return true;
  }
  const s=document.createElement('style');s.textContent=`
    #ewm-g20-hud{position:fixed;right:18px;top:92px;z-index:99994;width:min(310px,calc(100vw - 36px));padding:11px 14px;border:1px solid rgba(82,226,255,.38);border-radius:14px;background:linear-gradient(135deg,rgba(5,12,34,.86),rgba(17,7,48,.76));backdrop-filter:blur(14px);box-shadow:0 0 24px rgba(61,205,255,.16),inset 0 0 20px rgba(93,78,255,.08);color:#eafcff;font:800 10px/1.2 system-ui,sans-serif;letter-spacing:.11em;overflow:hidden}
    #ewm-g20-hud:after{content:"";position:absolute;left:-20%;right:-20%;top:0;height:1px;background:linear-gradient(90deg,transparent,#6cf6ff,transparent);opacity:.8}
    .g20-head{font-size:8px;opacity:.7;display:flex;align-items:center;gap:7px;margin-bottom:8px}.g20-live{width:6px;height:6px;border-radius:50%;background:#5dffcf;box-shadow:0 0 10px #5dffcf}.g20-main{display:flex;align-items:center;gap:8px}.g20-step{color:#7ef6ff;font-size:12px}.g20-arrow{opacity:.45;font-size:15px}.g20-objective{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:9px}.g20-flash{animation:g20Flash .7s ease}
    @keyframes g20Flash{0%{transform:translateY(-2px);filter:brightness(1.8)}100%{transform:none;filter:none}}
    body[data-grade="4"] #ewm-g20-hud{border-color:rgba(255,211,105,.5);box-shadow:0 0 26px rgba(255,190,65,.18)}body[data-grade="4"] .g20-step{color:#ffd86b}
    @media(max-width:600px){#ewm-g20-hud{top:auto;right:12px;bottom:58px;width:calc(100vw - 24px)}}
    @media(prefers-reduced-motion:reduce){.g20-flash{animation:none}}
  `;document.head.appendChild(s);
  if(!boot()){new MutationObserver((m,o)=>{if(boot())o.disconnect()}).observe(document.documentElement,{childList:true,subtree:true})}
})();
