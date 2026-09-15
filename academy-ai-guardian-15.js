/* English with Mariami — AI Guardian Personality 15.0
 * Visual-only personality layer for the Academy Guardian.
 * G2: playful / curious, G3: explorer / focused, G4: guardian / regal.
 * No auth, Supabase, XP, stars, progress, lessons, or navigation changes.
 */
(function(){
  'use strict';
  if(window.__EWM_AI_GUARDIAN_15__) return;
  window.__EWM_AI_GUARDIAN_15__=true;

  function getGrade(){
    const p=location.pathname.toLowerCase();
    if(/grade4|g4/.test(p)) return '4';
    if(/grade3|g3/.test(p)) return '3';
    return '2';
  }
  function guardian(){return document.querySelector('.ewm-guardian7');}
  function applyPersonality(){
    const g=guardian(); if(!g) return false;
    const grade=getGrade();
    document.documentElement.dataset.aiGuardian15='personality';
    g.dataset.personality=grade==='4'?'guardian':grade==='3'?'explorer':'playful';
    g.classList.remove('g15-playful','g15-explorer','g15-guardian');
    g.classList.add('g15-'+(grade==='4'?'guardian':grade==='3'?'explorer':'playful'));
    return true;
  }
  function react(type){
    const g=guardian(); if(!g) return;
    const personality=g.dataset.personality||'playful';
    g.classList.remove('g15-greet','g15-curious','g15-focus','g15-proud','g15-alert');
    let mode=type;
    if(type==='portal') mode=personality==='guardian'?'proud':personality==='explorer'?'focus':'curious';
    if(type==='click') mode=personality==='guardian'?'alert':personality==='explorer'?'focus':'greet';
    g.classList.add('g15-'+mode);
    clearTimeout(g.__g15Timer);
    g.__g15Timer=setTimeout(()=>g.classList.remove('g15-'+mode),1300);
  }
  function boot(){
    if(!applyPersonality()) return false;
    const style=document.createElement('style');
    style.textContent=`
      .ewm-guardian7.g15-playful{--g15-a:#39e9ff;--g15-b:#7b5cff}
      .ewm-guardian7.g15-explorer{--g15-a:#48f5ff;--g15-b:#b44cff}
      .ewm-guardian7.g15-guardian{--g15-a:#ffd76a;--g15-b:#9c55ff}
      .ewm-guardian7.g15-playful.g15-curious{transform:translateZ(60px) rotate(-3deg) scale(1.06)!important}
      .ewm-guardian7.g15-playful.g15-greet .g7-eye{filter:brightness(2.2);transform:scale(1.18)}
      .ewm-guardian7.g15-explorer.g15-focus{filter:brightness(1.55) saturate(1.3)}
      .ewm-guardian7.g15-explorer.g15-focus .g7-ring{filter:brightness(2);transform:scale(1.08)}
      .ewm-guardian7.g15-guardian.g15-proud{filter:brightness(1.7) saturate(1.4);transform:translateZ(75px) scale(1.1)!important}
      .ewm-guardian7.g15-guardian.g15-alert .g7-core{filter:brightness(2.5);transform:scale(1.2)}
      .ewm-guardian7.g15-proud .g7-ring,.ewm-guardian7.g15-alert .g7-ring{filter:brightness(2.2)}
      @media (prefers-reduced-motion:reduce){.ewm-guardian7.g15-playful.g15-curious,.ewm-guardian7.g15-guardian.g15-proud{transform:none!important}.ewm-guardian7.g15-explorer.g15-focus .g7-ring{transform:none}}
    `;
    document.head.appendChild(style);
    document.addEventListener('click',e=>{
      if(e.target.closest('.ap4-portal,.ap4-enter,.ap4-launch')) react('portal');
      else if(e.target.closest('.g7-body,.g7-core')) react('click');
    },{passive:true});
    window.addEventListener('ewm:portal-activated',()=>react('portal'));
    window.addEventListener('ewm:mission-activated',()=>react('focus'));
    window.addEventListener('ewm:mission-complete',()=>react('proud'));
    return true;
  }
  if(!boot()){
    const mo=new MutationObserver(()=>{if(boot()) mo.disconnect()});
    mo.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(()=>mo.disconnect(),10000);
  }
})();
