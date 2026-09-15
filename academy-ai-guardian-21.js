/* English with Mariami — AI Guardian Adaptive Mission Assistant 21.0
 * Visual-only assistant layer. No gameplay, auth, progress or Supabase writes.
 */
(function(){
  'use strict';
  if(window.__EWM_AI_GUARDIAN_21__)return;
  window.__EWM_AI_GUARDIAN_21__=true;
  let box,timer,last='READY';
  const messages={
    enter:['ASSIST','Welcome back. Enter your world.'],
    learn:['GUIDE','Explore the mission and learn.'],
    answer:['HINT','Take your time. Choose your answer.'],
    complete:['CELEBRATE','Mission complete. Excellent work!'],
    next:['NEXT','Your next mission is ready.']
  };
  function g(){return document.querySelector('.ewm-guardian7')}
  function show(key){
    const el=g();if(!el||!messages[key]||last===key&&key!=='answer')return;
    last=key;const [tag,msg]=messages[key];
    if(!box){box=document.createElement('div');box.id='ewm-g21-assistant';document.body.appendChild(box)}
    box.innerHTML='<span class="g21-tag">'+tag+'</span><span class="g21-msg">'+msg+'</span>';
    box.classList.remove('g21-show');void box.offsetWidth;box.classList.add('g21-show');
    el.classList.remove('g21-assist');void el.offsetWidth;el.classList.add('g21-assist');
    clearTimeout(timer);timer=setTimeout(()=>box.classList.remove('g21-show'),2600);
  }
  const style=document.createElement('style');style.textContent=`
    #ewm-g21-assistant{position:fixed;left:18px;bottom:18px;z-index:99993;display:flex;align-items:center;gap:10px;max-width:min(360px,calc(100vw - 36px));padding:12px 15px;border:1px solid rgba(92,231,255,.38);border-radius:15px;background:rgba(4,10,30,.84);backdrop-filter:blur(14px);box-shadow:0 0 26px rgba(53,214,255,.18);color:#eaffff;font:700 10px/1.35 system-ui,sans-serif;letter-spacing:.06em;opacity:0;transform:translateY(12px);transition:.35s}
    #ewm-g21-assistant.g21-show{opacity:1;transform:none}.g21-tag{font-size:8px;color:#67f5ff;letter-spacing:.14em;padding:5px 7px;border:1px solid currentColor;border-radius:7px}.g21-msg{opacity:.9}
    .ewm-guardian7.g21-assist .g7-core{filter:brightness(2);transform:scale(1.1)}.ewm-guardian7.g21-assist .g7-eye{filter:brightness(2.2)}
    body[data-grade="4"] #ewm-g21-assistant{border-color:rgba(255,211,105,.52);box-shadow:0 0 28px rgba(255,190,65,.2)}body[data-grade="4"] .g21-tag{color:#ffd86b}
    @media(max-width:600px){#ewm-g21-assistant{left:12px;bottom:112px;max-width:calc(100vw - 24px)}}
    @media(prefers-reduced-motion:reduce){#ewm-g21-assistant{transition:none}.ewm-guardian7.g21-assist .g7-core{transform:none}}
  `;document.head.appendChild(style);
  function boot(){
    if(!document.body)return false;
    setTimeout(()=>show('enter'),1100);
    window.addEventListener('ewm:portal-activated',()=>show('learn'));
    window.addEventListener('ewm:mission-activated',()=>show('answer'));
    window.addEventListener('ewm:mission-complete',()=>{show('complete');setTimeout(()=>show('next'),2200)});
    document.addEventListener('click',e=>{
      if(e.target.closest('.choice,[data-answer]'))show('answer');
      else if(e.target.closest('[data-next],[data-action="next"],.next-lesson,.next'))show('next');
      else if(e.target.closest('.ap4-portal,.ap4-enter,.ap4-launch'))show('learn');
    },{passive:true});
    document.documentElement.dataset.aiGuardian21='adaptive-assistant';
    return true;
  }
  if(!boot()){const mo=new MutationObserver(()=>{if(boot())mo.disconnect()});mo.observe(document.documentElement,{childList:true,subtree:true});setTimeout(()=>mo.disconnect(),10000)}
})();
